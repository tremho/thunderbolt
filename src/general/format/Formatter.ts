'use strict'

import FormatMinMaxString from './FormatMinMaxString'
import FormatIntDecNumber from './FormatIntDecNumber'

/**
 * @description
 * Formats a string based on format specifiers for positional or named arguments.
 *
 * <p>Format specifiers are given according to these semantic rules:</p>
 *
 * <p> The '$' character is used to signal a directive.  A $ character is expected to
 *  be followed by a digit or one of [ { ( or $.  For any other character following the
 *  $ character, the $ will be treated as part of the literal string.</p>
 *
 *  <p>Use the $$ notation to denote a literal case of ${ $[ $( or $1 (any digit).</p>
 *
 *  <p>A number following the $ is used to denote the ordinal number of the supplied argument
 *  list that contains the value to be formatted by this directive.</p>
 *
 *  <p>Arguments are numbered starting at 1.  0 is an invalid value.</p>
 *
 *  @example:
 *  fmtr.format("The $1 jumped over the $2", "cow", "moon");
 *  fmtr.format("We are putting the $2 before the $1 with this one", "horse", "cart");
 *
 *  The { } brackets are used to note a property token.  A property token is used to look up the value by
 *  name within an object collection.
 *  @example:
 *  fmtr.format("The ${dish} ran away with the ${spoon}",{dish: "platter", spoon: "spatula"});
 *
 *  Numbers can precede the { bracket to note which argument holds the object to find properties in.
 *  If no number is given, the first argument is assumed.
 *
 *  @example:
 *  var a = {
 *          individual: "man",
 *          foo: "not important",
 *          bar: "never mind"
 *      },
 *      b = {
 *          fruit: "apple",
 *          color: "blue",
 *          group: "mankind"
 *      };
 *  fmtr.format("One small step for a $1{individual}, one giant leap for $2{group}", a, b);
 *
 * <p>Square brackets are used for format specifiers.  Format specifiers define types and parameters
 * for how to format the display of a value.</p>
 *
 * <p>Two "standard" directives allow direct format specifier syntax for strings and numbers.
 * String values may be formatted to fit and align in a text field sized to a minimum and maximum
 * value, with left, right, or center alignment choice of padding characters.</p>
 * @example:
 * fmtr.format("Name: $1[20,20] Address: $2[ 60,60 ] State: $3[2,2]", name, addr, state);
 *
 * @see {@link FormatMinMaxString} for more information on this format.
 *
 * Numeric values may be formatted with a number of alignment options such as the number of integer and
 * decimal digits to represent, their padding, and other attributes.
 * @example:
 * fmtr.format("The value of PI to 6 places is $[1.6]", Math.PI);
 *
 * @see {@link FormatIntDecNumber} for more information on this format.
 *
 * <p>Other directives may be "installed" (see "installHandler()").  Installed handlers are invoked
 * with the semantic:</p>
 *
 *   [name:hint-subhint-etc|format|i8n] // TODO: Consider replacing |i18n with ~ln-LC
 *
 *  <p>where name is the name of the directive.  It is required.</p>
 *  Hint and the dash-separated subhints are variant information passed to the formatter to provide context.
 *  This is optional.  If given, it is preceded by the : character.
 *  A | (pipe) character precedes any local format information (e.g. date format, etc).
 *
 *  <p>Each specifier format is documented separately.</p>
 *  @see {@link FormatDateTime}
 *
 * <p>A ( character is used to specify a callback hook.  See the documentation for "installNamedCallback"
 * for information on this feature.</p>
 *
 * @alias Formatter
 */
class Formatter {
    private formatHandlers:any
    private callbackHandlers:any

    constructor () {
        this.formatHandlers = {}
        this.callbackHandlers = {}

        // The standard string and number handlers are default
        // Other handlers must be installed specifically.
        this.installHandler(':string:', new FormatMinMaxString())
        this.installHandler(':number:', new FormatIntDecNumber())
    }

