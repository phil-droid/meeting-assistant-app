const fs = require("fs");
const path = require("path");

/**
 * Extract plain text from uploaded files.
 * Supports: .txt, .md, .json, .pdf (via pdf-parse), .docx (via mammoth)
 */
async function extractText(filePath, mimeType) {
  const ext = path.extname(filePath).toLowerCase();

  // ── Plain text / markdown / json ──────────────────────────────
  if (
    ext === ".txt" ||
    ext === ".md" ||
    ext === ".json" ||
    mimeType === "text/plain" ||
    mimeType === "application/json"
  ) {
    return fs.readFileSync(filePath, "utf-8");
  }

  // ── PDF ───────────────────────────────────────────────────────
  if (ext === ".pdf" || mimeType === "application/pdf") {
    try {
      const pdfParse = require("pdf-parse");
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      return data.text;
    } catch (err) {
      throw new Error(`PDF extraction failed: ${err.message}. Run: npm install pdf-parse`);
    }
  }

  // ── DOCX ──────────────────────────────────────────────────────
  if (
    ext === ".docx" ||
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    try {
      const mammoth = require("mammoth");
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } catch (err) {
      throw new Error(`DOCX extraction failed: ${err.message}. Run: npm install mammoth`);
    }
  }

  // ── Unsupported ───────────────────────────────────────────────
  throw new Error(`Unsupported file type: ${ext} (${mimeType})`);
}

module.exports = { extractText };
