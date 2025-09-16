import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { Chroma } from '@langchain/community/vectorstores/chroma';
import { OpenAIEmbeddings } from '@langchain/openai';

/**
 * Directory where uploaded books are stored
 */
const UPLOADS_DIR = join(process.cwd(), 'uploads');

/**
 * API endpoint for finalizing book processing
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

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    const filePath = join(UPLOADS_DIR, filename);

    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Initialize embeddings
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // Verify vector store exists and is accessible
    const collectionName = filename.replace('.pdf', '');
    const vectorStore = await Chroma.fromExistingCollection(
      embeddings,
      { collectionName }
    );

    // Perform a test query to verify the vector store is working
    const testResults = await vectorStore.similaritySearch(
      "What is this book about?",
      1
    );

    if (!testResults || testResults.length === 0) {
      throw new Error('Vector store verification failed');
    }

    // Generate a unique ID for the book
    const bookId = Buffer.from(filename).toString('base64').replace(/[^a-zA-Z0-9]/g, '');

    // Return success with book information
    return NextResponse.json({
      success: true,
      id: bookId,
      title: filename.replace('.pdf', ''),
      isProcessed: true,
      uploadDate: new Date().toISOString(),
      message: 'Book processing completed successfully'
    });

  } catch (error) {
    console.error('Error finalizing book:', error);
    return NextResponse.json(
      { error: 'Failed to finalize book processing' },
      { status: 500 }
    );
  }
} 