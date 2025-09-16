import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import { AIResponse } from '@/components/AnswerDisplay';
import { generateBookResponse } from '@/utils/openai';

/**
 * Directory where uploaded books are stored
 */
const UPLOADS_DIR = join(process.cwd(), 'uploads');

/**
 * Checks if OpenAI integration is available
 */
function isOpenAIAvailable(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

/**
 * API endpoint for processing book-related queries
 */
export async function POST(request: NextRequest) {
  try {
    const { question, bookId, book } = await request.json();
    
    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }
    
    // Handle the Great Gatsby case separately with pre-configured responses
    if (bookId === 'the-great-gatsby' || book === 'the-great-gatsby') {
      // This would redirect to the existing implementation
      return NextResponse.json({
        responseType: 'text',
        text: "This query would be handled by the specialized Great Gatsby page."
      }, { status: 200 });
    }
    
    if (!bookId) {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      );
    }
    
    // Check if the PDF file exists
    const pdfPath = join(UPLOADS_DIR, `${bookId}.pdf`);
    
    if (!existsSync(pdfPath)) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }
    
    // Read the file
    const fileBuffer = await readFile(pdfPath);
    
    // Extract text from the PDF
    try {
      const pdfData = await pdf(fileBuffer);
      const bookText = pdfData.text;
      
      // If OpenAI API is available, use it for advanced AI responses
      if (isOpenAIAvailable()) {
        console.log('Using OpenAI integration for book query');
        try {
          const aiResponse = await generateBookResponse(question, bookText);
          return NextResponse.json(aiResponse, { status: 200 });
        } catch (error) {
          console.error('Error using OpenAI integration:', error);
          // Fall back to basic processing if OpenAI fails
        }
      }
      
      // If OpenAI is not available or fails, use the basic implementation
      console.log('Using basic implementation for book query');
      
      // For demonstration purposes, analyze the question to determine response type
      const lowerQuestion = question.toLowerCase();
      let response: AIResponse;
      
      // Generate a simple response based on question type
      if (lowerQuestion.includes('character') || lowerQuestion.includes('who is') || lowerQuestion.includes('about') && (lowerQuestion.includes('person') || lowerQuestion.includes('people'))) {
        // Character question
        response = generateCharacterResponse(lowerQuestion, bookText);
      } else if (lowerQuestion.includes('theme') || lowerQuestion.includes('symbol') || lowerQuestion.includes('motif')) {
        // Theme question
        response = generateThemeResponse(lowerQuestion, bookText);
      } else if (lowerQuestion.includes('quote') || lowerQuestion.includes('passage') || lowerQuestion.includes('line')) {
        // Quote question
        response = generateQuoteResponse(lowerQuestion, bookText);
      } else if ((lowerQuestion.includes('compare') || lowerQuestion.includes('contrast') || lowerQuestion.includes('difference')) && lowerQuestion.includes(' and ')) {
        // Comparison question
        response = generateComparisonResponse(lowerQuestion, bookText);
      } else if (lowerQuestion.includes('timeline') || lowerQuestion.includes('sequence') || lowerQuestion.includes('events') || lowerQuestion.includes('what happens')) {
        // Timeline question
        response = generateTimelineResponse(lowerQuestion, bookText);
      } else {
        // Default text response
        const relevantPassage = findRelevantPassage(lowerQuestion, bookText);
        response = {
          responseType: 'text',
          text: `Based on the book content, I found this relevant information: "${relevantPassage}"\n\nIn a complete implementation, this would use an AI model to provide a comprehensive answer to your question: "${question}"`
        };
      }
      
      return NextResponse.json(response, { status: 200 });
      
    } catch (error) {
      console.error('Error processing book query:', error);
      return NextResponse.json(
        { error: 'Failed to process query' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error processing book query:', error);
    return NextResponse.json(
      { error: 'Failed to process query' },
      { status: 500 }
    );
  }
}

/**
 * Find a relevant passage in the book text related to the question
 */
function findRelevantPassage(question: string, bookText: string): string {
  // In a real implementation, this would use embeddings and vector search
  // For demo, just do a simple keyword match
  const words = question
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(' ')
    .filter(word => word.length > 3 && !['what', 'when', 'where', 'which', 'about', 'there'].includes(word));
  
  // Split book into paragraphs
  const paragraphs = bookText.split('\n\n');
  
  // Score paragraphs based on keyword matches
  let bestParagraph = '';
  let highestScore = 0;
  
  for (const paragraph of paragraphs) {
    if (paragraph.length < 30) continue; // Skip short paragraphs
    
    let score = 0;
    const lowerParagraph = paragraph.toLowerCase();
    
    for (const word of words) {
      if (lowerParagraph.includes(word)) {
        score += 1;
      }
    }
    
    if (score > highestScore) {
      highestScore = score;
      bestParagraph = paragraph;
    }
  }
  
  // If no good match, return the first substantial paragraph
  if (highestScore === 0) {
    bestParagraph = paragraphs.find(p => p.length > 100) || paragraphs[0];
  }
  
  // Truncate to a reasonable length
  return bestParagraph.length > 300 
    ? bestParagraph.substring(0, 300) + '...' 
    : bestParagraph;
}

/**
 * Generate a character-focused response
 */
function generateCharacterResponse(question: string, bookText: string): AIResponse {
  // Extract potential character names (this would be much more sophisticated in a real implementation)
  const potentialNames = extractPotentialCharacterNames(bookText);
  const mainCharacter = potentialNames[0] || 'the protagonist';
  
  return {
    responseType: 'character_profile',
    character: {
      name: mainCharacter,
      description: `This character appears frequently in the book. In a real implementation, an AI would analyze the text to provide a detailed character description and analysis.`,
      traits: ['Trait 1', 'Trait 2', 'Trait 3'],
      connections: [
        { name: potentialNames[1] || 'Character 2', relationship: 'Related character' },
        { name: potentialNames[2] || 'Character 3', relationship: 'Related character' }
      ]
    }
  };
}

/**
 * Generate a theme-focused response
 */
function generateThemeResponse(question: string, bookText: string): AIResponse {
  return {
    responseType: 'theme_analysis',
    themes: [
      {
        title: 'Major Theme',
        description: 'This theme appears to be significant in the book based on keyword analysis. In a real implementation, an AI would identify and analyze the actual themes.',
        examples: [
          { text: findRelevantPassage(question, bookText), reference: 'From the book' }
        ],
        type: 'theme' as const
      }
    ]
  };
}

/**
 * Generate a quote analysis response
 */
function generateQuoteResponse(question: string, bookText: string): AIResponse {
  const passage = findRelevantPassage(question, bookText);
  
  return {
    responseType: 'quote_analysis',
    quote: {
      text: passage,
      speaker: 'Character or Narrator',
      chapter: 'Unknown Chapter',
      analysis: 'This passage appears relevant to your query. In a real implementation, an AI would provide detailed analysis of this quote, its context, and significance.',
      themes: ['Theme 1', 'Theme 2']
    }
  };
}

/**
 * Generate a comparison response
 */
function generateComparisonResponse(question: string, bookText: string): AIResponse {
  // Try to identify what's being compared
  const comparisonMatch = question.match(/compare\s+([a-z\s]+)\s+and\s+([a-z\s]+)/i);
  const element1 = comparisonMatch ? comparisonMatch[1].trim() : 'Element 1';
  const element2 = comparisonMatch ? comparisonMatch[2].trim() : 'Element 2';
  
  return {
    responseType: 'comparison',
    comparison: {
      element1: {
        name: element1,
        description: `In a real implementation, an AI would analyze ${element1} based on the book content.`
      },
      element2: {
        name: element2,
        description: `In a real implementation, an AI would analyze ${element2} based on the book content.`
      },
      similarities: [
        'In a real implementation, AI would identify actual similarities',
        'Based on content analysis'
      ],
      differences: [
        'In a real implementation, AI would identify actual differences',
        'Based on content analysis'
      ]
    }
  };
}

/**
 * Generate a timeline response
 */
function generateTimelineResponse(question: string, bookText: string): AIResponse {
  // Ensure we return a properly formatted timeline array
  const timelineEvents = [
    {
      id: '1',
      year: '1',
      title: 'Beginning',
      description: 'In a real implementation, AI would extract actual chronological events from the book.',
      color: 'blue'
    },
    {
      id: '2',
      year: '2',
      title: 'Middle Event',
      description: findRelevantPassage(question, bookText),
      color: 'purple'
    },
    {
      id: '3',
      year: '3',
      title: 'Conclusion',
      description: 'In a real implementation, AI would identify the resolution or ending events.',
      color: 'amber'
    }
  ];
  
  return {
    responseType: 'timeline',
    timeline: timelineEvents
  };
}

/**
 * Extract potential character names from book text
 * This is a very simplified approach - a real implementation would be much more sophisticated
 */
function extractPotentialCharacterNames(bookText: string): string[] {
  // Simple approach: look for capitalized words that aren't at the start of sentences
  const words = bookText.split(/\s+/);
  const potentialNames = new Set<string>();
  
  for (let i = 1; i < words.length; i++) {
    const word = words[i].replace(/[^\w]/g, '');
    // If word starts with capital letter and isn't at start of sentence
    if (word.length > 1 && 
        word[0] === word[0].toUpperCase() && 
        word[0] !== word[0].toLowerCase() &&
        !words[i-1].endsWith('.')) {
      potentialNames.add(word);
    }
  }
  
  // Count occurrences of each potential name
  const nameCounts = Array.from(potentialNames).map(name => {
    const regex = new RegExp(`\\b${name}\\b`, 'g');
    const count = (bookText.match(regex) || []).length;
    return { name, count };
  });
  
  // Sort by frequency and return top 5
  return nameCounts
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map(item => item.name);
} 