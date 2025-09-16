'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BookUploader from '@/components/BookUploader';
import BookCarousel from '@/components/BookCarousel';
import { ProcessedBook } from '@/utils/bookProcessor';
import builtinBooks from '@/data/builtinBooks';

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const router = useRouter();

  const handleBookSelect = (bookId: string) => {
    // Use a slight delay before navigation to allow the loading state to be visible
    setTimeout(() => {
      router.push(`/book/${bookId}`);
    }, 100);
  };
  
  const handleUploadComplete = (book: ProcessedBook) => {
    console.log('Book uploaded successfully:', book);
    // Redirect happens inside the uploader component
  };
  
  const handleUploadError = (error: Error) => {
    setUploadError(error.message);
  };

  // Create a function to prepare built-in book
  const setupBuiltinBook = async (bookId: string) => {
    try {
      setIsLoading(true);
      setUploadError(null);
      
      // Call the API to prepare the built-in book
      const response = await fetch(`/api/prepare-builtin-book/${bookId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to prepare book');
      }
      
      // Navigate to the book page
      handleBookSelect(bookId);
    } catch (error) {
      console.error('Error setting up built-in book:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to set up sample book');
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 md:p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono flex">
        <div className="flex fixed left-0 top-0 w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-purple-600 to-pink-600 mr-2 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">BookBuddy</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center w-full max-w-3xl">
        <h1 className="text-3xl md:text-5xl font-bold text-center mb-6">
          Your AI Book Companion
        </h1>
        <p className="text-center mb-12 text-gray-600 dark:text-gray-400">
          Upload a book PDF and ask any question about it. Get beautiful, interactive responses in seconds.
        </p>

        <BookUploader 
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
        />
        
        {uploadError && (
          <div className="w-full mb-8 text-red-500 bg-red-50 dark:bg-red-900/10 p-4 rounded-md">
            Error: {uploadError}
          </div>
        )}

        <div className="w-full mt-12">
          <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-200 dark:border-gray-700 inline-block">
            Try with a sample book
          </h2>
          
          <div className={`w-full transition-opacity duration-300 ${isLoading ? 'opacity-70' : 'opacity-100'}`}>
            <BookCarousel 
              books={builtinBooks}
              onBookSelect={setupBuiltinBook}
              disabled={isLoading}
            />
          </div>
          
          <div className="h-16 mt-4 flex items-center justify-center">
            {isLoading && (
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400 w-full max-w-3xl">
        <div className="flex items-center justify-center mb-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-600/30 to-pink-600/30 mr-2 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
          </div>
          <p>© 2024 BookBuddy - Your AI Book Companion</p>
        </div>
      </div>
    </main>
  );
}
