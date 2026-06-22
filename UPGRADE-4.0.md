UPGRADE FROM 3.x to 4.x
=======================

## Autowire: human-readable service IDs are now the default

**Before (3.x):** `Autowire` used base64-encoded absolute file paths as service IDs by default.
The generated dump file was machine-only readable:

```yaml
# services.yaml — 3.x (unreadable)
services:
  QXBwL1NlcnZpY2UvTWFpbGVy:
    class: ...
```

**After (4.x):** Service IDs are derived from the file path relative to `defaultDir` with the
extension stripped. The generated dump is human-readable:

```yaml
# services.yaml — 4.x (readable)
services:
  Service/Mailer:
    class: /Service/Mailer
    arguments: []
```

### Migration

**No code changes are required if you retrieve services by class** (the recommended approach):

```ts
container.get(MyService) // works with both strategies
```

If you retrieve services by string ID and relied on the legacy base64 format, call
`makeIdLegacy()` to restore the previous behaviour:

```ts
const autowire = new Autowire(container)
autowire.makeIdLegacy() // opt in to the 3.x base64 strategy
```

Alternatively, regenerate your dump file after switching to 4.x — the new readable IDs will be
used automatically.

### Backward-compatibility aliases

When the readable strategy is active (default in 4.x), NDI automatically registers a
**legacy alias** for every service so that any existing code that looked up services by their
old base64 ID continues to work without modification.
