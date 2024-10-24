// Handles CRUD requests for reports.
'use strict';

var Report = require('../../models/report');
var batch = require('../../models/batch');
var ReportQuery = require('../../models/query/report-query');
var _ = require('lodash');
var writelog = require('../../writeLog');
var tags = require('../../shared/tags');
const Group = require("../../models/group");
const eventRouter = require('../sockets/event-router');

// Determine the search keywords
const parseQueryData = (queryString) => {
  if (!queryString) return {};
  // Data passed through URL parameters
  var query = _.pick(queryString, ['keywords', 'status', 'after', 'before', 'media',
    'sourceId', 'groupId', 'author', 'tags', 'list', 'escalated', 'veracity', 'isRelevantReports', "irrelevant"]);
  if (query.tags) query.tags = tags.toArray(query.tags);
  return query;
}

// Get a list of queried Reports
exports.report_reports = (req, res) => {
  // Parse query string

  const queryData = parseQueryData(req.query);
  if (queryData) {
    let query = new ReportQuery(queryData);
    // Query for reports using fti
    Report.queryReports(query, req.query.page, (err, reports) => {
      if (err) return res.status(err.status).send(err.message);
      else {
        writelog.writeReport(req, reports, 'filter', query);
        return res.send(reports);
      }
    });
  } else {
    // Return all reports using pagination
    Report.findSortedPage({}, page, (err, reports) => {
      if (err) return res.status(err.status).send(err.message);
      else return res.status(200).send(reports);
    });
  }
}

// Load batch
exports.report_batch = (req, res) => {
  batch.load(req.user._id, (err, reports) => {
    if (err) res.status(err.status).send(err.message);
    else {
      writelog.writeBatch(req, 'loadBatch', reports);
      res.status(200).send({ results: reports, total: reports.length });
    }
  });
}

// Checkout new batch
exports.report_batch_new = (req, res) => {
  const query = new ReportQuery(req.body);
  batch.checkout(req.user._id, query, (err, reports) => {
    if (err) res.status(err.status).send(err.message);
    else {
      writelog.writeBatch(req, 'getNewBatch', reports);
      res.status(200).send({ results: reports, total: reports.length });
    }
  });
}

// Cancel batch
exports.report_batch_cancel = (req, res) => {
  batch.cancel(req.user._id, (err) => {
    if (err) res.status(err.status).send(err.message);
    else {
      writelog.writeBatch(req, 'cancelBatch');
      res.sendStatus(200);
    }
  });
}

// Get Report by id
exports.report_details = (req, res) => {
  Report.findById(req.params._id, (err, report) => {
    if (err) res.status(err.status).send(err.message);
    else if (!report) res.sendStatus(404);
    else {
      writelog.writeReport(req, report, 'viewReport');
      res.status(200).send(report);
    }
  });
}

// Get Report Comments by id
exports.report_comments = (req, res) => {
  const page = req.query.page;
  const queryData = { commentTo: req.params._id };
  const query = new ReportQuery(queryData);
  Report.queryReports(query, page, (err, reports) => {
    if (err) res.status(err.status).send(err.message);
    else {
      writelog.writeReport(req, reports, 'filter', query);
      res.status(200).send(reports);
    }
  });
}

// Update Report data
exports.report_update = (req, res) => {
  // Find report to update
  Report.findById(req.params._id, (err, report) => {
    if (err) return res.status(err.status).send(err.message);
    if (!report) return res.sendStatus(404);
    // Update the actual value
    _.forEach(_.pick(req.body, ['_group', 'read', 'smtcTags', 'notes', 'escalated', 'veracity']), (val, key) => {
      report[key] = val;
    });
    if (!report.read) {
      report.setReadStatus(true);
    }
    // Save report
    report.save((err, numberAffected) => {
      if (err) res.status(err.status).send(err.message);
      else if (!numberAffected) res.sendStatus(404);
      else {
        res.sendStatus(200);
      }
    });
  });
}
/* Delete all reports
router.delete('/api/report/_all', User.can('edit data'), (req, res) => {
  Report.remove((err) {
    if (err) res.status(err.status).send(err.message);
    else {
      writelog.writeReport(req, {}, 'deleteAllReports');
      res.sendStatus(200);
    }
  });
}); */

