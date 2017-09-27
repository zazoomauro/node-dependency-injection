#! /usr/bin/env node

import chalk from 'chalk'
import path from 'path'
import program from 'commander'
import util from 'util'
import { ContainerBuilder, YamlFileLoader } from '../lib/'
import JsAdapter from './Services/File/JsAdapter'
import JsonAdapter from './Services/File/JsonAdapter'
import JsFileLoader from '../lib/Loader/JsFileLoader'
import JsonFileLoader from '../lib/Loader/JsonFileLoader'
import Reference from '../lib/Reference'
import PackageReference from '../lib/PackageReference'

program.arguments('<path> <service>').action((dir, service) => {
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

  console.info(chalk.blue(
    `Checking ${dir}...
`))

  try {
    loader.load(dir)
  } catch (e) {
    console.info(chalk.bold.red(`

ERROR!
Exception name: ${e.name}
Exception message: ${e.message}

`))
    process.exit(1)
  }

  const def = container.definitions.get(service)
  if (!def) {
    console.info(chalk.bold.red(`Service \`${service}\` not found`))

    process.exit(1)
  }

  let argumentText = ''
  for (const argument of def.args) {
    if (argument instanceof Reference || argument instanceof PackageReference) {
      argumentText += `* ${chalk.green(argument.id)}\n`
    }
  }

  console.info(chalk.green(`
${chalk.bold.green('Key:')}                      ${service}
${chalk.bold.green('Class Name:')}               ${def.Object.name}
${chalk.bold.green('Arguments:')}
${argumentText}
${chalk.bold.green('Public:')}                   ${def.public.toString()}
${chalk.bold.green('Calls:')}                    ${def.calls.length > 0
    ? util.inspect(def.calls, false, null) : '[]'}
${chalk.bold.green('Tags:')}                     ${def.tags.length > 0
    ? util.inspect(def.tags, false, null) : '[]'}
${chalk.bold.green('Properties:')}               ${def.properties.size > 0
    ? util.inspect(def.properties, false, null) : '[]'}
${chalk.bold.green('Laziness:')}                 ${def.lazy.toString()}
${chalk.bold.green('Deprecated:')}               ${def.deprecated}
${chalk.bold.green('Factory:')}                  ${util.inspect(def.factory)}
${chalk.bold.green('Synthetic:')}                ${def.synthetic.toString()}
${chalk.bold.green('Decoration:')}
  ${chalk.bold.green('Service:')}                ${def.decoratedService}
  ${chalk.bold.green('Priority:')}               ${def.decorationPriority}
${chalk.bold.green('Shared:')}                   ${def.shared.toString()}
${chalk.bold.green('Parent:')}                   ${def.parent}
`))

  process.exit(0)
}).parse(process.argv)
