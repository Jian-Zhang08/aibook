'use client';

import React from 'react';
import Link from 'next/link';

interface BookHeaderProps {
  title: string;
  author?: string;
  onReadBook?: () => void;
}

/**
 * Header component for book pages displaying the title and author
 */
export default function BookHeader({ title, author, onReadBook }: BookHeaderProps) {
  return (
    <div className="w-full bg-purple-600 text-white py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-white hover:text-purple-200 transition-colors">
            BookBuddy
          </Link>
          
          <div className="flex items-center">
            <div className="text-right">
              <h1 className="text-xl font-bold">{title}</h1>
              {author && <p className="text-purple-200 text-sm">{author}</p>}
            </div>
          </div>
          
          {onReadBook && (
            <button 
              onClick={onReadBook}
              className="flex items-center space-x-2 px-3 py-1.5 bg-white text-purple-700 hover:bg-purple-100 rounded-md text-sm font-medium transition-colors ml-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
              <span>Read the Book</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 