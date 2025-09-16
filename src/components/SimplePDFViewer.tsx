'use client';

import React, { useState } from 'react';

interface SimplePDFViewerProps {
  pdfUrl: string;
  onClose: () => void;
}

/**
 * A very simple PDF viewer component using the HTML5 object tag
 * This is a fallback in case iframe doesn't work properly
 */
export default function SimplePDFViewer({ pdfUrl, onClose }: SimplePDFViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add a timestamp to prevent caching
  const urlWithTimestamp = `${pdfUrl}?t=${Date.now()}`;

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
              className="px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
            >
              Open in New Tab
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
        <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          )}
          
          <object
            data={urlWithTimestamp}
            type="application/pdf"
            className="w-full h-full"
            onLoad={() => setLoading(false)}
            onError={() => {
              setError("Failed to load the PDF document");
              setLoading(false);
            }}
          >
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">PDF Viewer Not Supported</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Your browser does not support inline PDF viewing.
              </p>
              <a 
                href={pdfUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
              >
                Download PDF
              </a>
            </div>
          </object>
        </div>
      </div>
    </div>
  );
} 