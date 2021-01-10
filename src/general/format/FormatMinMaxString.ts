'use strict'

import FormatSpecifierBase from './FormatSpecifierBase'

/**
 * <p>Constructs and returns a Format Handler for basic min-max width string formatting.
 * This specifier forces the value to be treated as a string and pads or trims it to fit
 * within the (optionally) supplied "min" and "max" width ranges.</p>
 *
 * <p>Additionally, the ("max" length) string value may be right or left aligned to fit the "min" width field
 * by specifying a sequence of one or more right or left pad characters.
 * Specifying both right and left padding will result in a centered alignment with the "min" width.</p>
 *
 * <p>The default is left aligned, and the default pad is a space.</p>
 *
 * <p>Pad characters are defined as the sequence of characters between the [ or ] braces of the specifier
 * and a numeric character of the "min" or "max" specification, or the "," character.
 * (Note that it is not possible to use a digit or a comma as a padding character).</p>
 *
 * <p>If more than one character is used in a pad sequence, this sequence will repeat, including any partial
 * reproduction as the width constraint is met.  For example, specifying "-->" as the pad sequence may
 * result in "-->-->-->--Value" as a result.</p>
 *
 * <p>White space is permissible between the numeric values and the comma.  Whitespace between the
 * numeric values (or comma) and the [ ] braces is considered part of the pad specification.</p>
 *
 * @example
 * [10,20]              // Will pad the end of the string with spaces if less than 10 characters,
 *                      // or truncate it if its length is more than 20.
 * [10,20 ]             // Equivalent to above
 * [10,20-]             // Similar, but pads with "-" instead of space
 * [10,]                // Pads if less than 10 characters, but unlimited max length otherwise
 * [,10]                // No minimum length, but maximum is 10
 * [0,10]               // Equivalent to above
 * [,0]                 // Max width of zero results in empty string for any value.
 * [20,Hello]           // Pads with repeats of "Hello" at end of string
 * [ 10,10]             // Will right align the string to a width of 10
 * [ 20,20 ]            // Center aligns within a field of 20
 * [,]                  // forces value to be cast as a string, but does not format width</pre>
 *
 * // Note that any or all min,max values and pad sequences may be specified by nested identifiers as well,
 * // so that the formatting parameters may come from the arguments themselves.
 * // Nested identifiers follow the same rules as standard format identifiers for naming properties in
 * // provided object argument(s).
 *
 * @example
 * str = fmtr.format("This is formatted: ${value}[${lpad}${min},${max}${rpad}]",
 *                              {lpad: '>', rpad: '<', min: 20, max:20, value: "hello"});
 *
 * // >>>>>>>hello<<<<<<<<
 */
export default class FormatMinMaxString extends FormatSpecifierBase {
    /**
     * Returns a promise that signifies we are fully constructed.
     * Note that for this implementation, there is no async action.
     */
    init () {
        return Promise.resolve()
    }

