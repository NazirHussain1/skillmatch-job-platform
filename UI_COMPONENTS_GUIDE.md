# UI Components Quick Reference Guide

## Buttons

### Primary Button
```jsx
<button className="btn-primary">
  <Plus className="w-5 h-5" />
  Create Job
</button>
```
**Style:** Gradient blue to purple, white text, shadow on hover

### Secondary Button
```jsx
<button className="btn-secondary">
  <LogOut className="w-5 h-5" />
  Logout
</button>
```
**Style:** White background, gray border, hover bg-gray-50

### Outline Button
```jsx
<button className="btn-outline">
  Learn More
</button>
```
**Style:** Transparent, primary border, hover bg-primary-50

---

## Cards

### Basic Card
```jsx
<div className="card">
  <h3 className="text-xl font-semibold mb-2">Title</h3>
  <p className="text-gray-600">Content</p>
</div>
```
**Style:** White bg, rounded-2xl, shadow-sm, hover:shadow-md

### Card with Hover Lift
```jsx
<div className="card hover-lift">
  {/* Content */}
</div>
```
**Style:** Lifts up on hover with shadow-lg

---

## Forms

### Input Field
```jsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Email
  </label>
  <input
    type="email"
    className="input"
    placeholder="john@example.com"
    required
  />
</div>
```

### Input with Icon
```jsx
<div className="relative">
  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
  <input
    type="email"
    className="input pl-10"
    placeholder="john@example.com"
  />
</div>
```

### Select Field
```jsx
<select className="select">
  <option value="jobseeker">Job Seeker</option>
  <option value="employer">Employer</option>
</select>
```

### Textarea
```jsx
<textarea
  className="input"
  rows="4"
  placeholder="Description"
/>
```

---

## Loading States

### Spinner
```jsx
import LoadingSpinner from '../components/LoadingSpinner';

<LoadingSpinner size="lg" text="Loading..." />
```

### Inline Spinner
```jsx
<div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
```

### Button Loading
```jsx
<button disabled={isLoading} className="btn-primary">
  {isLoading ? 'Loading...' : 'Submit'}
</button>
```

---

## Status Badges

```jsx
<span className={`px-3 py-1 rounded-full text-sm font-medium ${
  status === 'accepted' ? 'bg-green-100 text-green-700' :
  status === 'rejected' ? 'bg-red-100 text-red-700' :
  'bg-yellow-100 text-yellow-700'
}`}>
  {status}
</span>
```

---

## Icons

### Icon Container
```jsx
<div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
  <Briefcase className="w-6 h-6 text-primary-600" />
</div>
```

### Icon with Text
```jsx
<div className="flex items-center gap-2 text-gray-600">
  <MapPin className="w-4 h-4" />
  <span className="text-sm">San Francisco, CA</span>
</div>
```

---

## Layout

### Container
```jsx
<div className="container-custom">
  {/* max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 */}
</div>
```

### Grid Layout
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Items */}
</div>
```

### Flex Layout
```jsx
<div className="flex items-center justify-between">
  <div>Left content</div>
  <div>Right content</div>
</div>
```

---

## Navigation

### Desktop Nav Link
```jsx
<Link
  to="/dashboard"
  className={`px-4 py-2 rounded-xl transition ${
    isActive
      ? 'bg-primary-50 text-primary-600 font-medium'
      : 'text-gray-600 hover:text-gray-900'
  }`}
>
  Dashboard
</Link>
```

### Mobile Nav Item
```jsx
<Link
  to="/dashboard"
  className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-gray-600"
>
  <LayoutDashboard className="w-6 h-6" />
  <span className="text-xs">Dashboard</span>
</Link>
```

---

## Modal

```jsx
{showModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Modal Title</h2>
        <button onClick={() => setShowModal(false)}>
          <X className="w-6 h-6" />
        </button>
      </div>
      {/* Modal content */}
    </div>
  </div>
)}
```

---

## Empty State

```jsx
<div className="card text-center py-12">
  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
  <h3 className="text-xl font-semibold text-gray-900 mb-2">
    No Items Found
  </h3>
  <p className="text-gray-600">
    Get started by creating your first item
  </p>
</div>
```

---

## Toast Notifications

```jsx
import { toast } from 'react-hot-toast';

// Success
toast.success('Operation successful!');

// Error
toast.error('Something went wrong');

// Loading
const toastId = toast.loading('Processing...');
toast.success('Done!', { id: toastId });
```

---

## Responsive Utilities

### Show/Hide
```jsx
className="hidden md:block"     // Hidden on mobile, visible on desktop
className="md:hidden"           // Visible on mobile, hidden on desktop
className="hidden md:flex"      // Hidden on mobile, flex on desktop
```

### Text Sizes
```jsx
className="text-sm md:text-base lg:text-lg"
```

### Spacing
```jsx
className="p-4 md:p-6 lg:p-8"
className="gap-4 md:gap-6"
```

---

## Color Classes

### Text
```jsx
className="text-gray-900"      // Primary text
className="text-gray-600"      // Secondary text
className="text-gray-400"      // Tertiary text
className="text-primary-600"   // Brand color
```

### Backgrounds
```jsx
className="bg-white"           // White
className="bg-gray-50"         // Light gray
className="bg-primary-50"      // Light primary
className="bg-primary-600"     // Primary
```

### Borders
```jsx
className="border border-gray-300"
className="border-2 border-primary-600"
```

---

## Hover Effects

### Shadow
```jsx
className="shadow-sm hover:shadow-md transition-shadow duration-200"
```

### Transform
```jsx
className="hover:-translate-y-1 transition-all duration-200"
```

### Color
```jsx
className="text-gray-600 hover:text-gray-900 transition duration-200"
```

### Background
```jsx
className="hover:bg-gray-50 transition duration-200"
```

---

## Focus States

### Input Focus
```jsx
className="focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
```

### Button Focus
```jsx
className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
```

---

## Common Patterns

### Stat Card
```jsx
<div className="card">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-gray-600 text-sm">Label</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">42</p>
    </div>
    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-100 text-blue-600">
      <Icon className="w-6 h-6" />
    </div>
  </div>
</div>
```

### List Item
```jsx
<div className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
  <h3 className="font-semibold text-gray-900">Title</h3>
  <p className="text-sm text-gray-600">Subtitle</p>
</div>
```

### Avatar
```jsx
<div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
  J
</div>
```

---

**All components use Tailwind CSS only - no custom CSS files!**
