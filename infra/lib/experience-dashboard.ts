import {Construct} from 'constructs';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
export class ExperienceDashboard extends Construct {
 constructor(scope:Construct,id:string,logGroupName:string){
  super(scope,id);
  const dashboard=new cloudwatch.Dashboard(this,'Dashboard');
  dashboard.addWidgets(new cloudwatch.TextWidget({width:24,height:3,markdown:'# Quiet Compass experience signals\nOpt-in observations only. Percentiles are descriptive, not proof of representative performance. Inspect sample counts and device split; do not declare field validation from an empty dashboard.'}));
  dashboard.addWidgets(new cloudwatch.LogQueryWidget({title:'Core Web Vitals: p75 and sample count by device',logGroupNames:[logGroupName],width:24,height:8,queryLines:['fields @timestamp, type, name, detail.metric, detail.device, detail.value','filter type = "qc_analytics" and name = "web_vital"','stats pct(detail.value, 75) as p75, count(*) as samples by detail.metric, detail.device']}));
  dashboard.addWidgets(new cloudwatch.LogQueryWidget({title:'Interaction and delivery confirmation events',logGroupNames:[logGroupName],width:24,height:6,queryLines:['fields @timestamp, type, name','filter type = "qc_analytics" and name != "web_vital"','stats count(*) as events by name']}));
 }
}
