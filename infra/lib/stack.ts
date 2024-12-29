import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as targets from "aws-cdk-lib/aws-route53-targets";

export interface CuckooStackProps extends cdk.StackProps {
  domainName: string,
  assetDir: string
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

    const bucket = new s3.Bucket(this, "assetsBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      accessControl: s3.BucketAccessControl.PRIVATE,
      enforceSSL: true
    });

    const bucketOrigin = origins.S3BucketOrigin.withOriginAccessControl(bucket);
    const distribution = new cloudfront.Distribution(this, "cuckooDistribution", {
      defaultBehavior: {
        origin: bucketOrigin,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
      },
      domainNames: [props.domainName],
      certificate: certificate,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100
    });

    // Allow navigation to subdirectories without including index.html paths
    const rewriteIndexFunction = new cloudfront.Function(this, 'RewriteIndexFunction', {
      code: cloudfront.FunctionCode.fromFile({
        filePath: './lib/handler.js',
      }),
      runtime: cloudfront.FunctionRuntime.JS_2_0,
    });

    distribution.addBehavior("/*", bucketOrigin, {
      functionAssociations: [{
        function: rewriteIndexFunction,
        eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
      }]
    });

    // Deploy static site to S3
    new s3deploy.BucketDeployment(this, 'BucketDeploy', {
      sources: [s3deploy.Source.asset(props.assetDir)],
      destinationBucket: bucket,
      distribution: distribution,
      distributionPaths: ['/*']
    });

    // Update Route53 to point DNS name to CloudFront distribution
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
