#!/usr/bin/env node

'use strict'

/* eslint-disable no-console */

const yargs = require('yargs')
const reallyRequire = require('really-require')
require('colors')

const argv = yargs
  .argv

let ERROR = false
let WARN = false

function warn (data) {
  let loc = ''
  if (data.location) {
    loc = data.location
    loc = ' @ ' + loc.file + ' ' + loc.from.line + ':' + loc.from.column + ' -> ' + loc.to.line + ':' + loc.to.column
  }
  if (data.error) {
    ERROR = true
    console.error('%s%s: %s'.red, 'ERROR'.bold, loc, data.message)
  } else {
    WARN = true
    console.error('%s%s: %s'.yellow, 'WARN'.bold, loc, data.message)
  }
}

reallyRequire(argv._[0] || process.cwd(), argv)
  .then((result) => {
    result.missing.forEach(warn)
    result.unused.forEach(warn)
    result.errors.forEach(err => {
      console.error('Parser Error: %s @ %s', err.error.toString(), err.file)
      ERROR = true
    })

    if (result.missing.length || result.unused.length || result.errors.length) {
      console.error('')
    }

    if (ERROR) {
      console.error(' %s Detected Errors', '✖'.red.bold)
      process.exit(2)
    } else if (WARN) {
      console.error(' %s Detected Warnings', '⚠️'.yellow.bold)
      process.exit(argv.werror ? 2 : 0)
    } else {
      console.error(' %s All good', '✔'.green.bold)
      process.exit(0)
    }
  })
  .catch((err) => {
    console.error(err.stack)
    process.exit(2)
  })
