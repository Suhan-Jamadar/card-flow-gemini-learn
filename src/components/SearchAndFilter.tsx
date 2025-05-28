
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, SortAsc, SortDesc, Filter, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export type SortOption = 'name-asc' | 'name-desc' | 'date-asc' | 'date-desc' | 'priority';
export type FilterOption = 'all' | 'read' | 'unread' | 'high' | 'medium' | 'low';

interface SearchAndFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  filterBy: FilterOption;
  setFilterBy: (filter: FilterOption) => void;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({ 
  searchTerm, 
  setSearchTerm,
  sortBy,
  setSortBy,
  filterBy,
  setFilterBy
}) => {
  const getSortLabel = (sort: SortOption) => {
    switch (sort) {
      case 'name-asc': return 'Name (A-Z)';
      case 'name-desc': return 'Name (Z-A)';
      case 'date-asc': return 'Date (Oldest)';
      case 'date-desc': return 'Date (Newest)';
      case 'priority': return 'Priority (High to Low)';
      default: return 'Sort';
    }
  };

  const getFilterLabel = (filter: FilterOption) => {
    switch (filter) {
      case 'all': return 'All Cards';
      case 'read': return 'Read Only';
      case 'unread': return 'Unread Only';
      case 'high': return 'High Priority';
      case 'medium': return 'Medium Priority';
      case 'low': return 'Low Priority';
      default: return 'Filter';
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSortBy('date-desc');
    setFilterBy('all');
  };

  const hasActiveFilters = searchTerm || filterBy !== 'all' || sortBy !== 'date-desc';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search flashcard sets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-lg border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
          />
        </div>

        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-12 min-w-[150px] justify-between">
              {sortBy === 'name-asc' || sortBy === 'date-asc' ? (
                <SortAsc className="h-4 w-4 mr-2" />
              ) : (
                <SortDesc className="h-4 w-4 mr-2" />
              )}
              {getSortLabel(sortBy)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => setSortBy('name-asc')}>
              <SortAsc className="h-4 w-4 mr-2" />
              Name (A-Z)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('name-desc')}>
              <SortDesc className="h-4 w-4 mr-2" />
              Name (Z-A)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSortBy('date-desc')}>
              <SortDesc className="h-4 w-4 mr-2" />
              Date (Newest)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('date-asc')}>
              <SortAsc className="h-4 w-4 mr-2" />
              Date (Oldest)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSortBy('priority')}>
              <SortDesc className="h-4 w-4 mr-2" />
              Priority (High to Low)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-12 min-w-[150px] justify-between">
              <Filter className="h-4 w-4 mr-2" />
              {getFilterLabel(filterBy)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => setFilterBy('all')}>
              All Cards
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setFilterBy('read')}>
              Read Only
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterBy('unread')}>
              Unread Only
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setFilterBy('high')}>
              High Priority
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterBy('medium')}>
              Medium Priority
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterBy('low')}>
              Low Priority
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            onClick={clearFilters}
            className="h-12 px-3"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-4">
          {searchTerm && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: "{searchTerm}"
              <button onClick={() => setSearchTerm('')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filterBy !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Filter: {getFilterLabel(filterBy)}
              <button onClick={() => setFilterBy('all')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {sortBy !== 'date-desc' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Sort: {getSortLabel(sortBy)}
              <button onClick={() => setSortBy('date-desc')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
