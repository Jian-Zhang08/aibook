'use client';

import React, { useState } from 'react';

interface EmbeddedPDFViewerProps {
  pdfUrl: string;
  onClose: () => void;
}

/**
 * A PDF viewer component that uses an embed tag, which may have better compatibility
 * with various browsers compared to object or iframe
 */
export default function EmbeddedPDFViewer({ pdfUrl, onClose }: EmbeddedPDFViewerProps) {
  const [loading, setLoading] = useState(true);

  // Add a cache-busting timestamp
  const urlWithTimestamp = `${pdfUrl}?t=${Date.now()}`;
  
  const handleLoad = () => {
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 max-w-5xl w-full h-[90vh] rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header with controls */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold">PDF Viewer</h2>
          
          <div className="flex items-center space-x-2">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Open in new tab"
              title="Open in new tab"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
            </a>
            
            <button
              onClick={onClose}
              className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Close PDF viewer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* PDF Content */}
        <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          )}
          
          <embed 
            src={urlWithTimestamp}
            type="application/pdf"
            className="w-full h-full"
            onLoad={handleLoad}
          />
        </div>
      </div>
    </div>
  );
} 