import React, { useState, useRef, useEffect } from 'react';
import { Info, X } from 'lucide-react';

interface InfoTooltipProps {
  title: string;
  explanation: string;
  interpretation?: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ 
  title, 
  explanation, 
  interpretation,
  position = 'top'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [appliedPosition, setAppliedPosition] = useState(position);

  // Calculate tooltip position when it opens or window resizes
  useEffect(() => {
    if (!isOpen || !tooltipRef.current || !buttonRef.current) return;

    const calculatePosition = () => {
      if (!tooltipRef.current || !buttonRef.current) return;

      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Get the parent elements to calculate offset position
      let parentNode = buttonRef.current.parentElement;
      let offsetLeft = 0;
      let offsetTop = 0;
      
      while (parentNode && parentNode !== document.body) {
        offsetLeft += parentNode.scrollLeft;
        offsetTop += parentNode.scrollTop;
        parentNode = parentNode.parentElement;
      }

      // Default positions
      let newPosition = { top: 0, left: 0 };
      let bestPosition = position;

      // Check each position and find the best one that fits within viewport
      // Start with preferred position
      const positions: ('top' | 'right' | 'bottom' | 'left')[] = [position, 'top', 'right', 'bottom', 'left'];
      
      for (const pos of positions) {
        if (pos === 'top') {
          newPosition = {
            top: buttonRect.top - tooltipRect.height - 8,
            left: buttonRect.left + (buttonRect.width / 2) - (tooltipRect.width / 2)
          };
        } else if (pos === 'right') {
          newPosition = {
            top: buttonRect.top + (buttonRect.height / 2) - (tooltipRect.height / 2),
            left: buttonRect.right + 8
          };
        } else if (pos === 'bottom') {
          newPosition = {
            top: buttonRect.bottom + 8,
            left: buttonRect.left + (buttonRect.width / 2) - (tooltipRect.width / 2)
          };
        } else if (pos === 'left') {
          newPosition = {
            top: buttonRect.top + (buttonRect.height / 2) - (tooltipRect.height / 2),
            left: buttonRect.left - tooltipRect.width - 8
          };
        }

        // Check if this position is fully visible
        const isVisible = 
          newPosition.top >= 0 && 
          newPosition.left >= 0 && 
          newPosition.top + tooltipRect.height <= viewportHeight &&
          newPosition.left + tooltipRect.width <= viewportWidth;

        if (isVisible) {
          bestPosition = pos;
          break;
        }
      }

      // Final position adjustments to keep tooltip within viewport bounds
      if (newPosition.top < 0) newPosition.top = 8;
      if (newPosition.left < 0) newPosition.left = 8;
      if (newPosition.top + tooltipRect.height > viewportHeight) {
        newPosition.top = viewportHeight - tooltipRect.height - 8;
      }
      if (newPosition.left + tooltipRect.width > viewportWidth) {
        newPosition.left = viewportWidth - tooltipRect.width - 8;
      }

      setTooltipPosition(newPosition);
      setAppliedPosition(bestPosition);
    };

    // Calculate position immediately when tooltip opens
    calculatePosition();

    // Recalculate on window resize
    window.addEventListener('resize', calculatePosition);
    window.addEventListener('scroll', calculatePosition, true);
    
    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition, true);
    };
  }, [isOpen, position]);

  // Handle clicks outside to close the tooltip
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node) && 
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get arrow position based on the applied position
  const getArrowStyles = () => {
    switch (appliedPosition) {
      case 'top':
        return 'after:content-[""] after:absolute after:bottom-[-6px] after:left-1/2 after:transform after:-translate-x-1/2 after:border-l-[6px] after:border-l-transparent after:border-r-[6px] after:border-r-transparent after:border-t-[6px] after:border-t-white';
      case 'right':
        return 'after:content-[""] after:absolute after:left-[-6px] after:top-1/2 after:transform after:-translate-y-1/2 after:border-t-[6px] after:border-t-transparent after:border-b-[6px] after:border-b-transparent after:border-r-[6px] after:border-r-white';
      case 'bottom':
        return 'after:content-[""] after:absolute after:top-[-6px] after:left-1/2 after:transform after:-translate-x-1/2 after:border-l-[6px] after:border-l-transparent after:border-r-[6px] after:border-r-transparent after:border-b-[6px] after:border-b-white';
      case 'left':
        return 'after:content-[""] after:absolute after:right-[-6px] after:top-1/2 after:transform after:-translate-y-1/2 after:border-t-[6px] after:border-t-transparent after:border-b-[6px] after:border-b-transparent after:border-l-[6px] after:border-l-white';
      default:
        return '';
    }
  };

  return (
    <span className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="ml-1 p-1 text-gray-400 hover:text-blue-500 focus:outline-none transition-colors"
        aria-label="More information"
      >
        <Info className="w-4 h-4" />
      </button>

      {isOpen && (
        <div 
          ref={tooltipRef}
          className={`fixed z-50 w-64 bg-white border border-gray-200 shadow-lg rounded-md p-3 ${getArrowStyles()}`}
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
        >
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-gray-800">{title}</h4>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="text-sm text-gray-600 mb-2">
            <span className="block">{explanation}</span>
          </div>

          {interpretation && (
            <>
              <h5 className="font-medium text-gray-700 mt-3 mb-1">What this means:</h5>
              <span className="block text-sm text-gray-600">{interpretation}</span>
            </>
          )}
        </div>
      )}
    </span>
  );
}; 