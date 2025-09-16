import OpenAI from 'openai';
import { AIResponse } from '@/components/AnswerDisplay';

// Initialize the OpenAI client with environment variable
// Note: You need to set OPENAI_API_KEY in your environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate an AI response to a question about a book
 */
export async function generateBookResponse(
  question: string, 
  bookContent: string
): Promise<AIResponse> {
  try {
    // First, determine the appropriate response type based on the question
    const responseType = await determineResponseType(question);
    
    // Extract the most relevant passages from the book for this question
    const relevantContext = extractRelevantContext(question, bookContent);
    
    // Generate a structured response based on the determined type
    const structuredResponse = await generateStructuredContent(
      question, 
      relevantContext, 
      responseType
    );
    
    return structuredResponse;
  } catch (error) {
    console.error('Error generating book response:', error);
    // Fallback to a simple text response
    return {
      responseType: 'text',
      text: `I encountered an error when analyzing the book content. Please try a different question or check your API configuration.`
    };
  }
}

/**
 * Determine the most appropriate response type based on question analysis
 */
async function determineResponseType(question: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo", // Use the appropriate model
      messages: [
        {
          role: "system",
          content: `You are an AI that analyzes questions about books and determines the most appropriate response format.
          
Possible response types:
- text: General information or explanations
- character_profile: Questions about characters, personalities, or relationships
- timeline: Questions about events, sequences, or character journeys
- theme_analysis: Questions about themes, symbols, or motifs
- quote_analysis: Questions about specific quotes or passages
- comparison: Questions comparing characters, themes, or other elements

Respond with ONLY ONE of these types based on the question, with no explanation.`
        },
        {
          role: "user",
          content: question
        }
      ],
      max_tokens: 50
    });
    
    // Extract the response type
    const responseType = completion.choices[0].message.content?.trim().toLowerCase() || 'text';
    
    // Validate that it's one of our expected types
    const validTypes = ['text', 'character_profile', 'timeline', 'theme_analysis', 'quote_analysis', 'comparison'];
    return validTypes.includes(responseType) ? responseType : 'text';
    
  } catch (error) {
    console.error('Error determining response type:', error);
    return 'text'; // Default to text response on error
  }
}

/**
 * Extract relevant context from the book based on the question
 */
function extractRelevantContext(question: string, bookContent: string): string {
  // This is a simplified implementation for demonstration
  // In a real app, you would use embeddings and vector search
  
  // Basic approach: break the book into chunks and find the most relevant ones
  const chunks = splitIntoChunks(bookContent, 1000);
  
  // For this demo, just use keywords to find relevant passages
  const keywords = question
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(' ')
    .filter(word => word.length > 3 && !['what', 'when', 'where', 'which', 'about', 'there'].includes(word));
  
  // Score chunks based on keyword matches
  const scoredChunks = chunks.map(chunk => {
    const lowerChunk = chunk.toLowerCase();
    let score = 0;
    
    for (const word of keywords) {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      const matches = (lowerChunk.match(regex) || []).length;
      score += matches;
    }
    
    return { chunk, score };
  });
  
  // Sort by score and take top chunks
  const topChunks = scoredChunks
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.chunk);
  
  return topChunks.join('\n\n');
}

/**
 * Split text into chunks of approximately the specified size
 */
function splitIntoChunks(text: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split('\n\n');
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > chunkSize) {
      chunks.push(currentChunk);
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}

/**
 * Generate structured content based on response type
 */
async function generateStructuredContent(
  question: string, 
  context: string, 
  responseType: string
): Promise<AIResponse> {
  try {
    const promptMap: Record<string, string> = {
      text: `You are a helpful literary assistant. Answer the following question about a book using the provided context. Format your response as plain text with paragraphs as needed.`,
      
      character_profile: `You are a literary character analyst. Create a character profile based on the question and context provided. Format your response as a JSON object with these fields:
- name: The character's name
- description: A detailed description of the character
- traits: An array of 3-5 key character traits
- connections: An array of objects with 'name' and 'relationship' fields
- color: Suggest a color theme (purple, blue, green, amber, or rose)`,
      
      timeline: `You are a literary events analyst. Create a timeline of events based on the question and context provided. Format your response as a JSON array of timeline events, each with:
- id: A unique identifier
- year: The year or time period (if known)
- title: A short title for the event
- description: A description of what happened
- color: Suggest a color theme (blue, purple, green, amber, or rose)`,
      
      theme_analysis: `You are a literary theme analyst. Analyze the themes or symbols based on the question and context provided. Format your response as a JSON array of theme objects, each with:
- title: The name of the theme or symbol
- description: A detailed analysis of the theme or symbol
- examples: An array of objects with 'text' (the example from the book) and 'reference' (where it appears)
- type: Either 'theme', 'symbol', or 'motif'`,
      
      quote_analysis: `You are a literary quote analyst. Analyze the quote or find a relevant quote based on the question and context provided. Format your response as a JSON object with:
- text: The exact quote from the book
- speaker: Who said it (if known)
- chapter: Where it appears (if known)
- analysis: Your analysis of the quote's meaning and significance
- themes: An array of themes related to the quote`,
      
      comparison: `You are a literary comparison expert. Compare the elements mentioned in the question using the provided context. Format your response as a JSON object with:
- element1: Object with 'name' and 'description'
- element2: Object with 'name' and 'description'
- similarities: Array of similarities between the elements
- differences: Array of differences between the elements`
    };
    
    const prompt = promptMap[responseType] || promptMap.text;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo", // Use the appropriate model
      messages: [
        {
          role: "system",
          content: prompt
        },
        {
          role: "user",
          content: `Question: ${question}\n\nBook context: ${context}`
        }
      ],
      response_format: { type: responseType === 'text' ? 'text' : 'json_object' },
      max_tokens: 1000
    });
    
    const responseContent = completion.choices[0].message.content || '';
    
    // For text responses, just return the text
    if (responseType === 'text') {
      return {
        responseType: 'text',
        text: responseContent
      };
    }
    
    // For structured responses, parse the JSON
    try {
      const parsedContent = JSON.parse(responseContent);
      
      // Build the appropriate response structure based on type
      switch (responseType) {
        case 'character_profile':
          return {
            responseType: 'character_profile',
            character: parsedContent
          };
          
        case 'timeline':
          return {
            responseType: 'timeline',
            timeline: parsedContent
          };
          
        case 'theme_analysis':
          return {
            responseType: 'theme_analysis',
            themes: Array.isArray(parsedContent) ? parsedContent : [parsedContent]
          };
          
        case 'quote_analysis':
          return {
            responseType: 'quote_analysis',
            quote: parsedContent
          };
          
        case 'comparison':
          return {
            responseType: 'comparison',
            comparison: parsedContent
          };
          
        default:
          return {
            responseType: 'text',
            text: responseContent
          };
      }
    } catch (error) {
      console.error('Error parsing structured content:', error);
      return {
        responseType: 'text',
        text: responseContent
      };
    }
    
  } catch (error) {
    console.error('Error generating structured content:', error);
    return {
      responseType: 'text',
      text: 'I encountered an error when generating a structured response. Here is what I found: ' + context.substring(0, 300)
    };
  }
} 