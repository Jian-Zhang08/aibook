import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { existsSync } from 'fs';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import { readFile } from 'fs/promises';

/**
 * Directory where uploaded books are stored
 */
const UPLOADS_DIR = join(process.cwd(), 'uploads');

/**
 * API endpoint for extracting text content from uploaded PDF
 */
module.exports = async (req: any, res: any) => {
  try {
    const { filename } = req.body;

    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    const filePath = join(UPLOADS_DIR, filename);

    if (!existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Read the PDF file
    const dataBuffer = await readFile(filePath);

    // Extract text content
    const data = await pdf(dataBuffer);

    // Return the extracted content
    return res.status(200).json({
      success: true,
      content: data.text,
      numPages: data.numpages,
      info: data.info
    });

  } catch (error) {
    console.error('Error extracting book data:', error);
    return res.status(500).json({ error: 'Failed to extract book data' });
  }
};