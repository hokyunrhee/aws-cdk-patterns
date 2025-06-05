import path from "node:path";

import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import { ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { CfnAuthorizer, CfnDomainConfiguration } from "aws-cdk-lib/aws-iot";

import { NodejsLambda } from "../nodejs-lambda/nodejs-lambda";

export class Realtime extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const authorizerPath = path.join(__dirname, "authorizer.ts");
    const authorizer = new NodejsLambda(this, "Authorizer", {
      entry: authorizerPath,
      description: cdk.FileSystem.fingerprint(authorizerPath),
      environment: {
        AWS_ACCOUNT_ID: cdk.Stack.of(this).account,
      },
    });
    authorizer.grantInvoke(new ServicePrincipal("iot.amazonaws.com"));

    const customAuthorizer = new CfnAuthorizer(this, "CustomAuthorizer", {
      authorizerFunctionArn: authorizer.functionArn,
      status: "ACTIVE",
      signingDisabled: true,
    });

    new CfnDomainConfiguration(this, "DomainConfiguration", {
      authenticationType: "CUSTOM_AUTH",
      applicationProtocol: "MQTT_WSS",
      authorizerConfig: {
        defaultAuthorizerName: customAuthorizer.ref,
        allowAuthorizerOverride: false,
      },
      domainConfigurationStatus: "ENABLED",
    });
  }
}
