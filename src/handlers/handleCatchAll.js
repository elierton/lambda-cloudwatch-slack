const _ = require('lodash');
const { baseSlackMessage } = require("../../index");

function handleCatchAll(event, context) {

  var record = event.Records[0];
  var subject = record.Sns.Subject;
  var timestamp = new Date(record.Sns.Timestamp).getTime() / 1000;
  var message = JSON.parse(record.Sns.Message);
  var color = "warning";

  message.NewStateValue === "ALARM" ? color = "danger" : message.NewStateValue === "OK" ? color = "good" : null;

  // Add all of the values from the event message to the Slack message description
  var description = "";
  for (key in message) {

    var renderedMessage = typeof message[key] === 'object'
      ? JSON.stringify(message[key])
      : message[key];

    description = description + "\n" + key + ": " + renderedMessage;
  }

  var slackMessage = {
    text: "*" + subject + "*",
    attachments: [
      {
        "color": color,
        "fields": [
          { "title": "Message", "value": record.Sns.Subject, "short": false },
          { "title": "Description", "value": description, "short": false }
        ],
        "ts": timestamp
      }
    ]
  };

  return _.merge(slackMessage, baseSlackMessage);
}
exports.handleCatchAll = handleCatchAll;
