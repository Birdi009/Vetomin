#!/usr/bin/env node
import 'source-map-support/register.js';
import * as cdk from 'aws-cdk-lib';
import { QuietCompassStack } from '../lib/quiet-compass-stack.js';

const app=new cdk.App();
new QuietCompassStack(app,'QuietCompassStack',{
  env:{
    account:process.env.CDK_DEFAULT_ACCOUNT,
    region:process.env.CDK_DEFAULT_REGION || 'us-east-1'
  }
});