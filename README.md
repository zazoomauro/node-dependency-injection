Node Dependency Injection
=========================

![NDI Logo](http://image.ibb.co/iGnCUn/logojoy.png)

#### A special thanks to [Symfony](http://symfony.com) which was a great inspiration and example for this project.

The Node Dependency Injection component allows you to standardize and centralize the way objects are constructed in your application.

[![Npm Version](https://badge.fury.io/js/node-dependency-injection.svg)](https://badge.fury.io/js/node-dependency-injection)
![Build Status](https://github.com/zazoomauro/node-dependency-injection/actions/workflows/build.yml/badge.svg)
![Publish Status](https://github.com/zazoomauro/node-dependency-injection/actions/workflows/publish.yml/badge.svg)
[![Code Coverage](https://codecov.io/gh/zazoomauro/node-dependency-injection/branch/master/graph/badge.svg?token=faEAqrimPR)](https://codecov.io/gh/zazoomauro/node-dependency-injection)
[![Code Climate](https://codeclimate.com/github/zazoomauro/node-dependency-injection/badges/gpa.svg)](https://codeclimate.com/github/zazoomauro/node-dependency-injection)
[![Coding Standard](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![Known Vulnerabilities](https://snyk.io/test/github/zazoomauro/node-dependency-injection/badge.svg)](https://snyk.io/test/github/zazoomauro/node-dependency-injection)
[![Npm Downloads](https://img.shields.io/npm/dm/node-dependency-injection.svg?maxAge=2592000)](https://www.npmjs.com/package/node-dependency-injection)
[![License](https://img.shields.io/npm/l/node-dependency-injection.svg?maxAge=2592000?style=plastic)](https://github.com/zazoomauro/node-dependency-injection/blob/master/LICENCE)

Installation
------------

```sh
npm install --save node-dependency-injection
```

Usage: register and get services
-----------

Imagine you have a `Mailer` class like this:

```js
// services/Mailer.js

export default class Mailer {
  /**
   * @param {ExampleService} exampleService
   */
  constructor(exampleService) {
    this._exampleService = exampleService;
  }

  ...
}
```

You can register this in the container as a service:

```js
import {ContainerBuilder} from 'node-dependency-injection'
import Mailer from './services/Mailer'
import ExampleService from './services/ExampleService'

let container = new ContainerBuilder()

container
  .register('service.example', ExampleService)

container
  .register('service.mailer', Mailer)
  .addArgument('service.example')
```

And get services from your container

```js
const mailer = container.get('service.mailer')
```

Autowire for TypeScript
------------

```ts
import {ContainerBuilder, Autowire} from 'node-dependency-injection'

const container = new ContainerBuilder(
  false, 
  '/path/to/src'
)
const autowire = new Autowire(container)
await autowire.process()

```

or from yaml-json-js configuration

```yaml
# /path/to/services.yml
services:
  _defaults:
    autowire: true
    rootDir:  "/path/to/src"
```

You can also get a service from a class definition

```ts
import SomeService from '@src/service/SomeService'

container.get(SomeService)
```

If you are transpiling your Typescript may you need to dump the some kind of service configuration file.

```ts
import {ContainerBuilder, Autowire, ServiceFile} from 'node-dependency-injection'

const container = new ContainerBuilder(
  false, 
  '/path/to/src'
)
const autowire = new Autowire(container)
autowire.serviceFile = new ServiceFile('/some/path/to/dist/services.yaml')
await autowire.process()

```

My proposal for load configuration file in a production environment with transpiling/babel compilation:

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


Configuration files: how to load and use configuration files
------------

You can also use configuration files to improve your service configuration

```yaml
# /path/to/file.yml
services:
  service.example:
    class: 'services/ExampleService'

  service.mailer:
    class: 'services/Mailer'
    arguments: ['@service.example']
```

```js
import {ContainerBuilder, YamlFileLoader} from 'node-dependency-injection'

let container = new ContainerBuilder()
let loader = new YamlFileLoader(container)
await loader.load('/path/to/file.yml')
```

And get services from your container easily

```js
...
const mailer = container.get('service.mailer')
```

List of features
------------

- Autowire for TypeScript
- Configuration files with JS, YAML or JSON.
- Multiple configuration files
- Custom relative service directory
- Compiling container
  - Custom compiler pass
  - Change definition behaviour
- Using a factory to create services
- Nullable Dependencies
- Public or private services
- Service Aliasing
- Service Tagging
- Parameters Injection
- Lazy Services
- Deprecate Services
- Decorate Services
- Synthetic Services
- Non Shared Services
- Parent and Abstract Services
- Custom Logger
- Container as Service

> Please read [full documentation](https://github.com/zazoomauro/node-dependency-injection/wiki)

ExpressJS Usage
----------------

If you are using expressJS and you like Node Dependency Injection Framework then I strongly recommend
you to use the `node-dependency-injection-express-middleware` package.
That gives you the possibility to retrieve the container from the request.

```bash
npm install --save node-dependency-injection-express-middleware
```

```javascript
import NDIMiddleware from 'node-dependency-injection-express-middleware'
import express from 'express'

const app = express()

const options = {serviceFilePath: 'some/path/to/config.yml'}
app.use(new NDIMiddleware(options).middleware())
```

> [Express Middleware Documentation](https://github.com/zazoomauro/node-dependency-injection-express-middleware)

TypeScript Usage
----------------

If you are using typescript and you like Node Dependency Injection Framework then typing are now provided at `node-dependency-injection` so 
you do not have to create custom typing anymore.

```bash
npm install --save node-dependency-injection
```

```typescript
import { ContainerBuilder } from 'node-dependency-injection'
import MongoClient from './services/MongoClient'
import { Env } from './EnvType'

export async function boot(container = new ContainerBuilder(), env: Env) {
    container.register('Service.MongoClient', MongoClient).addArgument({
        host: env.HOST,
        port: env.PORT,
    })
}
```

Resources
---------

- [Documentation](https://github.com/zazoomauro/node-dependency-injection/wiki)
- [Collaboration and pull requests](CONTRIBUTING.md)
- [Milestones](https://github.com/zazoomauro/node-dependency-injection/milestones)
- [Twitter @zazoomauro](https://twitter.com/zazoomauro)
- [Changelog](CHANGELOG.md)
