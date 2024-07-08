'use strict'
const EventEmitter = require('events');
const util = require("util");

let Streamer = function () {
    this.bindings = {
        setting: this._addSettingListeners,
    };
};

util.inherits(Streamer, EventEmitter);

Streamer.prototype.addListeners = function (type, emitter) {
    this.bindings[type] && this.bindings[type].call(this, emitter);
};

Streamer.prototype._addSettingListeners = function (emitter) {
    let self = this;

    // Clean-up old listeners
    emitter.removeAllListeners('settingsUpdated');

    // Listens to new reports being written to the database
    emitter.on('settingsUpdated', function (report) {
        self.resumeQuery();
    });
};

module.exports = new Streamer();