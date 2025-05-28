import { XMLParser } from 'fast-xml-parser';

function safeFindArray(obj: any, key: string): any[] {
  // Recursively search the object for a key that holds an array or object(s) with that key.
  // We avoid deep recursion by iteration using a queue.

  const queue = [obj];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || typeof current !== 'object') continue;

    if (current[key]) {
      // Found key — return as array (convert single object to array)
      if (Array.isArray(current[key])) return current[key];
      return [current[key]];
    }

    // Add children to queue for scanning
    for (const k in current) {
      if (current.hasOwnProperty(k) && typeof current[k] === 'object') {
        queue.push(current[k]);
      }
    }
  }

  return [];
}

self.onmessage = (e: MessageEvent<File>) => {
  const file = e.data;
  const reader = new FileReader();

  reader.onload = () => {
    try {
      const xmlText = reader.result as string;

      // Parse entire XML safely, disabling value parsing to reduce complexity
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        parseTagValue: false,
        trimValues: true,
      });

      const jsonObj = parser.parse(xmlText);

      // Extract arrays safely from anywhere inside parsed JSON
      const activityArray = safeFindArray(jsonObj, 'Activity');
      const resourceAssignmentArray = safeFindArray(jsonObj, 'ResourceAssignment');
      const projectArray = safeFindArray(jsonObj, 'Project');
      const resourceArray = safeFindArray(jsonObj, 'Resource');
      const wbsArray = safeFindArray(jsonObj, 'WBS');

      self.postMessage({
        status: 'success',
        data: {
          activityArray,
          resourceAssignmentArray,
          projectArray,
          resourceArray,
          wbsArray,
        },
      });
    } catch (err: any) {
      self.postMessage({ status: 'error', message: err.message || 'Error parsing XML' });
    }
  };

  reader.onerror = () => {
    self.postMessage({ status: 'error', message: 'File reading failed' });
  };

  reader.readAsText(file);
};
