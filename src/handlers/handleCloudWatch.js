const _ = require('lodash');
const { baseSlackMessage } = require("../../index");

function handleCloudWatch(event, context) {
  let timestamp = (new Date(event.Records[0].Sns.Timestamp)).getTime() / 1000;
  let message = JSON.parse(event.Records[0].Sns.Message);
  let region = event.Records[0].EventSubscriptionArn.split(":")[3];
  let subject = "AWS CloudWatch Notification";
  let alarmName = message.AlarmName;
  let metricName = message.Trigger.MetricName;
  let oldState = message.OldStateValue;
  let newState = message.NewStateValue;
  let alarmDescription = message.AlarmDescription;
  let alarmReason = message.NewStateReason;
  let trigger = message.Trigger;
  let color = "warning";

  message.NewStateValue === "ALARM" ? color = "danger" : message.NewStateValue === "OK" ? color = "good" : null;
  
  var slackMessage = {
    text: "*" + subject + "*",
    attachments: [
      {
        "color": color,
        "fields": [
          { "title": "Alarm Name", "value": alarmName, "short": true },
          { "title": "Alarm Description", "value": alarmDescription, "short": false },
          {
            "title": "Trigger",
            "value": trigger.Statistic + " "
              + metricName + " "
              + trigger.ComparisonOperator + " "
              + trigger.Threshold + " for "
              + trigger.EvaluationPeriods + " period(s) of "
              + trigger.Period + " seconds.",
            "short": false
          },
          { "title": "Old State", "value": oldState, "short": true },
          { "title": "Current State", "value": newState, "short": true },
          {
            "title": "Link to Alarm",
            "value": "https://console.aws.amazon.com/cloudwatch/home?region=" + region + "#alarm:alarmFilter=ANY;name=" + encodeURIComponent(alarmName),
            "short": false
          }
        ],
        "ts": timestamp
      }
    ]
  };
  return _.merge(slackMessage, baseSlackMessage);
}
exports.handleCloudWatch = handleCloudWatch;
