import { join } from 'path';
import { existsSync, promises as fs } from 'fs';
import builtinBooks from '@/data/builtinBooks';
import { BUILTINBOOKS_DIR, SAMPLES_DIR } from '@/utils/bookSetup';

/**
 * Setup all built-in books, copying them to the samples directory if needed
 * This can be run as a script on application startup
 */
export async function setupAllBuiltinBooks() {
  try {
    console.log('Setting up built-in books...');
    
    // Create samples directory if it doesn't exist
    if (!existsSync(SAMPLES_DIR)) {
      console.log('Creating samples directory...');
      await fs.mkdir(SAMPLES_DIR, { recursive: true });
    }
    
    // Check if built-in books directory exists
    if (!existsSync(BUILTINBOOKS_DIR)) {
      console.error('Built-in books directory not found at:', BUILTINBOOKS_DIR);
      return false;
    }
    
    let copiedCount = 0;
    
    // Process each built-in book
    for (const book of builtinBooks) {
      // Skip placeholder books
      if (book.isPlaceholder || !book.filename) {
        console.log(`Skipping placeholder book: ${book.title}`);
        continue;
      }

      const samplePath = join(SAMPLES_DIR, `${book.id}.pdf`);
      const sourcePath = join(BUILTINBOOKS_DIR, book.filename);
      
      // Check if source file exists
      if (!existsSync(sourcePath)) {
        console.error(`Source file not found for ${book.title} at: ${sourcePath}`);
        continue;
      }
      
      // Copy the file if it doesn't exist in samples
      if (!existsSync(samplePath)) {
        await fs.copyFile(sourcePath, samplePath);
        copiedCount++;
        console.log(`Copied: ${book.title} (${book.id})`);
      }
    }
    
    console.log(`Setup complete. Copied ${copiedCount} books to samples directory.`);
    return true;
  } catch (error) {
    console.error('Error setting up built-in books:', error);
    return false;
  }
}

// Call the function if this script is executed directly
if (require.main === module) {
  setupAllBuiltinBooks().catch(console.error);
} 