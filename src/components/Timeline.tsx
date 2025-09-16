'use client';

import React from 'react';

export interface TimelineEvent {
  id: string;
  year?: string;
  title: string;
  description: string;
  color?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
}

/**
 * Timeline component for displaying a sequence of events in chronological order
 */
export default function Timeline({ events }: TimelineProps) {
  // Safety check: ensure events is a valid array
  if (!events || !Array.isArray(events) || events.length === 0) {
    return (
      <div className="p-4 border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800 rounded-md">
        <p className="text-amber-800 dark:text-amber-400">No timeline events to display.</p>
      </div>
    );
  }

  const sortedEvents = [...events].sort((a, b) => {
    if (!a.year && !b.year) return 0;
    if (!a.year) return 1;
    if (!b.year) return -1;
    return a.year.localeCompare(b.year);
  });

  const getColor = (color?: string) => {
    const colors: Record<string, { bg: string, text: string, border: string, darkBg: string, darkBorder: string }> = {
      default: { 
        bg: 'bg-gray-100', 
        text: 'text-gray-800', 
        border: 'border-gray-300',
        darkBg: 'dark:bg-gray-800',
        darkBorder: 'dark:border-gray-700'
      },
      purple: { 
        bg: 'bg-purple-50', 
        text: 'text-purple-800', 
        border: 'border-purple-200',
        darkBg: 'dark:bg-purple-900/20',
        darkBorder: 'dark:border-purple-800'
      },
      blue: { 
        bg: 'bg-blue-50', 
        text: 'text-blue-800', 
        border: 'border-blue-200',
        darkBg: 'dark:bg-blue-900/20',
        darkBorder: 'dark:border-blue-800'
      },
      green: { 
        bg: 'bg-green-50', 
        text: 'text-green-800', 
        border: 'border-green-200',
        darkBg: 'dark:bg-green-900/20',
        darkBorder: 'dark:border-green-800'
      },
      amber: { 
        bg: 'bg-amber-50', 
        text: 'text-amber-800', 
        border: 'border-amber-200',
        darkBg: 'dark:bg-amber-900/20',
        darkBorder: 'dark:border-amber-800'
      },
      rose: { 
        bg: 'bg-rose-50', 
        text: 'text-rose-800', 
        border: 'border-rose-200',
        darkBg: 'dark:bg-rose-900/20',
        darkBorder: 'dark:border-rose-800'
      },
    };
    
    return colors[color || 'default'] || colors.default;
  };

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
      
      {/* Timeline events */}
      <div className="space-y-6">
        {sortedEvents.map((event, index) => {
          const colorClass = getColor(event.color);
          
          return (
            <div key={event.id} className="relative pl-16">
              {/* Circle on timeline */}
              <div className="absolute left-7 top-1.5 transform -translate-x-1/2 w-3 h-3 rounded-full bg-purple-500 dark:bg-purple-400 z-10" />
              
              {/* Year indicator */}
              {event.year && (
                <div className="absolute left-0 top-0 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {event.year}
                </div>
              )}
              
              {/* Event content */}
              <div className={`${colorClass.bg} ${colorClass.darkBg} border ${colorClass.border} ${colorClass.darkBorder} rounded-md p-4`}>
                <h3 className={`font-bold ${colorClass.text}`}>{event.title}</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{event.description}</p>
                
                {/* View more button (optional) */}
                <button className="mt-2 text-xs text-purple-600 dark:text-purple-400 hover:underline">
                  + View info
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 