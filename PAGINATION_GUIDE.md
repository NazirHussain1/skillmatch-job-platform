# Job Listings Pagination System

## Features Added ✅

### Backend (Already Implemented)
- ✅ `GET /api/jobs` accepts `page` and `limit` query parameters
- ✅ Returns pagination metadata (page, limit, total, pages)
- ✅ Works seamlessly with search and filter parameters
- ✅ Default: 10 items per page

### Frontend Changes
- ✅ Created reusable `Pagination` component
- ✅ Updated `jobSlice` to store pagination data
- ✅ Updated `jobService` to return full response with pagination
- ✅ Updated Jobs page to use pagination
- ✅ Set default to 9 jobs per page (3x3 grid)
- ✅ Maintains filters while paginating
- ✅ Resets to page 1 when filters change
- ✅ Shows current page range (e.g., "Showing 1 to 9 of 25 jobs")
- ✅ Auto-scrolls to top on page change

## Pagination Component

### Features
- Smart page number display with ellipsis
- Previous/Next buttons
- Disabled state for first/last pages
- Responsive design
- Accessible (ARIA labels)
- Smooth transitions

### Display Logic
- Shows all pages if total ≤ 5
- Shows first, last, and pages around current
- Uses ellipsis (...) for gaps
- Always shows first and last page

### Examples
```
Total 3 pages:  [1] [2] [3]
Total 10 pages, on page 1:  [1] [2] [3] [4] [...] [10]
Total 10 pages, on page 5:  [1] [...] [4] [5] [6] [...] [10]
Total 10 pages, on page 10: [1] [...] [7] [8] [9] [10]
```

## API Usage

### Request
```bash
GET /api/jobs?page=2&limit=9&keyword=developer&location=remote
```

### Response
```json
{
  "success": true,
  "message": "Jobs retrieved successfully",
  "data": {
    "jobs": [...],
    "pagination": {
      "page": 2,
      "limit": 9,
      "total": 25,
      "pages": 3
    }
  }
}
```

## State Management

### jobSlice State
```javascript
{
  jobs: [],
  pagination: {
    page: 1,
    limit: 9,
    total: 0,
    pages: 0
  },
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: ''
}
```

### Jobs Page State
```javascript
const [searchParams, setSearchParams] = useState({
  keyword: '',
  location: '',
  salary: '',
  page: 1,
  limit: 9,
});
```

## User Flow

### 1. Initial Load
- Page loads with default params (page: 1, limit: 9)
- Shows first 9 jobs
- Displays pagination if total > 9

### 2. Navigating Pages
- User clicks page number or next/prev button
- `handlePageChange(page)` is called
- Updates `searchParams.page`
- Maintains all filters
- Scrolls to top smoothly
- Fetches new page of results

### 3. Searching/Filtering
- User enters search criteria
- Clicks "Search" button
- Resets to page 1
- Applies filters
- Shows filtered results with pagination

### 4. Removing Filters
- User clicks X on filter chip or "Clear Filters"
- Resets to page 1
- Removes filter
- Shows updated results

## Key Functions

### handlePageChange
```javascript
const handlePageChange = (page) => {
  setSearchParams({
    ...searchParams,
    page,
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
```

### handleSearch
```javascript
const handleSearch = (e) => {
  e.preventDefault();
  setSearchParams({
    ...filters,
    page: 1, // Reset to page 1
    limit: 9,
  });
};
```

### handleClearFilters
```javascript
const handleClearFilters = () => {
  setFilters({
    keyword: '',
    location: '',
    salary: '',
  });
  setSearchParams({
    keyword: '',
    location: '',
    salary: '',
    page: 1,
    limit: 9,
  });
};
```

## Results Display

Shows current range and total:
```
Showing 1 to 9 of 25 jobs
Showing 10 to 18 of 25 jobs
Showing 19 to 25 of 25 jobs
```

Calculation:
```javascript
const start = ((pagination.page - 1) * pagination.limit) + 1;
const end = Math.min(pagination.page * pagination.limit, pagination.total);
```

## Styling

### Pagination Component
- Previous/Next buttons with chevron icons
- Active page: Primary color background
- Inactive pages: Border with hover effect
- Disabled buttons: Gray with cursor-not-allowed
- Ellipsis: Gray text, not clickable

### Responsive Design
- Mobile: Smaller buttons, fewer visible pages
- Tablet/Desktop: Full pagination display
- Grid adjusts: 1 column (mobile) → 2 (tablet) → 3 (desktop)

## Performance Considerations

### Optimizations
1. **Lazy Loading**: Only loads current page data
2. **Smooth Scrolling**: Better UX on page change
3. **State Management**: Redux caches pagination data
4. **Efficient Queries**: Backend uses skip/limit for performance

### Best Practices
- Default limit: 9 (fits 3x3 grid nicely)
- Can be adjusted based on screen size
- Backend indexes on frequently queried fields
- Pagination metadata prevents unnecessary counts

## Testing Scenarios

### Test Cases
1. **First Page**: Previous button disabled
2. **Last Page**: Next button disabled
3. **Middle Page**: Both buttons enabled
4. **Single Page**: No pagination shown
5. **Page Change**: Maintains filters
6. **Filter Change**: Resets to page 1
7. **Empty Results**: Shows "No jobs found"
8. **Loading State**: Shows spinner

### Manual Testing
1. Create 30+ test jobs
2. Navigate through pages
3. Apply filters and paginate
4. Remove filters and check page reset
5. Test on mobile, tablet, desktop
6. Test with different result counts

## Customization

### Change Items Per Page
```javascript
// In Jobs.jsx
const [searchParams, setSearchParams] = useState({
  // ...
  limit: 12, // Change from 9 to 12
});
```

### Change Grid Layout
```javascript
// In Jobs.jsx, update grid classes
<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
  {/* For 12 items: 3 cols (tablet) → 4 cols (desktop) */}
</div>
```

### Customize Pagination Display
```javascript
// In Pagination.jsx
const maxVisible = 7; // Show more page numbers
```

## Accessibility

### ARIA Labels
- Previous button: `aria-label="Previous page"`
- Next button: `aria-label="Next page"`
- Page buttons: Implicit label from text

### Keyboard Navigation
- Tab through buttons
- Enter/Space to activate
- Focus visible on all interactive elements

### Screen Readers
- Announces current page
- Announces total pages
- Announces disabled state

## Future Enhancements

Potential improvements:
- [ ] Add "Jump to page" input
- [ ] Add items per page selector (9, 18, 27)
- [ ] Add "Load more" infinite scroll option
- [ ] Add keyboard shortcuts (arrow keys)
- [ ] Add URL query params for shareable links
- [ ] Add page prefetching for faster navigation
- [ ] Add animation on page change
- [ ] Add "Back to top" button
- [ ] Add page history (browser back/forward)
- [ ] Add total results in page title

## Troubleshooting

### Pagination not showing
- Check if `pagination.pages > 1`
- Verify backend returns pagination data
- Check Redux state in DevTools

### Wrong page count
- Verify `total` count from backend
- Check `limit` value
- Ensure `Math.ceil(total / limit)` calculation

### Filters not maintained
- Ensure `searchParams` includes all filters
- Check `handlePageChange` spreads existing params
- Verify Redux state updates correctly

### Page doesn't scroll to top
- Check `window.scrollTo` is called
- Verify `behavior: 'smooth'` is supported
- Add polyfill for older browsers if needed

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support
- IE11: Requires polyfills for smooth scroll
