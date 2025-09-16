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
module.exports = async (req: any, res: any) => {
  try {
    const { filename } = req.body;

    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key is not configured' });
    }

    const filePath = join(UPLOADS_DIR, filename);

    if (!existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
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
    return res.status(200).json({
      success: true,
      numChunks: chunks.length,
      message: 'Embeddings created successfully'
    });

  } catch (error) {
    console.error('Error creating embeddings:', error);
    return res.status(500).json({ error: 'Failed to create embeddings' });
  }
};