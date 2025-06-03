import path from "node:path";

import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import {
  aws_cloudwatch as cloudwatch,
  aws_cloudwatch_actions as cloudwatchActions,
  aws_iam as iam,
  aws_sns as sns,
  aws_sns_subscriptions as snsSubscriptions,
  aws_sqs as sqs,
} from "aws-cdk-lib";

import merge from "lodash.merge";

import { NodejsLambda } from "../nodejs-lambda/nodejs-lambda";

interface MonitoredQueueProps extends Omit<sqs.QueueProps, "deadLetterQueue"> {
  alarmProps?: cloudwatch.AlarmProps;
  topicProps?: sns.TopicProps;
  notificationProviders?: NotificationProvider[];
}

const defaultMonitoredQueueProps = {
  enforceSSL: true,
  notificationProviders: [] as NotificationProvider[],
} satisfies MonitoredQueueProps;

const defaultAlarmProps = {
  threshold: 1,
  evaluationPeriods: 1,
  treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
  comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
} satisfies Omit<cloudwatch.AlarmProps, "metric">;

const defaultMetricOptions = {
  statistic: "sum",
  period: cdk.Duration.minutes(1),
} satisfies cloudwatch.MetricOptions;

const defaultTopicProps = {
  enforceSSL: true,
} satisfies sns.TopicProps;

export class MonitoredQueue extends sqs.Queue {
  constructor(scope: Construct, id: string, props?: MonitoredQueueProps) {
    const mergedProps = merge({}, defaultMonitoredQueueProps, props);

    super(scope, id, mergedProps);

    const { alarmProps, topicProps, notificationProviders } = mergedProps;

    const mergedAlarmProps = merge(
      {},
      defaultAlarmProps,
      {
        alarmName: `${this.queueName}-alarm`,
        metric: this.metricApproximateNumberOfMessagesVisible(defaultMetricOptions),
      },
      alarmProps,
    );
    const alarm = new cloudwatch.Alarm(this, "Alarm", mergedAlarmProps);

    const mergedTopicProps = merge(
      {},
      defaultTopicProps,
      {
        topicName: `${this.queueName}-alarm-topic`,
      },
      topicProps,
    );
    const topic = new sns.Topic(this, "Topic", mergedTopicProps);

    topic.addToResourcePolicy(
      new iam.PolicyStatement({
        principals: [new iam.ServicePrincipal("cloudwatch.amazonaws.com")],
        actions: ["sns:Publish"],
        resources: [topic.topicArn],
      }),
    );

    const snsAction = new cloudwatchActions.SnsAction(topic);

    alarm.addAlarmAction(snsAction);
    alarm.addOkAction(snsAction);

    for (const provider of notificationProviders) {
      provider.integrate(this, topic);
    }
  }
}

// Example implementation of a webhook notification provider
export class WebhookProvider implements NotificationProvider {
  private readonly webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  integrate(scope: Construct, topic: sns.ITopic): void {
    const srcPath = path.join(__dirname, "path", "to", "directory");
    const lambda = new NodejsLambda(scope, "LambdaWithLogGroup", {
      description: cdk.FileSystem.fingerprint(srcPath),
      entry: path.join(srcPath, "lambda-function.ts"),
      environment: {
        WEBHOOK_URL: this.webhookUrl,
      },
    });

    topic.addSubscription(new snsSubscriptions.LambdaSubscription(lambda));
  }
}

interface NotificationProvider {
  integrate(scope: Construct, topic: sns.ITopic): void;
}
