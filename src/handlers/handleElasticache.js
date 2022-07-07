const _ = require("lodash");
const { baseSlackMessage } = require("../../config.js");

handleElasticache = (event, context) => {
  let { message, eventname, nodename, subject, color, region, timestamp } =
    Elasticache();

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
          { title: "Event", value: eventname.split(":")[1], short: true },
          { title: "Node", value: nodename, short: true },
          {
            title: "Link to cache node",
            value:
              "https://console.aws.amazon.com/elasticache/home?region=" +
              region +
              "#cache-nodes:id=" +
              nodename +
              ";nodes",
            short: false,
          },
        ],
        ts: timestamp,
      },
    ],
  };
  return _.merge(slackMessage, baseSlackMessage);

  function Elasticache() {
    let subject = "AWS ElastiCache Notification";
    let message = JSON.parse(event.Records[0].Sns.Message);
    let timestamp = new Date(event.Records[0].Sns.Timestamp).getTime() / 1000;
    let region = event.Records[0].EventSubscriptionArn.split(":")[3];
    let eventname, nodename;
    let color = "good";
    return { message, eventname, nodename, subject, color, region, timestamp };
  }
};
exports.handleElasticache = handleElasticache;
