import React, { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';

interface SearchableMultiSelectProps {
  options: string[];
  selectedValues: string[];
  onSelectionChange: (selected: string[]) => void;
  placeholder?: string;
  label?: string;
  loading?: boolean;
  maxSelections?: number;
  onMaxSelectionReached?: (max: number) => void;
}

const SearchableMultiSelect: React.FC<SearchableMultiSelectProps> = ({
  options,
  selectedValues,
  onSelectionChange,
  placeholder = "Search and select skills...",
  label,
  loading = false,
  maxSelections,
  onMaxSelectionReached
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  useEffect(() => {
    const filtered = options.filter(option =>
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [searchTerm, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleOption = (option: string) => {
    if (selectedValues.includes(option)) {
      onSelectionChange(selectedValues.filter(val => val !== option));
    } else {
      if (maxSelections && selectedValues.length >= maxSelections) {
        onMaxSelectionReached?.(maxSelections);
        return;
      }

      onSelectionChange([...selectedValues, option]);
    }
  };

  const handleRemoveSelected = (option: string) => {
    onSelectionChange(selectedValues.filter(val => val !== option));
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    inputRef.current?.focus();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-secondary-text font-medium mb-2">
          {label}
        </label>
      )}
      
      {/* Selected Skills Display */}
      {selectedValues.length > 0 && (
        <div className="mb-2">
          <div className="flex flex-wrap gap-1">
            {selectedValues.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center px-2 py-1 bg-accent text-white text-xs rounded-full"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSelected(skill)}
                  className="ml-1 hover:bg-accent-hover rounded-full p-0.5"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Dropdown Trigger */}
      <div
        className="relative cursor-pointer"
        onClick={handleInputFocus}
      >
        <div className="flex items-center justify-between w-full bg-surface border border-border-color rounded-lg px-4 py-3 text-primary-text placeholder-secondary-text/70 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-300">
          <div className="flex items-center flex-1">
            <MagnifyingGlassIcon className="w-4 h-4 text-secondary-text mr-2" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className="flex-1 bg-transparent outline-none"
            />
          </div>
          <ChevronDownIcon 
            className={`w-4 h-4 text-secondary-text transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-surface border border-border-color rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-secondary-text">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent mx-auto"></div>
              <p className="mt-2 text-sm">Loading skills...</p>
            </div>
          ) : filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option}
                className={`px-4 py-2 cursor-pointer hover:bg-muted transition-colors ${
                  selectedValues.includes(option) ? 'bg-accent-light text-accent' : 'text-primary-text'
                }`}
                onClick={() => handleToggleOption(option)}
              >
                <div className="flex items-center justify-between">
                  <span className="capitalize">{option}</span>
                  {selectedValues.includes(option) && (
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-secondary-text">
              <p className="text-sm">No skills found</p>
              {searchTerm && (
                <p className="text-xs mt-1">Try a different search term</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableMultiSelect;
