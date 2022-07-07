const _ = require("lodash");
const { baseSlackMessage } = require("../../config.js");

handleCatchAll = (event, context) => {
  let { message, color, subject, record, timestamp } = CatchAll();

  message.NewStateValue === "ALARM"
    ? (color = "danger")
    : message.NewStateValue === "OK"
    ? (color = "good")
    : null;

  // Add all of the values from the event message to the Slack message description
  var description = "";
  for (key in message) {
    var renderedMessage =
      typeof message[key] === "object"
        ? JSON.stringify(message[key])
        : message[key];

    description = description + "\n" + key + ": " + renderedMessage;
  }

  var slackMessage = {
    text: "*" + subject + "*",
    attachments: [
      {
        color: color,
        fields: [
          { title: "Message", value: record.Sns.Subject, short: false },
          { title: "Description", value: description, short: false },
        ],
        ts: timestamp,
      },
    ],
  };

  return _.merge(slackMessage, baseSlackMessage);

  function CatchAll() {
    let record = event.Records[0];
    let subject = record.Sns.Subject;
    let timestamp = new Date(record.Sns.Timestamp).getTime() / 1000;
    let message = JSON.parse(record.Sns.Message);
    let color = "warning";
    return { message, color, subject, record, timestamp };
  }
};
exports.handleCatchAll = handleCatchAll;
