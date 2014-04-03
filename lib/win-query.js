var request = require('superagent');

module.exports = winquery;

function winquery(backbone, globalConfig, localConfig)
{
  var self= this;

  //need to make requests, much like win-publish
  //pull in backbone info, we gotta set our logger/emitter up
  var self = this;

  self.winFunction = "query";

  //this is how we talk to win-backbone
  self.backEmit = backbone.getEmitter(self);

  //grab our logger
  self.log = backbone.getLogger(self);

  //only vital stuff goes out for normal logs
  self.log.logLevel = localConfig.logLevel || self.log.normal;

  //we have logger and emitter, set up some of our functions

  if(!globalConfig.server || !globalConfig.port)
    throw new Error("Global configuration requires server location and port")

  self.hostname = globalConfig.server;
  self.port = globalConfig.port;

  var baseWIN = function()
  {
    return self.hostname + ":" + self.port + "/api";
  }

  self.getWIN = function(apiPath, queryObjects, resFunction)
  {
    var base = baseWIN();

    if(typeof queryObjects == "function")
    {
      resFunction = queryObjects;
      queryObjects = {};
    }
    else //make sure to always have at least an empty object
      queryObjects = queryObjects || {};

    var qNotEmpty = false;
    var queryAdditions = "?";
    for(var key in queryObjects){
      if(queryAdditions.length > 1)
        queryAdditions += "&";

      qNotEmpty = true;
      queryAdditions += key + "=" + queryObjects[key];
    } 
    var fullPath = base + apiPath + (qNotEmpty ? queryAdditions : "");

    self.log("Requesting get from: ",fullPath )
    request
      .get(fullPath)
      // .send(data)
      .set('Accept', 'application/json')
      .end(resFunction);
  }

  self.postWIN = function(apiPath, data, resFunction)
  {
    var base = baseWIN();

    var fullPath= base + apiPath;
    self.log("Requesting post to: ",fullPath )

    request
      .post(fullPath)
      .send(data)
      .set('Accept', 'application/json')
      .end(resFunction);
  }

  //what events do we need?
  //none for now, though in the future, we might have a way to communicate with foreign win-backbones as if it was just sending
  //a message within our own backbone -- thereby obfuscating what is done remotely and what is done locally 
  self.requiredEvents = function()
  {
    return [
    ];
  }

  //what events do we respond to?
  self.eventCallbacks = function()
  { 
    return {
      "query:getHomeQuery" : self.getHomeData
    };
  }
  self.getHomeData = function(start, end, finished)
  {
    //simply make a request that fetches the different categories from the server
    var apiPath = '/home/recent';
      
    //send start/end for knowing which part to look through

    self.getWIN(apiPath, {start: start, end: end}, function(err, res)
    {
      self.log("Artifact return: ", err, " res: ", res.error);
      if(err)
      {
        finished(err);
        return;
      }
      else if(res.statusCode == 500 || res.statusCode == 404)
      {
        finished("Server failure: " + JSON.stringify(res.error) + " | message: " + err.message);
        return;
      }

      //otherwise, all good
      finished(undefined, {"recent" : res.body});

    });
  }

  return self;

}

