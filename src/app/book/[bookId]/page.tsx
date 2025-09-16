'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import BookHeader from '@/components/BookHeader';
import QuestionForm from '@/components/QuestionForm';
import AnswerDisplay, { AIResponse } from '@/components/AnswerDisplay';
import EmbeddedPDFViewer from '@/components/EmbeddedPDFViewer';
import { ProcessedBook } from '@/utils/bookProcessor';
import { TimelineEvent } from '@/components/Timeline';

// Sample data for the Great Gatsby timeline demonstration
const gatsbyTimelineEvents: TimelineEvent[] = [
  {
    id: '1',
    year: '1890',
    title: 'Birth',
    description: 'James Gatz is born to poor farmers in rural North Dakota.',
    color: 'blue'
  },
  {
    id: '2',
    year: '1907',
    title: 'Meets Dan Cody',
    description: 'At age 17, Gatz meets copper magnate Dan Cody while working as a fisherman on Lake Superior. Cody takes him under his wing, and Gatz renames himself Jay Gatsby.',
    color: 'purple'
  },
  {
    id: '3',
    year: '1917',
    title: 'Meets Daisy',
    description: 'While training to be an officer in the army, Gatsby meets and falls in love with Daisy Fay in Louisville. She promises to wait for him while he serves in the war.',
    color: 'rose'
  },
  {
    id: '4',
    year: '1918',
    title: 'Military Service',
    description: 'Gatsby serves with distinction in World War I, reaching the rank of Major and being decorated for valor in battle.',
    color: 'amber'
  },
  {
    id: '5',
    year: '1919',
    title: 'Wealth Amassed',
    description: 'After the war, Gatsby becomes involved in bootlegging and other criminal enterprises to quickly amass wealth to win Daisy back.',
    color: 'green'
  },
  {
    id: '6',
    year: '1922',
    title: 'West Egg Mansion',
    description: 'Gatsby purchases a massive mansion in West Egg, Long Island, directly across the bay from Daisy\'s home, hoping to impress her.',
    color: 'purple'
  },
  {
    id: '7',
    year: '1922',
    title: 'Reunion with Daisy',
    description: 'Through his neighbor Nick Carraway, Gatsby finally reunites with Daisy, now married to Tom Buchanan.',
    color: 'rose'
  },
  {
    id: '8',
    year: '1922',
    title: 'Death',
    description: 'Gatsby is shot and killed in his swimming pool by George Wilson, who mistakenly believes Gatsby killed his wife Myrtle in a car accident.',
    color: 'amber'
  }
];

