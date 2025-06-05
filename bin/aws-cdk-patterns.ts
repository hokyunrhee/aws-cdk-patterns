#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";

import { AwsCdkPatternsStack } from "../lib/stacks/aws-cdk-patterns-stack";

const app = new cdk.App();
new AwsCdkPatternsStack(app, "AwsCdkPatternsStack");
