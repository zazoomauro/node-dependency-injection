# Change Log

# [2.1.1] - 2018-08-22
### Changed
- package dependencies update

# [2.1.0] - 2018-06-13
### Changed
- add express middleware link and minimal documentation
- update dependencies for production and development

# [2.1.0] - 2018-06-13
### Changed
- add express middleware link and minimal documentation
- update dependencies for production and development

# [2.0.1] - 2018-04-11
### Changed
- fixing bug injecting private npm modules from configuration files (yml, js or json)

# [2.0.0] - 2017-09-26
### Changed
- updating production and developers dependencies 
### Added
- adding new project logo
- preparing version 2
- create a new node-dependency-injection-cli on /bin folder called
- can create a new config file: $ ndi config:create --name=services --format=yml|json|js /path/folder/
- adding config:check command to check if the configuration file contains any error
- node dependency injection throws custom exceptions instead of general Error
- adding container:service command to show service details