/**
 * Inplace replacement of env placeholders in config object.
 * @param {object} envMap
 * @param {object} target
 * @param {string} configPath - path of the config file, used for error messages
 * @returns {void}
 */
export function replaceEnvPlaceholders(envMap, target, configPath) {
  /**
   * @param {object} obj
   * @param {string} key
   */
  function updater(obj, key) {
    let val = obj[key];
    if (typeof val !== 'string') {
      return;
    }

    const envInjectionPattern = /\$\{[A-Za-z]\w+\}/g;
    const matches = val.match(envInjectionPattern);
    if (matches == null) {
      return;
    }

    const placeholderValMap = matches.reduce((acc, match) => {
      const placeholder = match;
      const envKey = placeholder.slice(2, -1);
      const envVal = envMap[envKey];
      if (envVal == undefined) {
        console.error(`\x1b[31mMissing environment variable! (${envKey})\x1b[m`);
        console.error(
          `You have specified a placeholder in your config: ${val}, but there is no corresponding value in your environment variables.`
        );
        console.error(`Config in question \x1b[33m${configPath}\x1b[m:`);
        console.error(target);
        process.exit(1);
      }
      return Object.assign(acc, { [placeholder]: envVal });
    }, {});

    obj[key] = val.replaceAll(envInjectionPattern, (p) => placeholderValMap[p]);
  }

  const targetCopy = structuredClone(target);
  deepWalkObjectEntries(targetCopy, updater);
  return targetCopy;
}

/**
 * Deeply walks through object and calls callback for each key-value pair.
 * @param {object} obj
 * @param {(obj: object, placeholder: string) => void} callback
 * @param {Set} visited
 */
function deepWalkObjectEntries(obj, callback, visited = new Set()) {
  for (const key in obj) {
    if (visited.has(obj[key])) {
      continue;
    }
    visited.add(obj[key]);

    const val = obj[key];

    if (typeof val === 'object') {
      deepWalkObjectEntries(obj[key], callback);
    }

    if (typeof val !== 'string') {
      continue;
    }

    callback(obj, key);
  }
}
