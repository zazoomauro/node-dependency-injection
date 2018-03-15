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
import 'console.table'

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

  console.info(chalk.blue(`Checking ${dir}...\n`))

  try {
    loader.load(dir)
  } catch (e) {
    console.info(chalk.bold.red(`ERROR! ${e.message}`))
    process.exit(1)
  }

  const def = container.definitions.get(service)
  if (!def) {
    console.info(chalk.bold.red(`Service \`${service}\` not found`))
    process.exit(1)
  }

  let argumentText = ''
  for (const argument of def.args) {
    argumentText += `\n\t- ${(argument.constructor.name)}:\t${chalk.green(argument.id)}`
  }

  console.table([
    {
      Attribute: 'Key',
      Value: service
    },
    {
      Attribute: 'Class Name',
      Value: def.Object.name
    },
    {
      Attribute: 'Arguments',
      Value: argumentText
    },
    {
      Attribute: 'Public',
      Value: def.public.toString()
    },
    {
      Attribute: 'Calls',
      Value: def.calls.length > 0 ? util.inspect(def.calls, false, null) : '[]'
    },
    {
      Attribute: 'Tags',
      Value: def.tags.length > 0 ? util.inspect(def.tags, false, null) : '[]'
    },
    {
      Attribute: 'Properties',
      Value: def.properties.size > 0 ? util.inspect(def.properties, false, null) : '[]'
    },
    {
      Attribute: 'Laziness',
      Value: def.lazy.toString()
    },
    {
      Attribute: 'Deprecated Message',
      Value: def.deprecated
    },
    {
      Attribute: 'Factory',
      Value: util.inspect(def.factory)
    },
    {
      Attribute: 'Synthetic',
      Value: def.synthetic.toString()
    },
    {
      Attribute: 'Decoration',
      Value: (def.decoratedService) ? `${def.decoratedService} ${def.decorationPriority}` : 'null'
    },
    {
      Attribute: 'Shared',
      Value: def.shared
    },
    {
      Attribute: 'Parent',
      Value: def.parent
    }
  ])

  process.exit(0)
}).parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp((helpText) => {
    return chalk.bold.red(helpText)
  })
}
