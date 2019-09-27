////
//// Some unit testing for package bbop-rest-response.
////

var chai = require('chai');
chai.config.includeStack = true;
var assert = chai.assert;
var response = require('..');

var bbop = require('bbop-core');

var us = require('underscore');

var same = assert.equal;

///
/// Start unit testing.
///

describe('regressions tests', function(){

    it('Smells like a server exception (20140225)', function(){

	var raw = {"message-type":"error",
		   "message":"Exception!",
		   "commentary":"blah"};

	var resp = new response(raw);

	same(resp.okay(), true, 'viable response');
	same(resp.message_type(), 'error', 'm type');
	same(resp.message(), 'Exception!', 'm');
	same(resp.commentary(), 'blah', 'comments');

    });
});

describe('fake data tests', function(){

    it('Real data coming in (20140225)', function(){

	var raw = {"uid":"foo",
		   "intention":"information",
		   "is-reasoned":false,
		   "signal":"rebuild",
		   "message-type":"success",
		   "message":"success",
		   "data":{"id":"gomodel:wb-GO_0043053",
			   "facts":[],
			   "properties":[],
			   "individuals":[]
			  }
		  };
	var resp = new response(raw);

	same(resp.okay(), true, 'viable real response');
	same(resp.message_type(), 'success', 'success type');
	same(resp.message(), 'success', 'success message');
	same(resp.user_id(), 'foo', 'foo user');
	same(resp.intention(), 'information', 'just want info');
	same(resp.reasoner_p(), false, 'reasoner not used');
	same(resp.signal(), 'rebuild', 'but will need to rebuild');
	same(resp.commentary(), null, 'no comments');
	same(bbop.what_is(resp.data()), 'object', 'have some data');
	same(resp.model_id(), 'gomodel:wb-GO_0043053', 'has a model id');
	same(resp.inconsistent_p(), false, 'looks consistent');
	same(resp.facts().length, 0, 'removed facts for test');
	same(resp.facts().length, 0, 'removed facts for test');
	same(resp.properties().length, 0, 'removed properties for test');
	same(resp.individuals().length, 0, 'removed individuals for test');
	same(resp.relations().length, 0, 'no relations requested');
	same(resp.evidence().length, 0, 'no evidence requested');

    });

    it('Real (truncated) data coming in (20150420)', function(){

	var raw = {
	    "packet-id": "1346eb5701b2410",
	    "intention": "query",
	    "is-reasoned": true,
	    "signal": "meta",
	    "message-type": "success",
	    "message": "success: 0",
	    "data": {
		"meta": {
		    "relations":
		    [
			{
			    "id": "BFO:0000050",
			    "label": "part of",
			    "relevant": true
			},
			{
			    "id": "BFO:0000051",
			    "label": "has part",
			    "relevant": false
			}
		    ]
		}
	    }
	};

	var resp = new response(raw);

	same(resp.relations().length, 2, 'two bits of ev');
	same(resp.reasoner_p(), true, 'reasoner used');

    });
});

describe('real data tests', function(){

    it('Real meta data coming in (20150807)', function(){

	var raw = require('./response-meta-2015-08-07.json');
	var resp = new response(raw);

	assert.isAbove(resp.relations().length, 2, 'at least two bits of ev');
	assert.isAbove(us.keys(resp.models_meta()).length, 20,
		       'at least two bits of meta');
	assert.isAbove(us.keys(resp.models_meta_read_only()).length, 20,
		       'at least two bits of meta-ro');
	assert.equal(us.keys(resp.models_meta_read_only()).length,
		     us.keys(resp.models_meta()).length,
		     'meta and meta-ro are the same');

	// Take one of the meta objects and see what's there.
	var mro_01_id = us.keys(resp.models_meta_read_only())[0];
	var mro_01 = resp.models_meta_read_only()[mro_01_id];
	assert.equal(mro_01['modified-p'], false, 'not modified');

    });

    it('Real model data coming in (20150807)', function(){

	var raw = require('./response-gomodel-55ad81df00000001-2015-08-07.json');
	var resp = new response(raw);

	assert.equal(resp.modified_p(), true, 'modified');
	assert.equal(resp.inconsistent_p(), false, 'aight');
	assert.equal(resp.has_undo_p(), false, 'nope 1');
	assert.equal(resp.has_redo_p(), false, 'nope 2');

    });

    it('Real post-add Scratch data (2016-11-01)', function(){

	var raw = require('./response-gomodel-55ad81df00000001-action-2016-11-01.json');
	var resp = new response(raw);

	assert.equal(resp.okay(), true, 'okay resp');
	assert.equal(us.isArray(resp.groups()), true, 'groups!');
	assert.deepEqual(resp.provided_by(), resp.groups(),
			 'groups are groups');
	assert.deepEqual(resp.groups(), ['http://geneontology.org'],
			 'groups are');
	assert.equal(resp.intention(), 'action', 'action!');
	assert.equal(resp.signal(), 'merge', 'merge!');

    });

    // TODO: As this is a little lame:
    // https://github.com/geneontology/minerva/issues/39#issuecomment-257717977
    it('Real store-only model data coming in (2016-11-01)', function(){

	var raw = require('./response-meta-dump-2016-11-01.json');
	var resp = new response(raw);

	assert.equal(resp.okay(), true, 'okay resp');
	assert.equal(resp.groups(), null, 'no groups');
	assert.equal(resp.provided_by(), null, 'no groups 2');
	assert.equal(resp.intention(), 'query', 'intention: '+ resp.intention());
	assert.equal(resp.message(), 'Dumped all models to folder', 'ugh');

    });
});

describe('validation - bad', function(){

    // Check that valid and invalid models work as expected.
    it('Works as expected (2019-09-25)', function(){

	var raw = require('./response-gomodel-5d88482400000052-2019-09-25.json');
	var resp = new response(raw);

	// Make sure we;re still sane after all these years.
	assert.equal(resp.okay(), true, 'okay resp');
	assert.equal(resp.groups(), null, 'no groups');
	assert.equal(resp.intention(), 'query', 'intention: '+ resp.intention());


	assert.equal(resp.valid_p(), false, 'overall invalid');
	assert.equal(resp.valid_owl_p(), true, 'owl valid');
	assert.equal(resp.valid_shex_p(), false, 'shex invalid');

	assert.equal(us.isArray(resp.shex_violations()), true, 'have violations');

	assert.equal(resp.shex_violations().length, 2, 'has 2 violations');

	// Examine the structure of the shex violations returns.
	us.each(resp.shex_violations(), function(v){
	    assert.equal(us.isString(v['node']), true, 'has node id as string');
	    assert.equal(us.isArray(v['explanations']), true, 'has exp');
	});
    });

});

describe('validation - good', function(){

    // Check that valid and invalid models work as expected.
    it('Does not work as expected (2019-09-26)', function(){

	var raw = require('./response-gomodel-R-HSA-159740-2019-09-26.json');
	var resp = new response(raw);

	// Make sure we;re still sane after all these years.
	assert.equal(resp.okay(), true, 'okay resp');
	assert.equal(resp.groups(), null, 'no groups');
	assert.equal(resp.intention(), 'query', 'intention: '+ resp.intention());

	assert.equal(resp.valid_p(), true, 'overall valid');
	assert.equal(resp.valid_owl_p(), true, 'owl valid');
	assert.equal(resp.valid_shex_p(), true, 'shex valid');

	assert.equal(us.isArray(resp.shex_violations()), true, 'have violations');

	assert.equal(resp.shex_violations().length, 0, 'has no violations');
    });

});
