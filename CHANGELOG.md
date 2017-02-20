# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [1.4.0] - 2016-02-20
### Added 
- Adding parameters on arguments wrapped on %{string}% with the configuration files
- Adding imports feature to load automatically more services in another files

## [1.3.3] - 2016-02-07
### Changed
- Refactoring container builder preventing having two different container builders for compiled and not compiled containers
- Fixing definition private get arguments class.
- Preventing instantiating reference service twice

## [1.3.2] - 2016-02-06
### Changed
- Preventing compiling an already compiled container

## [1.3.1] - 2016-01-30
### Changed
- Fix findTaggedServiceIds returns the tag name instead of definition
### Added
- Adding unit testing code coverage tools
- Adding codecov integration
- Adding npm downloads badges
- Adding LICENCE

## [1.3.0] - 2016-01-30
### Added
- Register compiler pass from the ContainerBuilder
- Aliasing: You may sometimes want to use shortcuts to access some services.
- Tagging: Services configured in your container can also be tagged.

## [1.2.2] - 2016-01-23
### Changed
- Fix prevent instantiate class again if we get a service and then compile

## [1.2.1] - 2016-01-20
### Changed
- Preventing instantiating service twice 

## [1.2.0] - 2016-01-20
### Added
- Adding compiled container and frozen container

## [1.1.1] - 2016-01-20
### Changed
- Moving configuration service test files to config folder
- Modifying file exists exception message

## [1.1.0] - 2016-01-20
### Added
- Adding method call with arguments feature
- Overriding the whole arguments collection in the definition model
- Adding Changelog file
- Updating README file

### Changed
- Refactoring parsing definitions

## [1.0.6] - 2016-01-19
### Added
- Following the default js standard coding standard

### Changed
- Using path join instead of file path constructor

### Removed
- Removing stage-2 babel preset

## [1.0.5] - 2016-01-19
### Added
- Adding unit testing for reference and package reference
- Adding js docs to the file loader abstract class
- Coding standards on test spec files

### Changed
- File loader class moving from private argument path to filePath
- Refactoring json file loader
- Updating README file adding more configuration examples

## [1.0.4] - 2016-01-18
### Changed
- Update travis configuration

## [1.0.3] - 2016-01-18
### Changed
- Update travis configuration

## [1.0.2] - 2016-01-18
### Changed
- Update README file

## [1.0.1] - 2016-01-18
### Added
- Adding travis configuration

## [1.0.0] - 2016-01-18
### Added
- Initial commit