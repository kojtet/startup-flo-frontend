# Library Module Documentation

This directory contains enhanced TypeScript interfaces, utilities, and configurations for the Fihankra Safety Sentinel application.

## 📁 File Structure

```
src/lib/
├── README.md           # This documentation file
├── index.ts           # Main exports and constants
├── types.ts           # Enhanced TypeScript interfaces
├── formUtils.ts       # Form state management utilities
├── validation.ts      # Data validation utilities
├── cache.ts           # Advanced caching utilities
├── errorHandling.ts   # Error handling utilities
├── utils.ts           # General utility functions
└── cacheConfig.ts     # Cache configuration utilities
```

## 🚀 Quick Start

Import the enhanced types and utilities:

```typescript
import {
  // Enhanced types
  FinanceContextState,
  ApiResponse,
  FormState,
  AppError,
  
  // Utilities
  createFormState,
  validateEmail,
  createCache,
  
  // Constants
  STATUS_OPTIONS,
  DEFAULT_CACHE_CONFIG,
  VALIDATION_RULES
} from '@/lib';
```

## 📋 Enhanced TypeScript Interfaces

### Context State Interfaces

- **`BaseContextState<T>`** - Base interface for all React context states
- **`PaginatedContextState<T>`** - Extended interface for paginated data
- **`FinanceContextState`** - Finance-specific context state
- **`CRMContextState`** - CRM-specific context state
- **`HRContextState`** - HR-specific context state
- **`AssetsContextState`** - Assets-specific context state

### Service Response Interfaces

- **`ApiResponse<T>`** - Standard API response structure
- **`PaginatedApiResponse<T>`** - Paginated API response
- **`ServiceResponse<T>`** - Service operation response
- **`BatchOperationResponse`** - Batch operation results

### Form Data Interfaces

- **`BaseFormData`** - Base interface for form data
- **`FormState<T>`** - Form state management
- **`FormValidationError`** - Form validation errors
- **`FormConfig<T>`** - Form configuration

### Utility Type Interfaces

- **`StatusType`** - Common status values
- **`PriorityType`** - Priority levels
- **`SortOrder`** - Sort directions
- **`SortConfig`** - Sorting configuration
- **`FilterConfig`** - Filtering configuration
- **`QueryParams`** - Query parameters
- **`DateRange`** - Date range structure
- **`SelectOption`** - Select dropdown options
- **`TableColumn<T>`** - Table column configuration
- **`TableConfig<T>`** - Table configuration

### Error Handling Interfaces

- **`AppError`** - Extended error interface
- **`ErrorBoundaryState`** - Error boundary state
- **`ErrorHandlerConfig`** - Error handler configuration
- **`ValidationError`** - Validation error structure
- **`ValidationResult`** - Validation result

### Cache Interfaces

- **`CacheEntry<T>`** - Cache entry structure
- **`CacheConfig`** - Cache configuration
- **`CacheStats`** - Cache statistics
- **`CacheOperation`** - Cache operation log

### Component Props Interfaces

- **`ModalProps`** - Modal component props
- **`ConfirmDialogProps`** - Confirmation dialog props
- **`DataTableProps<T>`** - Data table props
- **`FormFieldProps`** - Form field props
- **`InputFieldProps`** - Input field props
- **`SelectFieldProps`** - Select field props
- **`DateFieldProps`** - Date field props
- **`FileUploadProps`** - File upload props

### Advanced Interfaces

- **`Notification`** - Notification structure
- **`Theme`** - Theme configuration
- **`Permission`** - Permission structure
- **`Role`** - Role structure
- **`UserPermissions`** - User permissions
- **`AuditLog`** - Audit log entry
- **`ExportConfig`** - Export configuration
- **`ImportConfig`** - Import configuration
- **`WebSocketMessage<T>`** - WebSocket message
- **`AnalyticsEvent`** - Analytics event
- **`FeatureFlag`** - Feature flag
- **`Locale`** - Locale configuration

## 🛠️ Utilities

### Form Utilities (`formUtils.ts`)

```typescript
import {
  createFormState,
  updateFormData,
  setFieldValue,
  setFormErrors,
  clearFormErrors,
  validateForm,
  getFieldError,
  hasFieldError,
  isFieldTouched,
  getFormData,
  getSearchParams,
  debounceValidation,
  isFormDataEqual,
  createFieldChangeHandler,
  createFieldBlurHandler,
  createSubmitHandler
} from '@/lib/formUtils';
```

**Key Functions:**

- **`createFormState<T>(initialData?)`** - Creates initial form state
- **`updateFormData<T>(state, updates)`** - Updates form data and marks as dirty
- **`setFieldValue<T>(state, field, value)`** - Sets specific field value
- **`validateForm<T>(data, schema?)`** - Validates form data against schema
- **`createSubmitHandler<T>(state, setState, onSubmit, schema?)`** - Creates form submit handler

### Validation Utilities (`validation.ts`)

