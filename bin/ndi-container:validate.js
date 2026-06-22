#! /usr/bin/env node

import chalk from 'chalk'
import path from 'path'
import program from 'commander'
import { ContainerBuilder, YamlFileLoader, XmlFileLoader } from '../lib/'
import JsAdapter from './Services/File/JsAdapter'
import JsonAdapter from './Services/File/JsonAdapter'
import XmlAdapter from './Services/File/XmlAdapter'
import JsFileLoader from '../lib/Loader/JsFileLoader'
import JsonFileLoader from '../lib/Loader/JsonFileLoader'

program
  .arguments('<path>')
  .option('--strict', 'Exit with code 1 on warnings as well')
  .option('--format <format>', 'Output format: text or json', 'text')
  .action(async (dir, cmd) => {
    const container = new ContainerBuilder()
    dir = path.isAbsolute(dir) ? dir : path.join(process.cwd(), dir)
    let loader

    switch (path.extname(dir).split('.').pop()) {
      case JsAdapter.FORMAT:
        loader = new JsFileLoader(container)
        break
      case JsonAdapter.FORMAT:
        loader = new JsonFileLoader(container)
        break
      case XmlAdapter.FORMAT:
        loader = new XmlFileLoader(container)
        break
      default:
        loader = new YamlFileLoader(container)
    }

    try {
      await loader.load(dir)
    } catch (e) {
      if (cmd.format === 'json') {
        console.log(JSON.stringify({ error: e.message }))
      } else {
        console.error(chalk.bold.red(`ERROR loading file: ${e.message}`))
      }
      process.exit(1)
    }

    let result

    try {
      result = await container.compile({ validate: true, throwOnError: false })
    } catch (e) {
      if (cmd.format === 'json') {
        console.log(JSON.stringify({ error: e.message }))
      } else {
        console.error(chalk.bold.red(`Unexpected error during validation: ${e.message}`))
      }
      process.exit(1)
    }

    if (cmd.format === 'json') {
      console.log(JSON.stringify({
        isValid: result.isValid,
        serviceCount: result.serviceCount,
        errors: result.errors,
        warnings: result.warnings,
        info: result.info
      }, null, 2))
    } else {
      _printReport(result)
    }

    const hasErrors = result.errors.length > 0
    const hasWarnings = result.warnings.length > 0

    if (hasErrors || (cmd.strict && hasWarnings)) {
      process.exit(1)
    } else {
      process.exit(0)
    }
  })
  .parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp((helpText) => chalk.bold.red(helpText))
}

function _printReport (result) {
  const width = 52
  const border = '═'.repeat(width)
  const errCount = result.errors.length
  const warnCount = result.warnings.length
  const infoCount = result.info.length

  console.log(chalk.cyan(`╔${border}╗`))
  console.log(chalk.cyan('║') + chalk.bold.white('       Container Validation Report'.padEnd(width)) + chalk.cyan('║'))
  console.log(chalk.cyan(`╠${border}╣`))

  for (const issue of result.errors) {
    const line = ` ✗ ERROR   ${issue.message}`.slice(0, width).padEnd(width)
    console.log(chalk.cyan('║') + chalk.red(line) + chalk.cyan('║'))
  }

  for (const issue of result.warnings) {
    const line = ` ⚠ WARN    ${issue.message}`.slice(0, width).padEnd(width)
    console.log(chalk.cyan('║') + chalk.yellow(line) + chalk.cyan('║'))
  }

  for (const issue of result.info) {
    const line = ` ℹ INFO    ${issue.message}`.slice(0, width).padEnd(width)
    console.log(chalk.cyan('║') + chalk.blue(line) + chalk.cyan('║'))
  }

  console.log(chalk.cyan(`╠${border}╣`))

  const summary = ` Result: ${errCount} error(s), ${warnCount} warning(s), ${infoCount} info`.padEnd(width)
  const svcLine = ` ${result.serviceCount} services analyzed`.padEnd(width)
  console.log(chalk.cyan('║') + chalk.white(summary) + chalk.cyan('║'))
  console.log(chalk.cyan('║') + chalk.white(svcLine) + chalk.cyan('║'))
  console.log(chalk.cyan(`╚${border}╝`))
}
