'use strict'

// Note: this *MUST NOT* globally depend on any module installed in `node_modules`, as it could be
// loaded before they're installed.

const { p, run, exec, packageList } = require('./internal/util.js')
const { blue, green } = require('./internal/color').stdout
const deployTemplate = require('./internal/deploy-template.js')
const writeConfig = require('./internal/write-config.js')

function runTask (task, args = []) {
  return run(
    'npm', ['run', task, '--', ...args],
    { action: 'dev-portal/ task', target: task, cwd: p('dev-portal') }
  )
}

function printReady () {
  console.log()
  console.log(green('Process Complete! Run `node run start` to launch run the dev portal locally.'))
  console.log()
}

require('./internal/execute-tasks.js')({
  async install () {
    await exec('node', [p('scripts/npm'), 'install'])
  },

  async reinstall () {
    // Note: this might not necessarily be installed yet, so it can't be loaded globally.
    const fse = require('fs-extra')

    for (const { target, resolved } of packageList) {
      console.log(green('Deleting ') + blue(target))
      await fse.remove(resolved)
    }

    console.log(green('Preparing dependencies...'))
    // We have the package and distribution bundles here in source control, and these should only
    // be updated with that dependency. (Removing them causes build issues.)
    await run('git', ['checkout', '--', 'dev-portal/node_modules'])

    await this.install()
  },

  async lint () {
    await exec('eslint')
    await this['cfn-lint']()
  },

  async test (opts) {
    await exec('node', [p('scripts/test'), ...Object.entries(opts).map(p => '--' + p.join('='))], {
      // Output with color, even through pipes.
      // Do proxy existing color support, though.
      env: { ...process.env, FORCE_COLOR: true }
    })
  },

  async build () {
    // Note: this might not necessarily be installed yet, so it can't be loaded globally.
    const fse = require('fs-extra')

    await runTask('build')
    await fse.remove(p('lambdas/static-asset-uploader/build'))
    await fse.copy(p('dev-portal/build'), p('lambdas/static-asset-uploader/build'))
  },

  async deploy () {
    await deployTemplate()
    printReady()
  },

  async release () {
    await this.build()
    await deployTemplate()
    await this['reset-assets']()
    printReady()
  },

  async start () {
    await writeConfig()
    await runTask('start')
  },

  async 'reset-assets' () {
    await exec('git', ['checkout', '--force', '--', 'lambdas/static-asset-uploader/build'])
    await exec('git', ['clean', '-d', '--force', '--', 'lambdas/static-asset-uploader/build'])
  },

  async 'cfn-lint' () {
    await exec('cfn-lint')
  }
})
