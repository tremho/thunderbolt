'use strict'

import FormatSpecifierBase from './FormatSpecifierBase'

let thousandsSeparator = ','
let decimalSeparator = '.'

/**
 * @description
 * Constructs and returns a Format Handler for basic integer + decimal "width.precision" formatting.
 * <p>This specifier forces the value to be treated as a number and formats it for alignment.</p>
 *
 * <p>The format specifier consists of two values separated by a "." character.</p>
 *
 * <p>The leftmost value is the maximum number of digits to allow for the integer portion of the number.</p>
 *
 * <p>The second value is the maximum number of digits to allow for the fractional (decimal) part of
 * the number.</p>
 *
 * <p>Values that are truncated in the decimal portion will be rounded up (unless the ! flag is given).</p>
 *
 * <p>If either value is not given, there is no limit assigned for that component.</p>
 *
 * <p>If the value of the number exceeds the number of digits for the integer portion, # characters will
 * be returned for the provided digits, indicating an overflow.</p>
 *
 * <p>If 0 is given for the integer portion, values < 1 will be printed without a leading 0.  Values > 1 will
 * result in an "#" overflow indication.</p>
 *
 * <p>If 0 is given for the decimal portion, integer values (without a decimal point) will be returned.</p>
 *
 * <p>A leading "0" given for a non-zero integer portion value will result in the output being zero padded
 * (the default is space padded).</p>
 *
 * <p>A leading "-" given will result in no alignment padding for the integer portion.
 * A leading "+" given for an integer portion value will produce a + output for positive values.</p>
 *
 * <p>A leading "!" given as a flag will disable the rounding up of values.</p>
 *
 * <p>A "+" character following the decimal value digits will result in a space-padded result for values
 * that do not naturally fit the decimal width, rather than a zero padding.</p>
 *
 * <p>A "-" character following the decimal value digits will result in no padding for the decimal portion.</p>
 *
 * <p>A leading "k" character given as a flag will enable thousands separator grouping.</p>
 *
 * TODO:
 *  BUG - use of + flag with leading zeros (+04.)
 *  NEED - support for intl: Format for digits and separator and then apply padding, decorators.
 *
 * @example
 * NOTE: ERRATTA - THIS IS ASPIRATIONAL AND DOES NOT CURRENTLY FUNCTION
 * THERE IS NO WORKING SUPPORT FOR VARIABLE FORMAT IN THIS IMPLEMENTATION
 * <caption>
 * Note that integer and decimal portions and any flag and pad values may be specified by nested
 * identifiers, so that the formatting parameters may come from the arguments themselves.
 * Nested identifiers follow the same rules as standard format identifiers for naming properties in
 * provided object argument(s).
 * </caption>
 *
 * str = fmtr.format(
 *     "This is formatted: ${value}[${flag}${intSize}.${decimalSize}${padding}]",
 *     {
 *         flag: '+0',
 *         intSize: 4,
 *         decimalSize: 2,
 *         padding: '+',
 *         value: 123.456
 *     }
 * );
 *
 * @alias FormatIntDecNumber
 * @extends FormatSpecifierBase
 */
export default class FormatIntDecNumber extends FormatSpecifierBase {
    private decimalSeparator:string = decimalSeparator
    private thousandsSeparator:string = thousandsSeparator
    private renderBind:any
    constructor () {
        super()
        this.renderBind = this.renderFormat.bind(this)
        // Defaults in case we never call setLocale
        this.decimalSeparator = decimalSeparator
        this.thousandsSeparator = thousandsSeparator
    }
    setLocale (locale) {
        super.setLocale(locale)
        // get separators from intl if there as preference over the hard-coded US defaults
        if (this.intl && this.intl.NumberFormat) {
            const ifmtr = new this.intl.NumberFormat(locale)
            if (ifmtr.formatToParts) {
                const parts = ifmtr.formatToParts(1234.57)
                parts.forEach(p => {
                    switch (p.type) {
                        case 'decimal':
                            decimalSeparator = p.value
                            break
                        case 'group':
                            thousandsSeparator = p.value
                    }
                })
            } else if (ifmtr.format) {
                // If we have a partial implementation of intl, we can scrape a formatted number for our answers here
                const numStr = ifmtr.format(1234.57)
                let n = numStr.length
                let d
                while (--n) {
                    const c = numStr.charAt(n)
                    if (!isFinite(c)) {
                        if (!d) {
                            d = c
                            decimalSeparator = c
                        } else {
                            thousandsSeparator = c
                            break
                        }
                    }
                }
            }
        }
        // otherwise prefer anything we have in the 18n tables
        this.decimalSeparator = this.getLocaleString('formatter.number.decimal.separator', decimalSeparator)
        this.thousandsSeparator = this.getLocaleString('formatter.number.thousands.separator', thousandsSeparator)
    }

