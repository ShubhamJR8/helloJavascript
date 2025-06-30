import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, SortAsc, SortDesc, Tag, User, Star } from 'lucide-react';

const BlogFilters = ({ 
  filters = {},
  onFiltersChange, 
  categories = [],
  showTopicFilter = true
}) => {
  const [search, setSearch] = useState(filters.search || '');
  const [category, setCategory] = useState(filters.category || '');
  const [sortBy, setSortBy] = useState(filters.sortBy || 'publishedAt');
  const [sortOrder, setSortOrder] = useState(filters.sortOrder || 'desc');
  const [tag, setTag] = useState(filters.tag || '');
  const [author, setAuthor] = useState(filters.author || '');
  const [featured, setFeatured] = useState(filters.featured || false);
  const [searchError, setSearchError] = useState('');

  // Memoize the filter change handler
  const handleFilterChange = useCallback(() => {
    // Only trigger search if 3+ chars or empty (reset)
    if (search.length === 0 || search.length >= 3) {
      setSearchError('');
      onFiltersChange({
        search,
        category,
        sortBy,
        sortOrder,
        tag,
        author,
        featured
      });
    } else {
      setSearchError('Enter at least 3 characters to search');
      // Still update other filters
      onFiltersChange({
        search: '',
        category,
        sortBy,
        sortOrder,
        tag,
        author,
        featured
      });
    }
  }, [search, category, sortBy, sortOrder, tag, author, featured, onFiltersChange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleFilterChange();
    }, 300); // Debounce

    return () => clearTimeout(timer);
  }, [handleFilterChange]);

  const handleSortChange = useCallback((newSort) => {
    if (sortBy === newSort) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSort);
      setSortOrder('desc');
    }
  }, [sortBy, sortOrder]);

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setCategory('');
    setTag('');
    setAuthor('');
    setFeatured(false);
    setSearchError('');
  }, []);

  const hasActiveFilters = search || category || tag || author || featured;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search blogs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          {search.length > 0 && search.length < 3 && (
            <span className="absolute left-0 top-full mt-1 text-xs text-red-500">
              {searchError}
            </span>
          )}
        </div>

        {/* Category Filter */}
        {showTopicFilter && (
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tag Filter */}
        <div className="relative">
          <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Filter by tag..."
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Author Filter */}
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Filter by author..."
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Sort By */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
          >
            <option value="publishedAt">Date Published</option>
            <option value="title">Title</option>
            <option value="views">Most Viewed</option>
            <option value="likes">Most Liked</option>
            <option value="readTime">Read Time</option>
          </select>
        </div>

        {/* Sort Order */}
        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {sortOrder === 'asc' ? <SortAsc size={20} /> : <SortDesc size={20} />}
          <span className="text-sm font-medium">
            {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          </span>
        </button>

        {/* Featured Filter */}
        <button
          onClick={() => setFeatured(!featured)}
          className={`flex items-center justify-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
            featured
              ? 'bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200'
              : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Star size={20} className={featured ? 'fill-current' : ''} />
          <span className="text-sm font-medium">
            {featured ? 'Featured Only' : 'Show Featured'}
          </span>
        </button>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {search && (
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                Search: "{search}"
                <button
                  onClick={() => setSearch('')}
                  className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                >
                  ×
                </button>
              </span>
            )}
            {category && (
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                Category: {category}
                <button
                  onClick={() => setCategory('')}
                  className="ml-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                >
                  ×
                </button>
              </span>
            )}
            {tag && (
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Tag: {tag}
                <button
                  onClick={() => setTag('')}
                  className="ml-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
                >
                  ×
                </button>
              </span>
            )}
            {author && (
              <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-sm">
                Author: {author}
                <button
                  onClick={() => setAuthor('')}
                  className="ml-2 text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200"
                >
                  ×
                </button>
              </span>
            )}
            {featured && (
              <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-sm">
                Featured only
                <button
                  onClick={() => setFeatured(false)}
                  className="ml-2 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={handleClearFilters}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogFilters; 