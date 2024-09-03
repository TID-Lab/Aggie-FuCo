// A report is a single post/comment/article or other chunk of data from a source.
// This class is responsible for executing ReportQuerys.
const database = require('../database');
const mongoose = database.mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;
const SchemaTypes = mongoose.SchemaTypes;
const SMTCTag = require('./tag');
const { addPost, removePost } = require('../comments');

let schema = new Schema({
  authoredAt: { type: Date, index: true },
  fetchedAt: { type: Date, index: true },
  storedAt: { type: Date, index: true },
  content: { type: String, index: true },
  author: { type: String, index: true },
  veracity: { type: String, default: 'Unconfirmed', enum: ['Unconfirmed', 'Confirmed True', 'Confirmed False'] },
  url: String,
  metadata: Schema.Types.Mixed,
  smtcTags: { type: [{ type: SchemaTypes.ObjectId, ref: 'SMTCTag' }], default: [] },
  hasSMTCTags: { type: Boolean, default: false, required: true, index: true },
  closed: { type: Boolean, default: false, required: true },
  read: { type: Boolean, default: false, required: true, index: true },
  _sources: [{ type: String, ref: 'Source', index: true }],
  _media: { type: [String], index: true },
  _sourceNicknames: [String],
  _group: { type: SchemaTypes.ObjectId, ref: 'Group', index: true },
  checkedOutBy: { type: Schema.ObjectId, ref: 'User', index: true },
  checkedOutAt: { type: Date, index: true },
  commentTo: { type: Schema.ObjectId, ref: 'Report', index: true },
  originalPost: { type: String },
  notes: { type: String },
  escalated: { type: Boolean, default: false, required: true, index: true },
  content_lang: { type: String },
  irrelevant: { type: String, default: 'false', required: false, enum: ['false', 'true', 'maybe'] }
});

schema.index({ 'metadata.ct_tag': 1 }, { background: true });
// Add fulltext index to the `content` and `author` field.
//schema.index({ content: 'text', author: 'text' });
schema.path('_group').set(function (_group) {
  this._prevGroup = this._group;
  return _group;
});

// sets the indexed hasSMTCTags boolean
schema.pre('save', function (next) {
  this.hasSMTCTags = this.smtcTags.length > 0;
  next()
});

schema.pre('save', function (next) {
  if (this.isNew) {
    this._wasNew = true;
    // Set default storedAt.
    if (!this.storedAt) this.storedAt = new Date();

  } else {
    // Capture updates before saving report
    if (this.isModified('_group')) {
      this._groupWasModified = true;
    }

  }
  next();
});

// Emit information about updates after saving report
schema.post('save', function () {
  if (this._wasNew) schema.emit('report:new', { _id: this._id.toString() });
  if (!this._wasNew) schema.emit('report:updated', this);
  if (this._groupWasModified) {
    schema.emit('change:group', this._prevGroup, this._group);
  }
});



schema.methods.setReadStatus = function (readStatus) {
  this.read = readStatus;
};

schema.methods.setVeracity = function (veracity) {
  this.veracity = veracity;
};

schema.methods.setEscalated = function (escalated) {
  this.escalated = escalated;
};

schema.methods.setIrrelevant = function (irrelevant) {
  this.irrelevant = irrelevant;
};
schema.methods.addSMTCTag = function (smtcTagId, callback) {
  // TODO: Use Functional Programming
  // ML This finds the smtcTag to add (if it doesn't exists) then add it.
  let isRepeat = false;
  this.smtcTags.forEach(function (tag) {
    if (smtcTagId === tag.toString()) {
      isRepeat = true;
    }
  });
  if (isRepeat === false) {
    this.smtcTags.push({ _id: smtcTagId });
    this.read = true;
    // Only send a post to the acquisition API if it is a) not a comment b) a FB post and c) not a group post
    if (!this.commentTo && this._media[0] === 'facebook' && !this.url.match(/permalink/)) {
      SMTCTag.findById(smtcTagId, (err, tag) => {
        if (err) {
          console.error(err);
        }
        if (tag.isCommentTag) {
          addPost(this.url, callback)
        } else {
          callback();
        }
      });
      return;
    }
  }
  callback();
}

schema.methods.removeSMTCTag = function (smtcTagId, callback) {
  // TODO: Use Functional Programming
  // ML This finds the smtcTag to remove (if it exists) then remove it.
  if (this.smtcTags) {
    let fndIndex = -1;
    this.smtcTags.forEach(function (tag, index) {
      let string = tag.toString();
      if (smtcTagId === tag.toString()) {
        fndIndex = index;
      }
    })
    if (fndIndex !== -1) {
      this.smtcTags.splice(fndIndex, 1);

      if (!this.commentTo && this._media[0] === 'facebook') {
        SMTCTag.findById(smtcTagId, (err, tag) => {
          if (err) {
            console.error(err);
          }
          if (tag.isCommentTag) {
            removePost(this.url, callback)
          } else {
            callback();
          }
        });
        return;
      }
    }
  }
  callback();
}

schema.methods.clearSMTCTags = function (callback) {

  const cb = () => {
    this.smtcTags = [];
    callback();
  }

  if (!this.commentTo) {
    let remaining = this.smtcTags.length;
    this.smtcTags.forEach((tag) => {
      const tagId = tag.toString();
      this.removeSMTCTag(tagId, (err) => {
        if (err) {
          console.error(err);
        }
        if (--remaining === 0) {
          cb();
        }
      });
    });
    return;
  }
  cb();
}
schema.plugin(AutoIncrement, { inc_field: 'reportId' });
const Report = mongoose.model('Report', schema);

SMTCTag.schema.on('tag:removed', function (id) {
  Report.find({ smtcTags: id }, function (err, reports) {
    if (err) {
      console.error(err);
    }
    reports.forEach(function (report) {
      report.removeSMTCTag(id, () => {
        report.save();
      })
    });
  });
})


// queryReports reports based on passed query data
Report.queryReports = function (query, page, callback) {
  if (typeof query === 'function') return Report.findPage(query);
  if (typeof page === 'function') {
    callback = page;
    page = 0;
  }
  if (page < 0) page = 0;

  const filter = query.toMongooseFilter();

  // Re-set search timestamp
  query.since = new Date();

  if (query.escalated === 'escalated') filter.escalated = true;
  if (query.escalated === 'unescalated') filter.escalated = false;
  if (query.veracity === 'confirmed true') filter.veracity = 'Confirmed True';
  if (query.veracity === 'confirmed false') filter.veracity = 'Confirmed False';
  if (query.veracity === 'unconfirmed') filter.veracity = 'Unconfirmed';

  Report.findSortedPage(filter, page, callback);
};



Report.findSortedPage = function (filter, page, callback) {
  Report.findPage(filter, page, { sort: '-storedAt' }, function (err, reports) {
    if (err) return callback(err);
    callback(null, reports);
  });
};

module.exports = Report;
