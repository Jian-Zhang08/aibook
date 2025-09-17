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
module.exports = async (req: any, res: any) => {
  try {
    const { bookId } = req.query;

    if (!bookId) {
      return res.status(400).json({ error: 'Book ID is required' });
    }

    // First, check if it's a built-in book
    const builtinBook = builtinBooks.find(book => book.id === bookId);
    if (builtinBook) {
      // Try to find the PDF file for the built-in book
      const possiblePaths = [
        join(SAMPLES_DIR, `${bookId}.pdf`),
        join(SAMPLES_DIR, builtinBook.filename),
      ];

      let bookPath: string | null = null;
      for (const path of possiblePaths) {
        if (existsSync(path)) {
          bookPath = path;
          break;
        }
      }

      if (bookPath) {
        try {
          const fileBuffer = await readFile(bookPath);
          const pdfData = await pdf(fileBuffer);

          const bookData: ProcessedBook = {
            id: bookId,
            title: builtinBook.title,
            author: builtinBook.author,
            totalPages: pdfData.numpages,
            isProcessed: true,
            uploadDate: new Date(),
            content: pdfData.text.substring(0, 1000) + '...'
          };

          return res.status(200).json(bookData);
        } catch (error) {
          console.error('Error reading built-in book:', error);
        }
      }
    }

    // Try to find uploaded book
    const possiblePaths = [
      join(UPLOADS_DIR, `${bookId}.pdf`),
      join(SAMPLES_DIR, `${bookId}.pdf`),
    ];

    let bookPath: string | null = null;
    for (const path of possiblePaths) {
      if (existsSync(path)) {
        bookPath = path;
        break;
      }
    }

    if (!bookPath) {
      return res.status(404).json({ error: 'Book not found' });
    }

    try {
      const fileBuffer = await readFile(bookPath);
      const pdfData = await pdf(fileBuffer);

      const bookData: ProcessedBook = {
        id: bookId,
        title: pdfData.info.Title || bookId,
        author: pdfData.info.Author || 'Unknown Author',
        totalPages: pdfData.numpages,
        isProcessed: true,
        uploadDate: new Date(),
        content: pdfData.text.substring(0, 1000) + '...'
      };

      return res.status(200).json(bookData);
    } catch (error) {
      console.error('Error reading book:', error);
      return res.status(500).json({ error: 'Failed to read book' });
    }

  } catch (error) {
    console.error('Error retrieving book:', error);
    return res.status(500).json({ error: 'Failed to retrieve book' });
  }
};