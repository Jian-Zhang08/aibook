import { NextRequest, NextResponse } from 'next/server';
import { setupBuiltinBook } from '@/utils/bookSetup';
import builtinBooks from '@/data/builtinBooks';

/**
 * API endpoint to prepare a built-in book for use
 * Copies the book from the built-in directory to the samples directory if needed
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { bookId: string } }
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
    
    // Look up the book in our list of built-in books
    const book = builtinBooks.find(b => b.id === bookId);
    if (!book) {
      return NextResponse.json(
        { error: 'Book not found in built-in books' },
        { status: 404 }
      );
    }
    
    // Setup the book (copy to samples if needed)
    const success = await setupBuiltinBook(bookId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to prepare book' },
        { status: 500 }
      );
    }
    
    // Return book info
    return NextResponse.json({
      id: book.id,
      title: book.title,
      author: book.author,
      message: 'Book prepared successfully'
    });
    
  } catch (error) {
    console.error('Error preparing built-in book:', error);
    return NextResponse.json(
      { error: 'Failed to prepare built-in book' },
      { status: 500 }
    );
  }
} 