import { IoTCustomAuthorizerEvent, IoTCustomAuthorizerResult } from "aws-lambda";
import { z } from "zod";

const envSchema = z.object({
  AWS_REGION: z.string(),
  AWS_ACCOUNT_ID: z.string(),
});

const env = envSchema.parse(process.env);

const AWS_REGION = env.AWS_REGION;
const AWS_ACCOUNT_ID = env.AWS_ACCOUNT_ID;

export const handler = async (_: IoTCustomAuthorizerEvent) => {
  const response: IoTCustomAuthorizerResult = {
    isAuthenticated: true,
    principalId: "Unauthenticated",
    disconnectAfterInSeconds: 3600,
    refreshAfterInSeconds: 3600,
    policyDocuments: [
      {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Action: ["iot:Connect", "iot:Subscribe", "iot:Receive"],
            Resource: [
              `arn:aws:iot:${AWS_REGION}:${AWS_ACCOUNT_ID}:client/*`,
              `arn:aws:iot:${AWS_REGION}:${AWS_ACCOUNT_ID}:topicfilter/realtime/*`,
              `arn:aws:iot:${AWS_REGION}:${AWS_ACCOUNT_ID}:topic/realtime/*`,
            ],
          },
        ],
      },
    ],
  };

  return response;
};
