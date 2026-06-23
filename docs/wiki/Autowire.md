# Defining Services Dependencies Automatically (Autowiring)

### _Only available for TypeScript_

Autowiring uses TypeScript type hints to resolve and inject service dependencies automatically.

Autowiring simplifies the process of managing service dependencies within the container by minimizing configuration. It leverages TypeScript's type annotations to automatically inject the appropriate services into class constructors. Node Dependency Injection's autowiring feature is designed for predictability: if the system cannot clearly determine which dependency to inject, it raises an actionable exception to guide you.

> By utilizing a compiled container, autowiring introduces no runtime performance overhead.

> :warning: Currently, autowiring only supports private constructor properties.

## Example: Autowiring in Action

Let's start by creating a class to perform Base64 transformations:

```ts
export default class Base64Transformer
{
    public transform(value: string): string
    {
        return Buffer.from(value).toString('base64');
    }
}
```

Now, create a client class that uses this transformer:

```ts
export default class SomeClient
{
    constructor(
      private readonly transformer: Base64Transformer,
    ) {}

    async execute(value: string): Promise<void>
    {
        const transformedString = this.transformer.transform(value);
        // Further logic...
    }
}
```

If you're using the default `services.yaml` configuration, both `Base64Transformer` and `SomeClient` are automatically registered as services, ready for autowiring. This means you can use them without any additional configuration.

To understand the configuration behind this, here's how you could explicitly set it up:

```yaml
# config/services.yaml
services:
    _defaults:
        autowire: true
        rootDir: ../src  # Set this relative to your file path
```

## Service ID Strategy

> **Changed in v4.0.0** — Human-readable service IDs are now the default.

In previous versions (3.x), Autowire used **base64-encoded absolute file paths** as service IDs. These IDs were machine-only readable and made the generated dump difficult to review or debug:

```yaml
# services.yaml — 3.x (unreadable)
services:
  QXBwL1NlcnZpY2UvTWFpbGVy:
    class: ...
```

Starting with **4.0**, service IDs are derived from the file path **relative to `defaultDir`** with the extension stripped. The generated dump is now human-readable:

```yaml
# services.yaml — 4.x (readable, default)
services:
  Service/Mailer:
    class: /Service/Mailer
    arguments:
      - '@Service/Transport'
  Service/Transport:
    class: /Service/Transport
    arguments: []
```

### Available strategies

| Strategy | Default | Service ID example | Description |
|---|---|---|---|
| `readable` | ✅ v4.0+ | `Service/Mailer` | Path relative to `defaultDir`, extension stripped |
| `legacy` | v3.x | `U2VydmljZS9NYWlsZXI=` | Base64-encoded absolute path |

### Switching back to the legacy strategy

If you need to opt back in to the 3.x base64 strategy (e.g., for gradual migration), call `makeIdLegacy()` before processing:

```ts
const autowire = new Autowire(container)
autowire.makeIdLegacy() // switch back to base64-encoded IDs
await autowire.process()
```

### Backward-compatibility aliases

When the readable strategy is active (the default in 4.x), NDI **automatically registers a legacy alias** for every service so that any existing code that looked up services by their old base64 ID continues to work without modification:

```ts
// Both of these work in 4.x when using the readable strategy:
container.get(MyService)               // recommended — by class
container.get('Service/Mailer')        // readable ID (v4.x)
container.get('U2VydmljZS9NYWlsZXI=') // legacy base64 alias — still works
```

### Migration from 3.x to 4.x

**No code changes are required if you retrieve services by class** (the recommended approach):

```ts
container.get(MyService) // works with both strategies
```

If you retrieve services by string ID and relied on the legacy base64 format, you have two options:

1. **Regenerate the dump file** — run Autowire once and let it write the new `services.yaml` with readable IDs.
2. **Opt in to the legacy strategy** — call `makeIdLegacy()` to keep base64 IDs.

## Autowiring with Interfaces

