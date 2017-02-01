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