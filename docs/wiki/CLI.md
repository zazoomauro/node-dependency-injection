# CLI Tools

The `ndi` command-line tool lets you create configuration files, inspect services, validate your container, and export dependency graphs — all without writing a single line of code.

## Installation

The CLI is included when you install the package:

```bash
npm install node-dependency-injection
```

The `ndi` binary is then available in `./node_modules/.bin/ndi`, or globally if you install with `-g`.

## Commands overview

| Command | Description |
|---|---|
| [`config:create`](#configcreate) | Create an empty configuration file |
| [`config:check`](#configcheck) | Check a configuration file for syntax errors |
| [`container:service`](#containerservice) | Inspect a single service definition |
| [`container:graph`](#containergraph) | Export the service dependency graph |
| [`container:validate`](#containervalidate) | Validate the full service container |

---

## `config:create`

Creates an empty configuration file in the format of your choice.

```bash
ndi config:create <path> [options]
```

**Arguments**

| Argument | Description |
|---|---|
| `<path>` | Directory where the configuration file will be created |

**Options**

| Option | Default | Description |
|---|---|---|
| `-n, --name <name>` | `services` | File name (without extension) |
| `-f, --format <format>` | `yaml` | File format: `yaml`, `json`, `js`, `xml` |

**Examples**

```bash
# Create services.yaml in ./config
ndi config:create ./config

# Create my-services.json in ./config
ndi config:create ./config --name my-services --format json
```

---

## `config:check`

Loads a configuration file and reports any syntax or parsing errors.

```bash
ndi config:check <path>
```

**Arguments**

| Argument | Description |
|---|---|
| `<path>` | Path to the configuration file (`.yaml`, `.json`, `.js`, or `.xml`) |

The format is detected automatically from the file extension.

**Exit codes**

| Code | Meaning |
|---|---|
| `0` | File is valid |
| `1` | File contains errors |

**Example**

```bash
ndi config:check ./config/services.yaml
```

---

## `container:service`

Displays detailed information about a single registered service.

```bash
ndi container:service <path> <service>
```

**Arguments**

| Argument | Description |
|---|---|
| `<path>` | Path to the configuration file |
| `<service>` | Service ID to inspect |

**Example**

```bash
ndi container:service ./config/services.yaml mailer
```

The output is a table showing the service's class, arguments, public flag, method calls, tags, properties, laziness, deprecated message, factory, synthetic flag, decoration, shared scope, and parent.

---

## `container:graph`

Exports the service dependency graph in one of several formats.

```bash
ndi container:graph <path> [options]
```

**Arguments**

| Argument | Description |
|---|---|
| `<path>` | Path to the configuration file |

**Options**

| Option | Default | Description |
|---|---|---|
| `--format <format>` | `mermaid` | Output format: `mermaid`, `dot`, or `json` |
| `--filter <pattern>` | — | Keep only services whose ID matches this regex |
| `--tag <name>` | — | Keep only services that have the given tag |
| `--root <id>` | — | Show graph starting from this root service |
| `--depth <number>` | unlimited | Maximum traversal depth when `--root` is set |
| `--exclude-private` | `false` | Exclude services marked as private |

**Examples**

```bash
# Print a Mermaid diagram to stdout
ndi container:graph ./config/services.yaml

# Export as Graphviz DOT
ndi container:graph ./config/services.yaml --format dot

# Export as JSON, filtered to the payment group
ndi container:graph ./config/services.yaml --format json --filter '^payment\.'

# Show only the subtree of 'checkout', 2 levels deep
ndi container:graph ./config/services.yaml --root checkout --depth 2

# Pipe a Mermaid diagram into a file
ndi container:graph ./config/services.yaml > graph.mmd
```

See the [Graph Exporter](GraphExporter) guide for details on the output formats and filtering options.

---

## `container:validate`

Compiles and validates the full service container, reporting errors, warnings, and informational messages.

```bash
ndi container:validate <path> [options]
```

**Arguments**

| Argument | Description |
|---|---|
| `<path>` | Path to the configuration file |

**Options**

| Option | Default | Description |
|---|---|---|
| `--strict` | `false` | Exit with code `1` on warnings as well as errors |
| `--format <format>` | `text` | Output format: `text` or `json` |

**Exit codes**

| Code | Meaning |
|---|---|
| `0` | Container is valid (no errors; no warnings when `--strict` is used) |
| `1` | Container has errors (or warnings in `--strict` mode) |

**Examples**

```bash
# Validate with human-readable output
ndi container:validate ./config/services.yaml

# Validate in strict mode (warnings also fail the build)
ndi container:validate ./config/services.yaml --strict

# Machine-readable JSON output (useful in CI pipelines)
ndi container:validate ./config/services.yaml --format json
```

**JSON output shape**

```json
{
  "isValid": true,
  "serviceCount": 12,
  "errors": [],
  "warnings": [],
  "info": []
}
```

---

## Related guides

- [Configuration Files](ConfigurationFiles)
- [Container Validation](ContainerValidation)
- [Graph Exporter](GraphExporter)
- [Compiling Container](CompilingContainer)
