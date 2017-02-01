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