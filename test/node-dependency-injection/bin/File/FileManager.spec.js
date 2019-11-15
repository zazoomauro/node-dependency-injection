import { describe, it, beforeEach, afterEach } from 'mocha'
import chai from 'chai'
import path from 'path'
import sinon from 'sinon'
import fs from 'fs'
import jsYaml from 'js-yaml'
import YamlAdapter from '../../../../bin/Services/File/YamlAdapter'
import FileManager from '../../../../bin/Services/File/FileManager'
import JsonAdapter from '../../../../bin/Services/File/JsonAdapter'
import JsAdapter from '../../../../bin/Services/File/JsAdapter'

const assert = chai.assert

describe('FileManager', () => {
  describe('createConfiguration', () => {
    let fsStub

    beforeEach(() => {
      fsStub = sinon.stub(fs, 'writeFileSync')
    })

    afterEach(() => {
      fsStub.restore()
    })

    it('should return true if create an empty yaml configuration file', () => {
      // Arrange.
      fsStub.returns(undefined)
      const adapter = new YamlAdapter(jsYaml)
      const fileManager = new FileManager(adapter, fs, path)
      const dir = '/foo/bar'
      const name = 'foobar'

      // Act.
      const actual = fileManager.createConfiguration(dir, name)

      // Assert.
      assert.isTrue(actual)
    })

    it('should return false if yaml configuration file fails', () => {
      // Arrange.
      fsStub.throws(new Error())
      const adapter = new YamlAdapter(jsYaml)
      const fileManager = new FileManager(adapter, fs, path)
      const dir = '/foo/bar'
      const name = 'foobar'

      // Act.
      const actual = fileManager.createConfiguration(dir, name)

      // Assert.
      assert.isFalse(actual)
    })

    it('should return true if create an empty json configuration file', () => {
      // Arrange.
      fsStub.returns(undefined)
      const adapter = new JsonAdapter()
      const fileManager = new FileManager(adapter, fs, path)
      const dir = '/foo/bar'
      const name = 'foobar'

      // Act.
      const actual = fileManager.createConfiguration(dir, name)

      // Assert.
      assert.isTrue(actual)
    })

    it('should return false if json configuration file fails', () => {
      // Arrange.
      fsStub.throws(new Error())
      const adapter = new JsonAdapter()
      const fileManager = new FileManager(adapter, fs, path)
      const dir = '/foo/bar'
      const name = 'foobar'

      // Act.
      const actual = fileManager.createConfiguration(dir, name)

      // Assert.
      assert.isFalse(actual)
    })

    it('should return true if create an empty js configuration file', () => {
      // Arrange.
      fsStub.returns(undefined)
      const adapter = new JsAdapter()
      const fileManager = new FileManager(adapter, fs, path)
      const dir = '/foo/bar'
      const name = 'foobar'

      // Act.
      const actual = fileManager.createConfiguration(dir, name)

      // Assert.
      assert.isTrue(actual)
    })

    it('should return false if js configuration file fails', () => {
      // Arrange.
      fsStub.throws(new Error())
      const adapter = new JsAdapter()
      const fileManager = new FileManager(adapter, fs, path)
      const dir = '/foo/bar'
      const name = 'foobar'

      // Act.
      const actual = fileManager.createConfiguration(dir, name)

      // Assert.
      assert.isFalse(actual)
    })

    it('should return true if create an empty configuration file with ' +
      'default name', () => {
      // Arrange.
      fsStub.returns(undefined)
      const adapter = new JsAdapter()
      const fileManager = new FileManager(adapter, fs, path)
      const dir = '/foo/bar'

      // Act.
      const actual = fileManager.createConfiguration(dir)

      // Assert.
      assert.isTrue(actual)
    })
  })
})