    /**
     * Makes the specifier for this format.
     *
     * @param {string} spec - Specifier notation
     * @return {Object}
     */
    makeSpecifier (spec) {
        let mm
        let m
        let i
        let p
        let v
        class SpecProps {
            lpadProp:string
            rpadProp:string
            minProp:string
            maxProp:string
            lpad:string
            rpad:string
            min:number
            max:number
        }
        let props = new SpecProps()

        // separate into min, max
        mm = spec.split(',')

        // work with min now
        m = mm[0]
        // get any nested props
        i = m.indexOf('$')
        if (i >= 0) {
            p = m.split('$') // this will result in 1 empty plus 1 or 2 more elements
            if (p.length > 2) {
                // left padding and min both provided (more than 2 props an error, just ignored)
                props.lpadProp = p[1]
                props.minProp = p[2]
            } else {
                // if we have only one prop, anything before it is the padding
                if (i > 0) {
                    props.lpad = m.substring(0, i)
                    // and the property is the min
                    props.minProp = p[1]
                } else {
                    // otherwise, if there is a numeric component, that is the min and this is the pad
                    v = this.getDigits(m)
                    if (v !== undefined) {
                        props.min = v
                        props.lpadProp = p[1]
                    } else {
                        // otherwise, this is the min and there is no pad
                        props.minProp = p[1]
                    }
                }
            }
        } else {
            // if no props, find digits
            v = this.getDigits(m)
            if (v !== undefined) {
                props.min = v
                // anything prior to digits is padding
                v = '' + v
                i = m.indexOf(v)
                if (i > 0) {
                    props.lpad = m.substring(0, i)
                }
            } else {
                // if no digits, this is our left padding
                props.lpad = m
            }
        }

        // work with max now
        m = mm[1]
        // get any nested props
        i = m.indexOf('$')
        if (i >= 0) {
            p = m.split('$')
            if (p.length > 2) { // 1 empty to start
                // right padding and min both provided (more than 2 props an error, just ignored)
                props.maxProp = p[1]
                props.rpadProp = p[2]
            } else {
                // if we have only one prop, anything after it is the padding
                i = m.indexOf('}', i)
                if (++i > 0 && i < m.length) {
                    props.rpad = m.substring(i)
                    // and the property is the max
                    props.maxProp = p[1]
                } else {
                    // otherwise, if there is a numeric component, that is the max and this is the pad
                    v = this.getDigits(m)
                    if (v !== undefined) {
                        props.max = v
                        props.rpadProp = p[1]
                    } else {
                        // otherwise, this is the max and there is no pad
                        props.maxProp = p[1]
                    }
                }
            }
        } else {
            // if no props, find digits
            v = this.getDigits(m)
            if (v !== undefined) {
                props.max = v
                // anything afterward is padding
                v = '' + v
                i = m.indexOf(v) + v.length
                if (i < m.length) {
                    props.rpad = m.substring(i)
                }
            } else {
                // if no digits, this is our right padding
                props.rpad = m
            }
        }

        return {
            method: this.renderFormat.bind(this),
            props: props
        }
    }

    /**
     * Applies the MinMaxString specifier properties to a value
     *
     * @param value     {*}       Value that will be cast to string and formatted
     * @param props     {object}    Properties for this operation
     * @param args      {Array}     Arguments used for indirect property values
     *
     * @return {String} Formatted string value
     */
    renderFormat (value, props, args) {
        let min
        let max
        let lpad
        let rpad
        let n
        let w
        let d

        value = '' + value

        if (props.minProp) {
            min = this.extractSpecifiedProperty(props.minProp, args)
        } else {
            min = props.min
        }
        if (props.maxProp) {
            max = this.extractSpecifiedProperty(props.maxProp, args)
        } else {
            max = props.max
        }
        if (props.lpadProp) {
            lpad = this.extractSpecifiedProperty(props.lpadProp, args)
        } else {
            lpad = props.lpad
        }
        if (props.rpadProp) {
            rpad = this.extractSpecifiedProperty(props.rpadProp, args)
        } else {
            rpad = props.rpad
        }

        if (min === undefined) {
            min = value.length
        }

        // default is to left align to fit min width
        if (lpad === undefined) {
            if (!rpad) {
                rpad = ' '
            }
        }

        if (min !== undefined) {
            if (max !== undefined && max < value.length) {
                // trim
                value = value.substring(0, max)
            }
            if (min > value.length) {
                w = min - value.length
                if (rpad && lpad) {
                    w /= 2
                }
                if (lpad) {
                    n = [lpad]
                    d = 1
                    while (d < w) {
                        n = n.concat(n)
                        d = d << 1
                    }
                    n = n.join('').substring(0, w)
                    value = n + value
                }
                if (rpad) {
                    n = [rpad]
                    if (min - value.length > w * 2) {
                        w++
                    }
                    d = 1
                    while (d < w) {
                        n = n.concat(n)
                        d = d << 1
                    }
                    if (min > value.length + w) {
                        n = n.concat(n)
                        w++
                    }
                    n = n.join('').substring(0, w)
                    value += n
                }
            }
        }
        return value
    }
}
