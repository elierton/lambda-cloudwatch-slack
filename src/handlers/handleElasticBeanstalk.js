const _ = require("lodash");
const { baseSlackMessage } = require("../../config.js");

handleElasticBeanstalk = (event, context) => {
  let {
    stateRed,
    stateSevere,
    butWithErrors,
    noPermission,
    failedDeploy,
    failedConfig,
    failedQuota,
    unsuccessfulCommand,
    stateYellow,
    stateDegraded,
    stateInfo,
    removedInstance,
    addingInstance,
    abortedOperation,
    abortedDeployment,
    subject,
    message,
    timestamp,
  } = ElasticBeanstalk();

  var color = "good";

  if (
    stateRed != -1 ||
    stateSevere != -1 ||
    butWithErrors != -1 ||
    noPermission != -1 ||
    failedDeploy != -1 ||
    failedConfig != -1 ||
    failedQuota != -1 ||
    unsuccessfulCommand != -1
  ) {
    color = "danger";
  }
  if (
    stateYellow != -1 ||
    stateDegraded != -1 ||
    stateInfo != -1 ||
    removedInstance != -1 ||
    addingInstance != -1 ||
    abortedOperation != -1 ||
    abortedDeployment != -1
  ) {
    color = "warning";
  }

  var slackMessage = {
    text: "*" + subject + "*",
    attachments: [
      {
        fields: [
          {
            title: "Subject",
            value: event.Records[0].Sns.Subject,
            short: false,
          },
          { title: "Message", value: message, short: false },
        ],
        color: color,
        ts: timestamp,
      },
    ],
  };

  return _.merge(slackMessage, baseSlackMessage);

  function ElasticBeanstalk() {
    let timestamp = new Date(event.Records[0].Sns.Timestamp).getTime() / 1000;
    let subject =
      event.Records[0].Sns.Subject || "AWS Elastic Beanstalk Notification";
    let message = event.Records[0].Sns.Message;
    let stateRed = message.indexOf(" to RED");
    let stateSevere = message.indexOf(" to Severe");
    let butWithErrors = message.indexOf(" but with errors");
    let noPermission = message.indexOf("You do not have permission");
    let failedDeploy = message.indexOf("Failed to deploy application");
    let failedConfig = message.indexOf("Failed to deploy configuration");
    let failedQuota = message.indexOf(
      "Your quota allows for 0 more running instance"
    );
    let unsuccessfulCommand = message.indexOf("Unsuccessful command execution");
    let stateYellow = message.indexOf(" to YELLOW");
    let stateDegraded = message.indexOf(" to Degraded");
    let stateInfo = message.indexOf(" to Info");
    let removedInstance = message.indexOf("Removed instance ");
    let addingInstance = message.indexOf("Adding instance ");
    let abortedOperation = message.indexOf(" aborted operation.");
    let abortedDeployment = message.indexOf(
      "some instances may have deployed the new application version"
    );
    return {
      stateRed,
      stateSevere,
      butWithErrors,
      noPermission,
      failedDeploy,
      failedConfig,
      failedQuota,
      unsuccessfulCommand,
      stateYellow,
      stateDegraded,
      stateInfo,
      removedInstance,
      addingInstance,
      abortedOperation,
      abortedDeployment,
      subject,
      message,
      timestamp,
    };
  }
}
exports.handleElasticBeanstalk = handleElasticBeanstalk;
