import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import { ProcessedBook } from '@/utils/bookProcessor';

/**
 * Maximum file size for uploads (60MB)
 */
const MAX_FILE_SIZE = 60 * 1024 * 1024;

/**
 * Directories to store uploaded books
 */
const UPLOADS_DIR = join(process.cwd(), 'uploads');
const SAMPLES_DIR = join(process.cwd(), 'public', 'samples');

/**
 * Ensures a directory exists, creating it if needed
 */
async function ensureDirectoryExists(directory: string) {
  if (!existsSync(directory)) {
    try {
      await mkdir(directory, { recursive: true });
    } catch (error) {
      console.error(`Error creating directory ${directory}:`, error);
      throw error;
    }
  }
}

/**
 * API endpoint for uploading and processing book files
 */
module.exports = async (req: any, res: any) => {
  try {
    if (!req.body) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Ensure the directories exist
    try {
      await ensureDirectoryExists(UPLOADS_DIR);
      await ensureDirectoryExists(SAMPLES_DIR);
    } catch (error) {
      console.error('Error creating directories:', error);
      return res.status(500).json({ error: 'Failed to create storage directories' });
    }

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF files are supported' });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return res.status(400).json({ error: 'File size exceeds the limit (60MB)' });
    }

    // Generate a unique ID for the book
    const bookId = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    const fileName = `${bookId}.pdf`;

    // Define file paths
    const uploadPath = join(UPLOADS_DIR, fileName);
    const samplePath = join(SAMPLES_DIR, fileName);

    // Convert the file to a Buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Save the file to both locations
    await writeFile(uploadPath, fileBuffer);
    await writeFile(samplePath, fileBuffer);

    console.log(`PDF saved to: ${uploadPath} and ${samplePath}`);

    // Extract text from the PDF
    try {
      // Extract text and metadata
      const pdfData = await pdf(fileBuffer);

      // Get title from PDF metadata or use filename
      const title = pdfData.info.Title || file.name.replace('.pdf', '');
      const author = pdfData.info.Author || 'Unknown Author';

      // Process and store the book
      // In a real implementation, you would:
      // 1. Extract chapters or sections
      // 2. Generate embeddings
      // 3. Store in a vector database

      // For now, just return basic book data
      const bookData: ProcessedBook = {
        id: bookId,
        title: title.toString(),
        author: author?.toString() || 'Unknown Author',
        totalPages: pdfData.numpages,
        isProcessed: true,
        uploadDate: new Date(),
        content: pdfData.text.substring(0, 1000) + '...' // First 1000 chars for demo
      };

      // Return the processed book data
      return res.status(200).json(bookData);

    } catch (error) {
      console.error('Error extracting PDF content:', error);
      return res.status(500).json({ error: 'Failed to process PDF content' });
    }

  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({ error: 'Failed to upload file' });
  }
};