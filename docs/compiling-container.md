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