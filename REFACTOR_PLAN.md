# AdminExams.jsx Refactor Plan

## 7 Sorun ve Çözümler

### 1. ✅ Form Validation (formValidation.js)
- `validateQuestionForm()` - comprehensive validation
- `validateCSVRow()` - CSV row validation
- `validateCSVHeaders()` - CSV header check
- Field-level error support

### 2. ✅ API Error Handling (apiErrorHandler.js)
- `retryWithBackoff()` - exponential backoff retry
- `getErrorMessage()` - user-friendly error messages
- `executeAPICall()` - wrapper with retry
- `raceWithTimeout()` - timeout handling

### 3. ✅ CSV Import (csvParser.js)
- `parseCSV()` - robust CSV parsing with error handling
- `importCSV()` - complete workflow
- `validateCSVFile()` - file validation
- `downloadCSVTemplate()` - template generation
- Handles malformed CSVs, encoding issues

### 4. ✅ Image Upload (imageUpload.js)
- `uploadImage()` - with retry and timeout
- `compressImage()` - automatic compression
- `generateImagePreview()` - preview generation
- `validateImageFile()` - file validation
- `uploadMultipleImages()` - batch upload with concurrency

### 5. ✅ Loading States (SkeletonLoaders.jsx)
- QuestionCardSkeleton
- ModalFormSkeleton
- CSVImportSkeleton
- ImageUploadSkeleton
- ProgressBarSkeleton
- LoadingOverlay

### 6. ✅ State Management (useExamsState.js)
- `useExamsState()` - replaces 20+ useState
- Consolidated state structure
- Action creators (useCallback-wrapped)
- Predictable state updates

### 7. ✅ Responsive Design
- Mobile-first breakpoints (sm:, lg:)
- Modal responsive width/height
- Grid responsive columns
- Tab responsive layout

## Implementation Changes in AdminExams.jsx

### Before (Old):
```javascript
const [tab, setTab] = useState('short_test');
const [loading, setLoading] = useState(true);
const [errors, setErrors] = useState({});
const [form, setForm] = useState(...);
// ... 20+ useState declarations
```

### After (New):
```javascript
const { state, setFormField, setForm, openModal, closeModal, ... } = useExamsState();
// All state in one place, memoized actions
```

### Form Submission Before:
```javascript
if (!form.text.trim()) e.text = 'Soru metni zorunludur.';
// Manual validation
```

### Form Submission After:
```javascript
const validation = validateQuestionForm(form);
if (!validation.isValid) {
  actions.setFormErrors(validation.errors);
  return;
}
```

### Image Upload Before:
```javascript
const uploadRes = await api.post('/upload', fd);
// No retry, no progress, no timeout
```

### Image Upload After:
```javascript
const result = await uploadImage(imageFile, {
  apiEndpoint: '/api/upload',
  onProgress: (percent) => actions.setImageUploadProgress(percent),
  compress: true,
  maxRetries: 3,
});
if (!result.success) showError(result.error);
```

### CSV Import Before:
```javascript
const lines = csvContent.split('\n');
// Basic parsing, crashes on malformed CSV
```

### CSV Import After:
```javascript
const result = await importCSV(file, {
  fileValidation: { maxSizeMB: 10 }
});
// Complete validation, error reporting, retry logic
```

## Testing Checklist

- [ ] Form validation triggers correctly
- [ ] API calls retry on timeout/network error
- [ ] Image upload shows progress
- [ ] CSV import handles malformed files
- [ ] Loading skeletons display
- [ ] useReducer state updates predictably
- [ ] Modal responsive on mobile
- [ ] Error messages display correctly
- [ ] Draft auto-save works
- [ ] All 3 test types work (short/mock/real)

## Files Modified/Created

- ✅ formValidation.js (NEW)
- ✅ apiErrorHandler.js (NEW)
- ✅ csvParser.js (NEW)
- ✅ imageUpload.js (NEW)
- ✅ useExamsState.js (NEW)
- ✅ SkeletonLoaders.jsx (UPDATED)
- 🔄 AdminExams.jsx (IN PROGRESS)

## Refactor Strategy

1. Keep all existing functionality
2. Replace manual validation with utility functions
3. Replace raw api calls with retry wrapper
4. Add skeleton loaders during fetch
5. Consolidate useState into useReducer
6. Ensure mobile responsiveness
7. Test all paths before deployment