// Sample data for character profiles
const charactersData = [
  {
    name: 'Jay Gatsby',
    description: 'A mysterious millionaire who throws lavish parties at his mansion on Long Island. Born James Gatz to poor farmers, he reinvented himself as Jay Gatsby and amassed wealth through bootlegging and other criminal activities, all in pursuit of Daisy Buchanan, whom he loved as a young military officer.',
    traits: ['Idealistic', 'Mysterious', 'Obsessive', 'Hopeful', 'Ambitious'],
    connections: [
      { name: 'Daisy Buchanan', relationship: 'His lost love and motivation' },
      { name: 'Nick Carraway', relationship: 'Neighbor and friend' },
      { name: 'Meyer Wolfsheim', relationship: 'Business associate' },
      { name: 'Dan Cody', relationship: 'Former mentor' }
    ],
    color: 'purple'
  },
  {
    name: 'Daisy Buchanan',
    description: 'A beautiful, wealthy but shallow young woman from Louisville, Kentucky. She was Gatsby\'s love interest before she married Tom Buchanan. Her voice is "full of money," symbolizing her materialistic nature.',
    traits: ['Beautiful', 'Wealthy', 'Careless', 'Shallow', 'Indecisive'],
    connections: [
      { name: 'Tom Buchanan', relationship: 'Husband' },
      { name: 'Jay Gatsby', relationship: 'Former lover' },
      { name: 'Jordan Baker', relationship: 'Close friend' },
      { name: 'Nick Carraway', relationship: 'Cousin' }
    ],
    color: 'rose'
  },
  {
    name: 'Tom Buchanan',
    description: 'Daisy\'s husband, a wealthy and physically imposing man from a rich Chicago family. He is arrogant, aggressive, and unfaithful to Daisy with his mistress Myrtle Wilson.',
    traits: ['Wealthy', 'Athletic', 'Arrogant', 'Racist', 'Controlling'],
    connections: [
      { name: 'Daisy Buchanan', relationship: 'Wife' },
      { name: 'Myrtle Wilson', relationship: 'Mistress' },
      { name: 'George Wilson', relationship: 'Myrtle\'s husband' }
    ],
    color: 'blue'
  },
  {
    name: 'Jordan Baker',
    description: 'A professional golfer and friend of Daisy\'s. She is athletic, cynical, and romantically involved with Nick for a portion of the novel.',
    traits: ['Athletic', 'Dishonest', 'Independent', 'Cynical', 'Modern'],
    connections: [
      { name: 'Daisy Buchanan', relationship: 'Friend' },
      { name: 'Nick Carraway', relationship: 'Brief romantic interest' }
    ],
    color: 'green'
  },
  {
    name: 'Nick Carraway',
    description: 'The narrator of the novel, a young man from Minnesota who moves to New York to learn the bond business. He lives next door to Gatsby and becomes his friend, admiring Gatsby\'s optimism while being critical of high society.',
    traits: ['Observant', 'Reserved', 'Honest', 'Tolerant', 'Conflicted'],
    connections: [
      { name: 'Jay Gatsby', relationship: 'Neighbor and friend' },
      { name: 'Daisy Buchanan', relationship: 'Cousin' },
      { name: 'Jordan Baker', relationship: 'Brief romantic interest' },
      { name: 'Tom Buchanan', relationship: 'Acquaintance through Daisy' }
    ],
    color: 'amber'
  }
];

// Sample data for themes and symbols
const themeData = [
  {
    title: 'The American Dream',
    description: 'One of the central themes of the novel is the corruption of the American Dream, which suggests that anyone can achieve success through hard work and determination. Through Gatsby\'s ultimate failure and death, Fitzgerald suggests that this ideal has been corrupted by the pursuit of wealth for its own sake.',
    examples: [
      {
        text: "Gatsby believed in the green light, the orgastic future that year by year recedes before us. It eluded us then, but that's no matter—tomorrow we will run faster, stretch out our arms farther...",
        reference: "Chapter 9"
      },
      {
        text: "He had come a long way to this blue lawn, and his dream must have seemed so close that he could hardly fail to grasp it.",
        reference: "Chapter 8"
      }
    ],
    type: 'theme' as const
  },
  {
    title: 'The Green Light',
    description: 'The green light at the end of Daisy\'s dock is a recurring symbol in the novel. It represents Gatsby\'s hopes and dreams for the future, particularly his dream of being with Daisy. The light is associated with the American Dream, suggesting that it is ultimately unattainable.',
    examples: [
      {
        text: "...he stretched out his arms toward the dark water in a curious way, and, far as I was from him, I could have sworn he was trembling. Involuntarily I glanced seaward—and distinguished nothing except a single green light, minute and far away, that might have been the end of a dock.",
        reference: "Chapter 1"
      },
      {
        text: "Gatsby believed in the green light, the orgastic future that year by year recedes before us.",
        reference: "Chapter 9"
      }
    ],
    type: 'symbol' as const
  },
  {
    title: 'East vs. West',
    description: 'The novel contrasts the values of the East (represented by New York and Long Island) with those of the Midwest. The East represents moral corruption, materialism, and social decay, while the Midwest stands for traditional moral values and authenticity.',
    examples: [
      {
        text: "I see now that this has been a story of the West, after all—Tom and Gatsby, Daisy and Jordan and I, were all Westerners, and perhaps we possessed some deficiency in common which made us subtly unadaptable to Eastern life.",
        reference: "Chapter 9"
      },
      {
        text: "That's my Middle West... the street lamps and sleigh bells in the frosty dark... I see now that this has been a story of the West, after all—Tom and Gatsby, Daisy and Jordan and I, were all Westerners, and perhaps we possessed some deficiency in common which made us subtly unadaptable to Eastern life.",
        reference: "Chapter 9"
      }
    ],
    type: 'theme' as const
  }
];

