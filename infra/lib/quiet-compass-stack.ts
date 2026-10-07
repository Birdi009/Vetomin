import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { ExperienceDashboard } from './experience-dashboard.js';

export class QuietCompassStack extends cdk.Stack {
 constructor(scope:Construct,id:string,props?:cdk.StackProps){
  super(scope,id,props);
  const domainName=this.node.tryGetContext('domainName') as string|undefined;
  const hostedZoneName=this.node.tryGetContext('hostedZoneName') as string|undefined;
  const contactTo=this.node.tryGetContext('contactTo') as string|undefined;
  const sesFrom=this.node.tryGetContext('sesFrom') as string|undefined;
  if(domainName&&!hostedZoneName)throw new Error('Supply an existing hostedZoneName when configuring a custom domain. Domain ownership is not assumed.');
  const allowedOrigin=domainName?`https://${domainName}`:'https://birdi009.github.io';
  const returnPath=domainName?'/contact/':'/Vetomin/contact/';
  const siteBucket=new s3.Bucket(this,'SiteBucket',{blockPublicAccess:s3.BlockPublicAccess.BLOCK_ALL,enforceSSL:true,versioned:true,encryption:s3.BucketEncryption.S3_MANAGED,removalPolicy:cdk.RemovalPolicy.RETAIN});
  const rewrite=new cloudfront.Function(this,'RewriteIndex',{code:cloudfront.FunctionCode.fromInline(`function handler(event){var r=event.request;var u=r.uri;if(u.endsWith('/'))r.uri=u+'index.html';else if(!u.split('/').pop().includes('.'))r.uri=u+'/index.html';return r;}`)});
  let certificate:acm.ICertificate|undefined;let zone:route53.IHostedZone|undefined;
  if(domainName&&hostedZoneName){zone=route53.HostedZone.fromLookup(this,'Zone',{domainName:hostedZoneName});certificate=new acm.Certificate(this,'Certificate',{domainName,validation:acm.CertificateValidation.fromDns(zone)});}
  const distribution=new cloudfront.Distribution(this,'Distribution',{
   defaultRootObject:'index.html',defaultBehavior:{origin:origins.S3BucketOrigin.withOriginAccessControl(siteBucket),viewerProtocolPolicy:cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,compress:true,functionAssociations:[{function:rewrite,eventType:cloudfront.FunctionEventType.VIEWER_REQUEST}],cachePolicy:cloudfront.CachePolicy.CACHING_OPTIMIZED},domainNames:domainName?[domainName]:undefined,certificate,
   errorResponses:[{httpStatus:403,responseHttpStatus:404,responsePagePath:'/404.html',ttl:cdk.Duration.minutes(5)},{httpStatus:404,responseHttpStatus:404,responsePagePath:'/404.html',ttl:cdk.Duration.minutes(5)}],priceClass:cloudfront.PriceClass.PRICE_CLASS_100
  });
  if(domainName&&zone){new route53.ARecord(this,'AliasA',{zone,recordName:domainName,target:route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution))});new route53.AaaaRecord(this,'AliasAAAA',{zone,recordName:domainName,target:route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution))});}
  const contactFn=new nodejs.NodejsFunction(this,'ContactFunction',{entry:new URL('../lambda/contact.ts',import.meta.url).pathname,runtime:lambda.Runtime.NODEJS_22_X,handler:'handler',timeout:cdk.Duration.seconds(10),memorySize:256,environment:{SES_FROM_EMAIL:sesFrom||'',CONTACT_TO_EMAIL:contactTo||'',ALLOWED_ORIGIN:allowedOrigin,CONTACT_RETURN_URL:allowedOrigin+returnPath},bundling:{minify:true,sourceMap:false}});
  contactFn.addToRolePolicy(new iam.PolicyStatement({actions:['ses:SendEmail'],resources:sesFrom?[this.formatArn({service:'ses',resource:'identity',resourceName:sesFrom})]:['*']}));
  const analyticsFn=new nodejs.NodejsFunction(this,'AnalyticsFunction',{entry:new URL('../lambda/analytics.ts',import.meta.url).pathname,runtime:lambda.Runtime.NODEJS_22_X,handler:'handler',timeout:cdk.Duration.seconds(5),memorySize:128,environment:{ALLOWED_ORIGIN:allowedOrigin},bundling:{minify:true,sourceMap:false}});
  const api=new apigwv2.HttpApi(this,'HttpApi',{corsPreflight:{allowHeaders:['content-type'],allowMethods:[apigwv2.CorsHttpMethod.POST,apigwv2.CorsHttpMethod.OPTIONS],allowOrigins:[allowedOrigin],maxAge:cdk.Duration.days(1)}});
  api.addRoutes({path:'/contact',methods:[apigwv2.HttpMethod.POST],integration:new integrations.HttpLambdaIntegration('ContactIntegration',contactFn)});
  api.addRoutes({path:'/analytics',methods:[apigwv2.HttpMethod.POST],integration:new integrations.HttpLambdaIntegration('AnalyticsIntegration',analyticsFn)});
  const stage=api.defaultStage?.node.defaultChild as apigwv2.CfnStage|undefined;if(stage)stage.defaultRouteSettings={throttlingBurstLimit:8,throttlingRateLimit:4};
  if(this.node.tryGetContext('enableDashboard')===true||this.node.tryGetContext('enableDashboard')==='true')new ExperienceDashboard(this,'ExperienceSignals',analyticsFn.logGroup.logGroupName);
  new cdk.CfnOutput(this,'SiteBucketName',{value:siteBucket.bucketName});new cdk.CfnOutput(this,'DistributionId',{value:distribution.distributionId});new cdk.CfnOutput(this,'DistributionDomain',{value:distribution.distributionDomainName});new cdk.CfnOutput(this,'ContactEndpoint',{value:`${api.apiEndpoint}/contact`});new cdk.CfnOutput(this,'AnalyticsEndpoint',{value:`${api.apiEndpoint}/analytics`});
 }
}
