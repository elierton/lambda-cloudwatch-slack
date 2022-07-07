const _ = require("lodash");
const { baseSlackMessage } = require("../../config.js");

handleCodePipeline = (event, context) => {
  let { message, changeType, color, fields, subject, timestamp } =
    CodePipeline();

  try {
    message = JSON.parse(event.Records[0].Sns.Message);
    detailType = message["detail-type"];

    if (detailType === "CodePipeline Pipeline Execution State Change") {
      changeType = "";
    } else if (detailType === "CodePipeline Stage Execution State Change") {
      changeType = "STAGE " + message.detail.stage;
    } else if (detailType === "CodePipeline Action Execution State Change") {
      changeType = "ACTION";
    }

    if (message.detail.state === "SUCCEEDED") {
      color = "good";
    } else if (message.detail.state === "FAILED") {
      color = "danger";
    }
    header = message.detail.state + ": CodePipeline " + changeType;
    fields.push({ title: "Message", value: header, short: false });
    fields.push({
      title: "Pipeline",
      value: message.detail.pipeline,
      short: true,
    });
    fields.push({ title: "Region", value: message.region, short: true });
    fields.push({
      title: "Status Link",
      value:
        "https://console.aws.amazon.com/codepipeline/home?region=" +
        message.region +
        "#/view/" +
        message.detail.pipeline,
      short: false,
    });
  } catch (e) {
    color = "good";
    message = event.Records[0].Sns.Message;
    header = message.detail.state + ": CodePipeline " + message.detail.pipeline;
    fields.push({ title: "Message", value: header, short: false });
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

  function CodePipeline() {
    let subject = "AWS CodePipeline Notification";
    let timestamp = new Date(event.Records[0].Sns.Timestamp).getTime() / 1000;
    let snsSubject = event.Records[0].Sns.Subject;
    let message;
    let fields = [];
    let color = "warning";
    let changeType = "";
    return { message, changeType, color, fields, subject, timestamp };
  }
};
exports.handleCodePipeline = handleCodePipeline;
