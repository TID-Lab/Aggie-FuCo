'use strict';

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const User = require('../../models/user');
const {
  loadIncidentAccessContext,
} = require('../middlewares/incidentAccessMiddlewares');
const { loadReportSourceAccessFilter } = require('../utils/reportSourceAccess');

// Analytics aggregates the same reports the /report routes serve, so the read routes
// carry the same access context. loadReportSourceAccessFilter scopes report reads to
// the caller's sources; loadIncidentAccessContext supplies the team context used to
// hide incident references the caller cannot view.
router.get(
  '/overview',
  User.can('view data'),
  loadReportSourceAccessFilter,
  loadIncidentAccessContext,
  analyticsController.analytics_overview
);
router.get(
  '/report-metrics',
  User.can('view data'),
  loadReportSourceAccessFilter,
  analyticsController.analytics_report_metrics
);
router.get(
  '/notable-activities',
  User.can('view data'),
  loadReportSourceAccessFilter,
  loadIncidentAccessContext,
  analyticsController.analytics_notable_activities
);

// TODO(issue 3): these mutations still authorize only the global 'edit data'
// permission. They do not check that the caller may view or modify the target
// incident, and they spread the raw request body into Group.create. Bring them up to
// the contract PATCH /api/report/_group uses (allowGlobalOrScoped +
// requireReportIncidentAccess) before access policies are configured in production.
router.post('/notable-activities/incident', User.can('edit data'), analyticsController.analytics_create_incident);
router.patch('/notable-activities/incident', User.can('edit data'), analyticsController.analytics_update_incident);

module.exports = router;
