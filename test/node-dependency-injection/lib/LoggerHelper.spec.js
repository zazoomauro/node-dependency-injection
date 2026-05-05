import { describe, it } from 'mocha'
import chai from 'chai'
import Sinon from 'sinon'
import LoggerHelper from '../../../lib/LoggerHelper'

const assert = chai.assert

describe('LoggerHelper', () => {
  describe('parseLevel', () => {
    it('should parse valid levels', () => {
      assert.strictEqual(LoggerHelper.parseLevel('silent'), LoggerHelper.LEVEL_SILENT)
      assert.strictEqual(LoggerHelper.parseLevel('warn'), LoggerHelper.LEVEL_WARN)
      assert.strictEqual(LoggerHelper.parseLevel('info'), LoggerHelper.LEVEL_INFO)
      assert.strictEqual(LoggerHelper.parseLevel('debug'), LoggerHelper.LEVEL_DEBUG)
    })

    it('should throw on invalid level', () => {
      assert.throw(() => LoggerHelper.parseLevel('verbose'), TypeError)
    })
  })

  describe('warn', () => {
    it('should call warn when verbosity is warn', () => {
      // Arrange.
      const logger = { warn: Sinon.spy() }
      const helper = new LoggerHelper(logger, 'warn')

      // Act.
      helper.warn('test message')

      // Assert.
      assert.isTrue(logger.warn.calledWith('test message'))
    })

    it('should not call warn when verbosity is silent', () => {
      // Arrange.
      const logger = { warn: Sinon.spy() }
      const helper = new LoggerHelper(logger, 'silent')

      // Act.
      helper.warn('test message')

      // Assert.
      assert.isFalse(logger.warn.called)
    })

    it('should call warn when verbosity is debug', () => {
      // Arrange.
      const logger = { warn: Sinon.spy() }
      const helper = new LoggerHelper(logger, 'debug')

      // Act.
      helper.warn('test message')

      // Assert.
      assert.isTrue(logger.warn.called)
    })
  })

  describe('info', () => {
    it('should call info when verbosity is info', () => {
      // Arrange.
      const logger = { warn: Sinon.spy(), info: Sinon.spy() }
      const helper = new LoggerHelper(logger, 'info')

      // Act.
      helper.info('info message')

      // Assert.
      assert.isTrue(logger.info.calledWith('info message'))
    })

    it('should call info when verbosity is debug', () => {
      // Arrange.
      const logger = { warn: Sinon.spy(), info: Sinon.spy() }
      const helper = new LoggerHelper(logger, 'debug')

      // Act.
      helper.info('info message')

      // Assert.
      assert.isTrue(logger.info.called)
    })

    it('should not call info when verbosity is warn', () => {
      // Arrange.
      const logger = { warn: Sinon.spy(), info: Sinon.spy() }
      const helper = new LoggerHelper(logger, 'warn')

      // Act.
      helper.info('info message')

      // Assert.
      assert.isFalse(logger.info.called)
    })

    it('should not throw when logger lacks info method and verbosity is info', () => {
      // Arrange.
      const logger = { warn: Sinon.spy() }
      const helper = new LoggerHelper(logger, 'info')

      // Act & Assert.
      assert.doesNotThrow(() => helper.info('info message'))
    })
  })

  describe('debug', () => {
    it('should call debug when verbosity is debug', () => {
      // Arrange.
      const logger = { warn: Sinon.spy(), debug: Sinon.spy() }
      const helper = new LoggerHelper(logger, 'debug')

      // Act.
      helper.debug('debug message')

      // Assert.
      assert.isTrue(logger.debug.calledWith('debug message'))
    })

    it('should not call debug when verbosity is info', () => {
      // Arrange.
      const logger = { warn: Sinon.spy(), debug: Sinon.spy() }
      const helper = new LoggerHelper(logger, 'info')

      // Act.
      helper.debug('debug message')

      // Assert.
      assert.isFalse(logger.debug.called)
    })

    it('should not throw when logger lacks debug method and verbosity is debug', () => {
      // Arrange.
      const logger = { warn: Sinon.spy() }
      const helper = new LoggerHelper(logger, 'debug')

      // Act & Assert.
      assert.doesNotThrow(() => helper.debug('debug message'))
    })
  })

  describe('backward compatibility', () => {
    it('should work with a warn-only logger at debug verbosity without throwing', () => {
      // Arrange.
      const logger = { warn: Sinon.spy() }
      const helper = new LoggerHelper(logger, 'debug')

      // Act & Assert.
      assert.doesNotThrow(() => {
        helper.warn('warn')
        helper.info('info')
        helper.debug('debug')
      })
      assert.isTrue(logger.warn.calledWith('warn'))
    })
  })
})
