declare module 'pdf-parse/lib/pdf-parse.js' {
  interface PDFInfo {
    PDFFormatVersion?: string;
    IsAcroFormPresent?: boolean;
    IsXFAPresent?: boolean;
    IsCollectionPresent?: boolean;
    Title?: string;
    Author?: string;
    Subject?: string;
    Keywords?: string;
    Creator?: string;
    Producer?: string;
    CreationDate?: string;
    ModDate?: string;
    Trapped?: string;
    [key: string]: any;
  }

  interface PDFData {
    numpages: number;
    numrender: number;
    info: PDFInfo;
    metadata: any;
    text: string;
    version: string;
  }

  function pdf(
    dataBuffer: Buffer, 
    options?: {
      pagerender?: (pageData: any) => string;
      max?: number;
      version?: string;
    }
  ): Promise<PDFData>;

  export = pdf;
} 