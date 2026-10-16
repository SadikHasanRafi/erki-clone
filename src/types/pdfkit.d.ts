// Minimal typings for the parts of pdfkit the insights export uses (the package ships none).
declare module "pdfkit" {
  interface TextOptions {
    width?: number;
    align?: "left" | "center" | "right";
    lineBreak?: boolean;
    ellipsis?: boolean;
    characterSpacing?: number;
  }

  export default class PDFDocument {
    constructor(options?: { size?: string; margin?: number; bufferPages?: boolean; info?: Record<string, string> });
    x: number;
    y: number;
    page: { width: number; height: number; margins: { top: number; bottom: number; left: number; right: number } };
    bufferedPageRange(): { start: number; count: number };
    switchToPage(index: number): this;
    on(event: "data", listener: (chunk: Buffer) => void): this;
    on(event: "end", listener: () => void): this;
    on(event: "error", listener: (err: Error) => void): this;
    font(name: string): this;
    fontSize(size: number): this;
    fillColor(color: string): this;
    strokeColor(color: string): this;
    lineWidth(width: number): this;
    text(text: string, x?: number, y?: number, options?: TextOptions): this;
    text(text: string, options?: TextOptions): this;
    rect(x: number, y: number, w: number, h: number): this;
    roundedRect(x: number, y: number, w: number, h: number, r: number): this;
    moveTo(x: number, y: number): this;
    lineTo(x: number, y: number): this;
    fill(color?: string): this;
    stroke(color?: string): this;
    widthOfString(text: string): number;
    addPage(): this;
    end(): void;
  }
}
