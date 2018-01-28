#!/usr/bin/env node
'use strict'

const meow = require('meow')
const filess = require('./filess')
const chalk = require('chalk')

const cli = meow(`
  ${chalk.green('Usage')}
    $ filess <${chalk.gray('options')}>

  ${chalk.green('Options')}
    ${chalk.blue('--dir')}, ${chalk.blue(chalk.bold('-d'))}     ${chalk.gray('Set the directory you wanna serve, ')}${chalk.red('default: ~/')}
    ${chalk.blue('--port')}, ${chalk.blue(chalk.bold('-p'))}    ${chalk.gray('Set the port, ')}${chalk.red('default: 3030')}
    ${chalk.blue('--help')}, ${chalk.blue(chalk.bold('-h'))}    ${chalk.gray('Showing this help menu')}
    ${chalk.blue('--version')}, ${chalk.blue(chalk.bold('-v'))} ${chalk.gray('Show version')}
    
  ${chalk.green('Examples')}
    ${chalk.gray('$ filess')}
    ${chalk.gray('$ filess -d ~/Videos')}
    ${chalk.gray('$ filess -p 3000')}
    ${chalk.gray('$ filess -d ~/ -p 3000')}
`, {
  alias: {
    d: 'dir',
    p: 'port',
    h: 'help',
    v: 'version'
  },
  flags: {
    port: {
      type: 'integer',
      alias: 'p',
      default: null
    },
    dir: {
      type: 'string',
      alias: 'd',
      default: null
    }
  }
})

filess(cli.flags.d, cli.flags.p)
