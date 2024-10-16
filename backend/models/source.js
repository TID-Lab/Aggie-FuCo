// Represents a single source of data, e.g. a single Facebook page or RSS feed.
// Sources keep track of any errors or warnings that are encountered during fetching.
// They also track how many of these errors have been 'read' so that the user can be notified if new errors
// have occurred since they last checked.
// The actual fetching is handled by the fetching module.

var database = require('../database');
var mongoose = database.mongoose;
var validator = require('validator');
var _ = require('lodash');
require('../error');

var EVENTS_TO_RETURN = 50;

var lengthValidator = function (str) {
  return validator.isLength(str, { min: 0, max: 80 })
}

var urlValidator = function (url) {
  return (
    url == null
    || typeof url !== 'string'
    || url === ''
    || validator.isURL(url)
  )
}

var mediaValues = ['facebook', 'instagram', 'comments', 'elmo', 'twitter', 'rss', 'dummy', 'smsgh', 'whatsapp', 'telegram', 'junkipedia', 'dummy-pull', 'dummy-fast'];

var sourceSchema = new mongoose.Schema({
  media: { type: String, enum: mediaValues },
  nickname: { type: String, required: true, validate: lengthValidator, index: true },
  resource_id: String,
  url: { type: String, validate: urlValidator },
  keywords: String,
  lists: String,
  enabled: { type: Boolean, default: true },
  events: { type: Array, default: [] },
  unreadErrorCount: { type: Number, default: 0 },
  lastReportDate: { type: Date, index: true },
  lastReportDateSavedSearch: { type: Date, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  tags: { type: [String], default: [] },
  credentials: { type: mongoose.Schema.Types.ObjectId, ref: 'Credentials', required: true },
});

sourceSchema.pre('save', function (next) {
  // Do not allow changing media
  if (!this.isNew && this.isModified('media')) return next(new Error.Validation('source_media_change_not_allowed'));
  // Notify when changing error count
  if (!this.isNew && this.isModified('unreadErrorCount')) {
    this._sourceErrorCountUpdated = true;
  }

  if (!this.isNew && this.isModified('enabled')) {
    this._sourceStatusChanged = true;
  }

  process.nextTick(next);
});

sourceSchema.post('save', function () {
  if (this._sourceStatusChanged) {
    // emit special events for the enabling & disabling of sources
    var event = this.enabled ? 'source:enable' : 'source:disable';
    sourceSchema.emit(event, { _id: this._id.toString() });
  } else {
    if (!this._silent) {
      sourceSchema.emit('source:save', { _id: this._id.toString() });
    }
  }

  if (this._sourceErrorCountUpdated) {
    sourceSchema.emit('sourceErrorCountUpdated');
  }
});

sourceSchema.pre('remove', function (next) {
  sourceSchema.emit('source:remove', { _id: this._id.toString() });
  next();
});

// Enable source
sourceSchema.methods.enable = function () {
  this.enabled = true;
};

// Disable source
sourceSchema.methods.disable = function () {
  this.enabled = false;
};

// Log events in source
sourceSchema.methods.logEvent = function (level, message) {
  this.events.push({
    datetime: new Date(),
    type: level,
    message: message,
  });
  // if (level === 'error') this.disable();
  this.unreadErrorCount++;
  this._silent = true;
  return this.save();
};

var Source = mongoose.model('Source', sourceSchema);

// Get latest unread error messages
Source.findByIdWithLatestEvents = function (_id, callback) {
  Source.findById(_id, function (err, source) {
    if (err) return callback(err);
    if (!source) return callback(null, null);
    if (source.events) {
      source.events = _.chain(source.events).sortBy('datetime').last(EVENTS_TO_RETURN).value();
    }
    callback(null, source);
  });
};

// Reset unread error count back to zero
Source.resetUnreadErrorCount = function (_id, callback) {
  Source.findById(_id, '-events', function (err, source) {
    if (err) return callback(err);
    if (!source) return callback(null, null);
    if (source.unreadErrorCount === 0) return callback(null, source);
    source.unreadErrorCount = 0;
    source._silent = true;
    source.save(callback);
  });
};

// Determine total number of errors
Source.countAllErrors = function (callback) {
  var pipeline = [
    { $group: { _id: null, unreadErrorCount: { $sum: '$unreadErrorCount' } } }
  ];
  Source.aggregate(pipeline, function (err, total) {
    if (err) callback(err);
    else if (total.length === 0) callback(null, 0);
    else callback(null, total[0].unreadErrorCount);
  });
};

Source.getMediaValues = function () {
  return mediaValues;
};
module.exports = Source;
