import { createCanvas } from "@napi-rs/canvas";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { createWorker } from "tesseract.js";

async function pdfToImage(pdfBuffer) {
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(pdfBuffer),
  });

  const pdf = await loadingTask.promise;

  try {
    const page = await pdf.getPage(1);

    const scale = 2;

    const viewport = page.getViewport({
      scale,
    });

    const width = Math.ceil(viewport.width);
    const height = Math.ceil(viewport.height);

    const canvas = createCanvas(
      width,
      height
    );

    const context = canvas.getContext("2d");

    context.fillStyle = "#ffffff";

    context.fillRect(
      0,
      0,
      width,
      height
    );

    await page.render({
      canvasContext: context,
      viewport,
    }).promise;

    return canvas.toBuffer("image/png");
  } finally {
    await pdf.destroy();
  }
}

async function extractTextWithOCR(pdfBuffer) {
  console.log("Starting OCR...");

  const imageBuffer =
    await pdfToImage(pdfBuffer);

  console.log(
    "PDF converted to image."
  );

  const worker =
    await createWorker("eng");

  try {
    console.log(
      "Running Tesseract OCR..."
    );

    const result =
      await worker.recognize(
        imageBuffer
      );

    console.log(
      "OCR completed."
    );

    // Show exactly what OCR extracted
    console.log(
      "========== OCR TEXT =========="
    );

    console.log(
      result.data.text
    );

    console.log(
      "========== END OCR TEXT =========="
    );

    return result.data.text || "";
  } finally {
    await worker.terminate();
  }
}

export {
  extractTextWithOCR,
};