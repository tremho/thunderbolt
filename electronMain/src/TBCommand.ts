
/*
Start for app mode:

From app directory:

 p=`pwd`; cd ~/tbd/thunderbolt/electronMain; npm run start $p

 */

import {loadLoggerConfig, setLoggerConfig, getLogger} from 'gen-logger'
import * as path from 'path'
import * as fs from 'fs'
import {spawn} from 'child_process'
const os = require('os')

const defLogConfig = {
    "writers": [
        {
            "name": "Default",
            "type": "Console",
        }
    ],
    "loggers": [
        {
            "name": "Main",
            "writers": ["Default"]
        }
    ]
}

let Log
let tbRootPath
let appFolderPath
let tbAppConfigPath
let tbAppConfig
let tbCommand
let buildPath;
let commandList = []

function startCLI() {
    
    setLoggerConfig(defLogConfig)
    Log = getLogger('Main')
    tbRootPath = path.normalize(process.argv[1])
    let argPath = process.argv[2] || '.'
    appFolderPath = path.normalize(path.isAbsolute((argPath)) ? argPath : path.join(tbRootPath, argPath))

    commandList = process.argv.slice(3)

    Log.info('---- Starting the Thunderbolt CLI process ----')

    tbAppConfigPath = path.join(appFolderPath, '.app.tb')
    if(fs.existsSync(tbAppConfigPath)) {
        try {
            const contents = fs.readFileSync(tbAppConfigPath).toString()
            tbAppConfig = JSON.parse(contents)
            Log.info('app config', tbAppConfig)
        } catch(e) {
            Log.exception(e)
            process.exit(1)
        }
    } else {
        Log.error(`No .app.tb file found in ${appFolderPath}`)
        process.exit(2)
    }

    let logConfig = tbAppConfig.logConfig
    if(typeof logConfig === 'object') {
        setLoggerConfig(logConfig)
    } else if(typeof logConfig === 'string') {
        // assumed to be a valid path
        let logConfigPath = path.isAbsolute(logConfig) ? logConfig : path.join(appFolderPath, logConfig)
        loadLoggerConfig(logConfigPath)
    }
    Log = getLogger(tbAppConfig.mainLogName || 'Main')

    Log.info('Welcome to Thunderbolt!')

    // commandList = ['clean', 'build']
    generateBuild()
}

function displayHelp() {
    const help = `Thunderbolt CLI

usage:
    tbx cmd1 [cmd2 [cmd3 ...]]
    
where commands can be:

    clean - clean the build directory
    build - build the app
    run - build if necessary, then run the app
    dev - make a development build (default)
    release - make a release build
`
    console.log(help)
}

function setBuildPath() {
    buildPath = path.join(appFolderPath, 'build')
}

function cleanTarget() {
    Log.debug('cleaning build folder of ', appFolderPath)
    let p = Promise.resolve()
    if(fs.existsSync(buildPath)) {
        p = executeCommand('rm', ['-fr', 'build'], appFolderPath)

    }
    return p.then(() => {
        return executeCommand('mkdir', ['build'], appFolderPath)
    })
}

let executePromise = Promise.resolve()

function executeCommand(cmd, args, cwd, warnMode= '', silent=false):Promise<any> {
    return  new Promise(resolve => {
        const proc = spawn(cmd, args, {cwd})
        proc.stdout.on('data', data => {
            if(silent) return
            const str = data.toString().trim()
            if(warnMode === 'webpack') {
                return
            }
            Log.log(str)
        })
        proc.stderr.on('data', data => {
            if(silent) return
            const str = data.toString().trim()
            if(warnMode === 'npm') {
                if(str.indexOf('WARN') !== -1) {
                    return Log.warn(str)
                } else {
                    Log.log(str)
                }
            }
            if(warnMode === 'webpack') {
                const lns = str.split('\n')
                const ERROR='\u001b[31m'
                const WARNING = '\u001b[34m'
                const NORMAL = '\u001b[0m'
                lns.forEach(ln => {
                    if(ln.indexOf('"Chain') !== -1 && ln.indexOf('Ignoring attempt to redefine') !== -1) {
                        ln = ''
                    }
                    if(ln.indexOf('WARNING') !== -1) {
                        ln = WARNING + ln
                    } else {
                        if(ln.indexOf('ERROR') !== -1) ln = ERROR + ln
                    }
                    console.log(ln)
                })
                return console.log(NORMAL)
            }
            Log.error(str)
        })
        proc.on('error', error => {
            Log.exception(error)
            resolve(-1)
        })
        proc.on('close', code => {
            resolve(code)
        })
    })
}

