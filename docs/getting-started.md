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