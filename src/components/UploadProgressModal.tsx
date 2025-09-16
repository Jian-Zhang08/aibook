import React from 'react';

export type ProcessingStep = {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  description: string;
};

interface UploadProgressModalProps {
  isOpen: boolean;
  steps: ProcessingStep[];
  currentStep: number;
  onClose?: () => void;
}

/**
 * Modal component that displays the step-by-step progress of book processing
 */
export default function UploadProgressModal({
  isOpen,
  steps,
  currentStep,
  onClose
}: UploadProgressModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Processing Your Book
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => {
            const isCurrentStep = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div
                key={step.id}
                className={`flex items-start space-x-4 p-4 rounded-lg transition-colors ${isCurrentStep
                    ? 'bg-purple-50 dark:bg-purple-900/20'
                    : isCompleted
                      ? 'bg-green-50 dark:bg-green-900/20'
                      : 'bg-gray-50 dark:bg-gray-700/20'
                  }`}
              >
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : isCurrentStep ? (
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {index + 1}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 