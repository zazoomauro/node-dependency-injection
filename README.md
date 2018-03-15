Node Dependency Injection
=========================

<p align="center">
    <img src="https://image.ibb.co/ejH8FH/logojoy.png">
</p>

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

Usage
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

### Optional Dependencies: Setter Injection

Injecting dependencies into the constructor in this manner is an excellent way of ensuring that the dependency is available to use. If you have optional dependencies for a class, then "setter injection" may be a better option. This means injecting the dependency using a method call rather than through the constructor. The class would look like this:

```js
import Mailer from './Mailer'

class NewsletterManager {
  constructor {
    this._mailer = null
  }

  /**
   * @param {Mailer} mailer
   */
  setMailer(mailer) {
    this.mailer = mailer;
  }

  // ...
}
```

Injecting the dependency by the setter method just needs a change of syntax:

###### YAML
```yaml
services:
    app.mailer:
        # ...

    app.newsletter_manager:
        class: ./NewsletterManager
        calls:
            - [setMailer, ['@app.mailer']]
```

###### JS
```js
import {Reference, Definition} from 'node-dependency-inection'
import NewsletterManager from './Service/NewsletterManager'

// ...

definition = new Definition(NewsletterManager)
definition.addMethodCall('setMailer', [new Reference('app.mailer')])

container.setDefinition('app.newsletter_manager', definition)
```

### Property Injection

Another possibility is just setting public fields of the class directly:

```js
class NewsletterManager {
     /**
      * @param {Mailer} mailer
      */
     set mailer (value) {
          this._mailer = value
     }
}
```

###### YAML
```yaml
services:
     # ...

     app.newsletter_manager:
         class: ./App/Mail/NewsletterManager
         properties:
             mailer: '@mailer'
```

###### JS
```js
import {Definition, Reference} from 'node-dependency-injection'

// ...

definition = new Definition(NewsletterManager)
definition.addProperty('mailer', new Reference('mailer'))
```

Resources
---------

- [Documentation](https://github.com/zazoomauro/node-dependency-injection/wiki)
- [Collaboration and pull requests](CONTRIBUTING.md)
- [Milestones](https://github.com/zazoomauro/node-dependency-injection/milestones)
- [Twitter @zazoomauro](https://twitter.com/zazoomauro)
- [Changelog](CHANGELOG.md)
