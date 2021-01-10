'use strict'

/* TODO: Suuport this later, using Environmaent Checking for Thunderbolt

// We load i18n conditionally to use in {N}
// TODO: This should form a template for a later wrapper solution
let i18n
// the 'global' object is named in Node, but not native script
if (typeof global === 'object') {
    if (typeof global.android === 'object' || typeof global.ios === 'object') {
        if(!global.__snapshot) console.log('{N} detected, version ' + global.__runtimeVersion)
        i18n = require('../i18n')
    } else {
        if (typeof global.process === 'object') {
            console.log('NODE detected on a ' + global.process.platform + ' system')
        }
    }
}
*/

/**
 * @classdesc
 * Base class for creating format handlers; do not call directly.
 *
 * @alias FormatSpecifierBase
 */
export default class FormatSpecifierBase {
    protected locale:string
    protected intl:any = null
    protected getLocaleString:any = null // function
    /**
     * Looks for and parses numeric value from a given field.
     *
     * @param {string} field - The field to find number in.
     *
     * @return {number} Value, or undefined if not found.
     */
    getDigits (field) {
        let value
        let patt
        let j
        let k

        // Find digits
        patt = /\d/
        j = field.indexOf(patt.exec(field))
        if (j >= 0) {
            patt = /\D/
            patt.lastIndex = j
            k = field.indexOf(patt.exec(field), j)
            if (k < 0) {
                k = undefined
            }
            // this is our value
            value = Number(field.substring(j, k))
        }
        return value
    }

    /**
     * Given a property token, get the value (if any) from the arguments.
     *
     * @param {string} [token] - property token
     * @param {object[]} args - list of argument objects
     */
    extractSpecifiedProperty (token, args) {
        let i
        let argNum
        let name
        let value

        // Spec comes in without the leading $
        i = token.indexOf('{')
        // get arg num, or default to "1" (0)
        argNum = Number(token.substring(0, i))
        if (!argNum || isNaN(argNum)) {
            argNum = 0
        } else {
            argNum--
        }
        if (argNum < 0) {
            // Log.warn('Negative value argument selector ignored in format specifier')
            argNum = 0
        }
        // get name w/i brackets
        name = token.substring(++i, token.indexOf('}'))
        // find prop (name) in arg (num)
        value = args[argNum]
        if (typeof value === 'object' && value.hasOwnProperty(name)) {
            value = value[name]
        } else {
            value = undefined
        }
        return value
    }

    /**
     * For named specifier in the standard style, this will find any hints
     * and return an array of the hint words (without dashes).
     *
     * @param {!string} spec - The specifier notation
     *
     * @return {string[]} of hint keywords found
     */
    getHints (spec) {
        let i
        let j
        let hints = []

        i = spec.indexOf(':')
        if (i >= 0) {
            j = spec.indexOf('|', ++i)
            if (j < 0) {
                j = undefined
            }
            hints = spec.substring(i, j).split('-')
        }
        return hints
    }

    /**
     * For named specifier in the standard style, this will find any
     * format description and return the string.
     *
     * String will be empty if no format given.
     *
     * @param {!string} spec - The specifier notation
     *
     * @return {string} format description found
     */
    getFormat (spec) {
        let i
        let j
        let format = ''

        i = spec.indexOf('|')
        if (i >= 0) {
            j = spec.indexOf('|', ++i)
            if (j < 0) {
                j = undefined
            }
            format = spec.substring(i, j)
        }
        return format
    }

    // TODO: I18n Support needs to be added to Thunderbolt later
    // /**
    //  * Sets the locale for this formatter.
    //  * The `this.locale` property is set to match by this super function.
    //  * The `this.getLocaleString` property is set for use by this formatter to access the proper i18n strings,
    //  * which is normally the system set, but may be overridden by a `formatter.setLocale` call by user.
    //  *
    //  * @param {string} [locale] if not given, the system locale is set.  Otherwise, this is a BP47 locale string.
    //  */
    setLocale (locale) {
    //     if(!i18n) {
    //         i18n = require('../i18n')
    //     }
    //     // Support -no- locale
    //     if (!i18n) {
            this.locale = 'en-US'
            this.intl = null

            // No string tables; relay the default or decorated
            this.getLocaleString = (t, d) => {
                let rt = d
                if (d === undefined) {
                    rt = '%$>!' + t + '!<$%'
                }
                return rt
            }
            return
        }
    //
    //     // Use the i18n string tables
    //     if (!locale) locale = i18n.getSystemLocale()
    //     if (locale !== this.locale || !i18n.isLocaleLoaded(locale)) {
    //         if (locale !== i18n.getSystemLocale() || !i18n.isLocaleLoaded(locale)) {
    //             this.localeTable = i18n.loadForeignTableSync(locale)
    //
    //             // Return from the loaded string table
    //             this.getLocaleString = (t, d) => {
    //                 let rt = this.localeTable.getString(t)
    //                 if (rt === undefined) {
    //                     if (d === undefined) {
    //                         rt = '%$>!' + t + '!<$%'
    //                     } else {
    //                         rt = d
    //                     }
    //                 }
    //                 return rt
    //             }
    //         } else {
    //             // Return from the system string table
    //             this.localeTable = null
    //             this.getLocaleString = i18n.getLocaleString
    //         }
    //         this.locale = locale
    //     }
    //     this.intl = i18n.intl
    // }

}
