/*
Gather host environment data and any of the defines
and write out as BuildEnvironment.json in the ./build/src folder
 */


const fs = require('fs')
const path = require('path')
const os = require('os')

let mainPackageJSON
let environment;

function setEnvironment() {
  environment = {
    framework: {
      name: 'ThunderBolt/Desktop',
      version: mainPackageJSON.version,
    },
    platform: {
      name: os.platform(),
      version: os.release()
    },
    node: {
      version: process.versions.node
    }
    // electron
    // nativescript

  }
}

const tbroot = path.join(__dirname, '../..') // out of buildcycle/after-compile

function readMainPackageJSON() {
  const contents = fs.readFileSync(path.join(tbroot, 'package.json')).toString()
  try {
    mainPackageJSON = JSON.parse(contents)
  } catch(e) {
    throw Error('Unable to read package.json: '+e.message)
  }
}

function writeEnvironment() {
  try {
    const str = '\n' + JSON.stringify(environment, null, 2) + '\n'
    const outPath = path.normalize(path.join(tbroot, 'src', 'BuildEnvironment.json'))
    // console.log('writing to ', outPath)
    fs.writeFileSync(outPath, str)
  } catch(e) {
    console.error(e)
  }
}

readMainPackageJSON()
setEnvironment()

// TODO: Gather the defines
// Other values can be assigned at runtime
// note that platform data should reflect actual runtime discovery (in Electron main and {N} appMain)
// prior to that time it wil reflect the 'built-on' platform.
// todo: if nativescript, provide nativescript version

writeEnvironment()
