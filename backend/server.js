import express from "express";
import cors from "cors";
import multer from "multer";

import { PDFParse } from "pdf-parse";

import { extractInformation } from "./extractor.js";
import { compareDocuments } from "./matcher.js";
import { extractTextWithOCR } from "./ocr.js";

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
});

function hasUsefulText(text) {
  if (!text) {
    return false;
  }

  const cleanedText = text
    .replace(/\s+/g, " ")
    .trim();

  return cleanedText.length >= 30;
}

async function extractPdfText(buffer) {
  const parser = new PDFParse({
    data: buffer,
  });

  try {
    const result = await parser.getText();

    return result.text || "";
  } finally {
    await parser.destroy();
  }
}

async function getDocumentText(file) {
  const pdfText = await extractPdfText(
    file.buffer
  );

  if (hasUsefulText(pdfText)) {
    return {
      text: pdfText,
      usedOCR: false,
    };
  }

  console.log(
    `OCR required for: ${file.originalname}`
  );

  const ocrText = await extractTextWithOCR(
    file.buffer
  );

  return {
    text: ocrText,
    usedOCR: true,
  };
}

app.get("/", (req, res) => {
  res.json({
    message: "PrepMate-AI backend is running",
  });
});

app.post(
  "/verify",

  upload.fields([
    { name: "tenth", maxCount: 1 },
    { name: "twelfth", maxCount: 1 },
    { name: "graduation", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),

  async (req, res) => {
    try {
      const files = req.files;

      if (
        !files?.tenth ||
        !files?.twelfth ||
        !files?.graduation ||
        !files?.resume
      ) {
        return res.status(400).json({
          message:
            "All four documents are required",
        });
      }

      const tenth = await getDocumentText(
        files.tenth[0]
      );

      const twelfth = await getDocumentText(
        files.twelfth[0]
      );

      const graduation =
        await getDocumentText(
          files.graduation[0]
        );

      const resume = await getDocumentText(
        files.resume[0]
      );

      const tenthInfo =
        extractInformation(
          tenth.text,
          "10th"
        );

      const twelfthInfo =
        extractInformation(
          twelfth.text,
          "12th"
        );

      const graduationInfo =
        extractInformation(
          graduation.text,
          "graduation"
        );

      const resumeInfo =
        extractInformation(
          resume.text,
          "resume"
        );

      const verification =
        compareDocuments(
          tenthInfo,
          twelfthInfo,
          graduationInfo,
          resumeInfo
        );

      res.json({
        message:
          "Documents verified successfully",

        ocrUsed: {
          tenth: tenth.usedOCR,
          twelfth: twelfth.usedOCR,
          graduation: graduation.usedOCR,
          resume: resume.usedOCR,
        },

        verification,

        extractedData: {
          tenth: tenthInfo,
          twelfth: twelfthInfo,
          graduation: graduationInfo,
          resume: resumeInfo,
        },
      });
    } catch (error) {
      console.error(
        "Document processing error:",
        error
      );

      res.status(500).json({
        message:
          "Error processing documents",
        error: error.message,
      });
    }
  }
);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});