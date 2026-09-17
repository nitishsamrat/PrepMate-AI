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

/*
  Resume and documents are kept only in memory.
  They are not permanently saved on the server.
*/

const upload = multer({
  storage: multer.memoryStorage(),
});

/*
  Check whether normal PDF text extraction
  produced useful text.
*/

function hasUsefulText(text) {
  if (!text) {
    return false;
  }

  const cleanedText = text
    .replace(/\s+/g, " ")
    .trim();

  return cleanedText.length >= 30;
}

/*
  Extract text directly from a PDF.
*/

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

/*
  First try normal PDF text extraction.
  If the PDF does not contain useful text,
  use OCR instead.
*/

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

/*
  Test route
*/

app.get("/", (req, res) => {
  res.json({
    message: "PrepMate-AI backend is running",
  });
});

/*
  DOCUMENT VERIFICATION

  Required files:

  1. graduation
  2. resume
*/

app.post(
  "/verify",

  upload.fields([
    {
      name: "graduation",
      maxCount: 1,
    },
    {
      name: "resume",
      maxCount: 1,
    },
  ]),

  async (req, res) => {
    try {
      const files = req.files;

      /*
        Make sure both required files
        have been uploaded.
      */

      if (
        !files?.graduation ||
        !files?.resume
      ) {
        return res.status(400).json({
          message:
            "Graduation document and resume are required",
        });
      }

      /*
        Extract text from graduation document.
      */

      const graduation =
        await getDocumentText(
          files.graduation[0]
        );

      /*
        Extract text from resume.
      */

      const resume =
        await getDocumentText(
          files.resume[0]
        );

      /*
        Extract only the required information.
      */

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

      /*
        Compare graduation document
        information with resume.
      */

      const verification =
        compareDocuments(
          graduationInfo,
          resumeInfo
        );

      /*
        Send only the required processed
        information to the frontend.

        Raw OCR text is NOT returned.
      */

      res.json({
        message:
          "Documents verified successfully",

        ocrUsed: {
          graduation:
            graduation.usedOCR,

          resume:
            resume.usedOCR,
        },

        verification,

        extractedData: {
          graduation:
            graduationInfo,

          resume:
            resumeInfo,
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