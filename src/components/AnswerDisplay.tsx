'use client';

import React from 'react';
import CharacterProfile from './CharacterProfile';
import Timeline from './Timeline';
import ThemeSymbolCard from './ThemeSymbolCard';
import { TimelineEvent } from './Timeline';

export type ResponseType =
  | 'text'
  | 'character_profile'
  | 'timeline'
  | 'theme_analysis'
  | 'quote_analysis'
  | 'comparison'
  | 'themes'
  | 'character'
  | 'symbol';

export interface CharacterData {
  name: string;
  description: string;
  traits?: string[];
  connections?: { name: string; relationship: string }[];
  color?: string;
}

export interface ThemeData {
  title: string;
  description: string;
  examples?: { text: string; reference?: string }[];
  type: 'theme' | 'symbol' | 'motif';
}

export interface QuoteData {
  text: string;
  speaker?: string;
  chapter?: string;
  analysis: string;
  themes?: string[];
}

export interface ComparisonData {
  element1: {
    name: string;
    description: string;
  };
  element2: {
    name: string;
    description: string;
  };
  similarities: string[];
  differences: string[];
}

export interface AIResponse {
  responseType: ResponseType;
  text?: string;
  character?: CharacterData;
  characters?: CharacterData[];
  timeline?: TimelineEvent[];
  themes?: ThemeData[];
  quote?: QuoteData;
  comparison?: ComparisonData;

  // New fields for Great Gatsby demo
  characterName?: string;
  traits?: string[];
  description?: string;
  symbolName?: string;
  analysis?: string;
  quotes?: {
    text: string;
    explanation: string;
  }[];
}

interface AnswerDisplayProps {
  question: string;
  response: AIResponse | null;
  isLoading: boolean;
}

/**
 * Component for displaying AI-generated answers about books in various formats
 */
