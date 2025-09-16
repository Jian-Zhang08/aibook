import { join } from 'path';
import { existsSync, promises as fs } from 'fs';
import builtinBooks from '@/data/builtinBooks';

/**
 * Path to built-in books and samples directories
 */
export const BUILTINBOOKS_DIR = join(process.cwd(), 'builtinBooks');
export const SAMPLES_DIR = join(process.cwd(), 'public', 'samples');

/**
 * Checks if a built-in book exists in the samples directory
 * and copies it if not
 */
export async function setupBuiltinBook(bookId: string): Promise<boolean> {
  try {
    // Find the book in our list
    const book = builtinBooks.find(b => b.id === bookId);
    if (!book) {
      console.error(`Book with ID ${bookId} not found in built-in books`);
      return false;
    }

    // Skip placeholder books
    if (book.isPlaceholder || !book.filename) {
      console.log(`Skipping placeholder book: ${book.title}`);
      return false;
    }

    // Check if the book already exists in the samples directory
    const samplePath = join(SAMPLES_DIR, `${bookId}.pdf`);
    const sourcePath = join(BUILTINBOOKS_DIR, book.filename);

    // If the sample doesn't exist, copy it
    if (!existsSync(samplePath) && existsSync(sourcePath)) {
      // Ensure the samples directory exists
      if (!existsSync(SAMPLES_DIR)) {
        await fs.mkdir(SAMPLES_DIR, { recursive: true });
      }
      
      // Copy the file
      await fs.copyFile(sourcePath, samplePath);
      console.log(`Copied built-in book: ${book.title} to samples directory`);
    }

    return true;
  } catch (error) {
    console.error('Error setting up built-in book:', error);
    return false;
  }
} 