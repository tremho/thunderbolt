//
// /*
// const trace = require('tns-core-modules/trace')
// const application = require('tns-core-modules/application')
// const sauceCode = require('~/util/SauceCode')
//
// const { FileSystemAccess } = require('tns-core-modules/file-system/file-system-access')
//
// // we use our formatter
// const formatter = require('~/util/Formatter')
//
// // We hook ourselves into Telemetry
// const Telemetry = require('~/modules/Telemetry')
// */
//
// /*
// Categories for Thunderbolt are:
// - Default - no specified category
// - Page  - code the developer writes in pages
// - Component - code that comes from a component
// - Extension (api extension) - code the developer writes as app core extensions
// - Service - code that reaches out to a service (developer or framework)
// - Framework - code that comes from the framework and/or implementation tech
//
// categories should be kept in a list that can be added to by developer and selected like others
// it's just a string from a set of strings known by convention.
//
// writers attach to targets and may include filtered categories and levels
//
// By config, developer chooses which categories are routed to which target.
// By default:
// Default, Page, Component, App-extension -- to App Console (Electron debug window)
// Back-extension, Service, and Framework -- to Dev Console
// (For Nativescript, all go Dev Console by default, since there is no app console)
//
// Loggers are kept by category, so we import the loggers we need
// ```
// import * as Logging from 'Log'
// const Log = Logging.getLogger('Page')
// ```
// or
// ```
// import {getLogger} from 'Log'
// const ExtLog = getLogger('Extension')
// const ServiceLog = getLogger('Service')
// ```
// or, in a pinch (no clear category)
// ```
// const Log = getLogger('Default')
// ```
//
//
//  */
//
// const knownCategories:string[] = [
//     'Default',
//     'Page',
//     'Component',
//     'Extension',
//     'Service',
//     'Framework'
// ]
//
// function getCategories() {
//     return knownCategories
// }
// function addCategory(category) {
//     knownCategories.push(category)
// }
//
// /**
//  * Target types that control routing of writer output
//  */
// enum TargetType {
//     Console = 'Console',     // e.g. the Electron JS Debugger Console / (will be DevConsole on mobile).
//                              // location can be 'App' or 'Dev'
//     LogFile = 'LogFile',     // requires a path name
//     Service = 'Service'      // requires a URL
// }
//
// const defaultLevelColors = {
//     background: '',
//     time: 1,
//     message: 4,
//     func: 24,
//     file: 240,
//     line: 0,
//     debug: {
//         level: 142,
//         message: 108,
//         stack: false,
//         stackColor: 0
//     },
//     log: {
//         level: 2,
//         message: 22,
//         stack: false,
//         stackColor: 0
//     },
//     info: {
//         level: 45,
//         message: 18,
//         stack: false,
//         stackColor: 0
//     },
//     warn: {
//         level: [0, 11],
//         message: 3,
//         stack: false,
//         stackColor: 0
//     },
//     error: {
//         level: [15, 1],
//         message: 1,
//         stack: true,
//         stackColor: 242
//     },
//     error1: {
//         level: [0, 208],
//         message: 208,
//         stack: true,
//         stackColor: 242
//     }
// }
//
// /**
//  * A target names the target type and location
//  */
// class LogTarget {
//     public name:string
//     public type:TargetType
//     public location: string // file path or service url for LogFile or Service type; App/Dev for Console
//     public enabled: boolean
//     public supportsColor: boolean // true if ANSI color codes are supported on this device
//     public supportsGrouping: boolean // true if Google-Console style collapsible groups are supporting
//     public colorCategories:any = {}
//     public colorLevels:any = {}
//     public displayOptions:any = {}
//
//     constructor(name:string, type:TargetType, location:string, color?:boolean, grouping?:boolean) {
//         this.name = name
//         this.type = type
//         this.location = location
//         this.supportsColor = color || false
//         this.supportsGrouping = grouping || false
//     }
//
//
//
// }
//
// /**
//  * Defines where the output will appear, and what categories/levels are filtered
//  */
// class LogWriter {
//     public target: LogTarget
//     private catalogExcludes: string[] = []
//     private levelExcludes: string[] = []
//
//     constructor(target) {
//         this.target = target
//     }
//     includeCatalog(catalog:string, ...more) {
//
//     }
//     excludeCatalog(catalog:string, ...more) {
//
//     }
//     includeLevel(level:string, ...more) {
//
//     }
//     excludeLevel(level:string, ...more) {
//
//     }
//
//     isCategoryExcluded(category) {
//         return this.catalogExcludes.indexOf(category) === -1
//     }
//     isLevelExcluded(level) {
//         return this.levelExcludes.indexOf(level) === -1
//     }
//
//
//     /**
//      * Returns the colors to use per display item for a given category and level
//      * @param category
//      * @param level
//      * @returns {object}
//      */
//     private getColors (category, level) {
//         // No color if not enabled
//         if (!this.target.supportsColor) {
//             return {
//                 time: '',
//                 file: '',
//                 func: '',
//                 line: '',
//                 level: '',
//                 category: '',
//                 message: ''
//             }
//         }
//
//         const glevel = level && isFinite(Number(level.charAt(level.length - 1))) && level.substring(0, level.length - 1)
//         const def = defaultLevelColors || {}
//         const lvl = this.target.colorLevels[level] || this.target.colorLevels[glevel] || {}
//         const cat = this.target.colorCategories[category] || {}
//         const catLevel = cat[level] || {}
//         const catGlevel = cat[glevel] || {}
//
//         return {
//             time: applyColor(catLevel.time || catGlevel.time || cat.time || lvl.time || def.time),
//             file: applyColor(catLevel.file || catGlevel.file || cat.file || lvl.file || def.file),
//             func: applyColor(catLevel.func || catGlevel.func || cat.func || lvl.func || def.func),
//             line: applyColor(catLevel.line || catGlevel.line || cat.line || lvl.line || def.line),
//             level: applyColor(catLevel.level || catGlevel.level || cat.level || lvl.level || def.level),
//             category: applyColor(catLevel.category || catGlevel.category || cat.category || lvl.category || def.category),
//             message: applyColor(catLevel.message || catGlevel.message || cat.message || lvl.message || def.message),
//             stack: applyColor(lvl.stack && lvl.stackColor)
//         }
//     }
//
//     /**
//      * Format the log output
//      */
//     logFormat (time, category, level, ffl, message, ...args) {
//         const { file, func, line } = (ffl || {})
//         const sfx = Number(level.charAt(level.length - 1)) || 0
//         let dlvl = level.toUpperCase()
//         if (!sfx) dlvl = dlvl.substring(0, dlvl.length - 1)
//         if (dlvl === 'ERROR1') dlvl = 'EXCEPTION'
//         if (dlvl === 'ERROR2') {
//             dlvl = 'FATAL'
//             ffl.stackLines = '' // no stack on 'crash' type.. the stack comes from {N} layers
//         }
//
//         const c = this.getColors(category, level)
//         if (category === 'Default') category = ''
//         if (category) category = '[' + category + ']'
//
//         let out = '- '
//         if (this.target.supportsColor) {
//             out += this.target.displayOptions.colorReset || ''
//         }
//         if (this.target.displayOptions.time !== false) {
//             if (this.target.supportsColor) {
//                 out += c.time
//             }
//             out += formatter.format('$[date|HH:mm:ss.SSS]', time)
//             if (this.target.supportsColor) {
//                 out += this.target.displayOptions.colorReset || ''
//             }
//             out += ' '
//         }
//         if (this.target.displayOptions.source !== false) {
//             if (this.target.supportsColor) {
//                 out += c.func
//             }
//             out += `${func || ''}`
//             if (this.target.supportsColor) {
//                 out += this.target.displayOptions.colorReset || ''
//             }
//             out += '('
//             if (this.target.supportsColor) {
//                 out += c.file
//             }
//             out += `${file || ''}`
//             if (this.target.supportsColor) {
//                 out += this.target.displayOptions.colorReset || ''
//             }
//             out += ':'
//             if (this.target.supportsColor) {
//                 out += c.line
//             }
//             out += `${line || ''}`
//             if (this.target.supportsColor) {
//                 out += this.target.displayOptions.colorReset || ''
//             }
//             out += ') '
//         }
//         if (this.target.displayOptions.category !== false) {
//             if (this.target.supportsColor) {
//                 out += c.category
//             }
//             out += `${category || ''}`
//             if (this.target.supportsColor) {
//                 out += this.target.displayOptions.colorReset || ''
//             }
//             if (category) out += ' '
//         }
//         if (this.target.displayOptions.level !== false) {
//             if (this.target.supportsColor) {
//                 out += c.level
//             }
//             out += `${dlvl || ''}`
//             if (this.target.supportsColor) {
//                 out += this.target.displayOptions.colorReset || ''
//             }
//             out += ' '
//         }
//         if (this.target.displayOptions.message !== false) {
//             if (this.target.supportsColor) {
//                 out += c.message
//             }
//
//             // auto append arguments if not specifically called out in format
//             if (args.length && message.indexOf('$') === -1) {
//                 for (let i = 1; i <= args.length; i++) {
//                     if (i > 1) message += ', '
//                     message += '$' + i
//                 }
//             }
//
//             // if we have a $ in the message, but no args, treat this literally bu making a single arg message
//             if (!args.length && message.indexOf('$') !== -1) {
//                 args.push(message)
//                 message = '$1'
//             }
//
//             for (let i = 0; i < args.length; i++) {
//                 if (typeof args[i] === 'object' && !Array.isArray(args[i])) {
//                     try {
//                         args[i].toString = () => {
//                             try {
//                                 let rt = JSON.stringify(args[i], expandObject, 2)
//                                 if (rt.charAt(0) === '{') rt = '\n' + rt
//                                 return rt
//                             } catch (e) {
//                                 return '\n{-unparseable-} ' + (e || '!')
//                             }
//                         }
//                     } catch (e) {}
//                 }
//             }
//             out += formatter.format(message || '', ...args)
//         }
//         if (this.target.supportsColor) {
//             out += this.target.displayOptions.colorReset || ''
//         }
//         if (c.stack) {
//             const stackLines = ffl.stackLines.split('\n')
//             while (stackLines.length) {
//                 const ln = stackLines.shift()
//                 if (ln) {
//                     const sffl = android_ffl(ln)
//                     const smap = sauceCode.getSourceMap(sffl)
//                     out += '\nat ' + smap.func + ' (' + smap.file + ' ' + smap.line + ')'
//                 }
//
//             }
//         }
//         return out
//     }
//
// }
//
// class Logger {
//     private writers:LogWriter[]
//
//
//     getWriters():LogWriter[] {
//         return this.writers
//     }
//
//     addWriter(writer:LogWriter) {
//         if(!this.findWriter(writer.target.name)) {
//             this.writers.push(writer)
//         }
//     }
//     removeWriter(writer:LogWriter) {
//         let targetName = writer.target.name
//         for(let i=0; i<this.writers.length; i++) {
//             const wr = this.writers[i]
//             if (wr.target.name === targetName) {
//                 this.writers.splice(i,1)
//                 return;
//             }
//         }
//     }
//     findWriter(targetName:string):LogWriter {
//         for(let i=0; i<this.writers.length; i++) {
//             const wr = this.writers[i]
//             if (wr.target.name === targetName) {
//                 return wr
//             }
//         }
//         return null
//     }
//
//     /**
//      * Private method that converts a string 'level' (e.g. 'info', 'debug3', etc)
//      * into the corresponding type (number) and suffix granularity.
//      * @param level
//      * @returns {{type, granularity}) (both properties are integers)
//      * @private
//      */
//     _levelToType (level = '') {
//         let lvl, type
//         let sfx = level.charAt(level.length - 1)
//         if (sfx >= '0' && sfx <= '9') {
//             lvl = level.substring(0, level.length - 1)
//         } else {
//             lvl = level
//         }
//         type = lvl
//         let granularity = Number(sfx) || 0
//         return { type, granularity }
//     }
//
//     /**
//      * Direct output to all writers, subject to filtering.
//      * @param {number} time  in milliseconds
//      * @param {{file, func, line, stack}} ffl
//      * @param {string} category
//      * @param {string} level
//      * @param {string} message
//      * @param {*} args arguments used for formatting message
//      */
//     outToWriters (time, ffl, category, level, message, ...args) {
//         const typeGran = this._levelToType(level)
//         for (let i = 0; i < this.writers.length; i++) {
//             const writer = this.writers[i]
//             // filter by category is done by the trace module already at an enabled scope; here we filter per writer
//             if (writer.isCategoryExcluded(category)) {
//                 continue
//             }
//
//             // filter by level and granularity (granularity compared here as 1-10 instead of 9-0 for easier ordering)
//             if (writer.isLevelExcluded(level)) {
//                 continue
//             }
//             // having passed filtering, output the log
//             const formatted = writer.logFormat(time, category, level, ffl, message, ...args)
//             if (!formatted) {
//                 continue
//             }
//             // groups introduce indents
//             const pad = this.groups.length ? ' '.repeat(this.groups.length * 2) : ''
//             // trace.write(pad + formatted, category, typeGran.type)
//             console.log(pad + formatted, category, typeGran.type)
//         }
//     }
//
//     /**
//      * Handles passing category, message, args or simply message, args for any log level.
//      * @param level
//      * @param args
//      * @private
//      */
//     _morph (level, ...args) {
//         // TODO:Check
//         // if (global.__snapshot) return; // disallow if we are in snapshot release mode
//
//         let category = ''
//         let message = ''
//         let a = [...args]
//         if (a.length <= 1) {
//             // arg is message if it's a string and there are no other parameters
//             if (typeof a[0] === 'string') {
//                 message = a.shift() || ''
//             }
//             category = 'Default'
//         } else {
//             if (typeof a[0] !== 'string') {
//                 message = a.shift()
//             } else {
//                 // is it a registered category?
//                 if(knownCategories.indexOf(a[0]) !== -1) {
//                     category = a.shift()
//                     message = a.shift()
//                 } else {
//                     category = 'Default'
//                     message = a.shift()
//                 }
//             }
//         }
//         const ffl = getFuncFileLine()
//         this.outToWriters(Date.now(), ffl, category, level, message, ...a)
//     }
//
//     /** Outputs log at the named level granularity */
//     debug9 (...args) {
//         this._morph('debug9', ...args)
//     }
//
//     /** Outputs log at the named level granularity */
//     debug8 (...args) {
//         this._morph('debug8', ...args)
//     }
//
//     /** Outputs log at the named level granularity */
//     debug7 (...args) {
//         this._morph('debug7', ...args)
//     }
//
//     /** Outputs log at the named level granularity */
//     debug6 (...args) {
//         this._morph('debug6', ...args)
//     }
//
//     /** Outputs log at the named level granularity */
//     debug5 (...args) {
//         this._morph('debug5', ...args)
//     }
//
//     /** Outputs log at the named level granularity */
//     debug4 (...args) {
//         this._morph('debug4', ...args)
//     }
//
//     /** Outputs log at the named level granularity */
//     debug3 (...args) {
//         this._morph('debug3', ...args)
//     }
//
//     /** Outputs log at the named level granularity */
//     debug2 (...args) {
//         this._morph('debug2', ...args)
//     }
//
//     /** Outputs log at the named level granularity */
//     debug1 (...args) {
//         this._morph('debug1', ...args)
//     }
//
//     /** Outputs log at the named level granularity */
//     debug0 (...args) {
//         this._morph('debug0', ...args)
//     }
//
//     /** Synonymous with debug0 */
//     debug (...args) {
//         this.debug0(...args)
//     }
//
//     /** Outputs log at the named level granularity */
//     log9 (...args) {
//         this._morph('log9', ...args)
//     }
//
//     /** Outputs log at the named level granularity */
//     log8 (...args) {
//         this._morph('log8', ...args)
//     }
//
//     /** Outputs log at the named level granularity */
//     log7 (...args) {
//         this._morph('log7', ...args)
//     }
//
//     /** Outputs log at the named level granularity */
//     log6 (...args) {
//         this._morph('log6', ...args)
//     }
//
//     /** Outputs log at the named level granularity */
//     log5 (...args) {
//         this._morph('log5', ...args)
//     }
//
//     /** Outputs log at the named level granularity */
//     log4 (...args) {
//         this._morph('log4', ...args)
//     }
//
//     /** Outputs log at the named level granularity */
//     log3 (...args) {
//         this._morph('log3', ...args)
//     }
//
//     /** Outputs log at the named level granularity */
//     log2 (...args) {
//         this._morph('log2', ...args)
//     }
//
//     /** Outputs log at the named level granularity */
//     log1 (...args) {
//         this._morph('log1', ...args)
//     }
//
//     /** Outputs log at the named level granularity */
//     log0 (...args) {
//         this._morph('log0', ...args)
//     }
//
//     /** Synonymous with log0 */
//     log (...args) {
//         this.log0(...args)
//     }
//
//     /** Outputs log at the named level granularity */
//     info9 (...args) {
//         this._morph('info9', ...args)
//     }
//
//     /** Outputs log at the named level granularity */
//     info8 (...args) {
//         this._morph('info8', ...args)
//     }
//
//     /** Outputs log at the named level granularity */
//     info7 (...args) {
//         this._morph('info7', ...args)
//     }
//
//     /** Outputs log at the named level granularity */
//     info6 (...args) {
//         this._morph('info6', ...args)
//     }
//
//     /** Outputs log at the named level granularity */
//     info5 (...args) {
//         this._morph('info5', ...args)
//     }
//
//     /** Outputs log at the named level granularity */
//     info4 (...args) {
//         this._morph('info4', ...args)
//     }
//
//     /** Outputs log at the named level granularity */
//     info3 (...args) {
//         this._morph('info3', ...args)
//     }
//
//     /** Outputs log at the named level granularity */
//     info2 (...args) {
//         this._morph('info2', ...args)
//     }
//
//     /** Outputs log at the named level granularity */
//     info1 (...args) {
//         this._morph('info1', ...args)
//     }
//
//     /** Outputs log at the named level granularity */
//     info0 (...args) {
//         this._morph('info0', ...args)
//     }
//
//     /** Synonymous with info0 */
//     info (...args) {
//         this.info0(...args)
//     }
//
//     /** Outputs log at the named level granularity */
//     warn9 (...args) {
//         this._morph('warn9', ...args)
//     }
//
//     /** Outputs log at the named level granularity */
//     warn8 (...args) {
//         this._morph('warn8', ...args)
//     }
//
//     /** Outputs log at the named level granularity */
//     warn7 (...args) {
//         this._morph('warn7', ...args)
//     }
//
//     /** Outputs log at the named level granularity */
//     warn6 (...args) {
//         this._morph('warn6', ...args)
//     }
//
//     /** Outputs log at the named level granularity */
//     warn5 (...args) {
//         this._morph('warn5', ...args)
//     }
//
//     /** Outputs log at the named level granularity */
//     warn4 (...args) {
//         this._morph('warn4', ...args)
//     }
//
//     /** Outputs log at the named level granularity */
//     warn3 (...args) {
//         this._morph('warn3', ...args)
//     }
//
//     /** Outputs log at the named level granularity */
//     warn2 (...args) {
//         this._morph('warn2', ...args)
//     }
//
//     /** Outputs log at the named level granularity */
//     warn1 (...args) {
//         this._morph('warn1', ...args)
//     }
//
//     /** Outputs log at the named level granularity */
//     warn0 (...args) {
//         this._morph('warn0', ...args)
//     }
//
//     /** Synonymous with warn0 */
//     warn (...args) {
//         this.warn0(...args)
//     }
//
//     /** Used to output a log related to an exception. Alias for 'error1' */
//     exception (...args) {
//         this._morph('error1', ...args)
//     }
//
//     crash (...args) {
//         this._morph('error2', ...args)
//     }
//
//     /** Used to output a log related to an error. */
//     error (...args) {
//         this._morph('error0', ...args)
//     }
//
//
//
// }
//
//
// // Map of constructed and named output targets
// const namedTargets = {}
// const namedLogOutputs:any = {}
//
// // these get chained togehter to form a tangible output destination.
// // we need to define a few to start
//
// /**
//  * Make a target that can be associated by name to a logger
//  *
//  * @param targetName
//  * @param targetType
//  * @param targetLocation
//  * @param color
//  * @param grouping
//  */
// function makeTarget(targetName:string, targetType:TargetType, targetLocation:string, color?:boolean, grouping?: boolean) {
//     let target = new LogTarget(targetName, targetType, targetLocation, color, grouping)
//     namedTargets[targetName] = target;
//     return target
// }
//
// /**
//  * Make a new target and a new logger and attach
//  *
//  * @param name
//  * @param targetName
//  * @param targetType
//  * @param targetLocation
//  * @param color
//  * @param grouping
//  */
// function makeLogger(name:string, targetName:string, targetType:TargetType, targetLocation:string, color?:boolean, grouping?: boolean) {
//     let target = makeTarget(targetName, targetType, targetLocation, color, grouping)
//     let writer = new LogWriter(target)
//     let logger = new Logger()
//     logger.addWriter(writer)
//     namedLogOutputs[name] = logger
// }
//
// /**
//  * Attach an existing target to create a new logger with one writer
//  *
//  * @param name
//  * @param targetName
//  */
// function attachLogger(name:string, targetName:string) {
//     let target = namedTargets[targetName]
//     if(!target) {
//         throw Error(`target ${targetName} not found`)
//     }
//     let writer = new LogWriter(target)
//     let logger = new Logger()
//     logger.addWriter(writer)
//     namedLogOutputs[name] = logger
// }
//
// /**
//  * Standard targets are AppConsole, DevConsole,
//  */
// function makeStandardTargets() {
//     makeLogger('default', 'AppConsole', TargetType.Console, 'Dev', true, true)
//     makeLogger('page', TargetType.Console, 'App', true, true)
//     makeLogger('component', TargetType.Console, 'App', true, true)
//     makeLogger('app-extension', TargetType.Console, 'App', true, true)
//     makeLogger('back-extension', TargetType.Console, 'Dev', true, true)
//     makeLogger('service', TargetType.Console, 'Dev', true, true)
//     makeLogger('framework', TargetType.Console, 'Dev', true, true)
// }
//
// function getLogger(name) {
//     const logger =  namedLogOutputs[name]
//     if(!logger) {
//         throw Error(`Logger ${name} not found`)
//     }
//     return logger
// }
//
// //------------------------------------
//
// /*
//  * Applies color for the ColorWriter.
//  * If an array is used, the first element represents the color of the foreground, and the second of the background.
//  * If a string is given, it is used as the foreground color.
//  *
//  * Colors may be a direct ANSI number (8-bit extended), a three digit hex ('#ABC'), six-digit hex ('#123456'),
//  * or 'rgb()' statement.
//  *
//  * Undefined or '' entries are no-ops.
//  *
//  * @param strOrArray
//  * @returns {string}
//  */
// function applyColor (strOrArray) {
//     if (!Array.isArray(strOrArray)) {
//         strOrArray = [strOrArray]
//     }
//     const sFg = '' + (strOrArray[0] || '')
//     const sBg = '' + (strOrArray[1] || '')
//     let out = ''
//     if (sFg) {
//         let code = rgb2ansiCode(sFg)
//         if (code) out = '\u001b[38;5;' + code + 'm'
//     }
//     if (sBg) {
//         let code = rgb2ansiCode(sBg)
//         if (code) out += '\u001b[48;5;' + code + 'm'
//     }
//     return out
// }
//
// // Used by applyColor
// function parseColor (str = '') {
//     if (str.substring(0, 3).toLowerCase() === 'rgb') {
//         // rgb(red, green, blue)
//         let s = str.indexOf('(') + 1
//         if (s) {
//             let e = str.lastIndexOf(')')
//             let rgb = str.substring(s, e).split(',')
//             let r = ((rgb[0] || 0) & 255) / 255
//             let g = ((rgb[1] || 0) & 255) / 255
//             let b = ((rgb[2] || 0) & 255) / 255
//             return { r, g, b }
//         }
//     } else if (str.charAt(0) === '#') {
//         str = str.substring(1)
//         if (str.length === 3) {
//             // #RGB
//             const rgb = []
//             for (let i = 0; i < 3; i++) {
//                 let v = parseInt(str.charAt(i), 16)
//                 rgb.push(((v || 0) & 15) / 15)
//             }
//             return { r: rgb[0], g: rgb[1], b: rgb[2] }
//         }
//         if (str.length === 6) {
//             const rgb = []
//             for (let i = 0; i < 6; i++) {
//                 let v = parseInt(str.charAt(i), 16)
//                 rgb.push(((v || 0) & 255) / 255)
//             }
//             return { r: rgb[0], g: rgb[1], b: rgb[2] }
//         }
//     } else {
//         const n = parseInt(str)
//         if (isFinite(n) && n >= 0 && n <= 255) {
//             return n
//         }
//     }
//     return ''
// }
//
// // TODO: Handle the first 16 colors (primary, bright)
//
// // Used by applyColor
// function rgb2ansiCode (str) {
//     const rgb = parseColor(str)
//     if (typeof rgb === 'number') return rgb // direct code
//     if (!rgb) return ''
//     const R = Math.floor(rgb.r * 255)
//     const G = Math.floor(rgb.g * 255)
//     const B = Math.floor(rgb.b * 255)
//     let code = 0
//     if (R === G && R === B) {
//         if (R !== 0 && R !== 255) {
//             let g = Math.floor(R / 11)
//             code = 232 + g // codes 232-255 are grayscale minus black and white
//         }
//     }
//     if (!code) {
//         // codes 16-231 are a 6x6x6 color cube
//         // We approximate the mapping here
//         code = 16 + Math.floor(R / 51) * 36 + Math.floor(G / 51) * 6 + Math.floor(B / 51)
//     }
//     return code
// }
//
// // -----------------------
//
// function expandObject (key, value) {
//     if (typeof value === 'undefined') return 'undefined'
//     if (value instanceof RegExp) {
//         return '[RegEx]: ' + value.toString()
//     }
//     if (value instanceof Promise) {
//         return '[Promise]'
//     }
//     if (value instanceof Error) {
//         return '[' + value.name + ']: ' + value.message
//     }
//     return value
// }
