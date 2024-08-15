#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CuckooStack } from '../lib/stack';

const app = new cdk.App();
new CuckooStack(app, 'CuckooStack', {
  domainName: 'majestrocuckoo.com',
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
});
