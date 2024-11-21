function walkObjectEntries(obj, entries = [], visited = new Set()) {
  // Check if the object has already been visited
  if (visited.has(obj)) {
    return entries;
  }

  // Add the current object to the visited set
  visited.add(obj);

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      entries = entries.concat(walkObjectEntries(value, newKey, visited));
    } else {
      entries.push([newKey, value]);
    }
  }

  // Remove the current object from the visited set after processing
  visited.delete(obj);

  return entries;
}
