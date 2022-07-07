const AWS = require('aws-sdk');
const url = require('url');
const https = require('https');
const config = require('./config');
const { handleElasticBeanstalk } = require("./handleElasticBeanstalk");
const { handleCodeDeploy } = require("./handleCodeDeploy");
const { handleCodePipeline } = require("./handleCodePipeline");
const { handleElasticache } = require("./handleElasticache");
const { handleCloudWatch } = require("./handleCloudWatch");
const { handleAutoScaling } = require("./handleAutoScaling");
const { handleCatchAll } = require("./handleCatchAll");
var hookUrl;

const baseSlackMessage = {};
exports.baseSlackMessage = baseSlackMessage;

var postMessage = function(message, callback) {
  var body = JSON.stringify(message);
  var options = url.parse(hookUrl);
  options.method = 'POST';
  options.headers = {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  };

  var postReq = https.request(options, function(res) {
    var chunks = [];
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      return chunks.push(chunk);
    });
    res.on('end', function() {
      var body = chunks.join('');
      if (callback) {
        callback({
          body: body,
          statusCode: res.statusCode,
          statusMessage: res.statusMessage
        });
      }
    });
    return res;
  });

  postReq.write(body);
  postReq.end();
};

function newFunction() {
  return {};
}

function processEvent(event, context) {
  console.log("sns received:" + JSON.stringify(event, null, 2));
  var slackMessage = null;
  var eventSubscriptionArn = event.Records[0].EventSubscriptionArn;
  var eventSnsSubject = event.Records[0].Sns.Subject || 'no subject';
  var eventSnsMessageRaw = event.Records[0].Sns.Message;
  var eventSnsMessage = null;

  try {
    eventSnsMessage = JSON.parse(eventSnsMessageRaw);
  }
  catch (e) {
  }

  if (eventSubscriptionArn.indexOf(config.services.codepipeline.match_text) > -1 || eventSnsSubject.indexOf(config.services.codepipeline.match_text) > -1 || eventSnsMessageRaw.indexOf(config.services.codepipeline.match_text) > -1) {
    console.log("processing codepipeline notification");
    slackMessage = handleCodePipeline(event, context);
  }
  else if (eventSubscriptionArn.indexOf(config.services.elasticbeanstalk.match_text) > -1 || eventSnsSubject.indexOf(config.services.elasticbeanstalk.match_text) > -1 || eventSnsMessageRaw.indexOf(config.services.elasticbeanstalk.match_text) > -1) {
    console.log("processing elasticbeanstalk notification");
    slackMessage = handleElasticBeanstalk(event, context);
  }
  else if (eventSnsMessage && 'AlarmName' in eventSnsMessage && 'AlarmDescription' in eventSnsMessage) {
    console.log("processing cloudwatch notification");
    slackMessage = handleCloudWatch(event, context);
  }
  else if (eventSubscriptionArn.indexOf(config.services.codedeploy.match_text) > -1 || eventSnsSubject.indexOf(config.services.codedeploy.match_text) > -1 || eventSnsMessageRaw.indexOf(config.services.codedeploy.match_text) > -1) {
    console.log("processing codedeploy notification");
    slackMessage = handleCodeDeploy(event, context);
  }
  else if (eventSubscriptionArn.indexOf(config.services.elasticache.match_text) > -1 || eventSnsSubject.indexOf(config.services.elasticache.match_text) > -1 || eventSnsMessageRaw.indexOf(config.services.elasticache.match_text) > -1) {
    console.log("processing elasticache notification");
    slackMessage = handleElasticache(event, context);
  }
  else if (eventSubscriptionArn.indexOf(config.services.autoscaling.match_text) > -1 || eventSnsSubject.indexOf(config.services.autoscaling.match_text) > -1 || eventSnsMessageRaw.indexOf(config.services.autoscaling.match_text) > -1) {
    console.log("processing autoscaling notification");
    slackMessage = handleAutoScaling(event, context);
  }
  else {
    slackMessage = handleCatchAll(event, context);
  }

  postMessage(slackMessage, function (response) {
    if (response.statusCode < 400) {
      console.info('message posted successfully');
      context.succeed();
    } else if (response.statusCode < 500) {
      console.error("error posting message to slack API: " + response.statusCode + " - " + response.statusMessage);
      // Don't retry because the error is due to a problem with the request
      context.succeed();
    } else {
      // Let Lambda retry
      context.fail("server error when processing message: " + response.statusCode + " - " + response.statusMessage);
    }
  });
}

exports.handler = function(event, context) {
  if (hookUrl) {
    processEvent(event, context);
  } else if (config.unencryptedHookUrl) {
    hookUrl = config.unencryptedHookUrl;
    processEvent(event, context);
  } else if (config.kmsEncryptedHookUrl && config.kmsEncryptedHookUrl !== '<kmsEncryptedHookUrl>') {
    var encryptedBuf = new Buffer(config.kmsEncryptedHookUrl, 'base64');
    var cipherText = { CiphertextBlob: encryptedBuf };
    var kms = new AWS.KMS();

    kms.decrypt(cipherText, function(err, data) {
      if (err) {
        console.log("decrypt error: " + err);
        processEvent(event, context);
      } else {
        hookUrl = "https://" + data.Plaintext.toString('ascii');
        processEvent(event, context);
      }
    });
  } else {
    context.fail('hook url has not been set.');
  }
};