export default function AnswerDisplay({
  question,
  response,
  isLoading
}: AnswerDisplayProps) {
  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8 flex justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-64 w-full max-w-2xl bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="mt-4 text-gray-500 dark:text-gray-400 text-sm">Generating a thoughtful response...</div>
        </div>
      </div>
    );
  }

  if (!response) {
    return null;
  }

  const renderContent = () => {
    switch (response.responseType) {
      case 'text':
        return (
          <div className="prose dark:prose-invert max-w-none">
            {response.text?.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        );

      case 'character_profile':
        if (response.characters && response.characters.length > 0) {
          return (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {response.characters.map((character, index) => (
                  <CharacterProfile
                    key={index}
                    name={character.name}
                    description={character.description}
                    traits={character.traits}
                    connections={character.connections}
                    color={character.color || ['purple', 'blue', 'green', 'amber', 'rose'][index % 5]}
                  />
                ))}
              </div>
            </div>
          );
        } else if (response.character) {
          return (
            <div>
              <CharacterProfile
                name={response.character.name}
                description={response.character.description}
                traits={response.character.traits}
                connections={response.character.connections}
                color={response.character.color}
              />
            </div>
          );
        }
        return null;

      case 'timeline':
        return response.timeline && Array.isArray(response.timeline) ? (
          <div className="mt-6">
            <Timeline events={response.timeline} />
          </div>
        ) : (
          <div className="prose dark:prose-invert max-w-none">
            <p>Sorry, I couldn&apos;t generate a timeline for this query.</p>
          </div>
        );

      case 'theme_analysis':
        return response.themes ? (
          <div className="grid grid-cols-1 gap-6 mt-6">
            {response.themes.map((theme, index) => (
              <ThemeSymbolCard
                key={index}
                title={theme.title}
                description={theme.description}
                examples={theme.examples}
                type={theme.type}
              />
            ))}
          </div>
        ) : null;

      case 'themes':
        return (
          <div className="space-y-6">
            {response.text && (
              <div className="prose dark:prose-invert max-w-none">
                <p>{response.text}</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {response.themes && response.themes.map((theme, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                  <h3 className="font-bold text-purple-600 dark:text-purple-400 mb-2">{theme.title}</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{theme.description}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'character':
        return (
          <div className="space-y-6">
            {response.text && (
              <p className="text-lg mb-4">{response.text}</p>
            )}

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
              <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-3">{response.characterName}</h3>

              {response.description && (
                <div className="mb-6">
                  <p className="text-gray-700 dark:text-gray-300">{response.description}</p>
                </div>
              )}

              {response.traits && response.traits.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Character Traits</h4>
                  <div className="flex flex-wrap gap-2">
                    {response.traits.map((trait, i) => (
                      <span key={i} className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-3 py-1 rounded-full text-sm">
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {response.timeline && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Key Events</h4>
                  <div className="space-y-3">
                    {response.timeline.map((event, i) => (
                      <div key={i} className="flex">
                        <div className="mr-3 font-bold text-purple-600 dark:text-purple-400 w-16">{event.year}</div>
                        <div className="flex-1">{event.title}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'symbol':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
              <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-3">{response.symbolName}</h3>

              {response.text && (
                <p className="mb-4 text-gray-700 dark:text-gray-300">{response.text}</p>
              )}

              {response.analysis && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Analysis</h4>
                  <p className="text-gray-700 dark:text-gray-300">{response.analysis}</p>
                </div>
              )}

              {response.quotes && response.quotes.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Key Quotes</h4>
                  <div className="space-y-4">
                    {response.quotes.map((quote, i) => (
                      <div key={i} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md">
                        <blockquote className="italic mb-2 text-gray-700 dark:text-gray-300">&ldquo;{quote.text}&rdquo;</blockquote>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{quote.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'quote_analysis':
        return response.quote ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="mb-6 text-center">
              <blockquote className="text-xl italic font-medium text-gray-800 dark:text-gray-200">
                &ldquo;{response.quote.text}&rdquo;
              </blockquote>
              {response.quote.speaker && (
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  — {response.quote.speaker}
                  {response.quote.chapter && `, ${response.quote.chapter}`}
                </p>
              )}
            </div>

            <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
              <h3 className="text-lg font-bold mb-3">Analysis:</h3>
              <p>{response.quote.analysis}</p>
            </div>

            {response.quote.themes && response.quote.themes.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-bold mb-2">Related Themes:</h3>
                <div className="flex flex-wrap gap-2">
                  {response.quote.themes.map((theme, index) => (
                    <span key={index} className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm px-3 py-1 rounded-full">
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null;

      case 'comparison':
        return response.comparison ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">{response.comparison.element1.name}</h3>
                <p className="text-gray-700 dark:text-gray-300">{response.comparison.element1.description}</p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">{response.comparison.element2.name}</h3>
                <p className="text-gray-700 dark:text-gray-300">{response.comparison.element2.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-lg mb-3 text-green-600 dark:text-green-400">Similarities</h3>
                <ul className="space-y-2">
                  {response.comparison.similarities.map((similarity, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      <span className="text-gray-700 dark:text-gray-300">{similarity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-3 text-red-600 dark:text-red-400">Differences</h3>
                <ul className="space-y-2">
                  {response.comparison.differences.map((difference, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span className="text-gray-700 dark:text-gray-300">{difference}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : null;

      default:
        return (
          <div className="prose dark:prose-invert max-w-none">
            <p>Sorry, I couldn&apos;t generate a proper response. Please try asking a different question.</p>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="font-medium text-gray-500 dark:text-gray-400 text-sm">Your question:</h2>
        <p className="text-lg font-medium">{question}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        {renderContent()}
      </div>

      <div className="mt-4 flex justify-between">
        <button className="text-sm text-purple-600 dark:text-purple-400 hover:underline">
          Ask a follow-up question
        </button>
        <button className="text-sm text-gray-500 dark:text-gray-400 hover:underline">
          See related pages in book
        </button>
      </div>
    </div>
  );
} 