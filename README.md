Node Dependency Injection
===========

The Node Dependency Injection component allows you to standardize and centralize the way objects are constructed in your application.
*The idea is based on the Symfony Dependency Injection Component*

[![npm version](https://badge.fury.io/js/node-dependency-injection.svg)](https://badge.fury.io/js/node-dependency-injection)
[![Build Status](https://travis-ci.org/zazoomauro/node-dependency-injection.svg?branch=master)](https://travis-ci.org/zazoomauro/node-dependency-injection)
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)


Installation
------------

Npm:

```sh
npm install --save node-dependency-injection
```

Basic usage
-----------

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

This class is now much more flexible as you have separated the choice of transport out of the implementation and into the container.

Now that the mailer service is in the container you can inject it as a dependency of other classes. 
If you have a NewsletterManager class like this:

```js
class NewsletterManager {
    construct (mailer, fs) {
        this._mailer = mailer
        this._fs = fs
    }
}

export default NewsletterManager
```

When defining the newsletter_manager service, the mailer service does not exist yet. 
Use the Reference class to tell the container to inject the mailer service when it initializes the newsletter manager:

```js
import {ContainerBuilder, Reference, PackageReference} from 'node-dependency-injection'
import Mailer from './Mailer'
import NewsletterManager from './NewsletterManager'

let container = new ContainerBuilder()

container
  .register('mailer', Mailer)
  .addArgument('sendmail')

container
  .register('newsletter_manager', NewsletterManager)
  .addArgument(new Reference('mailer'))
  .addArgument(new PackageReference('fs-extra'))
```

If the NewsletterManager did not require the Mailer and injecting it was only optional then you could use setter injection instead:

```js
class NewsletterManager {
    setMailer (mailer) {
        this._mailer = mailer
    }

    // ...
}
```

You can now choose not to inject a Mailer into the NewsletterManager. 
If you do want to though then the container can call the setter method:

```js
import {ContainerBuilder, Reference, PackageReference} from 'node-dependency-injection'
import Mailer from './Mailer'
import NewsletterManager from './NewsletterManager'

let container = new ContainerBuilder()

container
    .register('mailer', Mailer)
    .addArgument('sendmail')

container
    .register('newsletter_manager', NewsletterManager)
    .addMethodCall('setMailer', [new Reference('mailer')])
```

You could then get your newsletter_manager service from the container like this:

```js
import {ContainerBuilder} from 'node-dependency-injection'

let container = new ContainerBuilder()
// ...

let newsletterManager = container.get('newsletter_manager')
```


Setting up the Container with Configuration Files
-------------------------------------------------

##### Loading a YAML config file:
```js
import {ContainerBuilder, YamlFileLoader} from 'node-dependency-injection'

let container = new ContainerBuilder()
let loader = new YamlFileLoader(container, 'services.yaml')
loader.load()
```

##### Loading a JSON config file:
```js
import {ContainerBuilder, JsonFileLoader} from 'node-dependency-injection'

let container = new ContainerBuilder()
let loader = new JsonFileLoader(container, 'services.json')
loader.load()
```

##### Loading a JS config file:
```js
import {ContainerBuilder, JsFileLoader} from 'node-dependency-injection'

let container = new ContainerBuilder()
let loader = new JsFileLoader(container, 'services.js')
loader.load()
```

You can now set up the newsletter_manager and mailer services using config files:

######YAML
```yaml
services:
    mailer:
        class:     ./Mailer
        arguments: ['sendmail']
    newsletter_manager:
        class:     ./NewsletterManager
        arguments: ['%fs-extra']
        calls:
            - { method: 'setMailer', arguments: ['@mailer'] }
```

######JSON
```json
{
  "services": {
    "mailer": {
      "class": "./Mailer",
      "arguments": ["sendmail"]
    },
    "newsletter_manager": {
      "class": "./NewsletterManager",
      "arguments": ["%fs-extra"],
      "calls": [
        {
          "method": "setMailer",
          "arguments": ["@mailer"]
        }
      ]
    }
  }
}
```

######JS
```js
module.exports = {
    services: {
        mailer: {class: "./Mailer", arguments: ["sendmail"]},
        newsletter_manager: {
          class: "./NewsletterManager", 
          arguments: ["%fs-extra"],
          calls: [{ method: 'setMailer', arguments: ['@mailer'] }]
        }
    }
}
```

Compiling the Container
------------------------

The service container can be compiled for various reasons. 
These reasons include checking for any potential issues such as circular references and making the container more efficient.

It is compiled by running:

```js
import {ContainerBuilder, JsFileLoader} from 'node-dependency-injection'

let container = new ContainerBuilder()

// ...

container.compile()
```

After compiling the container the same container will be frozen and you cannot register more services.

Compiler Pass
---------------

Sometimes, you need to do more than one thing during compilation, want to use compiler passes without an extension 
or you need to execute some code at another step in the compilation process. In these cases, you can create a new class 
with a process method

```js
class CustomPass {
    /**
     * @param {ContainerBuilder} container
     */
    process (container) {
       // ... do something during the compilation
    }
}
```

You then need to register your custom pass with the container:

```js
import {ContainerBuilder, JsFileLoader} from 'node-dependency-injection'

let container = new ContainerBuilder()
container.addCompilerPass(new CustomPass())
```

Aliasing
--------

You may sometimes want to use shortcuts to access some services. 

```js
import Mailer from './Mailer'
import {ContainerBuilder} from 'node-dependency-injection'

let container = new ContainerBuilder()
container.register('service.mailer', Mailer)

container.setAlias('mailer', 'service.mailer')
```

This means that when using the container directly, you can access the _service.mailer_ service 
by asking for the _mailer_ service like this:

```js
container.get('mailer')
```

In YAML, you can also use a shortcut to alias a service:

```yaml
services:
    # ...
    mailer: '@service.mailer'
```

or JSON
```json
{
  "services": {
    // ...
    "mailer": "@service.mailer"
  }
}
```

or JS
```js
module.exports = {
    services: {
        // ...
        mailer: "@service.mailer"
    }
}
```

Tagging
-------

Services configured in your container can also be tagged. 
In the service container, a tag implies that the service is meant to be used for a specific purpose.

```js
import UserRepository from './Entity/UserRepository'
import {ContainerBuilder, Definition} from 'node-dependency-injection'

let container = new ContainerBuilder()
let definition = new Definition(UserRepository)
definition.addTag('repository')
container.setDefinition('app.entity.user_repository', definition)
```

Tags, then, are a way to tell to your app that your service should be registered or used in some special way by the app.

Tags on their own don't actually alter the functionality of your services in any way. 
But if you choose to, you can ask a container builder for a list of all services that were tagged with some specific tag. 
This is useful in compiler passes where you can find these services and use or modify them in some specific way.

For example:

```js
// ./Entity/UserRepository
class UserRepository {
  constructor (someManager) {
    this._someManager = someManager
  }
  
  // ...
}

// ./Entity/AccountRepository
class AccountRepository {
  constructor (someManager) {
    this._someManager = someManager
  }
  
  // ...
}
```

So instead of injecting _someManager_ for every repository we can use tags for this purpose.

```yaml
services:
    app.service.some_service:
        class: ./Service/SomeService

    app.entity.user_repository:
        class: ./Entity/UserRepository
        tags:
            - { name: repository }

    app.entity.account_repository:
        class: ./Entity/AccountRepository
        tags:
            - { name: repository }
```

You can now use a compiler pass to ask the container for any services with the _repository_ tag:

```js
import {Reference} from 'node-dependency-injection'

class RepositoryPass {
    /**
     * @param {ContainerBuilder} container
     */
    process (container) {
       let taggedServices = container.findTaggedServiceIds('repository')
       
       for (let [id, definition] of taggedServices) {
         definition.addArgument(new Reference('app.service.some_service'))
       }
    }
}
```

Contributing
------------

We :heart: pull requests!

To contribute:

- Fork the repo
- Run `npm install`
- Write your unit tests for your change
- Run `npm test` to run unit testing
- Run `npm run build` to update the distribution files
- Update README.md and, if necessary