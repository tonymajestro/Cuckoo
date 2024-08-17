import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as targets from "aws-cdk-lib/aws-route53-targets";
import { CloudFrontToS3 } from '@aws-solutions-constructs/aws-cloudfront-s3';

export interface CuckooStackProps extends cdk.StackProps {
  domainName: string
}

export class CuckooStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CuckooStackProps) {
    super(scope, id, props);

    const hostedZone = route53.HostedZone.fromLookup(this, 'CuckooHostedZone', {
      domainName: props.domainName
    });

    const certificate = new acm.Certificate(this, 'CuckooCertificate', {
      domainName: props.domainName,
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    // Create Cloudfront Distribution and S3 bucket secured with OAC
    const distributionResources = new CloudFrontToS3(this, "CloudFrontToS3", {
      cloudFrontDistributionProps: {
        defaultBehavior: {
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
        domainNames: [props.domainName],
        certificate: certificate,
        priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      }
    });

    // Allow navigation to subdirectories without including index.html paths
    const rewriteIndexFunction = new cloudfront.Function(this, 'RewriteIndexFunction', {
      code: cloudfront.FunctionCode.fromFile({
        filePath: './lib/handler.js',
      }),
      runtime: cloudfront.FunctionRuntime.JS_2_0,
    });
    distributionResources.cloudFrontWebDistribution.addBehavior("/*", new origins.S3Origin(distributionResources.s3Bucket!), {
      functionAssociations: [{
        function: rewriteIndexFunction,
        eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
      }]
    });

    // Deploy static site to S3
    new s3deploy.BucketDeployment(this, 'BucketDeploy', {
      sources: [s3deploy.Source.asset('./dist')],
      destinationBucket: distributionResources.s3Bucket!,
      distribution: distributionResources.cloudFrontWebDistribution,
      distributionPaths: ['/*']
    });

    // Add Route53 alias records to map DNS name to CloudFront distribution
    this.updateHostedZone(distributionResources.cloudFrontWebDistribution, hostedZone);
  }

  updateHostedZone(distribution: cloudfront.Distribution, hostedZone: route53.IHostedZone): void {
    new route53.ARecord(this, 'CloudFrontARecord', {
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution))
    });

    new route53.AaaaRecord(this, 'CloudFrontAaaaRecord', {
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution))
    });
  }
}
