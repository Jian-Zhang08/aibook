import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { existsSync } from 'fs';
import { copyFile, mkdir } from 'fs/promises';
import builtinBooks from '@/data/builtinBooks';

/**
 * Directories for built-in books and samples
 */
const BUILTINBOOKS_DIR = join(process.cwd(), 'builtinBooks');
const SAMPLES_DIR = join(process.cwd(), 'public', 'samples');

/**
 * API endpoint to prepare a built-in book for use
 * Copies the book from the built-in directory to the samples directory if needed
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

    // Find the book in our list
    const book = builtinBooks.find(b => b.id === bookId);
    if (!book) {
      return NextResponse.json(
        { error: 'Book not found in built-in books' },
        { status: 404 }
      );
    }

    // Skip placeholder books
    if (book.isPlaceholder || !book.filename) {
      return NextResponse.json(
        { error: 'Cannot prepare placeholder book' },
        { status: 400 }
      );
    }

    // Check if the book already exists in the samples directory
    const samplePath = join(SAMPLES_DIR, `${bookId}.pdf`);
    const sourcePath = join(BUILTINBOOKS_DIR, book.filename);

    // If the sample doesn't exist, copy it
    if (!existsSync(samplePath) && existsSync(sourcePath)) {
      // Ensure the samples directory exists
      if (!existsSync(SAMPLES_DIR)) {
        await mkdir(SAMPLES_DIR, { recursive: true });
      }

      // Copy the file
      await copyFile(sourcePath, samplePath);
      console.log(`Copied built-in book: ${book.title} to samples directory`);
    }

    return NextResponse.json({
      success: true,
      message: `Book ${book.title} is ready for use`,
      bookId: bookId
    });

  } catch (error) {
    console.error('Error preparing built-in book:', error);
    return NextResponse.json(
      { error: 'Failed to prepare built-in book' },
      { status: 500 }
    );
  }
}