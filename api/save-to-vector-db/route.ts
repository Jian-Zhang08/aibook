import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Chroma } from '@langchain/community/vectorstores/chroma';

/**
 * Directory where uploaded books are stored
 */
const UPLOADS_DIR = join(process.cwd(), 'uploads');

/**
 * API endpoint for saving embeddings to vector database
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

    // Create vector store
    await Chroma.fromTexts(
      chunks,
      chunks.map((_, i) => ({ id: i.toString() })),
      embeddings,
      {
        collectionName: filename.replace('.pdf', ''),
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Embeddings saved to vector database successfully'
    });

  } catch (error) {
    console.error('Error saving to vector database:', error);
    return NextResponse.json(
      { error: 'Failed to save to vector database' },
      { status: 500 }
    );
  }
} 