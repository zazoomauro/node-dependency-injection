# Change Log

# [2.3.4] - 2019-05-28
### Changed
- Avoid collections lib usage

# [2.3.3] - 2019-04-11
### Changed
- Fix tstypes path

# [2.3.2] - 2019-04-11
### Added
- add typescript types

# [2.3.1] - 2019-04-02
### Changed
- package.json & package-lock.json to reduce vulnerabilities

# [2.3.0] - 2019-03-25
### Changed
- add default directory
- removing path library
- improving README file

[2.2.1] - 2018-10-01
### Changed
- Do not report file error on yaml syntax errors

# [2.2.0] - 2018-09-13
### Changed
* Added control to register container as a service and can recover
* Added control to retrieve container instance as service.
* container reference as service

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