/**
 * Dynamic page component for displaying individual books and handling queries
 */
export default function DynamicBookPage() {
  const params = useParams();
  const bookId = params.bookId as string;

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [book, setBook] = useState<ProcessedBook | null>(null);

  const [question, setQuestion] = useState<string>('');
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [isAnswerLoading, setIsAnswerLoading] = useState<boolean>(false);

  // PDF viewer state
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState<boolean>(false);

  // Pre-defined suggestions (could be generated based on book content)
  const suggestedQuestions = [
    "What happens in chapter 1?",
    "Who are the main characters?",
    "What are the key themes of this book?"
  ];

  /**
   * Load book data on component mount
   */
  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      setError(null);

      try {
        // For the pre-built Great Gatsby page, use hardcoded data
        if (bookId === 'the-great-gatsby') {
          setBook({
            id: 'the-great-gatsby',
            title: 'The Great Gatsby',
            author: 'F. Scott Fitzgerald',
            totalPages: 218,
            isProcessed: true,
            uploadDate: new Date()
          });
          setLoading(false);
          return;
        }

        // Otherwise, fetch the book from the API
        const response = await fetch(`/api/books/${bookId}`);

        if (!response.ok) {
          throw new Error('Failed to load book');
        }

        const bookData = await response.json();
        setBook(bookData);

      } catch (error) {
        console.error('Error loading book:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [bookId]);

  /**
   * Handle opening the PDF viewer
   */
  const handleReadBook = () => {
    try {
      // Check if file exists or throw an error?
      setIsPdfViewerOpen(true);
    } catch (error) {
      console.error('Error opening PDF viewer:', error);
      alert('There was an error opening the book. Please try again.');
    }
  };

  /**
   * Handle closing the PDF viewer
   */
  const handleClosePdfViewer = () => {
    setIsPdfViewerOpen(false);
  };

  /**
   * Handle question submission and fetch response
   */
  const handleQuestionSubmit = async (questionText: string) => {
    setQuestion(questionText);
    setIsAnswerLoading(true);

    try {
      // Check if we're on the pre-built Great Gatsby page
      if (bookId === 'the-great-gatsby') {
        // Instead of redirecting, simulate the various response types based on the question
        // This creates a more seamless experience
        const lowerQuestion = questionText.toLowerCase();
        let response: AIResponse;

        if (lowerQuestion.includes('gatsby') && lowerQuestion.includes('life')) {
          // Use the pre-defined timeline data from the Great Gatsby page
          response = {
            responseType: 'timeline',
            text: "Here's a timeline of Jay Gatsby's life and experiences:",
            timeline: gatsbyTimelineEvents
          };
        } else if (lowerQuestion.includes('timeline') || lowerQuestion.includes('events') || lowerQuestion.includes('chronology')) {
          // Generic timeline fallback when asking about timeline but not specifically about Gatsby's life
          response = {
            responseType: 'timeline',
            text: "Here's a timeline of major events:",
            timeline: gatsbyTimelineEvents.slice(0, 3) // Just use a subset of the existing timeline
          };
        } else if (lowerQuestion.includes('character') || lowerQuestion.includes('who is')) {
          if (lowerQuestion.includes('gatsby')) {
            response = {
              responseType: 'character_profile',
              character: charactersData[0] // Gatsby
            };
          } else if (lowerQuestion.includes('nick')) {
            response = {
              responseType: 'character_profile',
              character: charactersData[4] // Nick
            };
          } else if (lowerQuestion.includes('daisy')) {
            response = {
              responseType: 'character_profile',
              character: charactersData[1] // Daisy
            };
          } else {
            response = {
              responseType: 'character_profile',
              characters: charactersData
            };
          }
        } else if (lowerQuestion.includes('symbol') || lowerQuestion.includes('theme')) {
          response = {
            responseType: 'theme_analysis',
            themes: themeData
          };
        } else if (lowerQuestion.includes('green light')) {
          response = {
            responseType: 'theme_analysis',
            themes: [themeData[1]] // Green light symbol
          };
        } else if (lowerQuestion.includes('compare') || lowerQuestion.includes('contrast') || lowerQuestion.includes('similarities')) {
          response = {
            responseType: 'comparison',
            comparison: {
              element1: {
                name: "Jay Gatsby",
                description: "A self-made millionaire who rose from poverty, driven by his love for Daisy and belief in the American Dream."
              },
              element2: {
                name: "Tom Buchanan",
                description: "A wealthy, privileged man born into old money, representing entrenched social power and traditional aristocracy."
              },
              similarities: [
                "Both are wealthy and powerful men in society",
                "Both are in love with Daisy",
                "Both have a tendency toward control and manipulation"
              ],
              differences: [
                "Gatsby is self-made; Tom inherited his wealth",
                "Gatsby is idealistic and romantic; Tom is cynical and practical",
                "Gatsby represents new money; Tom represents old money",
                "Gatsby is respectful towards women; Tom is abusive"
              ]
            }
          };
        } else if (lowerQuestion.includes('quote') || lowerQuestion.includes('said')) {
          response = {
            responseType: 'quote_analysis',
            quote: {
              text: "So we beat on, boats against the current, borne back ceaselessly into the past.",
              speaker: "Nick Carraway (narrator)",
              chapter: "Final line of the novel",
              analysis: "This famous closing line encapsulates one of the novel's central themes: the impossibility of escaping the past. Despite Gatsby's tremendous effort to recreate the past and achieve his dream, he fails. The metaphor of boats struggling against the current suggests that human striving is ultimately futile against the overwhelming force of time. No matter how hard we try to move forward, we are inevitably pulled back into our pasts. This reflects Gatsby's tragically failed attempt to recreate his past with Daisy and speaks to the broader American experience of struggling to achieve an idealized future while being anchored by history.",
              themes: ["The Past", "Futility of the American Dream", "Time", "Human Striving"]
            }
          };
        } else {
          // Default response
          response = {
            responseType: 'text',
            text: "The Great Gatsby, written by F. Scott Fitzgerald and published in 1925, is a novel set in the Jazz Age on Long Island. It explores themes of wealth, class, love, and the American Dream through the tragic story of Jay Gatsby and his pursuit of his lost love, Daisy Buchanan. The novel is narrated by Nick Carraway, who moves next door to the mysterious millionaire Gatsby and becomes drawn into his world of lavish parties and obsessive dreams. Despite its initial poor reception, it's now considered a literary classic that captures the decadence and moral emptiness of the 1920s era."
          };
        }

        setResponse(response);
        setIsAnswerLoading(false);
        return;
      }

      // For uploaded books, query the API
      const response = await fetch('/api/query-book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: questionText,
          bookId: bookId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const responseData = await response.json();
      setResponse(responseData);

    } catch (error) {
      console.error('Error getting response:', error);
      setResponse({
        responseType: 'text',
        text: "I'm sorry, there was an error generating a response. Please try again."
      });
    } finally {
      setIsAnswerLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4 mx-auto"></div>
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading book...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !book) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h1 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">Error Loading Book</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-6">{error || 'Book not found'}</p>
          <Link href="/" className="text-purple-600 dark:text-purple-400 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <BookHeader
        title={book.title}
        author={book.author}
        onReadBook={handleReadBook}
      />

      <main>
        <QuestionForm
          onSubmit={handleQuestionSubmit}
          bookTitle={book.title}
          isLoading={isAnswerLoading}
          suggestedQuestions={suggestedQuestions}
        />

        {(question || isAnswerLoading) && (
          <AnswerDisplay
            question={question}
            response={response}
            isLoading={isAnswerLoading}
          />
        )}
      </main>

      {/* PDF Viewer Modal */}
      {isPdfViewerOpen && (
        <EmbeddedPDFViewer
          pdfUrl={`/api/serve-pdf/${bookId}.pdf`}
          onClose={handleClosePdfViewer}
        />
      )}
    </div>
  );
} 