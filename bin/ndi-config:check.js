#! /usr/bin/env node

import chalk from 'chalk'
import path from 'path'
import program from 'commander'
import { ContainerBuilder, YamlFileLoader } from '../lib/'
import JsAdapter from './Services/File/JsAdapter'
import JsonAdapter from './Services/File/JsonAdapter'
import JsFileLoader from '../lib/Loader/JsFileLoader'
import JsonFileLoader from '../lib/Loader/JsonFileLoader'

program.arguments('<path>').action((dir) => {
  const container = new ContainerBuilder()
  dir = path.isAbsolute(dir) ? dir : path.join(process.cwd(), dir)
  let loader

  switch (path.extname(dir)) {
    case JsAdapter.FORMAT:
      loader = new JsFileLoader(container)
      break
    case JsonAdapter.FORMAT:
      loader = new JsonFileLoader(container)
      break
    default:
      loader = new YamlFileLoader(container)
  }

  console.info(chalk.blue(`Checking ${dir}...\n`))

  try {
    loader.load(dir)
    console.info(chalk.green(`Configuration file ${dir} is valid`))
    process.exit(0)
  } catch (e) {
    console.info(chalk.bold.red(`ERROR! ${e.message}`))
    process.exit(1)
  }
}).parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp((helpText) => {
    return chalk.bold.red(helpText)
  })
}
