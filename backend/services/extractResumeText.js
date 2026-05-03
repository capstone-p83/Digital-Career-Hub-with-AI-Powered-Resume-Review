const mammoth = require("mammoth");

const MIME_PDF = "application/pdf";
const MIME_DOCX =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const MIME_DOC = "application/msword";

async function extractPdfText(buffer) {
  const { PDFParse } = require("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return String(result.text || "").trim();
  } finally {
    await parser.destroy();
  }
}
async function extractResumeText(buffer, mimetype) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    const err = new Error("Invalid file buffer");
    err.statusCode = 400;
    throw err;
  }

  if (mimetype === MIME_PDF) {
    return extractPdfText(buffer);
  }

  if (mimetype === MIME_DOCX) {
    const { value } = await mammoth.extractRawText({ buffer });
    return String(value || "").trim();
  }

  if (mimetype === MIME_DOC) {
    const err = new Error(
      "Legacy Word (.doc) is not supported. Please upload a PDF or .docx file."
    );
    err.statusCode = 400;
    throw err;
  }

  const err = new Error("Unsupported file type");
  err.statusCode = 400;
  throw err;
}

module.exports = { extractResumeText };
