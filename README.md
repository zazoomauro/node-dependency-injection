Node Dependency Injection
===========

The NodeDependencyInjection component allows you to standardize and centralize the way objects are constructed in your application.
The idea is based on the Symfony Dependency Injection Component


Travis Status
-------------

[![Build Status](https://travis-ci.org/zazoomauro/node-dependency-injection.svg?branch=master)](https://travis-ci.org/zazoomauro/node-dependency-injection)


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
class Mailer
{
    constructor() {
        this._transport = 'sendmail';
    }
}

export default Mailer;
```

You can register this in the container as a service:

```js
import {ContainerBuilder} from 'node-dependency-injection';

let container = new ContainerBuilder();
container.register('mailer', 'Mailer');
```

An improvement to the class to make it more flexible would be to allow the container to set the transport used. If you change the class so this is passed into the constructor:

```js
class Mailer
{
    constructor(transport) {
        this._transport = tansport;
    }
}

export default Mailer;
```

Then you can set the choice of transport in the container:

```js
import {ContainerBuilder} from 'node-dependency-injection';

container = new ContainerBuilder();
container.register('mailer', 'Mailer').addArgument('sendmail');
```

This class is now much more flexible as you have separated the choice of transport out of the implementation and into the container.

Now that the mailer service is in the container you can inject it as a dependency of other classes. 
If you have a NewsletterManager class like this:

```js
class NewsletterManager
{
    construct(mailer, fs) {
        this._mailer = mailer;
        this._fs = fs;
    }
}

export default NewsletterManager;
```

When defining the newsletter_manager service, the mailer service does not exist yet. 
Use the Reference class to tell the container to inject the mailer service when it initializes the newsletter manager:

```js
import {ContainerBuilder, Reference, PackageReference} from 'node-dependency-injection';
import Mailer from './Mailer';
import NewsletterManager from './NewsletterManager';

container = new ContainerBuilder();
container
  .register('mailer', Mailer)
  .addArgument('sendmail');
container
  .register('newsletter_manager', NewsletterManager)
  .addArgument(new Reference('mailer'))
  .addArgument(new PackageReference('fs-extra'));
```

You could then get your newsletter_manager service from the container like this:

```js
import {ContainerBuilder} from 'node-dependency-injection';

container = new ContainerBuilder();
// ...

newsletterManager = container.get('newsletter_manager');
```


Setting up the Container with Configuration Files
-------------------------------------------------

##### Loading a YAML config file:
```js
import {ContainerBuilder, YamlFileLoader} from 'node-dependency-injection';

container = new ContainerBuilder();
loader = new YamlFileLoader(container, '/path/to/services.yml');
loader.load();
```

##### Loading a JSON config file:
```js
import {ContainerBuilder, JsonFileLoader} from 'node-dependency-injection';

container = new ContainerBuilder();
loader = new JsonFileLoader(container, '/path/to/services.json');
loader.load();
```

##### Loading a JS config file:
```js
import {ContainerBuilder, JsFileLoader} from 'node-dependency-injection';

container = new ContainerBuilder();
loader = new JsFileLoader(container, '/path/to/services.js');
loader.load();
```

You can now set up the newsletter_manager and mailer services using config files:

```yaml
services:
    mailer:
        class:     Mailer
        arguments: ['sendmail']
    newsletter_manager:
        class:     NewsletterManager
        arguments: ['@mailer', '%fs-extra']
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