// Edit veracity selected reports
exports.reports_veracity_update = (req, res) => {
  if (!req.body.ids || !req.body.ids.length) return res.sendStatus(200);
  Report.find({ _id: { $in: req.body.ids } }, (err, reports) => {
    if (err) return res.status(err.status).send(err.message);
    if (reports.length === 0) return res.sendStatus(200);
    let remaining = reports.length;
    reports.forEach((report) => {
      // Edit veracity to catch it in model
      report.setVeracity(req.body.veracity);
      report.save((err) => {
        if (err) {
          if (!res.headersSent) res.status(err.status).send(err.message)
          return;
        }
        writelog.writeReport(req, report, 'changeVeracityReport');
        if (--remaining === 0) return res.sendStatus(200);
      });
    });
  });
}

// Mark selected reports as read
exports.reports_read_update = (req, res) => {
  if (!req.body.ids || !req.body.ids.length) return res.sendStatus(200);
  Report.find({ _id: { $in: req.body.ids } }, (err, reports) => {
    if (err) return res.status(err.status).send(err.message);
    if (reports.length === 0) return res.sendStatus(200);
    let remaining = reports.length;
    reports.forEach((report) => {
      // Mark each report as read only to catch it in model
      report.setReadStatus(req.body.read);
      report.save((err) => {
        if (err) {
          if (!res.headersSent) res.status(err.status).send(err.message)
          return;
        }
        writelog.writeReport(req, report, 'markAsRead');
        if (--remaining === 0) {
          eventRouter.publish('reports:update', { ids: req.body.ids, update: { read: req.body.read } }).then(() => {
            return res.sendStatus(200)
          });

        };
      });
    });
  });
}

// Escalate selected reports
exports.reports_escalated_update = (req, res) => {
  if (!req.body.ids || !req.body.ids.length) return res.sendStatus(200);
  Report.find({ _id: { $in: req.body.ids } }, (err, reports) => {
    if (err) return res.status(err.status).send(err.message);
    if (reports.length === 0) return res.sendStatus(200);
    let remaining = reports.length;
    reports.forEach((report) => {
      // Mark each report as escalated to catch it in model
      report.setEscalated(req.body.escalated);
      report.save((err) => {
        if (err) {
          if (!res.headersSent) res.status(err.status).send(err.message)
          return;
        }
        writelog.writeReport(req, report, 'escalatedReport');
        if (--remaining === 0) return res.sendStatus(200);
      });
    });
  });
}
// mark selected reports as irrelevent
exports.reports_irrelevant_update = (req, res) => {
  if (!req.body.ids || !req.body.ids.length) return res.sendStatus(200);
  Report.find({ _id: { $in: req.body.ids } }, (err, reports) => {
    if (err) return res.status(err.status).send(err.message);
    if (reports.length === 0) return res.sendStatus(200);
    let remaining = reports.length;
    reports.forEach((report) => {
      // Mark each report as escalated to catch it in model
      report.setIrrelevant(req.body.irrelevance);
      report.save((err) => {
        if (err) {
          if (!res.headersSent) res.status(err.status).send(err.message)
          return;
        }
        writelog.writeReport(req, report, 'irreleventReport');
        if (--remaining === 0) {
          eventRouter.publish('reports:update', { ids: req.body.ids, update: { irrelevant: req.body.irrelevance } }).then(() => {
            return res.sendStatus(200)
          });

        };
      });
    });
  });
}

// Link selected reports to one group
exports.reports_group_update = (req, res) => {
  if (!req.body.ids || !req.body.ids.length) return res.sendStatus(200);
  Report.find({ _id: { $in: req.body.ids } }, (err, reports) => {
    if (err) return res.status(err.status).send(err.message);
    if (reports.length === 0) return res.sendStatus(200);
    let remaining = reports.length;
    reports.forEach((report) => {
      report.read = true;
      report._group = req.body.group._id;
      report.save((err) => {
        if (err) {
          if (!res.headersSent) return res.status(err.status).send(err.message)
          return;
        }
        Group.findById(req.body.group._id, (err, group) => {
          if (err) {
            if (!res.headersSent) {
              return res.status(err.status).send(err.message);
            }
            return;
          }
          group._reports.push(report._id);
          group.save((err) => {
            if (err) {
              if (!res.headersSent) return res.status(err.status).send(err.message)
              return;
            }
          })
        })
        writelog.writeReport(req, report, 'addToGroup');
        if (--remaining === 0) {
          eventRouter.publish('reports:update', { ids: req.body.ids, update: { _group: req.body.group._id } }).then(() => {
            return res.sendStatus(200)
          });

        };
      });
    });
  });
}

