declare module 'sax' {
  export function parser(strict?: boolean, opt?: any): SAXParser;

  export interface SAXParser {
    onopentag: (node: { name: string; attributes: Record<string, string> }) => void;
    ontext: (text: string) => void;
    onclosetag: (tagName: string) => void;
    onerror: (err: Error) => void;
    write: (chunk: string) => SAXParser;
    close: () => void;
  }
}