    setLocale (locale = 'en-US') {
        Object.getOwnPropertyNames(this.formatHandlers).forEach(p => {
            const fh = this.formatHandlers[p]
            fh.setLocale(locale)
        })
    }

    /**
     * Installs a format handler of a given name.
     *
     * @param name
     * @param handler
     */
    installHandler (name, handler) {
        name = name.toLowerCase()
        this.formatHandlers[name] = handler
    }

    /**
     * Removes a named handler.
     *
     * @param name
     */
    removeHandler (name) {
        name = name.toLowerCase()
        delete this.formatHandlers[name]
    }

    /**
     * Retrieves a reference to an installed handler by name
     * @param name
     * @return {Object}
     */
    getHandler (name) {
        name = name.toLowerCase()
        return this.formatHandlers[name]
    }

    /**
     * Installs callback by named that may be identified as part of the format string.
     * This callback will receive the formatted-so-far string of the value as well as
     * the array of all arguments passed when the format was applied,
     * and may return a further decorated string format as a result.
     *
     * Invoked with the $(callbackName) directive in a format declaration.
     *
     * @param name
     * @param callback
     */
    installNamedCallback (name, callback) {
        name = name.toLowerCase()
        this.callbackHandlers[name] = callback
    }

    /**
     * Removes a named callback that was previously installed.
     *
     * @param name
     */
    removeNamedCallback (name) {
        name = name.toLowerCase()
        delete this.callbackHandlers[name]
    }

    /**
     * Formats a string based on format specifiers for positional or named arguments.
     *
     * @params {string}     fmt The format specifiers to be parsed
     * @params {mixed}      ... All remaining parameters are values to use in format declaration
     */
    format (fmt, ...args) {
        const parsed = this.parseFormat(fmt)

        return this.applyFormat(parsed, args)
    }

