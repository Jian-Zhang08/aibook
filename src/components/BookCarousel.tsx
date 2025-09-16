'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BuiltinBook } from '@/data/builtinBooks';
import BookCard from './BookCard';

interface BookCarouselProps {
  books: BuiltinBook[];
  onBookSelect: (bookId: string) => void;
  disabled?: boolean;
}

/**
 * A horizontal scrollable carousel for book cards
 */
export default function BookCarousel({ books, onBookSelect, disabled = false }: BookCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [thumbPosition, setThumbPosition] = useState(0);
  const [thumbWidth, setThumbWidth] = useState(100);

  const updateArrows = useCallback(() => {
    if (!carouselRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);

    // Update thumb position and width
    updateThumbPositionAndWidth();
  }, []);

  const updateThumbPositionAndWidth = () => {
    if (!carouselRef.current || !scrollbarRef.current || !thumbRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    const scrollbarWidth = scrollbarRef.current.clientWidth;

    // Calculate how wide the thumb should be based on visible portion
    const thumbWidthValue = Math.max(60, (clientWidth / scrollWidth) * scrollbarWidth);
    setThumbWidth(thumbWidthValue);

    // Calculate position of the thumb
    const scrollRatio = scrollLeft / (scrollWidth - clientWidth);
    const maxThumbPosition = scrollbarWidth - thumbWidthValue;
    const thumbPositionValue = scrollRatio * maxThumbPosition;
    setThumbPosition(thumbPositionValue);
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    const handleResize = () => {
      updateThumbPositionAndWidth();
      updateArrows();
    };

    if (carousel) {
      carousel.addEventListener('scroll', updateArrows);
      // Initial check
      updateArrows();

      // Update on resize as well
      window.addEventListener('resize', handleResize);
      return () => {
        carousel.removeEventListener('scroll', updateArrows);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [updateArrows]);

  const scroll = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;

    const carousel = carouselRef.current;
    const scrollAmount = carousel.clientWidth * 0.8;
    const targetScroll = direction === 'right'
      ? carousel.scrollLeft + scrollAmount
      : carousel.scrollLeft - scrollAmount;

    carousel.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current || !scrollbarRef.current) return;

    setIsDragging(true);
    setStartX(e.clientX);
    setScrollLeft(carouselRef.current.scrollLeft);
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current || !scrollbarRef.current || !thumbRef.current) return;

    const x = e.clientX;
    const deltaX = x - startX;

    const scrollbarWidth = scrollbarRef.current.clientWidth;
    const thumbWidthValue = thumbWidth;

    // The scroll track width (total width minus thumb width)
    const scrollTrackWidth = scrollbarWidth - thumbWidthValue;

    // How much to scroll the carousel for each pixel of thumb movement
    const { scrollWidth, clientWidth } = carouselRef.current;
    const scrollRatio = (scrollWidth - clientWidth) / scrollTrackWidth;

    // Move the carousel
    carouselRef.current.scrollLeft = scrollLeft + (deltaX * scrollRatio);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.style.userSelect = '';
  };

  const handleScrollbarClick = (e: React.MouseEvent) => {
    if (!carouselRef.current || !scrollbarRef.current || !thumbRef.current) return;
    if (e.target === thumbRef.current) return;

    // Get click position relative to scrollbar
    const scrollbarRect = scrollbarRef.current.getBoundingClientRect();
    const clickPosition = e.clientX - scrollbarRect.left;

    // Calculate target position for the center of the thumb
    const adjustedPosition = Math.max(thumbWidth / 2, Math.min(clickPosition, scrollbarRect.width - thumbWidth / 2));

    // Calculate the scroll position for the carousel
    const scrollbarWidth = scrollbarRect.width;
    const effectiveScrollbarWidth = scrollbarWidth - thumbWidth;
    const scrollRatio = (adjustedPosition - thumbWidth / 2) / effectiveScrollbarWidth;

    const { scrollWidth, clientWidth } = carouselRef.current;
    const maxScroll = scrollWidth - clientWidth;
    const targetScroll = scrollRatio * maxScroll;

    carouselRef.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        document.body.style.userSelect = '';
      }
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging && carouselRef.current && scrollbarRef.current) {
        const x = e.clientX;
        const deltaX = x - startX;

        const scrollbarWidth = scrollbarRef.current.clientWidth;

        // The scroll track width (total width minus thumb width)
        const scrollTrackWidth = scrollbarWidth - thumbWidth;

        // How much to scroll the carousel for each pixel of thumb movement
        const { scrollWidth, clientWidth } = carouselRef.current;
        const scrollRatio = (scrollWidth - clientWidth) / scrollTrackWidth;

        // Move the carousel
        carouselRef.current.scrollLeft = scrollLeft + (deltaX * scrollRatio);
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('mousemove', handleGlobalMouseMove);

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [isDragging, startX, scrollLeft, thumbWidth]);

  return (
    <div className="relative w-full">
      {/* Left Arrow */}
      {showLeftArrow && (
        <button
          className="absolute left-[-36px] top-1/2 transform -translate-y-1/2 z-10 bg-white dark:bg-gray-800 rounded-full p-2 shadow-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
          onClick={() => scroll('left')}
          aria-label="Scroll left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Book Cards */}
      <div
        ref={carouselRef}
        className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {books.map(book => (
          <div key={book.id} className="flex-shrink-0" style={{ width: '300px' }}>
            <BookCard
              book={book}
              onClick={onBookSelect}
              disabled={disabled}
            />
          </div>
        ))}
      </div>

      {/* Custom Scrollbar */}
      <div
        ref={scrollbarRef}
        className="h-2 bg-gray-100 dark:bg-gray-800/50 rounded-full mt-4 cursor-pointer relative"
        onClick={handleScrollbarClick}
      >
        <div
          ref={thumbRef}
          className={`absolute top-0 h-full bg-purple-300 hover:bg-purple-400 dark:bg-purple-400/50 dark:hover:bg-purple-400/70 rounded-full 
            transition-colors duration-200 cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
          style={{
            width: `${thumbWidth}px`,
            left: `${thumbPosition}px`,
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
      </div>

      {/* Right Arrow */}
      {showRightArrow && (
        <button
          className="absolute right-[-36px] top-1/2 transform -translate-y-1/2 z-10 bg-white dark:bg-gray-800 rounded-full p-2 shadow-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
          onClick={() => scroll('right')}
          aria-label="Scroll right"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}

// This will hide scrollbars in modern browsers
// const scrollbarHideStyles = `
// .scrollbar-hide::-webkit-scrollbar {
//   display: none;
// }
// `; 