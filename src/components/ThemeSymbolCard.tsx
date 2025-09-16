'use client';

import React from 'react';

interface ThemeSymbolCardProps {
  title: string;
  description: string;
  examples?: { text: string; reference?: string }[];
  type: 'theme' | 'symbol' | 'motif';
}

/**
 * Card component for displaying thematic elements and symbols from the book
 */
export default function ThemeSymbolCard({
  title,
  description,
  examples = [],
  type
}: ThemeSymbolCardProps) {
  const getTypeStyles = () => {
    switch (type) {
      case 'theme':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          title: 'text-blue-800 dark:text-blue-300',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>
          )
        };
      case 'symbol':
        return {
          bg: 'bg-amber-50 dark:bg-amber-900/20',
          border: 'border-amber-200 dark:border-amber-800',
          title: 'text-amber-800 dark:text-amber-300',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'motif':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          title: 'text-green-800 dark:text-green-300',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
            </svg>
          )
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-800',
          border: 'border-gray-200 dark:border-gray-700',
          title: 'text-gray-800 dark:text-gray-300',
          icon: null
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={`${styles.bg} border ${styles.border} rounded-lg p-6`}>
      <div className="flex items-center mb-4">
        {styles.icon && <div className="mr-3">{styles.icon}</div>}
        <h3 className={`text-lg font-bold ${styles.title}`}>{title}</h3>
      </div>

      <p className="text-gray-700 dark:text-gray-300 mb-4">{description}</p>

      {examples.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2 text-sm uppercase text-gray-500 dark:text-gray-400">Examples in the text</h4>
          <ul className="space-y-2">
            {examples.map((example, index) => (
              <li key={index} className="text-sm border-l-2 border-gray-300 dark:border-gray-600 pl-3 py-1">
                <p className="italic text-gray-600 dark:text-gray-400">&ldquo;{example.text}&rdquo;</p>
                {example.reference && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    — {example.reference}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 