When you need to type-hint interfaces instead of concrete classes, autowiring still works seamlessly. This is useful when you want to decouple your code by programming to abstractions.

For example, let's define an interface for the transformer:

```ts
export default interface Transformer
{
    transform(value: string): string;
}
```

Next, update `Base64Transformer` to implement the `Transformer` interface:

```ts
export default class Base64Transformer implements Transformer
{
    transform(value: string): string
    {
        return Buffer.from(value).toString('base64');
    }
}
```

Now, modify `SomeClient` to depend on the interface instead of the concrete class:

```ts
export default class SomeClient
{
    constructor(
      private readonly transformer: Transformer,
    ) {}

    async execute(value: string): Promise<void>
    {
        const transformedString = this.transformer.transform(value);
        // Further logic...
    }
}
```

This allows for more flexibility, enabling you to swap out implementations of `Transformer` without changing the client.

## Overriding Arguments with Autowiring

Sometimes, you may want to override certain arguments when autowiring services. You can achieve this through the service definition in `services.yaml`:

```yaml
services:
    _defaults:
        autowire: true
        rootDir: ../src

    App.FooBarAutowireOverride:
        class: './FooBarAutowireOverride'
        override_arguments:
            - '@CiAdapter'
            - '@SomeService'
            - '@AnotherService'

    App.AnotherFooBarAutowireOverride:
        class: './AnotherFooBarAutowireOverride'
        override_arguments:
            - '@BarAdapter'
            - '@SomeService'
            - '@AnotherService'
```

In this case, the `override_arguments` directive specifies which services to inject, allowing you to replace dependencies selectively.

## Dumping a Service File from Autowiring

When transpiling TypeScript, you may need to dump a service configuration file, which can be loaded in a production environment. Here's an example of how to do this:

```ts
import { ContainerBuilder, Autowire, ServiceFile } from 'node-dependency-injection';

const container = new ContainerBuilder(false, '/path/to/src');
const autowire = new Autowire(container);
autowire.serviceFile = new ServiceFile('/some/path/to/dist/services.yaml');
await autowire.process();
await container.compile();
```

### Loading the Configuration in Production

To handle different environments, like development vs. production, here's a suggestion for loading the correct configuration file:

```ts
if (process.env.NODE_ENV === 'dev') {
  this._container = new ContainerBuilder(false, '/src');
  this._autowire = new Autowire(this._container);
  this._autowire.serviceFile = new ServiceFile('/some/path/to/dist/services.yaml');
  await this._autowire.process();
} else {
  this._container = new ContainerBuilder(false, '/dist');
  this._loader = new YamlFileLoader(this._container);
  await this._loader.load('/some/path/to/dist/services.yaml');
}
await this._container.compile();
```

This setup ensures that in production, the container loads from the transpiled `dist` folder, while in development, it uses the source directory.

## Autowiring Keyed Services

To inject a keyed service (or a full keyed group) into a typed constructor parameter, register a **bind** whose name matches the parameter name. Named binds take priority over type-based resolution.

```typescript
export default class CheckoutService {
  constructor(private readonly payment: IPaymentService) {}
}

export default class PaymentRouter {
  constructor(private readonly payments: Map<string, IPaymentService>) {}
}
```

```js
container.registerKeyed('payment', 'stripe', StripePaymentService)
container.registerKeyed('payment', 'paypal', PaypalPaymentService)

container.addBind('payment',  new KeyedReference('payment', 'stripe'))
container.addBind('payments', new KeyedGroupReference('payment'))

const autowire = new Autowire(container)
await autowire.process()
await container.compile()
```

See [Keyed Services](KeyedServices) for the full API reference.

## Excluding Folders from the Root Directory

In some cases, you might want to exclude specific folders from autowiring. Here's how you can configure that:

```yaml
# /path/to/services.yml
services:
  _defaults:
    autowire: true
    rootDir: "../path/to/src"
    exclude: ["ToExclude"]
```

In this example, the folder `../path/to/src/ToExclude` is excluded from the container, preventing it from being scanned for services.
