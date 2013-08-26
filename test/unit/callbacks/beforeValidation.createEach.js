var Waterline = require('../../../lib/waterline'),
    assert = require('assert');

describe('.beforeValidation()', function() {

  describe('basic function', function() {
    var person;

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
      var adapterDef = { create: function(col, values, cb) { return cb(null, values); }};
      waterline.initialize({ adapters: { foo: adapterDef }}, function(err, colls) {
        if(err) done(err);
        person = colls.user;
        done();
      });
    });

    /**
     * CreateEach
     */

    describe('.createEach()', function() {

      it('should run beforeValidation and mutate values', function(done) {
        person.createEach([{ name: 'test' }, { name: 'test2' }], function(err, users) {
          assert(!err);
          assert(users[0].name === 'test updated');
          assert(users[1].name === 'test2 updated');
          done();
        });
      });
    });
  });


  /**
   * Test Callbacks can be defined as arrays and run in order.
   */

  describe('array of functions', function() {
    var person, status;

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

          // Function 2
          function(values, cb) {
            values.name = values.name + ' fn2';
            cb();
          }
        ]
      });

      waterline.loadCollection(Model);

      // Fixture Adapter Def
      var adapterDef = { create: function(col, values, cb) { return cb(null, values); }};
      waterline.initialize({ adapters: { foo: adapterDef }}, function(err, colls) {
        if(err) done(err);
        person = colls.user;
        done();
      });
    });

    it('should run the functions in order', function(done) {
      person.createEach([{ name: 'test' }, { name: 'test2' }], function(err, users) {
        assert(!err);
        assert(users[0].name === 'test fn1 fn2');
        assert(users[1].name === 'test2 fn1 fn2');
        done();
      });
    });
  });

});
