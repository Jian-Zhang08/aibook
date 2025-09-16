'use client';

import React from 'react';
import { BuiltinBook } from '@/data/builtinBooks';
import Image from 'next/image';

interface BookCardProps {
  book: BuiltinBook;
  onClick: (bookId: string) => void;
  disabled?: boolean;
}

/**
 * A reusable card component for displaying book information
 */
export default function BookCard({ book, onClick, disabled = false }: BookCardProps) {
  const colorVariants = {
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-900',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-300 dark:border-purple-700',
      shadow: 'shadow-purple-300/20 dark:shadow-purple-900/30',
      hover: 'hover:bg-purple-50 dark:hover:bg-purple-900/70 hover:border-purple-400',
      gradient: 'from-purple-600 to-indigo-600',
    },
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-300 dark:border-blue-700',
      shadow: 'shadow-blue-300/20 dark:shadow-blue-900/30',
      hover: 'hover:bg-blue-50 dark:hover:bg-blue-900/70 hover:border-blue-400',
      gradient: 'from-blue-600 to-cyan-600',
    },
    green: {
      bg: 'bg-green-100 dark:bg-green-900',
      text: 'text-green-700 dark:text-green-300',
      border: 'border-green-300 dark:border-green-700',
      shadow: 'shadow-green-300/20 dark:shadow-green-900/30',
      hover: 'hover:bg-green-50 dark:hover:bg-green-900/70 hover:border-green-400',
      gradient: 'from-green-600 to-emerald-600',
    },
    amber: {
      bg: 'bg-amber-100 dark:bg-amber-900',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-300 dark:border-amber-700',
      shadow: 'shadow-amber-300/20 dark:shadow-amber-900/30',
      hover: 'hover:bg-amber-50 dark:hover:bg-amber-900/70 hover:border-amber-400',
      gradient: 'from-amber-600 to-orange-600',
    },
    rose: {
      bg: 'bg-rose-100 dark:bg-rose-900',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-300 dark:border-rose-700',
      shadow: 'shadow-rose-300/20 dark:shadow-rose-900/30',
      hover: 'hover:bg-rose-50 dark:hover:bg-rose-900/70 hover:border-rose-400',
      gradient: 'from-rose-600 to-pink-600',
    },
  };

  const colorSet = colorVariants[book.codeColor as keyof typeof colorVariants] || colorVariants.blue;

  // Map book IDs to their respective cover image paths
  const getCoverImagePath = (bookId: string): string => {
    switch (bookId) {
      case 'the-great-gatsby':
        return '/book-covers/the-grat-gatsby.webp'; // Note: File has typo in name
      case 'the-law-of-attraction':
        return '/book-covers/The Law of Attraction.jpg';
      case 'percy-jackson':
        return '/book-covers/Percy Jackson & The Olympians.jpg';
      default:
        return '';
    }
  };

  const coverImagePath = getCoverImagePath(book.id);

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg transition-all duration-300 
        border border-gray-200 dark:border-gray-700 ${colorSet.shadow}
        ${book.isPlaceholder ? 'border-dashed' : ''}
        ${disabled || book.isPlaceholder ? 'opacity-70 cursor-not-allowed' : `cursor-pointer ${colorSet.hover} hover:shadow-xl`}
        h-[160px]`}
      onClick={() => !disabled && !book.isPlaceholder && onClick(book.id)}
    >
      <div className="flex items-start space-x-4 h-full">
        {/* Book cover with actual image or placeholder */}
        <div className={`w-16 h-24 rounded-md flex items-center justify-center overflow-hidden shadow-md 
          ${colorSet.border} border relative ${book.isPlaceholder ? 'border-dashed bg-gray-50 dark:bg-gray-800' : ''}`}
        >
          {book.isPlaceholder ? (
            <div className="flex items-center justify-center h-full w-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          ) : coverImagePath ? (
            <Image 
              src={coverImagePath}
              alt={`${book.title} cover`}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${colorSet.gradient}`}>
              <span className="text-white font-bold text-sm">{book.code}</span>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1 leading-tight">{book.title}</h3>
          <p className={`text-sm ${colorSet.text} font-medium mb-2`}>{book.author}</p>
          {book.shortDescription && (
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-snug mt-1">{book.shortDescription}</p>
          )}
        </div>
      </div>
    </div>
  );
} 