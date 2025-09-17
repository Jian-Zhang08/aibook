import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * Directories where PDF files are stored
 */
const UPLOADS_DIR = join(process.cwd(), 'uploads');
const SAMPLES_DIR = join(process.cwd(), 'public', 'samples');

/**
 * API endpoint for directly serving PDF files
 */
module.exports = async (req: any, res: any) => {
  try {
    const { filename } = req.query;

    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    // Try multiple locations for the PDF file
    const possiblePaths = [
      join(UPLOADS_DIR, filename),
      join(SAMPLES_DIR, filename),
    ];

    // Find the first path that exists
    let pdfPath: string | null = null;
    for (const path of possiblePaths) {
      if (existsSync(path)) {
        pdfPath = path;
        break;
      }
    }

    // If no PDF was found, return 404
    if (!pdfPath) {
      console.error(`PDF not found: ${filename}. Checked paths:`, possiblePaths);
      return res.status(404).json({ error: 'PDF file not found' });
    }

    console.log(`Serving PDF from: ${pdfPath}`);

    // Read the file
    const fileBuffer = await readFile(pdfPath);

    // Return the PDF file with appropriate headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(fileBuffer);

  } catch (error) {
    console.error('Error serving PDF:', error);
    return res.status(500).json({ error: 'Failed to serve PDF file' });
  }
};