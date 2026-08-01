#!/usr/bin/env node
import { runRenovateHostedCheck } from './lib/renovate-hosted.js';

runRenovateHostedCheck({
  repository: process.env.GITHUB_REPOSITORY,
  token: process.env.GITHUB_TOKEN,
})
  .then((result) => console.log(JSON.stringify(result, null, 2)))
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
