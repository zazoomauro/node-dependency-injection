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