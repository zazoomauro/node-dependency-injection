# Change Log

# [1.11.2] - 2018-01-03
### Changed
- ContainerBuilder refactor 
- FileLoader refactor 

# [1.11.1] - 2017-12-27
### Changed
- Updating dependencies
- Updating dev dependencies

# [1.11.0] - 2017-09-08
### Added
- append parent arguments to the child service
- check if the abstract service is well formed

### Changed
- serviceCircularReferenceException thrown when container compile fails with RangeError exception
- moving from .throws to .throw unit testing
- updating package with newer compatible dependencies

# [1.10.2] - 2017-08-16
### Changed
- Updating dependencies
- Updating dev dependencies

# [1.10.1] - 2017-06-19
### Changed
- fixing changelog

# [1.10.0] - 2017-06-15
### Added
- decoration priority
- allow complex parameter as objects
- add a parameter in the ContainerBuilder constructor to use the sent logger instance instead of the default console service
### Changed
- inverting instead of shared false by default instance is shared by default
- updating major nyc dev dependency package

# [1.9.3] - 2017-05-30
### Added
- adding travis node 8 version
### Changed
- fixing out dating dev dependencies

# [1.9.2] - 2017-05-25
### Changed
- fixing ContainerBuilder code issue `Method '_getInstance' has a complexity of 10.`
- fixing ContainerBuilder code issue `Similar code found in other locations`  

# [1.9.1] - 2017-05-25
### Changed
- fixing fs-extra out to date dependency
- fixing all the dev out to date dependencies

# [1.9.0] - 2017-05-22
### Changed
- refactoring compile optimization
- refactoring compile removal
- getInstanceFromDefinition is now public
### Added
- adding container builder remove method
- adding container builder isSet method
- adding add compiler pass priority argument
- adding decorators

# [1.8.2] - 2017-04-24
### Changed
- Fix: FileLoader cannot load files in subfolder

# [1.8.1] - 2017-04-10
### Changed
- Removing linkedIn link from README file

# [1.8.0] - 2017-04-10
### Added
- Adding definition synthetic parameter
- Public container direct set method
- Container get method will only return you a valid instance
- Remove not necessary instances from container on compile
- Reference Symfony as a source of inspiration
- Adding Additional Attributes on Tags
- Inject Instances into the Container
### Changed
- Refactor following new standard rules
- Removing linkedIn link from README file

# [1.7.4] - 2017-03-22
### Changed
- Throw an exception if the method call does not exists

# [1.7.3] - 2017-03-21
### Changed 
- Adding standard coding style configuration

# [1.7.2] - 2017-03-21
### Changed
- Add Definition class in to the index file

# [1.7.1] - 2017-03-20
### Changed
- Fixing npm version issue

# [1.7.0] - 2017-03-20
### Added
- Remove definition container method
- Managing Configuration with Extensions
- Controlling the pass ordering
- Adding code climate badge

## [1.6.1] - 2017-03-15
### Changed
- Fixing configuration files Boolean arguments issue
- Fixing configuration files Boolean parameters issue

## [1.6.0] - 2017-03-10
### Added
- Deprecating Services
- Using a Factory to Create Services
- Passing Parsed Arguments to the Factory Method
- Ignoring Missing Dependencies

## [1.5.0] - 2017-03-06
### Added
- Adding hasDefinition public container method
- Adding has container public method
- Adding getDefinition public container method
- Adding findDefinition public container method
- Injecting in to public fields properties
- Adding Definition lazy service property 
### Changed
- Deprecating second constructor argument of File loader
- Deprecating not setting first argument on config file load method

## [1.4.1] - 2017-02-23
### Changed
- Removing CHANGELOG file description
- Using npm version script instead or server:release to do npm packages releases

## [1.4.0] - 2017-02-20
### Added 
- Adding parameters on arguments wrapped on %{string}% with the configuration files
- Adding imports feature to load automatically more services in another files

## [1.3.3] - 2017-02-07
### Changed
- Refactoring container builder preventing having two different container builders for compiled and not compiled containers
- Fixing definition private get arguments class.
- Preventing instantiating reference service twice

## [1.3.2] - 2017-02-06
### Changed
- Preventing compiling an already compiled container

## [1.3.1] - 2017-01-30
### Changed
- Fix findTaggedServiceIds returns the tag name instead of definition
### Added
- Adding unit testing code coverage tools
- Adding codecov integration
- Adding npm downloads badges
- Adding LICENCE

## [1.3.0] - 2017-01-30
### Added
- Register compiler pass from the ContainerBuilder
- Aliasing: You may sometimes want to use shortcuts to access some services.
- Tagging: Services configured in your container can also be tagged.

## [1.2.2] - 2017-01-23
### Changed
- Fix prevent instantiate class again if we get a service and then compile

## [1.2.1] - 2017-01-20
### Changed
- Preventing instantiating service twice 

## [1.2.0] - 2017-01-20
### Added
- Adding compiled container and frozen container

## [1.1.1] - 2017-01-20
### Changed
- Moving configuration service test files to config folder
- Modifying file exists exception message

## [1.1.0] - 2017-01-20
### Added
- Adding method call with arguments feature
- Overriding the whole arguments collection in the definition model
- Adding Changelog file
- Updating README file

### Changed
- Refactoring parsing definitions

## [1.0.6] - 2017-01-19
### Added
- Following the default js standard coding standard

### Changed
- Using path join instead of file path constructor

### Removed
- Removing stage-2 babel preset

## [1.0.5] - 2017-01-19
### Added
- Adding unit testing for reference and package reference
- Adding js docs to the file loader abstract class
- Coding standards on test spec files

### Changed
- File loader class moving from private argument path to filePath
- Refactoring json file loader
- Updating README file adding more configuration examples

## [1.0.4] - 2017-01-18
### Changed
- Update travis configuration

## [1.0.3] - 2017-01-18
### Changed
- Update travis configuration

## [1.0.2] - 2017-01-18
### Changed
- Update README file

## [1.0.1] - 2017-01-18
### Added
- Adding travis configuration

## [1.0.0] - 2017-01-18
### Added
- Initial commit