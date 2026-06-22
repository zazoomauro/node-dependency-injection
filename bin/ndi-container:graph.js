#! /usr/bin/env node

import chalk from 'chalk'
import path from 'path'
import program from 'commander'
import { ContainerBuilder, YamlFileLoader } from '../lib/'
import JsAdapter from './Services/File/JsAdapter'
import JsonAdapter from './Services/File/JsonAdapter'
import XmlAdapter from './Services/File/XmlAdapter'
import JsFileLoader from '../lib/Loader/JsFileLoader'
import JsonFileLoader from '../lib/Loader/JsonFileLoader'
import XmlFileLoader from '../lib/Loader/XmlFileLoader'

program
  .arguments('<path>')
  .option('--format <format>', 'Output format: mermaid, dot, json', 'mermaid')
  .option('--filter <pattern>', 'Filter service ids with a regex')
  .option('--tag <name>', 'Filter services by tag')
  .option('--root <id>', 'Show graph starting from this root service')
  .option('--depth <number>', 'Depth from root', (value) => parseInt(value, 10))
  .option('--exclude-private', 'Exclude private services')
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
      await container.compile()
    } catch (e) {
      console.error(chalk.bold.red(`ERROR loading container: ${e.message}`))
      process.exit(1)
    }

    const options = {
      tag: cmd.tag,
      root: cmd.root,
      depth: Number.isInteger(cmd.depth) ? cmd.depth : undefined,
      excludePrivate: Boolean(cmd.excludePrivate)
    }

    if (cmd.filter) {
      try {
        options.filter = new RegExp(cmd.filter)
      } catch (e) {
        console.error(chalk.bold.red(`Invalid --filter regex: ${e.message}`))
        process.exit(1)
      }
    }

    try {
      const output = container.exportGraph(cmd.format, options)
      if (cmd.format === 'json') {
        console.log(JSON.stringify(output, null, 2))
      } else {
        console.log(output)
      }
      process.exit(0)
    } catch (e) {
      console.error(chalk.bold.red(`ERROR exporting graph: ${e.message}`))
      process.exit(1)
    }
  })
  .parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp((helpText) => chalk.bold.red(helpText))
}
