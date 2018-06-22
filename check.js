#!/usr/bin/env node

const glob = require('glob')
const fs = require('fs')
const path = require('path')

const dir = process.argv[2]

console.log('Checking src/**/*.js in %s...', dir)

const pkg = require(dir + '/package.json')
const deps = Object.keys(pkg.dependencies)
const devDeps = Object.keys(pkg.devDependencies)
let unused = deps.slice(0)
const hasDep = dep => ~deps.indexOf(dep)
const files = glob.sync(dir + '/src/**/*.js')

files.forEach(file => {
  const content = String(fs.readFileSync(file))
  const requireRE = /require\('([a-z0-9@\/_-]+)'\)/gmi

  let match
  while ((match = requireRE.exec(content))) {
    let fullName = match[1].split('/').slice(0, match[1].startsWith('@') ? 2 : 1).join('/')
    unused = unused.filter(dep => dep !== fullName)
    if (!hasDep(fullName)) {
      let split = content.substr(0, match.index).split('\n')
      let line = split.length
      let col = split.pop().length + 1
      console.log('ERROR %s:%s:%s: Dependency "%s" required but %s', path.relative(dir, file), line, col, fullName, devDeps.indexOf(fullName) !== -1 ? 'only declared as dev-dependency' : 'not declared in package.json') // TODO: use require.resolve() to check if dep is in node_modules and use warn for in-direct deps, error for missing
    }
  }
})

unused.forEach(dep => {
  console.log('WARN: Dependency "%s" is defined in package.json but never used. Move it to devDependencies or remove it completely.', dep)
})
