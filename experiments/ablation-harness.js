#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {parseArgs,readText} from '../scripts/lib/frontier-text.js';
import {inspectRewrite} from '../scripts/verify-rewrite.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourcePath=path.join(root,'src/modules/SKILL_CORE_PATTERNS.md');
const groups={
  content:[1,12],style:[13,18],communication:[19,21],
  fillerAndHedging:[22,30],extended:[31,34],cadenceAndRegister:[35,40],
};
export function parsePatterns(source){
  const matches=[...source.matchAll(/^### Pattern (\d+):\s*(.+)$/gmu)];
  const patterns=matches.map((m,index)=>{
    const start=m.index, next=matches[index+1]?.index??source.length;
    const part=source.slice(start,next).split(/^## (?!#)/mu)[0].trim();
    return {id:Number(m[1]),name:m[2].trim(),content:part};
  });
  const ids=patterns.map(p=>p.id);
  if(patterns.length!==40||new Set(ids).size!==40||ids.some((id,i)=>id!==i+1)){
    throw new Error('Expected each numbered pattern from 1 through 40 exactly once');
  }
  return patterns;
}
export function variants(patterns){
  const make=(id,kind,active)=>({
    id,kind,activePatterns:active.map(p=>p.id),prompt:active.map(p=>p.content).join('\n\n'),
  });
  const out=[make('full','baseline',patterns)];
  for(const p of patterns){
    out.push(make('without-'+p.id,'leave-one-out',patterns.filter(x=>x.id!==p.id)));
    out.push(make('only-'+p.id,'single', [p]));
  }
  for(const [name,[lo,hi]] of Object.entries(groups)){
    out.push(make('without-cluster-'+name,'cluster',patterns.filter(x=>x.id<lo||x.id>hi)));
  }
  return out;
}
function executeProvider(provider,input,prompt,id){
  // Explicitly selected local adapter. No shell, web request, or source echo in reports.
  const script=path.resolve(provider);
  if(!fs.statSync(script).isFile()||!/\.(mjs|js)$/iu.test(script))throw new Error('Provider must be a local Node script');
  const result=spawnSync(process.execPath,[script],{
    cwd:root,input:JSON.stringify({source:input,prompt,id}),
    encoding:'utf8',timeout:120000,maxBuffer:8*1024*1024,env:{...process.env,AUTHENTEXT_ABLATION:'1'},
  });
  if(result.status!==0)throw new Error('Local provider failed for '+id);
  let response=result.stdout.trim();
  try{const parsed=JSON.parse(response);if(typeof parsed.output==='string')response=parsed.output;}catch{}
  if(!response)throw new Error('Empty provider result for '+id);
  return response;
}
export function evaluate({source,provider,original,selected=variants(parsePatterns(source))}){
  const inputs=original ? [original] : [];
  const rows=[];
  for(const run of selected){
    const tokenEstimate=Math.ceil(run.prompt.length/4);
    const row={id:run.id,kind:run.kind,patternIds:run.activePatterns,
      promptTokenEstimate:tokenEstimate,
      verified:false,invariantPreservationRate:null,deltaCV:null,deltaDashRate:null,
      netMarginalLift:null,editorialPreference:null};
    if(provider&&inputs.length){
      const output=executeProvider(provider,inputs[0],run.prompt,run.id);
      const audit=inspectRewrite(inputs[0],output,{mode:'standard'});
      row.verified=true;row.invariantPreservationRate=audit.passed?1:0;
      row.deltaCV=audit.stylometry.deltaCV;
      row.deltaDashRate=audit.stylometry.rewrite.punctuationPer1000.emDash-audit.stylometry.original.punctuationPer1000.emDash;
      row.warnings=audit.warnings.map(x=>x.code);
    }
    rows.push(row);
  }
  // Do not create a fabricated quality score from token counts or punctuation.
  // Human blind-preference ratings and claim entailment are separate inputs.
  return {schemaVersion:'1.0.0',kind:'ablation',dryRun:!provider,patternCount:40,
    variantCount:rows.length,limitations:['No semantic quality claim without independent paired evaluation','Tokenizer estimate is length divided by four, not model tokenisation'],
    rows};
}
function main(){
  try{
    const args=parseArgs(process.argv.slice(2));
    if(!args['dry-run']&&!args.provider)throw new Error('Provide --dry-run or --provider');
    if(args.provider&&!args.input)throw new Error('--provider requires --input');
    const all=variants(parsePatterns(readText(sourcePath)));
    const report=evaluate({source:readText(sourcePath),provider:args.provider,original:args.input?readText(args.input):null,selected:all});
    const out=path.resolve(args.output??'experiments/reports/ablation-schema.json');
    fs.mkdirSync(path.dirname(out),{recursive:true});
    fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
    process.stdout.write(JSON.stringify({path:out,patternCount:report.patternCount,variantCount:report.variantCount,dryRun:report.dryRun})+'\n');
  }catch(e){process.stderr.write('ablation: '+e.message+'\n');process.exitCode=2;}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
