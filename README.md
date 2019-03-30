Node Dependency Injection
=========================

![NDI Logo](http://image.ibb.co/iGnCUn/logojoy.png)

#### A special thanks to [Symfony](http://symfony.com) which was a great inspiration and example for this project.

The Node Dependency Injection component allows you to standardize and centralize the way objects are constructed in your application.

[![Npm Version](https://badge.fury.io/js/node-dependency-injection.svg)](https://badge.fury.io/js/node-dependency-injection)
[![Build Status](https://travis-ci.org/zazoomauro/node-dependency-injection.svg?branch=master)](https://travis-ci.org/zazoomauro/node-dependency-injection)
[![Dependencies](https://david-dm.org/zazoomauro/node-dependency-injection.svg)](https://david-dm.org/zazoomauro/node-dependency-injection)
[![DevDependencies](https://david-dm.org/zazoomauro/node-dependency-injection/dev-status.svg)](https://david-dm.org/zazoomauro/node-dependency-injection#info=devDependencies)
[![Code Coverage](https://codecov.io/gh/zazoomauro/node-dependency-injection/branch/master/graph/badge.svg)](https://codecov.io/gh/zazoomauro/node-dependency-injection)
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
  constructor(exampleService) {
    ...
  }
}
```

You can register this in the container as a service:

```js
import {ContainerBuilder} from 'node-dependency-injection'
import Mailer from './services/Mailer'
import Example from './services/Example'

let container = new ContainerBuilder()
container.register('service.example', Example)
container
  .register('service.mailer', Mailer)
  .addArgument('service.example')
```

And get services from your container

```js
const mailer = container.get('service.mailer')
```


Configuration files: how to load and use configuration files
------------

You can also use configuration files to improve your service configuration

```yaml
# /path/to/file.yml
services:
  service.example:
    class: 'services/Example'

  service.mailer:
    class: 'services/Mailer'
    arguments: ['@service.example']
```

```js
import {ContainerBuilder, YamlFileLoader} from 'node-dependency-injection'

let container = new ContainerBuilder()
let loader = new YamlFileLoader(container)
loader.load('/path/to/file.yml')
```

And get services from your container

```js
...
const mailer = container.get('service.mailer')
```

List of features
------------

* Configuration files with JS, YAML or JSON.
  - Imports inside configuration files
- Custom relative service directory
* Compiling container
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

A Node Dependency Injection Middleware for Express

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

Resources
---------

- [Documentation](https://github.com/zazoomauro/node-dependency-injection/wiki)
- [Collaboration and pull requests](CONTRIBUTING.md)
- [Milestones](https://github.com/zazoomauro/node-dependency-injection/milestones)
- [Twitter @zazoomauro](https://twitter.com/zazoomauro)
- [Changelog](CHANGELOG.md)