    /**
     * Separates out tokens, specifiers and string parts into ready-to-apply format
     *
     * @param {string}  fmt     The string to be parsed as a format string
     *
     * @return {Object} A "ParsedFormat" object that may be used with "applyFormat".
     */
    parseFormat (fmt) {
        let i = 0
        let j
        let n
        let defChar
        let sectionStart
        let sectionEnd
        let position
        let item
        let items = []

        // checks for digits
        function isDigitAt (n) {
            return (n < fmt.length && fmt.charAt(n) >= '0' && fmt.charAt(n) <= '9')
        }

        // parses out a specifier declaration into a Specifier object
        function parseSpecifier (fmtr, specStr) {
            let name
            let form
            let maker
            let spec
            let j
            let k

            j = specStr.indexOf(':')
            k = specStr.indexOf('|')
            if (j >= 0) {
                if (k > j || k < 0) {
                    k = j
                }
            }
            if (k < 0) {
                k = undefined
            }

            name = specStr.substring(0, k).toLowerCase()
            if (k) {
                form = specStr.substring(k)
            } else {
                form = ''
            }
            // find the handler from the installed list and call it
            maker = fmtr.formatHandlers[name]
            if (!maker) {
                form = name
                // see if it is one of our "standard" string or number format handlers
                if (name.indexOf(',') >= 0) {
                    maker = fmtr.formatHandlers[':string:']
                } else if (name.indexOf('.') >= 0) {
                    maker = fmtr.formatHandlers[':number:']
                }
            }
            if (maker) {
                spec = maker.makeSpecifier(form)
            } else {
                throw Error('Format specifier "' + name + '" not found')
            }
            return spec
        }

        // -----------------------------------------------------------

        //
        // Walks the format string and parses it
        //
        while (i < fmt.length) {
            position = 0
            item = {}
            n = fmt.indexOf('$', i)
            if (n < 0) {
                // add trailing literal as last item
                item.literal = fmt.substring(i)
                items.push(item)
                break
            }
            sectionStart = i
            sectionEnd = n++
            if (isDigitAt(n)) {
                j = n
                while (isDigitAt(j)) {
                    j++
                }
                position = Number(fmt.substring(n, j))
                n = j
            }
            defChar = fmt.charAt(n)
            item.argPosition = position
            if (position > 0) {
                item.argPosition = position - 1
            } else {
                item.argPosition = 0
            }
            item.literal = fmt.substring(sectionStart, sectionEnd)
            while (n < fmt.length) {
                // parse the specifier or token
                if (defChar === '[') {
                    // it's a specifier
                    n++
                    j = fmt.indexOf('|', n)
                    if (j !== -1) {
                        let ep = j + 1
                        let si
                        while ((si = fmt.indexOf('[', ep)) !== -1) {
                            ep = fmt.indexOf(']', si + 1)
                        }
                        ep = fmt.indexOf(']', ep + 1)
                        item.format = fmt.substring(j + 1, ep)
                    } else {
                        j = fmt.indexOf(']', n)
                    }
                    if (j > 0) {
                        let spec = fmt.substring(n, j)
                        if (item.format) {
                            spec += '|' + item.format // append to spec again for later extraction
                            fmt = fmt.substring(0, j)
                        }
                        item.specifier = parseSpecifier(this, spec)
                        n = ++j
                    }
                } else if (defChar === '{') {
                    // it's a property token
                    position = 0
                    j = fmt.indexOf('}', ++n)
                    if (j > 0) {
                        item.property = fmt.substring(n, j)
                        n = ++j
                    }
                } else if (defChar === '(') {
                    // it's a callback token
                    j = fmt.indexOf(')', ++n)
                    if (j > 0) {
                        item.callback = fmt.substring(n, j)
                        n = ++j
                    }
                } else if (!position) {
                    // literal '$'
                    item.value = '$'
                    if (defChar === '$') {
                        n++
                    }
                    item.argPosition = undefined // n/a
                }
                j = n
                defChar = fmt.charAt(j)
                if (defChar === '[' ||
                    defChar === '{' ||
                    defChar === '(') {
                    n = j
                } else {
                    break
                }
            }
            items.push(item)
            i = n
        }

        // returning an object, although for now all I think we need is the items array
        return {
            items: items
        }
    }

    /**
     * Applies an array of values to a format that has been parsed with parseFormat
     * and returns the formatted string result.
     *
     * @param parsedFormat  {Object}    Object returned from "parseFormat" method.
     * @param args          {Array}     Array of argument values to be applied.
     *
     * @return {string} Formatted string
     */
    applyFormat (parsedFormat, args) {
        let i
        let str
        let it
        let value
        let fval
        let cbFunc
        let items = parsedFormat.items

        str = ''
        for (i = 0; i < items.length; i++) {
            it = items[i]

            if (it.literal) {
                str += it.literal
            }
            if (it.hasOwnProperty('value')) {
                value = it.value
            } else {
                if (it.argPosition !== undefined) {
                    if (it.argPosition >= 0 && it.argPosition < args.length) {
                        value = args[it.argPosition]
                    }
                } else {
                    continue // a disconnected literal (probably the tail), skip
                }
            }
            if (it.property) {
                if (typeof value === 'object' && value.hasOwnProperty(it.property)) {
                    value = value[it.property]
                } else {
                    value = undefined
                }
            }
            if (!it.specifier) {
                // if no specifier, the default is a just the value as is, cast to a string.
                fval = '' + value
            } else {
                // otherwise we call our specified format handler to treat this value
                fval = it.specifier.method(value, it.specifier.props, args)
            }
            if (it.callback && it.callback.length) {
                // if we have a named callback, attempt to call it for a modified value
                cbFunc = this.callbackHandlers[it.callback]
                if (cbFunc) {
                    fval = cbFunc(fval, args)
                }
            }
            str += fval
        }
        return str
    }
}

export default Formatter
