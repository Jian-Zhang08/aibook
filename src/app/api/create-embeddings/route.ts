import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

/**
 * Directory where uploaded books are stored
 */
const UPLOADS_DIR = join(process.cwd(), 'uploads');

/**
 * API endpoint for creating embeddings from book content
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

    // Read the extracted content
    const content = await readFile(filePath, 'utf-8');

    // Split text into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await textSplitter.splitText(content);

    // Initialize OpenAI embeddings
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // Create embeddings for each chunk
    const embeddingPromises = chunks.map(chunk => embeddings.embedQuery(chunk));
    await Promise.all(embeddingPromises);

    // Store the embeddings (in a real implementation, you would save these to a database)
    // For now, we'll just return success
    return NextResponse.json({
      success: true,
      numChunks: chunks.length,
      message: 'Embeddings created successfully'
    });

  } catch (error) {
    console.error('Error creating embeddings:', error);
    return NextResponse.json(
      { error: 'Failed to create embeddings' },
      { status: 500 }
    );
  }
}