import { useState } from 'react';

interface Props {
  content: string;
}

export function InfoTooltip({ content }: Props) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span className="relative inline-block ml-1">
      <button
        type="button"
        className="w-4 h-4 inline-flex items-center justify-center text-xs bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 cursor-help"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
      >
        ?
      </button>
      {isVisible && (
        <div className="absolute z-50 w-64 p-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg shadow-lg -left-28 top-6">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-gray-200 rotate-45" />
          <p className="relative">{content}</p>
        </div>
      )}
    </span>
  );
}
