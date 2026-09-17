import fs from "fs";
import os from "os";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

async function convertPdfToImage(pdfBuffer) {
  const tempDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), "prepmate-")
  );

  const pdfPath = path.join(tempDir, "document.pdf");
  const outputPrefix = path.join(tempDir, "page");

  try {
    await fs.promises.writeFile(pdfPath, pdfBuffer);

    // Convert first PDF page to PNG
    await execFileAsync("pdftoppm", [
      "-png",
      "-f",
      "1",
      "-singlefile",
      pdfPath,
      outputPrefix,
    ]);

    const imagePath = `${outputPrefix}.png`;

    const imageBuffer = await fs.promises.readFile(imagePath);

    return imageBuffer;
  } finally {
    await fs.promises.rm(tempDir, {
      recursive: true,
      force: true,
    });
  }
}

export {
  convertPdfToImage,
};