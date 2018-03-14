#! /usr/bin/env node

import program from 'commander'

process.env.SUPPRESS_NO_CONFIG_WARNING = true

program.version('0.0.1')
  .command('config:create', 'Creates a new default configuration file')
  .command('config:check', 'Check for container errors')
  .command('container:service', 'Show information about a single service')
  .parse(process.argv)
