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