"use strict";
/*
Records log-style messages into an array that can be displayed by UI
- sends events on update
- has adjustable max-lines and will trim off top to make room at bottom
- We may have more than one of these for different purposes.
 */
exports.__esModule = true;
exports.getInfoMessageRecorder = exports.InfoMessageRecorder = void 0;
var InfoMessage = /** @class */ (function () {
    function InfoMessage() {
        this.timestamp = Date.now(); // ms timestamp
        this.subject = ''; // message subject or title
        this.message = ''; // the message body
    }
    return InfoMessage;
}());
var InfoMessageRecorder = /** @class */ (function () {
    function InfoMessageRecorder() {
        this.recorded = [];
        this.maxRecords = 5000;
        this.subscribers = [];
    }
    /**
     * Records entry, maintaining max size as needed.
     * @param im
     * @private
     */
    InfoMessageRecorder.prototype.record = function (im) {
        // console.log('recording IM', im)
        while (this.recorded.length >= this.maxRecords) {
            this.recorded.shift();
        }
        this.recorded.push(im);
        this.notify();
    };
    /**
     * Notifies subscribers on a change.  Passes entire array as the argument.
     * @private
     */
    InfoMessageRecorder.prototype.notify = function () {
        var _this = this;
        // console.log('notifying '+this.subscribers.length+' subscribers')
        this.subscribers.forEach(function (cb) {
            if (cb) {
                // console.log('calling subscriber...')
                cb(_this.recorded);
            }
        });
    };
    /**
     * Subscribe to a notification when the array changes
     * @param callback -- callback is passed the entire InfoMessage array on a change
     * @returns {number} -- and id that may be used to unsubscribe
     */
    InfoMessageRecorder.prototype.subscribe = function (callback) {
        var trimmed = [];
        this.subscribers.forEach(function (s) {
            if (s)
                trimmed.push(s);
        });
        this.subscribers = trimmed;
        this.subscribers.push(callback);
        return this.subscribers.length - 1;
    };
    /**
     * Unsubscribes from further notifications.
     * @param subscribeId -- the number returned by subscribe.
     */
    InfoMessageRecorder.prototype.unsubscribe = function (subscribeId) {
        this.subscribers[subscribeId] = null;
    };
    /**
     * Records a message
     * @param subject
     * @param message
     */
    InfoMessageRecorder.prototype.write = function (subject, message) {
        var im = new InfoMessage();
        im.subject = subject;
        im.message = message;
        this.record(im);
    };
    /**
     * Records a message referring to an object.
     * @param refObj
     * @param subject
     * @param message
     */
    InfoMessageRecorder.prototype.writeFor = function (refObj, subject, message) {
        var im = new InfoMessage();
        im.subject = subject;
        im.message = message;
        im.refObj = refObj;
        this.record(im);
    };
    return InfoMessageRecorder;
}());
exports.InfoMessageRecorder = InfoMessageRecorder;
// export thie as a singleton with access in AppGateway via API
var imrSingleton = null;
function getInfoMessageRecorder() {
    if (!imrSingleton) {
        imrSingleton = new InfoMessageRecorder();
    }
    return imrSingleton;
}
exports.getInfoMessageRecorder = getInfoMessageRecorder;
