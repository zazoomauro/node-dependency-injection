The Node Dependency Injection component allows you to standardize and centralize the way objects are constructed in your application.

[Installation](getting-started)

[Configuration files](configuration-files)

[Compiling container](compiling-container)

[Compiler Pass](compiler-pass)

[Aliasing](aliasing)

[Tagging](tagging)

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