```typescript
import {
  validateEmail,
  validatePhone,
  validateUrl,
  validatePassword,
  validateUsername,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateNumericRange,
  validateDateRange,
  validateFileSize,
  validateFileType,
  validateArrayLength,
  validateUniqueValues,
  validateObjectStructure,
  validatePattern,
  validateConditional,
  combineValidationResults,
  validateFormData,
  createRequiredRule,
  createEmailRule,
  createPhoneRule,
  createUrlRule,
  createPasswordRule,
  createUsernameRule,
  createMinLengthRule,
  createMaxLengthRule,
  createNumericRangeRule,
  createPatternRule,
  formatValidationErrors,
  hasValidationError,
  getValidationError
} from '@/lib/validation';
```

**Key Functions:**

- **`validateEmail(email)`** - Validates email format
- **`validatePassword(password)`** - Validates password strength
- **`validateRequired(value, fieldName)`** - Validates required fields
- **`validateDateRange(startDate, endDate)`** - Validates date ranges
- **`combineValidationResults(...results)`** - Combines multiple validation results

### Cache Utilities (`cache.ts`)

```typescript
import {
  AdvancedCache,
  createCache,
  globalCache,
  cached,
  useCache,
  createCacheMiddleware,
  cacheUtils
} from '@/lib/cache';
```

**Key Features:**

- **LRU Eviction** - Automatically removes least recently used entries
- **Persistence** - Saves cache to localStorage
- **Compression** - Optional data compression
- **Statistics** - Tracks hits, misses, and performance metrics
- **Tag-based Operations** - Bulk operations by tags
- **Decorators** - Easy caching of functions and methods

**Usage Examples:**

```typescript
// Create a cache instance
const cache = createCache({
  maxSize: 1000,
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  enablePersistence: true
});

// Cache decorator
class UserService {
  @cached(5 * 60 * 1000) // Cache for 5 minutes
  async getUser(id: string) {
    return await api.get(`/users/${id}`);
  }
}

// Cache hook
function UserProfile({ userId }: { userId: string }) {
  const cache = useCache(`user:${userId}`);
  const user = cache.get();
  
  if (!user) {
    // Load user data
    const userData = await fetchUser(userId);
    cache.set(userData);
  }
  
  return <div>{user.name}</div>;
}
```

## 📊 Constants and Configurations

### Status and Priority Options

```typescript
import {
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  SORT_ORDER_OPTIONS,
  STATUS_MAPPINGS,
  PRIORITY_MAPPINGS,
  SORT_OPTIONS,
  FILTER_OPTIONS
} from '@/lib';
```

### Default Configurations

```typescript
import {
  DEFAULT_PAGINATION,
  DEFAULT_CACHE_CONFIG,
  DEFAULT_ERROR_CONFIG,
  DEFAULT_NOTIFICATION_CONFIG,
  DEFAULT_THEME
} from '@/lib';
```

### Format Constants

```typescript
import {
  DATE_FORMATS,
  CURRENCY_FORMATS,
  FILE_TYPES,
  FILE_SIZE_LIMITS,
  VALIDATION_RULES
} from '@/lib';
```

## 🔧 Type Guards and Utilities

```typescript
import {
  isAppError,
  isValidationError,
  isDateRange,
  isSelectOption
} from '@/lib';
```

## 📝 Usage Examples

### Form Management

```typescript
import { createFormState, createSubmitHandler } from '@/lib/formUtils';

function UserForm() {
  const [formState, setFormState] = useState(
    createFormState<UserFormData>({
      email: '',
      firstName: '',
      lastName: ''
    })
  );

  const handleSubmit = createSubmitHandler(
    formState,
    setFormState,
    async (data) => {
      await api.createUser(data);
    }
  );

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formState.data.email}
        onChange={(e) => setFormState(setFieldValue(formState, 'email', e.target.value))}
      />
      {/* More form fields */}
    </form>
  );
}
```

### Validation

```typescript
import { validateFormData, createEmailRule, createRequiredRule } from '@/lib/validation';

const validationRules = {
  email: createEmailRule(),
  firstName: createRequiredRule('First Name'),
  lastName: createRequiredRule('Last Name')
};

const result = validateFormData(formData, validationRules);
if (!result.isValid) {
  console.log(result.errors);
}
```

### Caching

```typescript
import { createCache, cacheUtils } from '@/lib/cache';

const userCache = createCache({
  maxSize: 100,
  defaultTTL: 10 * 60 * 1000 // 10 minutes
});

// Cache user data
const cacheKey = cacheUtils.createUserKey(userId, 'profile');
userCache.set(cacheKey, userData);

// Get cached data
const cachedUser = userCache.get(cacheKey);
```

### Error Handling

```typescript
import { isAppError, createAppError } from '@/lib';

try {
  await someApiCall();
} catch (error) {
  if (isAppError(error)) {
    console.log(error.code, error.severity);
  } else {
    const appError = createAppError(error, 'API_CALL_FAILED');
    console.log(appError.userFriendlyMessage);
  }
}
```

## 🧪 Testing

All utilities include comprehensive JSDoc documentation with examples. You can also find type definitions that provide excellent IntelliSense support in your IDE.

## 🤝 Contributing

When adding new utilities or types:

1. Add comprehensive JSDoc documentation
2. Include usage examples
3. Add type definitions
4. Update this README
5. Add tests if applicable

## 📚 Additional Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [JSDoc Documentation](https://jsdoc.app/)
- [React Context API](https://reactjs.org/docs/context.html)
- [Local Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) 