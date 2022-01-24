#!/usr/bin/env node

import bountyfs from './bountyfs.js'
// import dataGetter from './harvestGenerator.js'
const CONFIG_SCHEMA = {
  'serviceName': null,
  'id': null,
  'authorization': null
}

const DATA_SCHEMA = {
  'initReferenceDate': null,
  'initReferenceBalance': null,
  'currReferenceDate': null,
  'currReferenceBalance': null
}

async function run() {
  bountyfs.setup(CONFIG_SCHEMA, DATA_SCHEMA)
  console.log('bountyfs.getConfig() :>> ', bountyfs.getConfig());
  // dataGetter.iterator()
}

import { fileURLToPath } from "url";
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run()
}