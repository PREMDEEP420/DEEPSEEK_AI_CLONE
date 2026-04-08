import multer from "multer";
import pdfParse from "pdf-parse";
import fs from "fs";

const upload = multer({ dest: "uploads/" });

export const uploadFile = [
  upload.single("file"),
  async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      let text = "";
      if (file.mimetype === "application/pdf") {
        const dataBuffer = fs.readFileSync(file.path);
        const data = await pdfParse(dataBuffer);
        text = data.text;
      } else if (file.mimetype.startsWith("image/")) {
        // For images, placeholder, as OCR would require tesseract
        text = "Image uploaded, but OCR not implemented yet.";
      } else {
        text = "Unsupported file type.";
      }

      // Clean up file
      fs.unlinkSync(file.path);

      return res.status(200).json({ text });
    } catch (error) {
      console.error("Error processing file:", error);
      return res.status(500).json({ error: "Failed to process file" });
    }
  },
];