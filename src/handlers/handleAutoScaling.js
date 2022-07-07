const _ = require("lodash");
const { baseSlackMessage } = require("../../config.js");

handleAutoScaling = (event, context) => {
  let { message, eventname, nodename, subject, color, timestamp } =
    AutoScaling();

  for (key in message) {
    eventname = key;
    nodename = message[key];
    break;
  }

  var slackMessage = {
    text: "*" + subject + "*",
    attachments: [
      {
        color: color,
        fields: [
          {
            title: "Message",
            value: event.Records[0].Sns.Subject,
            short: false,
          },
          { title: "Description", value: message.Description, short: false },
          { title: "Event", value: message.Event, short: false },
          { title: "Cause", value: message.Cause, short: false },
        ],
        ts: timestamp,
      },
    ],
  };
  return _.merge(slackMessage, baseSlackMessage);

  function AutoScaling() {
    let subject = "AWS AutoScaling Notification";
    let message = JSON.parse(event.Records[0].Sns.Message);
    let timestamp = new Date(event.Records[0].Sns.Timestamp).getTime() / 1000;
    let eventname, nodename;
    let color = "good";
    return { message, eventname, nodename, subject, color, timestamp };
  }
};
exports.handleAutoScaling = handleAutoScaling;
