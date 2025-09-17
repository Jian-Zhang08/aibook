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
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: 'PDF file not found' },
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
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (error) {
    console.error('Error serving PDF:', error);
    return NextResponse.json(
      { error: 'Failed to serve PDF file' },
      { status: 500 }
    );
  }
}