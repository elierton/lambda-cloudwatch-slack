#!/bin/bash
NODE_LAMBDA=./node_modules/node-lambda/bin/node-lambda

# $NODE_LAMBDA run -x tests/context.json -j tests/sns-codepipeline-event-pipeline-started.json
# $NODE_LAMBDA run -x tests/context.json -j tests/sns-codepipeline-event-stage-started.json
# $NODE_LAMBDA run -x tests/context.json -j tests/sns-codepipeline-event-stage-succeeded.json
# $NODE_LAMBDA run -x tests/context.json -j tests/sns-codepipeline-event-stage-failed.json
# $NODE_LAMBDA run -x tests/context.json -j tests/sns-cloudwatch-event.json
$NODE_LAMBDA run -x tests/context.json -j tests/sns-event.json
# $NODE_LAMBDA run -x tests/context.json -j tests/sns-elastic-beanstalk-event.json
# $NODE_LAMBDA run -x tests/context.json -j tests/sns-codedeploy-event.json
# $NODE_LAMBDA run -x tests/context.json -j tests/sns-codedeploy-configuration.json
# $NODE_LAMBDA run -x tests/context.json -j tests/sns-elasticache-event.json
# $NODE_LAMBDA run -x tests/context.json -j tests/sns-autoscaling-event.json