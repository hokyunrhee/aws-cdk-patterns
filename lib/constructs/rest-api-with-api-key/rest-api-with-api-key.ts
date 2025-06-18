import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import { aws_apigateway as apigateway } from "aws-cdk-lib";

import merge from "lodash.merge";

interface UsagePlanProps extends Omit<apigateway.UsagePlanProps, "apiStages"> {
  removalPolicy?: cdk.RemovalPolicy;
}

interface RestApiWithApiKeyProps extends apigateway.RestApiProps {
  apiKeyProps?: apigateway.ApiKeyOptions;
  usagePlanProps?: UsagePlanProps;
}

const defaultProps = {
  usagePlanProps: {
    removalPolicy: cdk.RemovalPolicy.DESTROY,
  },
} satisfies RestApiWithApiKeyProps;

export class RestApiWithApiKey extends apigateway.RestApi {
  public readonly defaultApiKey: apigateway.IApiKey;

  #usagePlan: apigateway.UsagePlan;

  constructor(scope: Construct, id: string, props?: RestApiWithApiKeyProps) {
    const mergedProps = merge({}, defaultProps, props);
    const { apiKeyProps, usagePlanProps, ...restApiProps } = mergedProps;

    super(scope, id, restApiProps);

    const defaultApiKey = this.addApiKey("DefaultApiKey", apiKeyProps);

    this.#usagePlan = this.addUsagePlan("UsagePlan", usagePlanProps);

    this.#usagePlan.addApiKey(defaultApiKey);
    this.#usagePlan.addApiStage({ stage: this.deploymentStage });
    this.#usagePlan.applyRemovalPolicy(usagePlanProps.removalPolicy);

    this.defaultApiKey = defaultApiKey;
  }

  get usagePlan() {
    return {
      addApiKey: this.#usagePlan.addApiKey,
    };
  }
}