    /**
     * Sets the character to use for decimal separation
     * @param {string} s - separator
     */
    setDecimalSeparator (s) {
        this.decimalSeparator = s
    }

    /**
     * Gets the character used for decimal separation
     * @return {String}
     */
    getDecimalSeparator () {
        return this.decimalSeparator
    }

    /**
     * Sets the character to use for thousands separation
     * @param {string} s - separator
     */
    setThousandsSeparator (s) {
        this.thousandsSeparator = s
    }

    /**
     * Gets the character to use for thousands separation
     * @return {String}
     */
    getThousandsSeparator () {
        return this.thousandsSeparator
    }

    /**
     * Makes the specifier for this format.
     *
     * @param {string} spec - specifier notation
     * @return {Object}
     */
    makeSpecifier (spec) {
        let mm
        let m
        let i
        let p
        let v
        class PropSpec {
            flagProp:string
            intProp:string
            decProp:string
            padProp:string
            flags:string
            pad:string
            intSize:number
            decSize:number

        }
        let props = new PropSpec()

        // separate into int, dec
        mm = spec.split('.')

        // work with int size now
        m = mm[0]
        // get any nested props
        i = m.indexOf('$')
        if (i >= 0) {
            p = m.split('$') // this will result in 1 empty plus 1 or 2 more elements
            if (p.length > 2) {
                // flags and int size both provided (more than 2 props an error, just ignored)
                props.flagProp = p[1]
                props.intProp = p[2]
            } else {
                // if we have only one prop, anything before it is the flags
                if (i > 0) {
                    props.flags = m.substring(0, i)
                    // and the property is the integer size
                    props.intProp = p[1]
                } else {
                    // otherwise, if there is a numeric component, that is the int size and this is the flags
                    v = this.getDigits(m)
                    if (v !== undefined) {
                        props.intSize = v
                        props.flagProp = p[1]
                    } else {
                        // otherwise, this is the int size and there is no flag
                        props.intProp = p[1]
                    }
                }
            }
        } else {
            // if no props, find digits
            v = this.getDigits(m)
            if (v !== undefined) {
                props.intSize = v
                // anything prior to digits is flags
                v = '' + v
                i = m.indexOf(v)
                if (i > 0) {
                    props.flags = m.substring(0, i)
                }
            } else {
                // if no digits, this is our flags
                props.flags = m
            }
        }

        // work with decimal now
        m = mm[1] || ''
        // get any nested props
        i = m.indexOf('$')
        if (i >= 0) {
            p = m.split('$')
            if (p.length > 2) { // 1 empty to start
                // pad and dec both provided (more than 2 props an error, just ignored)
                props.decProp = p[1]
                props.padProp = p[2]
            } else {
                // if we have only one prop, anything after it is the pad
                i = m.indexOf('}', i)
                if (++i > 0 && i < m.length) {
                    props.pad = m.substring(i)
                    // and the property is the dec
                    props.decProp = p[1]
                } else {
                    // otherwise, if there is a numeric component, that is the dec and this is the pad
                    v = this.getDigits(m)
                    if (v !== undefined) {
                        props.decSize = v
                        props.padProp = p[1]
                    } else {
                        // otherwise, this is the dec and there is no pad
                        props.decProp = p[1]
                    }
                }
            }
        } else if (m) {
            // if no props, find digits
            v = this.getDigits(m)
            if (v !== undefined) {
                props.decSize = v
                // anything afterward is pad
                v = '' + v
                i = m.indexOf(v) + v.length
                if (i < m.length) {
                    props.pad = m.substring(i)
                }
            } else {
                // if no digits, this is our right padding
                props.pad = m
            }
        }

        return {
            method: this.renderBind,
            props: props
        }
    }

