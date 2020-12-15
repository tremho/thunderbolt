
var fs = require('fs');
const path = require('path')

console.log('webpack script running')

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

function copyFolderRecursiveSync( source, target ) {
  var files = [];

  //check if folder needs to be created or integrated
  var targetFolder = path.join( target, path.basename( source ) );
  console.log('from '+source+ ' to '+targetFolder)

  if ( !fs.existsSync( targetFolder ) ) {
    fs.mkdirSync( targetFolder, {recursive: true} );
  }

  //copy
  if ( fs.lstatSync( source ).isDirectory() ) {
    files = fs.readdirSync( source );
    files.forEach( function ( file ) {
      var curSource = path.join( source, file );
      if ( fs.lstatSync( curSource ).isDirectory() ) {
        copyFolderRecursiveSync( curSource, targetFolder );
      } else {
        copyFileSync( curSource, targetFolder );
      }
    } );
  }
}

function cleanFolder(folderPath) {
  fs.rmdirSync(folderPath,{recursive: true});
  fs.mkdirSync(folderPath);
}

// tsc has already put js files in build directory, so don't clean it.
const root = path.resolve(__dirname, '../../') // back out of buildcycle/before-bundle
const srcPath = path.resolve(root, 'src')
const buildPath = path.resolve(root, 'build')
const distPath = path.resolve(root, 'dist')
copyFolderRecursiveSync(path.join(srcPath, 'components'), buildPath)
console.log('copy complete')
