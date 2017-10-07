#!/usr/bin/env node
'use strict'

const meow = require('meow')
const filess = require('./filess')

const cli = meow(`
  Usage
    $ filess <options>

  Options
    --dir, -d   Set the directory you wanna serve, default: ~/
    --port, -p  Set the port, default: 3030
    --help, -h  Showing this help menu
    
  Examples
    $ filess
    $ filess -d ~/Videos
    $ filess -p 3000
    $ filess -d ~/ -p 3000
`, {
  alias: {
    d: 'dir',
    p: 'port',
    h: 'help'
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