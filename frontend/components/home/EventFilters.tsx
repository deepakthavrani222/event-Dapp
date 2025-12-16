'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/lib/context/ThemeContext';

interface EventFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  categories: string[];
}

export interface FilterState {
  date: string | null;
  category: string | null;
}

export function EventFilters({ onFilterChange, categories }: EventFiltersProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Date filter options
  const dateFilters = [
    { id: 'today', label: 'Today' },
    { id: 'tomorrow', label: 'Tomorrow' },
    { id: 'weekend', label: 'This Weekend' },
    { id: 'week', label: 'This Week' },
  ];

  // Handle date filter click
  const handleDateFilter = (dateId: string) => {
    const newDate = activeDate === dateId ? null : dateId;
    setActiveDate(newDate);
    onFilterChange({ date: newDate, category: activeCategory });
  };

  // Handle category filter click
  const handleCategoryFilter = (category: string) => {
    const newCategory = activeCategory === category ? null : category;
    setActiveCategory(newCategory);
    onFilterChange({ date: activeDate, category: newCategory });
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveDate(null);
    setActiveCategory(null);
    onFilterChange({ date: null, category: null });
  };

  const hasActiveFilters = activeDate || activeCategory;

  return (
    <div className="w-full">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Date Filters */}
        {dateFilters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => handleDateFilter(filter.id)}
            className={`h-8 px-4 rounded-lg border transition-all text-[13px] font-medium ${
              activeDate === filter.id
                ? isDark
                  ? 'bg-white text-black border-white'
                  : 'bg-gray-900 text-white border-gray-900'
                : isDark
                  ? 'bg-transparent border-gray-600 text-white hover:bg-white/10'
                  : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
            }`}
          >
            {filter.label}
          </button>
        ))}

        {/* Category Filters - Show first 4 */}
        {categories.slice(0, 4).map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryFilter(category)}
            className={`h-8 px-4 rounded-lg border transition-all text-[13px] font-medium ${
              activeCategory === category
                ? isDark
                  ? 'bg-white text-black border-white'
                  : 'bg-gray-900 text-white border-gray-900'
                : isDark
                  ? 'bg-transparent border-gray-600 text-white hover:bg-white/10'
                  : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
            }`}
          >
            {category}
          </button>
        ))}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className={`h-8 px-2 rounded-lg flex items-center gap-1 text-[13px] font-medium transition-all ${
              isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
