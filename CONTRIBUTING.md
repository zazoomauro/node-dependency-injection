# Issues
Issues are always very welcome. 
However, there are a couple of things you can do to make the lives of the developers much easier:

### Tell us:

* What you are doing?
  * Post a _minimal_ code sample that reproduces the issue
  * What do you expect to happen?
  * What is actually happening?
* Which NodeJS version you are using?
* Which Ecma Script version you are using?
* Which Ecma Script presets you are using?

When you post code, please use [Github flavored markdown](https://help.github.com/articles/github-flavored-markdown), 
in order to get proper syntax highlighting!

# Pull requests

We're glad to get pull request if any functionality is missing or something is buggy. 
However, there are a couple of things you can do to make life easier for the maintainers:

* Explain the issue that your PR is solving - or link to an existing issue
* Make sure that all existing tests pass
* Make sure you followed [standard coding guidelines](http://standardjs.com)
* Add some tests for your new functionality or a test exhibiting the bug you are solving. Ideally all new tests should not pass _without_ your changes.
* If you are adding or changing the public API, remember to add this changes in to the docs/wiki.
* Add an entry to the [changelog](CHANGELOG.md), following the [changelog rules](http://keepachangelog.com/)

### 1. Prepare your environment

You need [Node.JS](http://nodejs.org) and [npm](https://docs.npmjs.com/getting-started/installing-node)

### 2. Install dependencies

Run `npm install`, see an example below:

```console
$ npm install
```

### 3. Run tests ###

All tests are located in the `test` folder (which contains the [Mocha](http://visionmedia.github.io/mocha/) tests).

```console
$ npm test || test:coverage
```

### 4. Standard Coding Guidelines ###

Please, follow [Standard JS Coding Guidelines](http://standardjs.com)

```console
$ npm run test:standard
```

and if you want to fix automatically some of your source code
 
```console
$ npm run test:standard:fix
```

### 5. Documentation/Wiki ###

```console
$ git clone https://github.com/zazoomauro/node-dependency-injection.wiki.git
```

And then make and commit your changes

### 6. Done ###

Just commit and send your pull request. 
Thank you for contributing.
