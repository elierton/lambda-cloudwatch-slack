const _ = require("lodash");
const { baseSlackMessage } = require("../../config.js");

handleCodeDeploy = (event, context) => {
  let { message, color, fields, snsSubject, subject, timestamp } = CodeDeploy();

  try {
    message = JSON.parse(event.Records[0].Sns.Message);

    message.status === "SUCCEEDED"
      ? (color = "good")
      : message.status === "FAILED"
      ? (color = "danger")
      : null;

    fields.push({ title: "Message", value: snsSubject, short: false });
    fields.push({
      title: "Deployment Group",
      value: message.deploymentGroupName,
      short: true,
    });
    fields.push({
      title: "Application",
      value: message.applicationName,
      short: true,
    });
    fields.push({
      title: "Status Link",
      value:
        "https://console.aws.amazon.com/codedeploy/home?region=" +
        message.region +
        "#/deployments/" +
        message.deploymentId,
      short: false,
    });
  } catch (e) {
    color = "good";
    message = event.Records[0].Sns.Message;
    fields.push({ title: "Message", value: snsSubject, short: false });
    fields.push({ title: "Detail", value: message, short: false });
  }

  var slackMessage = {
    text: "*" + subject + "*",
    attachments: [
      {
        color: color,
        fields: fields,
        ts: timestamp,
      },
    ],
  };

  return _.merge(slackMessage, baseSlackMessage);

  function CodeDeploy() {
    let subject = "AWS CodeDeploy Notification";
    let timestamp = new Date(event.Records[0].Sns.Timestamp).getTime() / 1000;
    let snsSubject = event.Records[0].Sns.Subject;
    let message;
    let fields = [];
    let color = "warning";
    return { message, color, fields, snsSubject, subject, timestamp };
  }
}
exports.handleCodeDeploy = handleCodeDeploy;
