'use client';

import React, { useState } from 'react';

interface QuestionFormProps {
  onSubmit: (question: string) => Promise<void>;
  bookTitle: string;
  isLoading: boolean;
  suggestedQuestions?: string[];
}

/**
 * Form component for submitting questions about a book
 */
export default function QuestionForm({
  onSubmit,
  bookTitle,
  isLoading,
  suggestedQuestions = []
}: QuestionFormProps) {
  const [question, setQuestion] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !isLoading) {
      await onSubmit(question);
      // Don't clear the question as it's nice to see what was asked
    }
  };

  const handleSuggestedQuestion = async (suggestedQuestion: string) => {
    if (!isLoading) {
      setQuestion(suggestedQuestion);
      await onSubmit(suggestedQuestion);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Ask me about &ldquo;{bookTitle}&rdquo;</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Type a question about characters, symbols, or plot points.
        </p>
      </div>

      {suggestedQuestions.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-3">
            {suggestedQuestions.map((q, index) => (
              <button
                key={index}
                className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-sm px-4 py-2 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800/40 transition-colors disabled:opacity-50"
                onClick={() => handleSuggestedQuestion(q)}
                disabled={isLoading}
              >
                Try asking about: &ldquo;{q}&rdquo;
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about the book..."
          className="w-full py-3 pl-4 pr-12 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-70"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!question.trim() || isLoading}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:hover:bg-purple-600"
        >
          {isLoading ? (
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
} 