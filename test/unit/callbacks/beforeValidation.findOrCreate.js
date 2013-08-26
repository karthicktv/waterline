var Waterline = require('../../../lib/waterline'),
    assert = require('assert');

describe('.beforeValidation()', function() {

  describe('basic function', function() {
    var person,
        Model;

    before(function(done) {

      var waterline = new Waterline();
      var Model = Waterline.Collection.extend({
        identity: 'user',
        adapter: 'foo',
        attributes: {
          name: 'string'
        },

        beforeValidation: function(values, cb) {
          values.name = values.name + ' updated';
          cb();
        }
      });

      waterline.loadCollection(Model);

      // Fixture Adapter Def
      var adapterDef = {
        find: function(col, criteria, cb) { return cb(null, null); },
        create: function(col, values, cb) { return cb(null, values); }
      };

      waterline.initialize({ adapters: { foo: adapterDef }}, function(err, colls) {
        if(err) done(err);
        person = colls.user;
        done();
      });
    });

    /**
     * findOrCreate
     */

    describe('.findOrCreate()', function() {

       describe('without a record', function() {

        before(function(done) {
          // Fixture Adapter Def
          var adapterDef = {
            find: function(col, criteria, cb) { return cb(null, []); },
            create: function(col, values, cb) { return cb(null, values); }
          };

          new Model({ adapters: { foo: adapterDef }}, function(err, coll) {
            if(err) done(err);
            person = coll;
            done();
          });
        });

        it('should run beforeValidation and mutate values on create', function(done) {
          person.findOrCreate({ name: 'test' }, { name: 'test' }, function(err, user) {
            assert(!err);
            assert(user.name === 'test updated');
            done();
          });
        });
      });

      describe('with a record', function() {

        before(function(done) {
          var adapterDef = {
            find: function(col, criteria, cb) { return cb(null, [criteria.where]); },
            create: function(col, values, cb) { return cb(null, values); }
          };

          new Model({ adapters: { foo: adapterDef }}, function(err, coll) {
            if(err) done(err);
            person = coll;
            done();
          });
        });

        it('should not run beforeValidation and mutate values on find', function(done) {
          person.findOrCreate({ name: 'test' }, { name: 'test' }, function(err, user) {
            assert(!err);
            assert(user.name === 'test');
            done();
          });
        });
      });


    });
  });


  /**
   * Test Callbacks can be defined as arrays and run in order.
   */

  describe('array of functions', function() {
    var person,
        Model;

    before(function(done) {

      var waterline = new Waterline();
      var Model = Waterline.Collection.extend({
        identity: 'user',
        adapter: 'foo',
        attributes: {
          name: 'string'
        },

        beforeValidation: [
          // Function 1
          function(values, cb) {
            values.name = values.name + ' fn1';
            cb();
          },

          // Function 1
          function(values, cb) {
            values.name = values.name + ' fn2';
            cb();
          }
        ]
      });

      waterline.loadCollection(Model);

      // Fixture Adapter Def
      var adapterDef = {
        find: function(col, criteria, cb) { return cb(null, null); },
        create: function(col, values, cb) { return cb(null, values); }
      };

      waterline.initialize({ adapters: { foo: adapterDef }}, function(err, colls) {
        if(err) done(err);
        person = colls.user;
        done();
      });
    });

    describe('without a record', function() {

      it('should run the functions in order on create', function(done) {
        person.findOrCreate({ name: 'test' }, { name: 'test' }, function(err, user) {
          assert(!err);
          assert(user.name === 'test fn1 fn2');
          done();
        });
      });
    });

    describe('without a record', function() {

      it('should not run any of the functions on find', function(done) {
        person.findOrCreate({ name: 'test' }, { name: 'test' }, function(err, user) {
          assert(!err);
          assert(user.name === 'test');
          done();
        });
      });
    });

  });

});
