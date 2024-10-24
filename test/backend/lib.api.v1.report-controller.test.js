'use strict';

var utils = require('./init');
var expect = require('chai').expect;
var request = require('supertest');
require('../../backend/database');
require('../../backend/models/group');
var reportController = require('../../backend/api/controllers/reportController')();
var Report = require('../../backend/models/report');
var Group = require('../../backend/models/group');
var Source = require('../../backend/models/source');
var User = require('../../backend/models/user');
var async = require('async');
var source;
var user;
var reports;
var groups;

describe('Report controller', function() {
  function createSource(done) {
    Source.create({ nickname: 'test', media: 'dummy', keywords: 'e' }, function(err, src) {
      source = src;
      done(err);
    });
  }

  function loadUser(done) {
    User.findOne({}, function(err, u) {
      user = u;
      done(err);
    });
  }

  function createReports(done) {
    Report.create([
      { authoredAt: new Date(), content: 'one', _source: source._id, checkedOutBy: user.id },
      { authoredAt: new Date(), content: 'two', _source: source._id, checkedOutBy: user.id },
      { authoredAt: new Date(), content: 'three', _source: source._id, checkedOutBy: user.id }
    ], done);
  }

  function createGroups(done) {
    Group.create([
      { authoredAt: new Date(), title: 'First group' },
      { authoredAt: new Date(), title: 'Second group' }
    ], done);
  }

  function loadReports(done) {
    Report.find({}, function(err, results) {
      reports = results;
      done(err);
    });
  }

  function loadGroups(done) {
    Group.find({}, function(err, results) {
      groups = results;
      done(err);
    });
  }


  beforeEach(createSource);

  afterEach(utils.wipeModels([Report, Source, Group]));

  describe('GET /api/controllers/report', function() {

    // Create some reports.
    beforeEach(function(done) {
      var past = new Date(2000, 1, 1, 12, 0, 0); // Feb 1
      Report.create([
        { authoredAt: new Date(), content: 'one', flagged: true, _source: source._id },
        { authoredAt: new Date(), content: 'one', _source: source._id },
        { authoredAt: new Date(), content: 'two', _source: source._id },
        { storedAt: past, authoredAt: past, content: 'three', _source: source._id }
      ], done);
    });

    it('should get a list of all reports', function(done) {
      request(reportController)
        .get('/api/controllers/report')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.contain.property('total');
          expect(res.body).to.contain.property('results');
          expect(res.body.results).to.not.be.empty;
          expect(res.body.results).to.be.an.instanceof(Array);
          done();
        });
    });

    it('should query for reports', function(done) {
      request(reportController)
        .get('/api/controllers/report?keywords=one')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.contain.property('total');
          expect(res.body).to.contain.property('results');
          expect(res.body.results.length).to.equal(2);
          expect(res.body.results[0].content).to.equal('one');
          done();
        });
    });

    it('should query and filter reports', function(done) {
      request(reportController)
        .get('/api/controllers/report?keywords=one&flagged=true')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body.results.length).to.equal(2);
          expect(res.body.results[0].content).to.equal('one');
          done();
        });
    });

    it('should query and filter reports with no results', function(done) {
      request(reportController)
        .get('/api/controllers/report?keywords=seven&read=true')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body.total).to.equal(0);
          expect(res.body.results).to.be.empty;
          done();
        });
    });

    it('should filter by date range', function(done) {
      request(reportController)
        .get('/api/controllers/report?after=' + new Date(2000, 0, 31, 12, 0, 0) + '&before=' + new Date(2000, 1, 2, 12, 0, 0))
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body.results.length).to.equal(1);
          expect(res.body.results[0].content.toLowerCase()).to.contain('three');
          done();
        });
    });
  });

  describe('DELETE /api/controllers/report/_all', function() {
    beforeEach(function(done) {
      Report.create([
        { authoredAt: new Date(), content: 'one', _source: source._id },
        { authoredAt: new Date(), content: 'two', _source: source._id }
      ], done);
    });

    it('should delete all reports', function(done) {
      request(reportController)
        .del('/api/controllers/report/_all')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          request(reportController)
            .get('/api/controllers/report')
            .expect(200, { total: 0, results: [] }, done);
        });
    });
  });

  describe('PATCH api/controllers/report/_read', function() {
    beforeEach(function(done) {
      async.series([loadUser, createReports, loadReports], done);
    });

    it('should mark reports as read', function(done) {
      request(reportController)
        .patch('/api/controllers/report/_read')
        .send({ ids: [reports[0].id, reports[1].id], read: true })
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          done();
        });
    });
  });

  describe('PATCH api/controllers/report/_link', function() {
    beforeEach(function(done) {
      async.series([loadUser, createReports, loadReports, createGroups, loadGroups], done);
    });

    it('should link 2 reports to specific Group', function(done) {
      request(reportController)
        .patch('/api/controllers/report/_link')
        .send({ ids: [reports[0]._id, reports[1]._id], group: groups[0]._id })
        .expect(200)
        .end(function(err) {
          if (err) return done(err);

          request(reportController)
          .get('/api/controllers/report/' + reports[0]._id)
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            expect(res.body).to.have.property('_group');
            expect(res.body._group).to.equal(String(groups[0]._id));

            request(reportController)
            .get('/api/controllers/report/' + reports[1]._id)
            .expect(200)
            .end(function(err, res) {
              if (err) return done(err);
              expect(res.body).to.have.property('_group');
              expect(res.body._group).to.equal(String(groups[0]._id));
              done();
            });
          });
        });
    });

    it('should update the totalReports field in group', function(done) {
      var groupChanges = new utils.EventCounter(Group.schema,
                                                   'group:update');
      async.waterfall([
        function(callback) {
          request(reportController)
            .patch('/api/controllers/report/_link')
            .send({ ids: [reports[0]._id, reports[1]._id], group: groups[0]._id })
            .expect(200)
            .end(callback);
        },
        function(res, callback) {
          // Wait for group to be updated in the database
          groupChanges.waitForEvents(2, callback);
        },
        function(callback) {
          Group.findById(groups[0]._id, callback);
        },
        function(group, callback) {
          expect(group.totalReports).to.equal(2);
          request(reportController)
            .patch('/api/controllers/report/_link')
            .send({ ids: [reports[0]._id, reports[1]._id], group: groups[1]._id })
            .expect(200)
            .end(callback);
        },
        function(res, callback) {
          // Group 0 has two reports removed and group 1 has two added,
          // for a total of 4 additional events, plus the 2 we already had
          groupChanges.waitForEvents(6, callback);
        },
        function(callback) {
          Group.findById(groups[0]._id, callback);
        },
        function(group, callback) {
          expect(group.totalReports).to.equal(0);
          setImmediate(callback);
          groupChanges.kill();
        }
      ], done);
    });
  });

  describe('PATCH api/controllers/report/_unlink', function() {
    beforeEach(function(done) {
      async.series([loadUser, createReports, loadReports, createGroups, loadGroups], done);
    });

    it('should unlink 2 reports from specific Group', function(done) {
      request(reportController)
        .patch('/api/controllers/report/_link')
        .send({ ids: [reports[0]._id, reports[1]._id], group: groups[0]._id })
        .expect(200)
        .end(function(err) {
          if (err) return done(err);

          request(reportController)
          .patch('/api/controllers/report/_unlink')
          .send({ ids: [reports[0]._id, reports[1]._id] })
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);

            request(reportController)
            .get('/api/controllers/report/' + reports[0]._id)
            .expect(200)
            .end(function(err, res) {
              if (err) return done(err);
              expect(res.body).to.have.property('_group');
              expect(res.body._group).to.equal(null);

              request(reportController)
              .get('/api/controllers/report/' + reports[1]._id)
              .expect(200)
              .end(function(err, res) {
                if (err) return done(err);
                expect(res.body).to.have.property('_group');
                expect(res.body._group).to.equal(null);
                done();
              });
            });
          });
        });
    });

    it('should update the totalReports field in group', function(done) {
      var groupChanges = new utils.EventCounter(Group.schema,
                                                   'group:update');
      async.waterfall([
        function(callback) {
          request(reportController)
            .patch('/api/controllers/report/_link')
            .send({ ids: [reports[0]._id, reports[1]._id], group: groups[0]._id })
            .expect(200)
            .end(callback);
        },
        function(res, callback) {
          // Wait for group to be updated in the database
          groupChanges.waitForEvents(2, callback);
        },
        function(callback) {
          request(reportController)
            .patch('/api/controllers/report/_unlink')
            .send({ ids: [reports[0]._id, reports[1]._id] })
            .expect(200)
            .end(callback);
        },
        function(res, callback) {
          // Wait for group to be updated in the database
          groupChanges.waitForEvents(2, callback);
        },
        function(callback) {
          Group.findById(groups[0]._id, callback);
        },
        function(group, callback) {
          expect(group.totalReports).to.equal(0);
          setImmediate(callback);
          groupChanges.kill();
        },
      ], done);
    });
  });

  after(utils.expectModelsEmpty);
});
