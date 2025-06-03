import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import { aws_lambda as lambda, aws_lambda_nodejs as lambdaNodejs, aws_logs as logs } from "aws-cdk-lib";

import merge from "lodash.merge";

interface LambdaWithLogGroupProps extends lambdaNodejs.NodejsFunctionProps {
  logGroupProps?: Omit<logs.LogGroupProps, "logGroupName">;
}

const defaultProps: LambdaWithLogGroupProps = {
  runtime: lambda.Runtime.NODEJS_22_X,
  memorySize: 1024,
  timeout: cdk.Duration.seconds(3),
  architecture: lambda.Architecture.ARM_64,
  logGroupProps: {
    retention: logs.RetentionDays.ONE_DAY,
    removalPolicy: cdk.RemovalPolicy.DESTROY,
  },
};

export class NodejsLambda extends lambdaNodejs.NodejsFunction {
  constructor(scope: Construct, id: string, props: LambdaWithLogGroupProps) {
    const mergedProps = merge({}, defaultProps, props);

    super(scope, id, mergedProps);

    const { logGroupProps } = mergedProps;

    new logs.LogGroup(this, "LogGroup", {
      logGroupName: `/aws/lambda/${this.functionName}`,
      ...logGroupProps,
    });
  }
}