// Update Notes
exports.reports_notes_update = (req, res) => {
  if (!req.body.ids || !req.body.ids.length) return res.sendStatus(200);
  Report.find({ _id: { $in: req.body.ids } }, (err, reports) => {
    if (err) return res.status(err.status).send(err.message);
    if (reports.length === 0) return res.sendStatus(200);
    var remaining = reports.length;
    reports.forEach((report) => {
      report.notes = req.body.notes;
      report.save((err) => {
        if (err) {
          if (!res.headersSent) res.status(err.status).send(err.message)
          return;
        }
        writelog.writeReport(req, report, 'updateNotes');
        if (--remaining === 0) return res.sendStatus(200);
      });
    });
  });
}

// Update Tags
exports.reports_tags_update = (req, res) => {
  if (!req.body.ids || !req.body.ids.length) return res.sendStatus(200);
  Report.find({ _id: { $in: req.body.ids } }, (err, reports) => {
    if (err) return res.status(err.status).send(err.message);
    if (reports.length === 0) return res.sendStatus(200);
    var remaining = reports.length;
    reports.forEach((report) => {
      report.smtcTags = req.body.tags;
      report.save((err) => {
        if (err) {
          if (!res.headersSent) res.status(err.status).send(err.message)
          return;
        }
        writelog.writeReport(req, report, 'updateTags');
        if (--remaining === 0) {
          eventRouter.publish('reports:update', { ids: req.body.ids, update: { smtcTags: req.body.tags } }).then(() => {
            return res.sendStatus(200)
          });

        };
      });
    });
  });
}
// dont think we are using these....
exports.reports_tags_add = (req, res) => {
  if (!req.body.ids || !req.body.ids.length) return res.sendStatus(200);
  Report.find({ _id: { $in: req.body.ids } }, (err, reports) => {
    if (err) return res.status(err.status).send(err.message);
    if (reports.length === 0) return res.sendStatus(200);
    var remaining = reports.length;
    reports.forEach((report) => {
      report.read = true;
      report.addSMTCTag(req.body.smtcTag, (err) => {
        if (err && !res.headersSent) {
          res.send(500, err.message);
          return;
        }
        report.save((err) => {
          if (err) return res.status(err.status).send(err.message);
          writelog.writeReport(req, report, 'addTagToReport');
          if (--remaining === 0) return res.sendStatus(200);
        });
      });
    });
  });
}
// dont think we are using these....

exports.reports_tags_remove = (req, res) => {
  if (!req.body.ids || !req.body.ids.length) return res.sendStatus(200);
  Report.find({ _id: { $in: req.body.ids } }, (err, reports) => {
    if (err) return res.status(err.status).send(err.message);
    if (reports.length === 0) return res.sendStatus(200);
    var remaining = reports.length;
    reports.forEach((report) => {
      report.removeSMTCTag(req.body.smtcTag, (err) => {
        if (err && !res.headersSent) {
          res.send(500, err.message);
          return;
        }
        report.save((err) => {
          if (err) return res.status(err.status).send(err.message);
          writelog.writeReport(req, report, 'removeTagFromReport');
          if (--remaining === 0) return res.sendStatus(200);
        });
      });
    });
  });
}
// dont think we are using these....

exports.reports_tags_clear = (req, res) => {
  if (!req.body.ids || !req.body.ids.length) return res.sendStatus(200);
  Report.find({ _id: { $in: req.body.ids } }, (err, reports) => {
    if (err) return res.status(err.status).send(err.message);
    if (reports.length === 0) return res.sendStatus(200);
    var remaining = reports.length;
    reports.forEach((report) => {
      report.clearSMTCTags(() => {
        report.save((err) => {
          if (err) {
            if (!res.headersSent) res.status(err.status).send(err.message)
            return;
          }
          writelog.writeReport(req, report, 'clearTagsFromReport');
          if (--remaining === 0) return res.sendStatus(200);
        });
      });
    });
  });
}


