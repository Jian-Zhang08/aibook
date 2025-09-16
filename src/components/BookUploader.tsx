'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ProcessedBook } from '@/utils/bookProcessor';
import UploadProgressModal, { ProcessingStep } from './UploadProgressModal';

interface BookUploaderProps {
  onUploadStart?: () => void;
  onUploadComplete?: (book: ProcessedBook) => void;
  onUploadError?: (error: Error) => void;
}

/**
 * Component for uploading and processing book files
 */
export default function BookUploader({
  onUploadStart,
  onUploadComplete,
  onUploadError
}: BookUploaderProps) {
  const [uploadHover, setUploadHover] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const processingSteps: ProcessingStep[] = [
    {
      id: 'upload',
      title: 'Uploading Book',
      status: 'pending',
      description: 'Uploading your book file to our servers...'
    },
    {
      id: 'extract',
      title: 'Extracting Book Data',
      status: 'pending',
      description: 'Analyzing and extracting text content from your book...'
    },
    {
      id: 'embed',
      title: 'Creating Embeddings',
      status: 'pending',
      description: 'Processing book content for AI understanding...'
    },
    {
      id: 'vector',
      title: 'Saving to Vector Database',
      status: 'pending',
      description: 'Storing processed content for quick retrieval...'
    },
    {
      id: 'finalize',
      title: 'Finalizing',
      status: 'pending',
      description: 'Performing final checks and preparing for Q&A...'
    }
  ];

  /**
   * Handle file upload and processing
   */
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // File validation
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are supported');
      if (onUploadError) onUploadError(new Error('Invalid file type'));
      return;
    }

    if (file.size > 60 * 1024 * 1024) { // 60MB limit
      setError('File size exceeds the 60MB limit');
      if (onUploadError) onUploadError(new Error('File too large'));
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    setShowProgressModal(true);
    setCurrentStep(0);
    if (onUploadStart) onUploadStart();

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Step 1: Upload file
      const response = await fetch('/api/upload-book', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload book');
      }

      setCurrentStep(1); // Move to extraction step

      // Step 2: Extract book data
      const extractResponse = await fetch('/api/extract-book-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename: file.name }),
      });

      if (!extractResponse.ok) {
        throw new Error('Failed to extract book data');
      }

      setCurrentStep(2); // Move to embedding step

      // Step 3: Create embeddings
      const embedResponse = await fetch('/api/create-embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename: file.name }),
      });

      if (!embedResponse.ok) {
        throw new Error('Failed to create embeddings');
      }

      setCurrentStep(3); // Move to vector storage step

      // Step 4: Save to vector database
      const vectorResponse = await fetch('/api/save-to-vector-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename: file.name }),
      });

      if (!vectorResponse.ok) {
        throw new Error('Failed to save to vector database');
      }

      setCurrentStep(4); // Move to finalization step

      // Step 5: Final checks
      const finalResponse = await fetch('/api/finalize-book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename: file.name }),
      });

      if (!finalResponse.ok) {
        throw new Error('Failed to finalize book processing');
      }

      const bookData: ProcessedBook = await finalResponse.json();

      // Signal completion
      if (onUploadComplete) onUploadComplete(bookData);

      // Redirect to book page
      router.push(`/book/${bookData.id}`);

    } catch (error) {
      console.error('Error processing book:', error);
      setError(error instanceof Error ? error.message : 'Failed to process book');
      if (onUploadError && error instanceof Error) onUploadError(error);
    } finally {
      setIsUploading(false);
      setShowProgressModal(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setUploadHover(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="w-full mb-12">
      <div
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors h-[230px] flex flex-col items-center justify-center ${uploadHover ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10' : 'border-gray-300 dark:border-gray-700'
          } ${isUploading ? 'pointer-events-none opacity-70' : 'cursor-pointer'}`}
        onDragOver={(e) => {
          e.preventDefault();
          if (!isUploading) setUploadHover(true);
        }}
        onDragLeave={() => setUploadHover(false)}
        onDrop={isUploading ? undefined : handleDrop}
        onClick={() => {
          if (!isUploading && fileInputRef.current) {
            fileInputRef.current.click();
          }
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf"
          onChange={handleFileInput}
          disabled={isUploading}
        />

        <div className={`w-full transition-opacity duration-300 ${isUploading ? 'opacity-0 absolute' : 'opacity-100'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-lg font-medium">Drag & drop your book PDF here</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">or click to browse</p>

          {error && (
            <div className="mt-4 text-red-500 bg-red-50 dark:bg-red-900/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
            Supported format: PDF (Max 60MB)
          </div>
        </div>

        <div className={`w-full max-w-md transition-opacity duration-300 ${isUploading ? 'opacity-100' : 'opacity-0 absolute'}`}>
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-md h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-purple-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              {uploadProgress < 100
                ? 'Uploading and processing book...'
                : 'Finalizing...'
              }
            </p>
          </div>
        </div>
      </div>

      <UploadProgressModal
        isOpen={showProgressModal}
        steps={processingSteps}
        currentStep={currentStep}
        onClose={() => setShowProgressModal(false)}
      />
    </div>
  );
} 