const copyInstructions = [
    {
        source: 'framework',
        from: `src`,
        pattern: /.js$/,
        to: 'src',
        recurse: false
    },
    {
        source: 'framework',
        from: `src`,
        pattern: /.[ts|riot]$/,
        to: 'src',
        exclude: /pages/,
        recurse: true
    },
    {
        source: 'app',
        from: `pages`,
        pattern: /.[ts|riot]$/,
        to: 'src/components/global/pages',
        recurse: true
    }

]

function addCopyPaths() {
    const paths = tbAppConfig.paths || {}
    Object.getOwnPropertyNames(paths).forEach(p => {
        const value = paths[p]
        if(value !== 'pages') {
            copyInstructions.push({
                source: 'app',
                from: value,
                pattern: /./,
                to: `src/${value}`,
                recurse: true

            })
        }
    })
}


function doCopy(source, from, to, pattern, exclude, recurse) {
    const sourcePath = source === 'framework' ? path.resolve(path.join(tbRootPath, '..')) : path.resolve(path.join(appFolderPath))
    if(!path.isAbsolute(from)) from = path.join(sourcePath, from)
    if(!path.isAbsolute(to)) to = path.join(appFolderPath, 'build', to)
    if(!fs.existsSync(to)) {
        fs.mkdirSync(to, {recursive:true})
    }
    if(fs.existsSync(from)) {
        const files = fs.readdirSync(from, {withFileTypes: true})
        for (let i = 0; i < files.length; i++) {
            const f = files[i]
            if (!exclude || !exclude.test(f.name)) {
                if (recurse && f.isDirectory()) {
                    let newFrom = path.join(from, f.name)
                    let newTo = path.join(to, f.name)
                    doCopy(source, newFrom, newTo, pattern, exclude, recurse)
                }
                if (f.isFile()) {
                    if (!pattern || pattern.test(f.name)) {
                        fs.copyFileSync(path.join(from, f.name), path.join(to, f.name))
                    }
                }
            }
        }
    }
}
const appRiotTemplate =
    `
<app>
    <div bind="navigation.pageId">
$$$PageList$$$
    </div>
    <style>
    </style>
    <script>
      import {newCommon} from '../../../app-core/ComCommon'
      let cm;
      export default {
        state: {},
        bound: {},
        onMounted(props, state) {
          cm = newCommon(this)
          cm.bindComponent()
          console.log('App Page Context Mounted', this.bound)
        }
      }
    </script>
</app>  
`

