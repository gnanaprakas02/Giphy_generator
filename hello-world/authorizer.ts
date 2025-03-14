import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from "aws-lambda";
import * as jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || ""; // Store in AWS Secrets Manager or SSM

export const handler = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  try {
    if (!event.authorizationToken) {
      throw new Error("No token provided");
    }

    const token = event.authorizationToken.replace("Bearer ", "");
    const decoded = jwt.verify(token, SECRET_KEY, { algorithms: ["RS256"] });

    return {
      principalId: (decoded as any).sub,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Allow",
            Resource: event.methodArn,
          },
        ],
      },
    };
  } catch (error) {
    return {
      principalId: "unauthorized",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Deny",
            Resource: event.methodArn,
          },
        ],
      },
    };
  }
};
