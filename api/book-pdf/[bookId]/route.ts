import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * Directories where book PDFs are stored
 */
const UPLOADS_DIR = join(process.cwd(), 'uploads');
const SAMPLE_DIR = join(process.cwd(), 'public', 'samples');

/**
 * API endpoint for retrieving book PDF files
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { bookId } = await params;

    if (!bookId) {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      );
    }

    // Try multiple locations for the PDF file
    const possiblePaths = [
      join(UPLOADS_DIR, `${bookId}.pdf`),
      join(SAMPLE_DIR, `${bookId}.pdf`),
      join(SAMPLE_DIR, 'the-great-gatsby.pdf'), // Fallback for demo
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
      console.error(`PDF not found for book ID: ${bookId}. Checked paths:`, possiblePaths);
      return NextResponse.json(
        { error: 'Book PDF not found' },
        { status: 404 }
      );
    }

    console.log(`Serving PDF from: ${pdfPath}`);

    // Read the file
    const fileBuffer = await readFile(pdfPath);

    // Return the PDF file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${bookId}.pdf"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (error) {
    console.error('Error retrieving book PDF:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve book PDF' },
      { status: 500 }
    );
  }
}