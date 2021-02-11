"use strict";
exports.__esModule = true;
exports.StringParser = void 0;
var whitespace = [' ', '\t', '\r\n', '\n', '\r'];
/**
 * String Parser is a helper for stepwise tokenized string reading.
 */
var StringParser = /** @class */ (function () {
    /**
     * Constructs a StringParser object, setting up a string to be parsed
     *
     * @param parseString
     */
    function StringParser(parseString) {
        this.parseString = parseString;
        this.parsePos = 0;
    }
    /**
     * Moves just behind the match occurrence, looking forward
     *
     * @param match
     */
    StringParser.prototype.aheadTo = function (match) {
        this.parsePos = this.parseString.indexOf(match, this.parsePos);
    };
    /**
     * Moves just forward of the match occurrence, looking forward
     * @param match
     */
    StringParser.prototype.aheadPast = function (match) {
        this.parsePos = this.parseString.indexOf(match, this.parsePos) + match.length;
    };
    /**
     * Moves just forward the match occurrence, looking backward.
     * @param match
     */
    StringParser.prototype.backTo = function (match) {
        this.backBefore(match);
        this.parsePos += match.length;
    };
    /**
     * Moves to the start of the match occurrence, looking backward.
     * @param match
     */
    StringParser.prototype.backBefore = function (match) {
        this.parsePos = this.parseString.lastIndexOf(match, this.parsePos);
    };
    /**
     * Reads the word next in the parse string.
     * "Word" is terminated by the occurrence of one of the given delimiters.
     *
     * @param delimiters
     */
    StringParser.prototype.readNext = function (delimiters) {
        if (!delimiters)
            delimiters = whitespace;
        var index = -1;
        var ds = delimiters.slice(0); // make copy
        while (index === -1) {
            var d = ds.shift();
            if (!d)
                break;
            index = this.parseString.indexOf(d, this.parsePos);
        }
        if (index === -1)
            index = undefined;
        var word = this.parseString.substring(this.parsePos, index);
        this.parsePos = index ? index + 1 : this.parseString.length;
        this.skipWhitespace();
        return word;
    };
    /**
     * Reads the word prior to the current position.
     * "Word" is terminated by the occurrence of one of the given delimiters.
     *
     * @param delimiters
     */
    StringParser.prototype.readPrevious = function (delimiters) {
        if (!delimiters)
            delimiters = whitespace;
        var index = -1;
        var ds = delimiters.slice(); // make copy
        while (index === -1) {
            var d = ds.shift();
            if (!d)
                break;
            index = this.parseString.lastIndexOf(d, this.parsePos);
        }
        if (index === -1)
            index = 0;
        var word = this.parseString.substring(index, this.parsePos);
        return word;
    };
    /**
     * advances past any interceding whitespace at current position.
     */
    StringParser.prototype.skipWhitespace = function () {
        while (whitespace.indexOf(this.parseString.charAt(this.parsePos)) !== -1) {
            this.parsePos++;
        }
    };
    /**
     * Returns the remaining part of the string ahead of parse position
     */
    StringParser.prototype.getRemaining = function () {
        return this.parseString.substring(this.parsePos + 1);
    };
    /**
     * Moves the current parse position the given amount
     * @param charCount
     */
    StringParser.prototype.advancePosition = function (charCount) {
        this.parsePos += charCount;
    };
    Object.defineProperty(StringParser.prototype, "parsePosition", {
        /**
         * Returns the current parse position
         */
        get: function () { return this.parsePos; },
        enumerable: false,
        configurable: true
    });
    return StringParser;
}());
exports.StringParser = StringParser;
