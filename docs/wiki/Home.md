# Node Dependency Injection

Standardize and centralize object creation with a lightweight, configurable container.

The Node Dependency Injection component allows you to standardize and centralize the way objects are constructed in your application.

> **v4.0.0** — Autowire now generates **human-readable service IDs** by default. See the [Autowire](Autowire) and [migration guide](https://github.com/zazoomauro/node-dependency-injection/blob/master/UPGRADE-4.0.md) for details.

## Recommended learning path (priority order)

1. [Installation](GettingStarted)
2. [Configuration Files](ConfigurationFiles)
3. [Parameters](Parameters)
4. [Defining Services Dependencies Automatically (Autowiring)](Autowire)
5. [Binding Arguments by Name](Bind)
6. [Keyed Services](KeyedServices)
7. [Conditional Services](ConditionalServices)
8. [Compiling the Container](CompilingContainer)
9. [Container Validation](ContainerValidation)
10. [Graph Exporter](GraphExporter)

## Basic usage

You might have a simple class like the following `Mailer` that you want to make available as a service:

```js
class Mailer {
    constructor () {
        this._transport = 'sendmail'
    }
}

export default Mailer
```

You can register this in the container as a service:

```js
import {ContainerBuilder} from 'node-dependency-injection'
import Mailer from './Mailer'

let container = new ContainerBuilder()
container.register('mailer', Mailer)
```

An improvement to the class to make it more flexible would be to allow the container to set the transport used.
If you change the class so this is passed into the constructor:

```js
class Mailer {
    constructor (transport) {
        this._transport = tansport
    }
}

export default Mailer
```

Then you can set the choice of transport in the container:

```js
import {ContainerBuilder} from 'node-dependency-injection'
import Mailer from './Mailer'

let container = new ContainerBuilder()
container
  .register('mailer', Mailer)
  .addArgument('sendmail')
```

You could then get your mailer service from the container like this:

```js
import {ContainerBuilder} from 'node-dependency-injection'

let container = new ContainerBuilder()

// ...

let mailer = container.get('mailer');
```

## Related guides

- [Compiling container](CompilingContainer)
- [Container validation](ContainerValidation)
