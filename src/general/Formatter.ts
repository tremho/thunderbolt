
/**
 * The Formatter combines the commonly implemented format handlers into a single formatter singleton for general use.
 *
 * The formatter may be used to format strings for justification, padding, or truncation or for the formatting of
 * numeric values in a variety of display alignments for decimal places, padding, leading or trailing zeros, etc.
 *
 * Additionally, the Formatter singleton includes handlers for date and time display (utilizing MomentJS), and
 * for the representation of units of measure across different unit scales (uses {@Link UnitMeasure} features).
 *
 * The formatter is obtained by importing the module:
 * ```
 *    const formatter = require("~/util/Formatter")
 * ```
 *
 * A string is formatted by passing the format string, with any referenced values as arguments:
 * ```
 *    const numText = formatter.format("Pi to 3 digits is $[1.3]", Math.PI)
 *    const strText = formatter.format("This string is a padded minimum of 10 and max 20 characters $[10,20]", aString)
 *    const strText = formatter.format("This is padded $[>10,10<]", "Hello")
 * ```
 *
 * Note that formats are specified by $[ ] blocks, usually with two values.  String formatting uses a comma (,)
 * separator to denote the min/max pad/truncate values.  Numeric formatting uses a period (.) to separate integer
 * and decimal portions of a value.
 *
 * Arguments may be passed in order, or by number reference:
 *```
 *    const example = formatter.format("The $1 jumped over the $2", 'cow, 'moon')
 *    const example2 = formatter.format("The $2 jumped over the $1", 'moon', 'cow')
 *```
 * Arguments may be named properties in an object:
 *```
 *    const example = formatter.format("The cow (named ${cow}) jumped over ${what}",
 *                                        {cow: "Daisy", what: "The moon"} )
 *```
 *
 * Note that the $ token can be combined with numbers to indicate positional order: `$1`, `$2`, `$1[2.02]`, `$3{cow}`, etc
 * and that these can be used to refer to the arguments in order.  This is useful in localization contexts, where
 * the format structure of a sentence may present translated words in differing orders per language use.  It also
 * allows for repeating or omitting items by changing the format string only (possibly by configuration).
 *
 * Of course, the `${propertyName}` syntax also allows similar flexibility for arguments that can be passed as name/value
 * objects.
 *
 * One can pass control to a callback function by using `$(callbackName)` as the directive.  The callback name must
 * be assigned by the `formatter.installNamedCallback(name, callback)` method.  Such action allows application-level
 * control over formatting directives for special handling needs, such as dynamic substitutions.
 * The callback receives the result string as formatted up to this point, as well as the array of all arguments.  It
 * returns the modified result string.
 *
 * Handlers such as those for dates and units take some named arguments.  For example, to specify a date format, we
 * must name the date handler:
 *```
 *    const dateStr = formatter.format("The date is $[date|MM DD YYYY]", aDate)
 *```
 * Hints are accepted by some handlers.  Hints follow a colon character (:) after the handler name.
 * The hints may provide a pre-set format or context, depending upon the handler.  Sub hints, if applicable,
 * are given successively with dash (-) separators.  The format is separated from the handler name (and/or hints) by
 * a pipe character (|).  A second pipe character may optionally be given if there is a localization hint to be applied
 * as well.  Localization hints are given in the form `en-US`, or `en`.
 *
 * More succinctly, the order for these additional handler hints is as follows:
 *```
 *   [name:hint-subhint-etc|format|i18n]
 *```
 * See the documentation for the handlers for more specifics in context.
 *
 * Provides a singleton instance of a standard formatter that includes
 * - The number formatter ({@Link FormatIntDecNumber})
 * - The string formatter ({@Link FormatMinMaxString})
 * - The date formatter ({@Link FormatDateTime})
 * - The unit formatter ({@Link FormatUnit})
 *
 * Documentation on the methods of the Formatter singleton may be seen here ({@Link Formatter})
 *
 * @type {Formatter}
 */

'use strict'

import Formatter from './format/Formatter'
// import FormatDateTime from './format/FormatDateTime'
// import FormatUnit from './format/FormatUnit'
// import FormatCurrency from './format/FormatCurrency'

const formatter = new Formatter()
// formatter.installHandler('date', new FormatDateTime())
// formatter.installHandler('unit', new FormatUnit(formatter))
// formatter.installHandler('currency', new FormatCurrency(formatter))
formatter.setLocale() // init locale set to system

export default formatter