function makeAppPageList() {
    const buildRoot = path.join(appFolderPath, 'build')
    const components = path.join(buildRoot, 'src', 'components')
    const pages = path.join(components, 'global', 'pages')
    const appRiotFile = path.join(components, 'global', 'main', 'app.riot')

    function enumerateRiotPages() {
        const pageOut = []
        const dirents = fs.readdirSync(pages, {withFileTypes: true})
        dirents.forEach(dirent => {
            const name = dirent.name
            const did = name.lastIndexOf('.')
            if (did !== -1) {
                const ext = name.substring(did)
                if (ext === '.riot') {
                    const pageName = name.substring(0, did)
                    let di = pageName.indexOf('-page')
                    if (di !== -1) {
                        const pageId = pageName.substring(0, di)
                        if (fs.existsSync(path.join(pages, pageName + '.ts'))) { // we must have a code page too
                            pageOut.push(pageId)
                        }
                    } else {
                        console.warn(`non-page .riot file "${name}" found in "pages" folder`)
                    }
                }
            }
        })
        return pageOut
    }

    function createAppRiot(pageList = []) {
        let pagegen = ''
        pageList.forEach(pageId => {
            pagegen += `        <${pageId}-page if="{bound.pageId === '${pageId}'}"/>\n`
        })
        pagegen = pagegen.substring(0, pagegen.length - 1) // take off the last \n
        let src = appRiotTemplate.replace('$$$PageList$$$', pagegen)
        fs.writeFileSync(appRiotFile, src)
    }

    const list = enumerateRiotPages()
    createAppRiot(list)
}
function makeEnvironment() {
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

    const framework = path.resolve(path.join(tbRootPath, '..'))

    function readMainPackageJSON() {
        const contents = fs.readFileSync(path.join(framework, 'package.json')).toString()
        try {
            mainPackageJSON = JSON.parse(contents)
        } catch(e) {
            throw Error('Unable to read package.json: '+e.message)
        }
    }

    function writeEnvironment() {
        try {
            const str = '\n' + JSON.stringify(environment, null, 2) + '\n'
            const outPath = path.normalize(path.join(appFolderPath, 'build', 'src', 'BuildEnvironment.json'))
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
}

function writePackageJson() {
    tbAppConfig
    // name, version, description, author, license
    let {name, majorVersion, minorVersion, description, author, license} = tbAppConfig
    let dependencies = {
        "riot": "^4.13.5",
        "gen-format": "file:../../gen-format",
        "gen-logger": "file:../../gen-logger",
        "tb-log": "file:../../thunderbolt/exports/tb-log"
    }
    let devDependencies = {
        "@fortawesome/fontawesome-free": "^5.14.0",
        "@riotjs/compiler": "^4.10.1",
        "@riotjs/ssr": "^5.0.0",
        "@riotjs/webpack-loader": "^4.0.3",
        "@types/node": "^14.14.31",
        // "@types/riot": "^4.1.0",
        "base-64": "^1.0.0",
        // "esm": "^3.2.25",
        // "jsdom": "^16.4.0",
        // "jsdom-global": "^3.0.2",
        // "sass": "^1.26.10",
        // "sourcemap-codec": "^1.4.8",
        "tap": "^14.11.0",
        "ts-loader": "^8.0.3",
        // "typescript": "^4.0.2",
        "webpack": "^4.44.1",
        "webpack-cli": "^3.3.12",
        // "webpack-dev-server": "^3.11.0"
    }
    let revision = 0; // We need to figure this out later. can't read from here, because it is destroyed.
    let pkgInfo = {
        name,
        description,
        version: `${majorVersion}.${minorVersion}.${revision}`,
        author,
        license,
        main: 'index.js',
        dependencies,
        devDependencies
    }
    const jsonFile = path.join(appFolderPath, 'build', 'package.json')
    fs.writeFileSync(jsonFile, JSON.stringify(pkgInfo, null, 2))
}

function generateWebpackConfig() {
    const wpcfg = `
    const webpack = require('webpack')
    const path = require('path')

    module.exports = {
        entry: './src/appMain.js',
        output: {
            path: path.resolve(__dirname, 'dist'),
            publicPath: '/dist/',
            filename: 'bundle.js'
        },
        devtool: 'eval-source-map',
        devServer: {
            open: true
        },
        module: {
            rules: [
                {
                    test: /\.riot$/,
                    exclude: /node_modules/,
                    use: [{
                        loader: '@riotjs/webpack-loader',
                        options: {
                            hot: true
                        }
                    }]
                },
                {
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    use: [{
                        loader: 'ts-loader',
                    }]
                },
                {
                    test: /\.json$/,
                    exclude: /node_modules/
                },
            ]
        },
        resolve: {
            extensions: [ '.tsx', '.ts', '.js' ],
        }
    }        
`
    const pn = path.join(appFolderPath, 'build', 'webpack.config.js')
    fs.writeFileSync(pn, wpcfg)
}
function generateTSConfig() {
const tscfg = `
{
  "compilerOptions": {
    "outDir": "./build",
    "allowJs": true,
    "target": "es5",
    "sourceMap": true,
    "lib": [
      "dom",
      "es5",
      "scripthost",
      "es2015.proxy"
    ]
  },
  "exclude": [
    "./node_modules/"
  ],
  "include": [
    "./*.js",
    "./**/*.ts"
  ]
}
`
    const pn = path.join(appFolderPath, 'build', 'tsconfig.json')
    fs.writeFileSync(pn, tscfg)
}

function generateIndexHtml() {
const indexHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Thunderbolt</title>
  <link rel="stylesheet" href="css/app.css">
  <link rel="stylesheet" href="css/datepicker.css">
</head>
<body>
<div id="root"></div>
<script>
  console.log("index.html is loaded")
</script>
<script src="bundle.js"></script>
<!--<script src="dist/smx-info.js"></script> -->

</body>
</html>`
    const pn = path.join(appFolderPath, 'build', 'dist', 'index.html')
    fs.writeFileSync(pn, indexHtml)
}

function generateBuild() {
    if(!commandList.length || commandList.indexOf('help') !== -1) {
        displayHelp()
    }
    // we are going to go with the copy-to-staging route because
    // I'm not sure how to do a disparate webpack config
    // So the steps here are:
    setBuildPath()
    addCopyPaths()
    let p = Promise.resolve()
    if(commandList.indexOf('clean') !== -1) {
        p = cleanTarget()
    }
    let doBuild = commandList.indexOf('build') !== -1
    if(!doBuild) {
        // todo: compare dates
        doBuild = !fs.existsSync(path.join(appFolderPath, 'build', 'dist', 'bundle.js'))
    }

    p.then(() => {
        if(doBuild) {
            // p = executeCommand('mkdir', ['build'], appFolderPath).then(() => {
            p = Promise.resolve().then(() => {
                // Copy the app-core and appMain files from the framwework
                // Copy the component files from the framework
                Log.debug('copying framework files')
                copyInstructions.forEach(step => {
                    let {source, from, pattern, to, exclude, recurse} = step
                    doCopy(source, from, to, pattern, exclude, recurse)
                })
                // Generate app.riot
                Log.debug('creating page list and app.riot')
                makeAppPageList();
                // make environment include
                Log.debug('creating environment data')
                makeEnvironment() // after-compileC:
                // Generate a package.json
                Log.debug('writing package.json')
                writePackageJson()
                // perform npm install
                Log.debug('installing dependencies...')
                return executeCommand('npm', ['install'], buildPath, 'npm', true).then(() => {
                    // Generate webpack config
                    generateWebpackConfig()
                    // Generate tsconfig.js
                    generateTSConfig()
                    Log.debug('performing webpack build...')
                    // execute webpack (this creates our output bundle(s) (output)
                    return executeCommand('./node_modules/.bin/webpack', ['--mode', 'development'], buildPath, 'webpack').then(() => {
                        // // let's take a look at this point

                        // we also need to:
                        // generate index.html
                        generateIndexHtml()
                        // copy css
                        doCopy('framework', 'css', 'dist/css', undefined, undefined, true)
                        // make a backside electron folder
                        const distMain = path.join(buildPath, 'dist', 'main')
                        doCopy('framework', 'electronMain', distMain, /\.js$/, undefined, false)
                        fs.renameSync(path.join(distMain, 'applicationMain.js'), path.join(distMain, 'main.js'))
                        doCopy('framework', 'electronMain/build/electronMain/src', path.join(distMain, 'src'), /\.js$/, /TBCommand.js/, false)
                        // executeCommand(`cd ${appFolderPath}/build && tree -I node_modules`)
                        // Generate/copy index.html to output
                        // -- run scripts; -- jump off to app build

                        // todo:
                        // √ BuildEnvironment.json needs to go to src
                        // √ activity is not assigned to pageComponent
                        // execute from <app>/build/dist/main
                        // ~/tbd/thunderbolt/electronMain/node_modules/.bin/electron ./main.js

                        // next steps
                        // make a cli path executable that does start above; executes command or help default
                        // make build command do our build, as above
                        // make a run command that does our execute
                        // support clean, build and run w/combos (build clean, run clean / clean build, clean run)
                        // detect node_modules and only do npm install if missing or outdated

                    })
                })
            })
        }
        p.then(() => {
            if(commandList.indexOf('run') !== -1) {
                Log.debug('running...')
                let xpath = path.resolve(path.join(tbRootPath, 'node_modules', '.bin', 'electron'))
                executeCommand(xpath, ['./main.js'], path.join(appFolderPath, 'build', 'dist', 'main'))
            }  else {
                Log.info('All Done!')
                process.exit(0)
            }
        })
    })
}

export default {
    startCLI,
    Log,
    appFolderPath
}