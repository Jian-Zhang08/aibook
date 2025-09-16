'use client';

import React from 'react';

interface CharacterProfileProps {
  name: string;
  description: string;
  traits?: string[];
  connections?: { name: string; relationship: string }[];
  initials?: string;
  color?: string;
}

/**
 * Character profile card for displaying information about book characters
 */
export default function CharacterProfile({ 
  name, 
  description, 
  traits = [], 
  connections = [],
  initials,
  color = 'purple' 
}: CharacterProfileProps) {
  const colorClasses: Record<string, { bg: string, text: string, darkBg: string, darkText: string }> = {
    purple: { 
      bg: 'bg-purple-100', 
      text: 'text-purple-600', 
      darkBg: 'dark:bg-purple-900/30',
      darkText: 'dark:text-purple-300'
    },
    blue: { 
      bg: 'bg-blue-100', 
      text: 'text-blue-600', 
      darkBg: 'dark:bg-blue-900/30',
      darkText: 'dark:text-blue-300'
    },
    green: { 
      bg: 'bg-green-100', 
      text: 'text-green-600', 
      darkBg: 'dark:bg-green-900/30',
      darkText: 'dark:text-green-300'
    },
    amber: { 
      bg: 'bg-amber-100', 
      text: 'text-amber-600', 
      darkBg: 'dark:bg-amber-900/30',
      darkText: 'dark:text-amber-300'
    },
    rose: { 
      bg: 'bg-rose-100', 
      text: 'text-rose-600', 
      darkBg: 'dark:bg-rose-900/30',
      darkText: 'dark:text-rose-300'
    },
  };
  
  const colorClass = colorClasses[color] || colorClasses.purple;
  const displayInitials = initials || name.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className={`w-12 h-12 rounded-full ${colorClass.bg} ${colorClass.darkBg} flex items-center justify-center mr-4`}>
            <span className={`font-bold ${colorClass.text} ${colorClass.darkText}`}>{displayInitials}</span>
          </div>
          <h3 className="text-xl font-bold">{name}</h3>
        </div>
        
        <p className="text-gray-700 dark:text-gray-300 mb-4">{description}</p>
        
        {traits.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold mb-2 text-sm uppercase text-gray-500 dark:text-gray-400">Key Traits</h4>
            <div className="flex flex-wrap gap-2">
              {traits.map((trait, index) => (
                <span 
                  key={index} 
                  className={`${colorClass.bg} ${colorClass.darkBg} ${colorClass.text} ${colorClass.darkText} text-xs px-2 py-1 rounded`}
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {connections.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 text-sm uppercase text-gray-500 dark:text-gray-400">Connections</h4>
            <ul className="space-y-1">
              {connections.map((connection, index) => (
                <li key={index} className="text-sm">
                  <span className="font-medium">{connection.name}</span>
                  <span className="text-gray-500 dark:text-gray-400"> — {connection.relationship}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 