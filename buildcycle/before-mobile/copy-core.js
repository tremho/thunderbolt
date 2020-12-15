/*
Copy cross-platform coded files for app-core functionality to the nativescript app/Bridge folder
 */

const fs = require('fs')
const path = require('path')

function copyFileSync( source, target ) {

  var targetFile = target;

  //if target is a directory a new file with the same name will be created
  if ( fs.existsSync( target ) ) {
    if ( fs.lstatSync( target ).isDirectory() ) {
      targetFile = path.join( target, path.basename( source ) );
    }
  }

  fs.writeFileSync(targetFile, fs.readFileSync(source));
}

const tbroot = path.resolve(__dirname, '../../') // back out of buildcycle/before-mobile
const nsBridge = path.join(tbroot, 'NativeScript', 'ThunderBolt-NS', 'app', 'Bridge')
const appCore = path.join(tbroot, 'src', 'app-core')
const dtBuildEnv = path.join(tbroot, 'build', 'BuildEnvironment.json')
const nsBuildEnv = path.join(tbroot, 'NativeScript', 'ThunderBolt-NS', 'app', 'BuildEnvironment.json')

copyFileSync(path.join(appCore, 'AppCore.ts'), path.join(nsBridge, 'AppCore.ts'))
copyFileSync(path.join(appCore, 'AppModel.ts'), path.join(nsBridge, 'AppModel.ts'))
copyFileSync(path.join(appCore, 'ComBinder.ts'), path.join(nsBridge, 'ComBinder.ts'))
copyFileSync(path.join(appCore, 'ComCommon.ts'), path.join(nsBridge, 'ComCommon.ts'))
copyFileSync(path.join(appCore, 'EnvCheck.ts'), path.join(nsBridge, 'EnvCheck.ts'))
copyFileSync(dtBuildEnv, nsBuildEnv)
