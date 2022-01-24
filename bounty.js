#!/usr/bin/env node
import setup from './setup'

async function run() {
  setup.run()
}

import { fileURLToPath } from "url";
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run()
}