    /**
     * Applies the IntDecNumber specifier properties to a value
     *
     * @param value     {*}       Value that will be cast to string and formatted
     * @param props     {Object}    Properties for this operation
     *
     * @param args      {Array}     Arguments used for indirect property values
     *
     * @return {String} Formatted string value
     */
    renderFormat (value, props, args) {
        let intSize
        let decSize
        let flags
        let pad
        let n
        let d
        let c
        let maxDigs
        let limitVal
        let strVal
        let strIntVal
        let strDecVal
        let plus
        let lead0
        let sign
        let noRound
        let noAlignInt
        let noAlignDec
        let paddedSpaces
        let decimal
        let thousands
        let ksep

        if (props.intProp) {
            intSize = this.extractSpecifiedProperty(props.intProp, args)
        } else {
            intSize = props.intSize
        }
        if (props.decProp) {
            decSize = this.extractSpecifiedProperty(props.decProp, args)
        } else {
            decSize = props.decSize
        }
        if (props.flagProp) {
            flags = this.extractSpecifiedProperty(props.flagProp, args)
        } else {
            flags = props.flags
        }
        if (props.padProp) {
            pad = this.extractSpecifiedProperty(props.padProp, args)
        } else {
            pad = props.pad
        }

        noRound = flags && flags.indexOf('!') >= 0
        lead0 = flags && flags.indexOf('0') >= 0
        plus = flags && flags.indexOf('+') >= 0
        ksep = flags && flags.indexOf('k') >= 0
        noAlignInt = flags && flags.indexOf('-') >= 0
        noAlignDec = pad && pad.indexOf('-') >= 0
        paddedSpaces = pad && pad.indexOf('+') >= 0

        decimal = (props.decimal === undefined ? this.decimalSeparator : props.decimal)
        thousands = ksep ? (props.thousands === undefined ? this.thousandsSeparator : props.thousandsSeparator) : ''

        value = Number(value)

        if (value < 0) {
            value = -value
            sign = '-'
        } else {
            sign = plus ? '+' : ''
        }

        if (!noRound && decSize !== undefined) {
            value += 5 / Math.pow(10, decSize + 1) // round up
        }

        n = Math.floor(value)
        d = value - n

        strVal = '' + value

        if (!isNaN(value)) {
            strIntVal = '' + n
            if (intSize || value) {
                maxDigs = intSize > 16 ? 16 : intSize // largest possible value is 16 digits long
                limitVal = Math.pow(10, maxDigs)
                if (value >= limitVal) {
                    if (!maxDigs) {
                        maxDigs = 1 // for [0.] cases
                    }
                    strIntVal = '################'.substring(0, maxDigs)
                    d = 0
                    paddedSpaces = true
                }
            } else if (!n && n !== 0) {
                strIntVal = ''
                strVal = strVal.substring(strVal.indexOf('.'))
            }

            if (d) {
                strDecVal = strVal.substring(strIntVal.length + 1)
            } else {
                strDecVal = ''
            }
            if (intSize === undefined) {
                intSize = strIntVal.length
            } else if (intSize === 0 && value < 1) {
                strIntVal = ''
            }
            if (decSize === undefined || paddedSpaces || noAlignDec) {
                if (decSize === undefined) {
                    decSize = strDecVal.length
                }
                while (strDecVal.charAt(decSize - 1) === '0') {
                    decSize--
                }
            }
            if (decSize < strDecVal.length) {
                strDecVal = strDecVal.substring(0, decSize)
            }
            if (!noAlignDec) {
                n = decSize - strDecVal.length
                if (paddedSpaces) {
                    strDecVal += '                '.substring(0, n)
                } else {
                    strDecVal += '0000000000000000'.substring(0, n)
                }
            }
            strIntVal = sign + strIntVal
            if (lead0) {
                n = intSize - strIntVal.length
                strIntVal = '0000000000000000'.substring(0, n) + strIntVal
            } else if (!noAlignInt) {
                n = intSize - strIntVal.length
                strIntVal = '                 '.substring(0, n) + strIntVal
            }
            if (thousands && thousands.length) {
                d = ''
                n = strIntVal.length
                while (n > 3) {
                    d = thousands + strIntVal.substring(n - 3, n) + d
                    n -= 3
                }
                if (n) {
                    c = strIntVal.charAt(n - 1)
                    if (c >= '0' && c <= '9') {
                        strIntVal = strIntVal.substring(0, n) + d
                    } else {
                        strIntVal = strIntVal.substring(0, n) + d.substring(1)
                    }
                }
            }

            if (strDecVal.length) {
                value = strIntVal + decimal + strDecVal
            } else {
                value = strIntVal
            }
        }
        return value
    }
}
