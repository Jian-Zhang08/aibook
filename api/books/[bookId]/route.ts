import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import { ProcessedBook } from '@/utils/bookProcessor';
import builtinBooks from '@/data/builtinBooks';

/**
 * Directory where uploaded books are stored
 */
const UPLOADS_DIR = join(process.cwd(), 'uploads');
const SAMPLES_DIR = join(process.cwd(), 'public', 'samples');

/**
 * API endpoint for retrieving book data by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    // Ensure params is fully resolved before accessing its properties
    const { bookId } = await Promise.resolve(params);

    if (!bookId) {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      );
    }

    // Check if this is a built-in book
    const builtinBook = builtinBooks.find(b => b.id === bookId);
    if (builtinBook) {
      return NextResponse.json({
        id: builtinBook.id,
        title: builtinBook.title,
        author: builtinBook.author,
        totalPages: 100, // Placeholder
        isProcessed: true,
        uploadDate: new Date()
      });
    }

    // Check if the PDF file exists in multiple locations
    const pdfPaths = [
      join(UPLOADS_DIR, `${bookId}.pdf`),
      join(SAMPLES_DIR, `${bookId}.pdf`),
    ];

    // Find the first path that exists
    let pdfPath = null;
    for (const path of pdfPaths) {
      if (existsSync(path)) {
        pdfPath = path;
        break;
      }
    }

    if (!pdfPath) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    // Read the file
    const fileBuffer = await readFile(pdfPath);

    // Extract basic information from the PDF
    try {
      const pdfData = await pdf(fileBuffer);

      // Get title from PDF metadata or use ID
      const title = pdfData.info.Title || `Book ${bookId}`;
      const author = pdfData.info.Author || 'Unknown Author';

      // Create the book object
      const bookData: ProcessedBook = {
        id: bookId,
        title: title.toString(),
        author: author?.toString() || 'Unknown Author',
        totalPages: pdfData.numpages,
        isProcessed: true,
        uploadDate: new Date(),
        // Only return a preview of the content
        content: pdfData.text.substring(0, 500) + '...'
      };

      return NextResponse.json(bookData, { status: 200 });

    } catch (error) {
      console.error('Error parsing PDF:', error);
      return NextResponse.json(
        { error: 'Failed to process book data' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error retrieving book:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve book' },
      { status: 500 }
    );
  }
} 