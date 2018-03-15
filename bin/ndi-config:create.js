#! /usr/bin/env node

import chalk from 'chalk'
import path from 'path'
import program from 'commander'
import YamlAdapter from './Services/File/YamlAdapter'
import JsAdapter from './Services/File/JsAdapter'
import JsonAdapter from './Services/File/JsonAdapter'
import { ContainerBuilder, YamlFileLoader } from '../lib/'

const regex = new RegExp(
  `(${YamlAdapter.FORMAT}|${JsonAdapter.FORMAT}|${JsAdapter.FORMAT})`)
const format = YamlAdapter.FORMAT

program
  .option('-n, --name [name]', 'File name', 'services')
  .option('-f, --format [format]', 'Configuration file format', regex, format)
  .arguments('<path>')
  .action((dir) => {
    const container = new ContainerBuilder()
    const loader = new YamlFileLoader(container)
    loader.load(path.join(__dirname, 'Resources', 'services.yaml'))

    console.log(`
${chalk.bold.blue(`Creating empty ${program.format} configuration file...`)}

Path: ${chalk.green(dir)}
File name: ${chalk.green(program.name)}
File format: ${chalk.green(program.format)}
`)

    const fileManager = container.get(`ndi.file.file_manager.${program.format}`)
    if (fileManager.createConfiguration(dir, program.name)) {
      console.log(chalk.bold.green('Configuration file created successfully!'))
    } else {
      console.error(chalk.bold.red(`Wait! Error creating configuration file!`))
    }
  })
  .parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp((helpText) => {
    return chalk.bold.red(helpText)
  })
}
