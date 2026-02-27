# Quick Start Guide - Code Quality Improvements

## What's New?

### 1. API Documentation (Swagger)
Access interactive API documentation at:
```
http://localhost:5000/api-docs
```

Features:
- Try out API endpoints directly from browser
- View request/response schemas
- See authentication requirements
- Download OpenAPI spec

### 2. Centralized Constants
All application constants are now in one place:
```typescript
import { 
  USER_ROLES, 
  HTTP_STATUS, 
  ERROR_MESSAGES,
  MATCHING_CONSTANTS 
} from './config/app.constants.js';
```

### 3. TypeScript Support
Critical services now use TypeScript for type safety:
- Matching service
- Constants configuration
- Swagger configuration

Build TypeScript files:
```bash
npm run build         # Compile once
npm run build:watch   # Watch mode
```

### 4. Cleaned Dependencies
Removed 7 unused packages:
- bull, crypto, crypto-js, joi, morgan, nodemailer, redis

Install dependencies:
```bash
cd server
npm install
```

### 5. ER Diagram
Complete database schema documentation:
```
server/ER_DIAGRAM.md
```

---

## Quick Commands

### Development
```bash
npm run dev          # Start with hot reload
npm run build        # Compile TypeScript
npm run build:watch  # Watch TypeScript files
```

### Testing
```bash
npm test                # Run all tests
npm run test:unit       # Unit tests only
npm run test:integration # Integration tests only
npm run test:coverage   # With coverage report
npm run load:test       # Load testing
```

### Production
```bash
npm run build        # Compile TypeScript
npm start            # Start server
```

---

## File Structure

```
server/
├── src/
│   ├── config/
│   │   ├── app.constants.ts      # ✨ NEW: Centralized constants
│   │   └── constants.js           # Deprecated (re-exports from above)
│   ├── swagger/
│   │   └── swagger.config.ts      # ✨ NEW: API documentation config
│   ├── modules/
│   │   └── matching/
│   │       ├── matching.service.ts # ✨ NEW: TypeScript version
│   │       └── matching.service.js # Old version (can be removed)
│   └── app.js                     # ✨ UPDATED: Swagger integration
├── ER_DIAGRAM.md                  # ✨ NEW: Database schema
├── CODE_QUALITY_SUMMARY.md        # ✨ NEW: Improvements summary
├── QUICK_START_GUIDE.md           # ✨ NEW: This file
├── tsconfig.json                  # ✨ NEW: TypeScript config
└── package.json                   # ✨ UPDATED: Dependencies cleaned
```

---

## Using Swagger Documentation

### Access Swagger UI
1. Start the server: `npm run dev`
2. Open browser: `http://localhost:5000/api-docs`
3. Explore endpoints and try them out

### Authentication in Swagger
1. Click "Authorize" button
2. Enter JWT token: `Bearer <your-token>`
3. Click "Authorize"
4. Now you can test protected endpoints

### Download OpenAPI Spec
```bash
curl http://localhost:5000/api-docs.json > openapi.json
```

---

## Using Centralized Constants

### Before (Deprecated)
```javascript
const status = 'Pending';
const role = 'JOB_SEEKER';
```

### After (Recommended)
```javascript
import { APPLICATION_STATUS, USER_ROLES } from './config/app.constants.js';

const status = APPLICATION_STATUS.PENDING;
const role = USER_ROLES.JOB_SEEKER;
```

### Benefits
- Type safety with TypeScript
- Autocomplete in IDE
- No typos
- Easy to update

---

## TypeScript Migration

### Current Status
- ✅ Constants (app.constants.ts)
- ✅ Swagger config (swagger.config.ts)
- ✅ Matching service (matching.service.ts)
- ⏳ Other services (future)

### Running TypeScript Files
Node.js can run .ts files directly in development. For production, compile first:

```bash
# Development (no compilation needed)
npm run dev

# Production
npm run build  # Creates dist/ folder
npm start      # Runs compiled JavaScript
```

---

## Database Schema Reference

### Quick Access
View complete ER diagram:
```bash
cat server/ER_DIAGRAM.md
```

### Key Entities
- **User**: Job seekers, employers, admins
- **Job**: Job postings with full-text search
- **Application**: Job applications with match scores
- **Notification**: Real-time notifications
- **SearchHistory**: User search tracking

### Relationships
- User → Job (1:N) - Employer creates jobs
- User → Application (1:N) - Job seeker applies
- Job → Application (1:N) - Job receives applications
- User → Notification (1:N) - User receives notifications

---

## Common Tasks

### Add New Constant
1. Open `src/config/app.constants.ts`
2. Add to appropriate section
3. Export in CONSTANTS object
4. Use throughout application

### Add New API Endpoint
1. Create route in module
2. Add JSDoc comments for Swagger
3. Test in Swagger UI
4. Documentation auto-generated

### Migrate Service to TypeScript
1. Create `.ts` version of file
2. Add type annotations
3. Import from `app.constants.ts`
4. Update imports in other files
5. Test thoroughly
6. Remove old `.js` file

---

## Troubleshooting

### TypeScript Errors
```bash
# Check for errors
npm run build

# Fix by adding types or using 'any' temporarily
```

### Swagger Not Loading
```bash
# Check if server is running
curl http://localhost:5000/health/live

# Check Swagger endpoint
curl http://localhost:5000/api-docs.json
```

### Import Errors
```bash
# Use .js extension even for .ts files (ESM requirement)
import { CONSTANTS } from './app.constants.js'; // ✅ Correct
import { CONSTANTS } from './app.constants.ts'; // ❌ Wrong
```

---

## Best Practices

### 1. Use Constants
```javascript
// ❌ Bad
if (user.role === 'job_seeker') { ... }

// ✅ Good
import { USER_ROLES } from '@config/app.constants.js';
if (user.role === USER_ROLES.JOB_SEEKER) { ... }
```

### 2. Document APIs
```javascript
/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Get all jobs
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', controller.getJobs);
```

### 3. Type Safety
```typescript
// Use TypeScript for complex logic
interface MatchResult {
  score: number;
  matched: string[];
  missing: string[];
}

function calculateMatch(user: User, job: Job): MatchResult {
  // Implementation
}
```

---

## Resources

- **API Docs**: http://localhost:5000/api-docs
- **ER Diagram**: `server/ER_DIAGRAM.md`
- **Code Quality Summary**: `server/CODE_QUALITY_SUMMARY.md`
- **Architecture**: `server/ARCHITECTURE.md`
- **Security**: `server/SECURITY.md`
- **Monitoring**: `server/MONITORING.md`

---

## Support

For questions or issues:
1. Check documentation files
2. Review Swagger API docs
3. Check ER diagram for data model
4. Review code quality summary

---

**Last Updated**: February 2026
**Version**: 1.0.0
