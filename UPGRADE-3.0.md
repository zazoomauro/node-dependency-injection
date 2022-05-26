UPGRADE FROM 2.x to 3.x
=======================

### Removed deprecations 

- FileLoader load method is now Promised. Add await to be sync
- ContainerBuilder compile method is now Promised. Add await to be sync
- All your custom Compiler Pass process method needs to be promised
- Container Builder findTaggedServiceIds returns an Iterable object instead of Map