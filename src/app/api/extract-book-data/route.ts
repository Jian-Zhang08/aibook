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
export async function POST(request: NextRequest) {
  try {
    const { filename } = await request.json();

    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      );
    }

    const filePath = join(UPLOADS_DIR, filename);

    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Read the PDF file
    const dataBuffer = await readFile(filePath);

    // Extract text content
    const data = await pdf(dataBuffer);

    // Return the extracted content
    return NextResponse.json({
      success: true,
      content: data.text,
      numPages: data.numpages,
      info: data.info
    });

  } catch (error) {
    console.error('Error extracting book data:', error);
    return NextResponse.json(
      { error: 'Failed to extract book data' },
      { status: 500 }
    );
  }
}