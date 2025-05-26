import { XMLParser } from 'fast-xml-parser';

self.onmessage = async function (e: MessageEvent<File>) {
  const file = e.data;

  const reader = new FileReader();

  reader.onload = function () {
    try {
      const xmlText = reader.result as string;

      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        allowBooleanAttributes: true,
        trimValues: true,
      });

      const jsonObj = parser.parse(xmlText);

      function findFirstWBSNode(obj: any): any | null {
        if (typeof obj !== 'object' || obj === null) return null;
        for (const key in obj) {
          if (key === 'WBS') {
            return obj[key];
          }
          if (typeof obj[key] === 'object') {
            const found = findFirstWBSNode(obj[key]);
            if (found) return found;
          }
        }
        return null;
      }

      const firstWBSNode = findFirstWBSNode(jsonObj);

      let wbsArray: any[] = [];

      if (firstWBSNode) {
        if (Array.isArray(firstWBSNode)) {
          wbsArray = firstWBSNode;
        } else {
          wbsArray = [firstWBSNode];
        }
      } else {
        self.postMessage({ status: 'error', message: 'No <WBS> elements found in XML.' });
        return;
      }

      const cleanedData = wbsArray.map((item) => {
        const cleanedItem: Record<string, string> = {};
        for (const key in item) {
          if (typeof item[key] === 'object' && item[key] !== null) {
            cleanedItem[key] = JSON.stringify(item[key]);
          } else {
            cleanedItem[key] = item[key] ?? '';
          }
        }
        return cleanedItem;
      });

      self.postMessage({ status: 'success', data: cleanedData });
    } catch (error: any) {
      self.postMessage({ status: 'error', message: error.message || 'Parsing error' });
    }
  };

  reader.onerror = function () {
    self.postMessage({ status: 'error', message: 'File reading failed' });
  };

  reader.readAsText(file);
};
