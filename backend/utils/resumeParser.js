const mammoth = require("mammoth");

async function parsePdfBuffer(buffer) {
  const workerModule = await import("pdf-parse/worker");
  const pdfModule = await import("pdf-parse");

  const CanvasFactory = workerModule.CanvasFactory;
  const PDFParse = pdfModule.PDFParse || pdfModule.default?.PDFParse;

  if (!PDFParse) {
    throw new Error("PDFParse class was not found in pdf-parse.");
  }

  const parser = new PDFParse({
    data: new Uint8Array(buffer),
    CanvasFactory,
  });

  try {
    const result = await parser.getText();
    return result?.text || "";
  } finally {
    await parser.destroy();
  }
}

async function parseResumeFile(file) {
  if (!file || !file.buffer) {
    throw new Error("No file buffer provided.");
  }

  if (file.mimetype === "application/pdf") {
    const text = await parsePdfBuffer(file.buffer);
    return cleanExtractedText(text);
  }

  if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({
      buffer: file.buffer,
    });

    return cleanExtractedText(result.value || "");
  }

  throw new Error("Unsupported file type. Please upload PDF or DOCX.");
}

function cleanExtractedText(text) {
  return String(text || "")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

module.exports = {
  parseResumeFile,
};