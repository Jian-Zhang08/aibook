import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import { ProcessedBook } from '@/utils/bookProcessor';

// For server components, we don't need to set worker path
// pdfjs-dist will work in Node.js environment without worker
// This approach avoids the "Module not found" error

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
export async function POST(request: NextRequest) {
  try {
    if (!request.body) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Ensure the directories exist
    try {
      await ensureDirectoryExists(UPLOADS_DIR);
      await ensureDirectoryExists(SAMPLES_DIR);
    } catch (error) {
      console.error('Error creating directories:', error);
      return NextResponse.json(
        { error: 'Failed to create storage directories' },
        { status: 500 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are supported' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds the limit (60MB)' },
        { status: 400 }
      );
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
      return NextResponse.json(bookData, { status: 200 });

    } catch (error) {
      console.error('Error extracting PDF content:', error);
      return NextResponse.json(
        { error: 'Failed to process PDF content' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 