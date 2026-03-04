# Job Search and Filtering System

## Features Added ✅

### Backend Changes
- ✅ Modified `GET /api/jobs` endpoint to accept query parameters
- ✅ Added keyword search (searches in title, company, description)
- ✅ Added location filter (case-insensitive regex)
- ✅ Added minimum salary filter
- ✅ Implemented pagination compatible with filtering
- ✅ Returns total count and pagination metadata

### Frontend Changes
- ✅ Added search bar with keyword input
- ✅ Added collapsible filter section
- ✅ Added location filter input
- ✅ Added minimum salary dropdown
- ✅ Added active filters display with remove buttons
- ✅ Added clear all filters button
- ✅ Added results count display
- ✅ Added empty state when no jobs found
- ✅ Updated jobService to send query parameters

## API Endpoint

### GET /api/jobs

**Query Parameters:**
- `keyword` (string, optional) - Searches in job title, company name, and description
- `location` (string, optional) - Filters by location (case-insensitive)
- `salary` (number, optional) - Minimum salary filter
- `page` (number, optional, default: 1) - Page number for pagination
- `limit` (number, optional, default: 10) - Items per page

**Example Requests:**

```bash
# Search by keyword
GET /api/jobs?keyword=developer

# Filter by location
GET /api/jobs?location=New York

# Filter by minimum salary
GET /api/jobs?salary=50000

# Combine multiple filters
GET /api/jobs?keyword=react&location=remote&salary=70000

# With pagination
GET /api/jobs?keyword=engineer&page=2&limit=20
```

**Response Format:**

```json
{
  "success": true,
  "message": "Jobs retrieved successfully",
  "data": {
    "jobs": [
      {
        "_id": "...",
        "title": "Senior Developer",
        "company": "Tech Corp",
        "description": "...",
        "location": "New York",
        "salary": 80000,
        "employer": {
          "_id": "...",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

## How It Works

### Backend Logic

1. **Keyword Search**: Uses MongoDB `$regex` with case-insensitive flag (`i`) to search across:
   - Job title
   - Company name
   - Job description
   - Uses `$or` operator to match any of these fields

2. **Location Filter**: Uses `$regex` for partial, case-insensitive matching
   - "New York" matches "New York, NY" and "New York City"
   - "Remote" matches "Remote - USA" and "Fully Remote"

3. **Salary Filter**: Uses `$gte` (greater than or equal) operator
   - Only shows jobs with salary >= specified amount

4. **Pagination**: 
   - Calculates skip value: `(page - 1) * limit`
   - Returns total count for pagination UI
   - Compatible with all filters

### Frontend Flow

1. User enters search criteria in the UI
2. Filters are stored in local state
3. On search button click or filter change, `searchParams` state updates
4. `useEffect` detects `searchParams` change and dispatches `getJobs(searchParams)`
5. jobService builds query string from parameters
6. API request is made with query parameters
7. Results are displayed with active filters shown
8. User can remove individual filters or clear all

## UI Components

### Search Bar
- Full-width input with search icon
- Searches across title, company, and description
- Real-time input, searches on button click or Enter key

### Filter Section
- Collapsible panel (toggle with "Filters" button)
- Location input field
- Salary dropdown with preset ranges
- Clear filters button

### Active Filters Display
- Shows applied filters as removable chips
- Each chip has an X button to remove that filter
- Automatically updates when filters change

### Results Display
- Shows count of results found
- Grid layout for job cards
- Empty state with icon when no results
- Loading spinner during search

## Salary Ranges

Predefined salary ranges in dropdown:
- Any (no filter)
- $30,000+
- $50,000+
- $70,000+
- $100,000+
- $150,000+

## Usage Examples

### Search by Keyword
1. Enter "developer" in search bar
2. Click Search
3. Shows all jobs with "developer" in title, company, or description

### Filter by Location
1. Click "Filters" button
2. Enter "Remote" in location field
3. Click Search
4. Shows all remote jobs

### Filter by Salary
1. Click "Filters" button
2. Select "$70,000+" from salary dropdown
3. Click Search
4. Shows jobs with salary >= $70,000

### Combine Filters
1. Enter "react" in search bar
2. Click "Filters"
3. Enter "New York" in location
4. Select "$100,000+" from salary
5. Click Search
6. Shows React jobs in New York with $100k+ salary

### Remove Filters
- Click X on individual filter chip to remove that filter
- Click "Clear Filters" to remove all filters
- Results update automatically

## Technical Details

### MongoDB Query Example

```javascript
// Input: keyword="developer", location="remote", salary=50000
const filter = {
  $or: [
    { title: { $regex: "developer", $options: "i" } },
    { company: { $regex: "developer", $options: "i" } },
    { description: { $regex: "developer", $options: "i" } }
  ],
  location: { $regex: "remote", $options: "i" },
  salary: { $gte: 50000 }
};

const jobs = await Job.find(filter)
  .populate('employer', 'name email')
  .sort({ createdAt: -1 })
  .limit(10)
  .skip(0);
```

### Performance Considerations

1. **Indexes**: Consider adding indexes for better performance:
   ```javascript
   // In Job model
   jobSchema.index({ title: 'text', company: 'text', description: 'text' });
   jobSchema.index({ location: 1 });
   jobSchema.index({ salary: 1 });
   ```

2. **Pagination**: Always use pagination to limit results
3. **Regex Performance**: Regex searches can be slow on large datasets
   - Consider using MongoDB text search for production
   - Add indexes on frequently searched fields

## Future Enhancements

Potential improvements:
- [ ] Add job type filter (full-time, part-time, contract)
- [ ] Add experience level filter (entry, mid, senior)
- [ ] Add date posted filter (last 24h, last week, last month)
- [ ] Add sort options (newest, salary high-low, salary low-high)
- [ ] Add saved searches functionality
- [ ] Add search suggestions/autocomplete
- [ ] Add advanced search with boolean operators
- [ ] Add skills/tags filter
- [ ] Add company size filter
- [ ] Add remote/hybrid/onsite filter

## Testing

### Test Cases

1. **Empty Search**: Should return all jobs
2. **Keyword Only**: Should search across title, company, description
3. **Location Only**: Should filter by location
4. **Salary Only**: Should show jobs >= specified salary
5. **Combined Filters**: Should apply all filters together
6. **No Results**: Should show empty state
7. **Clear Filters**: Should reset to all jobs
8. **Pagination**: Should work with filters applied

### Manual Testing Steps

1. Start servers (backend and frontend)
2. Create test jobs with various:
   - Titles (Developer, Designer, Manager)
   - Locations (New York, Remote, San Francisco)
   - Salaries (30k, 50k, 80k, 120k)
3. Test each filter individually
4. Test filter combinations
5. Test clearing filters
6. Test pagination with filters
7. Test empty results scenario

## Troubleshooting

### No results showing
- Check if jobs exist in database
- Check browser console for errors
- Verify API endpoint is responding
- Check if filters are too restrictive

### Filters not working
- Check backend logs for errors
- Verify query parameters are being sent
- Check MongoDB query in backend
- Verify jobService is building query string correctly

### Pagination not working with filters
- Ensure filters are passed to pagination requests
- Check if total count is calculated with filters
- Verify page/limit parameters are sent correctly
