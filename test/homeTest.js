//We must test the ability to generate genotypes, force parents, and create valid offspring according to the schema

var assert = require('assert');
var should = require('should');
var colors = require('colors');
var Q = require('q');

var util = require('util');

var winquery = require('..');
var wMath = require('win-utils').math;
var uuid = require('win-utils').cuid;
var winback = require('win-backbone');

var backbone, generator, backEmit, backLog;
var evoTestEnd;
var count = 0;

var emptyModule = 
{
	winFunction : "test",
	eventCallbacks : function(){ return {}; },
	requiredEvents : function() {
		return [
        "query:getHomeQuery"
			];
	}
};

var sampleSchema = {
    sample : "string"
};

var cIx = 0;

describe('Testing win-query for: ', function(){

    //we need to start up the WIN backend
    before(function(done){

    	//do this up front yo
    	backbone = new winback();


    	var sampleJSON = 
		{
			"win-query" : winquery,
			"test" : emptyModule
		};
		var configurations = 
		{
			"global" : {
                "server" : "http://localhost",
                "port" : "3000"
			},
			"win-query" : {
				logLevel : backbone.testing
			}
		};

    	backbone.logLevel = backbone.testing;

    	backEmit = backbone.getEmitter(emptyModule);
    	backLog = backbone.getLogger({winFunction:"mocha"});
    	backLog.logLevel = backbone.testing;

    	//loading modules is synchronous
    	backbone.loadModules(sampleJSON, configurations);

    	var registeredEvents = backbone.registeredEvents();
    	var requiredEvents = backbone.moduleRequirements();
    		
    	backLog('Backbone Events registered: ', registeredEvents);
    	backLog('Required: ', requiredEvents);

    	backbone.initializeModules(function()
    	{
    		backLog("Finished Module Init");
 			done();
    	});

    });

    it('get home artifacts',function(done){

        var artType = "picArtifact";

        backEmit("query:getHomeQuery", 0, 10, function(err, artifacts){

            if(err)
                done(new Error(err));
            else{

                backLog("Arts returned: ", artifacts);
                backLog("Successfully querired!");
                done();
            }

        })

    });

});







