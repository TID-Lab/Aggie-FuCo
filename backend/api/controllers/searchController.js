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
        'sourceId', 'groupId', 'author', 'tags', 'list', 'escalated', 'veracity', 'isRelevantReports',]);
    if (query.tags) query.tags = tags.toArray(query.tags);
    return query;
}

// Get a list of queried Reports
exports.search_reports = (req, res) => {
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
