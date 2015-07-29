////
//// Some unit testing for package bbop-rest-response.
////

var chai = require('chai');
chai.config.includeStack = true;
var assert = chai.assert;
var response = require('..');

var bbop = require('bbop-core');

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

describe('data tests', function(){

    it('Real data coming in (20140225)', function(){

	var raw = {"uid":"foo",
		   "intention":"information",
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
	
    });
});
