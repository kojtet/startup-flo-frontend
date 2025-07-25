/**
 * @fileoverview Validation utility functions for form and data validation.
 * 
 * This module provides comprehensive validation utilities for common data types
 * including emails, phones, URLs, passwords, and custom validation patterns.
 * It includes both individual validation functions and utility functions for
 * combining and managing validation results.
 * 
 * @author Fihankra Safety Sentinel Team
 * @version 1.0.0
 * @since 2024
 */

// ================================
// VALIDATION UTILITIES
// ================================

import { ValidationError, ValidationResult, VALIDATION_RULES } from './types';

/**
 * Validates email format
 */
export function validateEmail(email: string): ValidationResult {
  const isValid = VALIDATION_RULES.email.test(email);
  return {
    isValid,
    errors: isValid ? [] : [{ field: 'email', message: 'Please enter a valid email address', value: email }],
  };
}

/**
 * Validates phone number format
 */
export function validatePhone(phone: string): ValidationResult {
  const isValid = VALIDATION_RULES.phone.test(phone);
  return {
    isValid,
    errors: isValid ? [] : [{ field: 'phone', message: 'Please enter a valid phone number', value: phone }],
  };
}

/**
 * Validates URL format
 */
export function validateUrl(url: string): ValidationResult {
  const isValid = VALIDATION_RULES.url.test(url);
  return {
    isValid,
    errors: isValid ? [] : [{ field: 'url', message: 'Please enter a valid URL', value: url }],
  };
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): ValidationResult {
  const isValid = VALIDATION_RULES.password.test(password);
  return {
    isValid,
    errors: isValid ? [] : [{ 
      field: 'password', 
      message: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character', 
      value: password 
    }],
  };
}

/**
 * Validates username format
 */
export function validateUsername(username: string): ValidationResult {
  const isValid = VALIDATION_RULES.username.test(username);
  return {
    isValid,
    errors: isValid ? [] : [{ 
      field: 'username', 
      message: 'Username must be 3-20 characters long and contain only letters, numbers, and underscores', 
      value: username 
    }],
  };
}

/**
 * Validates required field
 */
export function validateRequired(value: any, fieldName: string): ValidationResult {
  const isValid = value !== undefined && value !== null && value !== '';
  return {
    isValid,
    errors: isValid ? [] : [{ field: fieldName, message: `${fieldName} is required`, value }],
  };
}

/**
 * Validates minimum length
 */
export function validateMinLength(value: string, minLength: number, fieldName: string): ValidationResult {
  const isValid = value.length >= minLength;
  return {
    isValid,
    errors: isValid ? [] : [{ 
      field: fieldName, 
      message: `${fieldName} must be at least ${minLength} characters long`, 
      value 
    }],
  };
}

/**
 * Validates maximum length
 */
export function validateMaxLength(value: string, maxLength: number, fieldName: string): ValidationResult {
  const isValid = value.length <= maxLength;
  return {
    isValid,
    errors: isValid ? [] : [{ 
      field: fieldName, 
      message: `${fieldName} must be no more than ${maxLength} characters long`, 
      value 
    }],
  };
}

/**
 * Validates numeric range
 */
export function validateNumericRange(
  value: number, 
  min: number, 
  max: number, 
  fieldName: string
): ValidationResult {
  const isValid = value >= min && value <= max;
  return {
    isValid,
    errors: isValid ? [] : [{ 
      field: fieldName, 
      message: `${fieldName} must be between ${min} and ${max}`, 
      value 
    }],
  };
}

/**
 * Validates date range
 */
export function validateDateRange(
  startDate: string, 
  endDate: string, 
  startFieldName: string = 'startDate',
  endFieldName: string = 'endDate'
): ValidationResult {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const isValid = start <= end;
  
  return {
    isValid,
    errors: isValid ? [] : [{ 
      field: endFieldName, 
      message: `${endFieldName} must be after ${startFieldName}`, 
      value: endDate 
    }],
  };
}

/**
 * Validates file size
 */
export function validateFileSize(
  file: File, 
  maxSize: number, 
  fieldName: string = 'file'
): ValidationResult {
  const isValid = file.size <= maxSize;
  const maxSizeMB = Math.round(maxSize / (1024 * 1024));
  
  return {
    isValid,
    errors: isValid ? [] : [{ 
      field: fieldName, 
      message: `File size must be no more than ${maxSizeMB}MB`, 
      value: file.name 
    }],
  };
}

/**
 * Validates file type
 */
export function validateFileType(
  file: File, 
  allowedTypes: string[], 
  fieldName: string = 'file'
): ValidationResult {
  const isValid = allowedTypes.includes(file.type);
  
  return {
    isValid,
    errors: isValid ? [] : [{ 
      field: fieldName, 
      message: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`, 
      value: file.name 
    }],
  };
}

/**
 * Validates array length
 */
export function validateArrayLength(
  array: any[], 
  minLength: number, 
  maxLength: number, 
  fieldName: string
): ValidationResult {
  const isValid = array.length >= minLength && array.length <= maxLength;
  
  return {
    isValid,
    errors: isValid ? [] : [{ 
      field: fieldName, 
      message: `${fieldName} must have between ${minLength} and ${maxLength} items`, 
      value: array 
    }],
  };
}

/**
 * Validates unique values in array
 */
export function validateUniqueValues(
  array: any[], 
  fieldName: string
): ValidationResult {
  const uniqueValues = new Set(array);
  const isValid = uniqueValues.size === array.length;
  
  return {
    isValid,
    errors: isValid ? [] : [{ 
      field: fieldName, 
      message: `${fieldName} must contain unique values`, 
      value: array 
    }],
  };
}

/**
 * Validates object structure
 */
export function validateObjectStructure(
  obj: any, 
  requiredFields: string[], 
  fieldName: string = 'object'
): ValidationResult {
  const missingFields = requiredFields.filter(field => !(field in obj));
  const isValid = missingFields.length === 0;
  
  return {
    isValid,
    errors: isValid ? [] : [{ 
      field: fieldName, 
      message: `Missing required fields: ${missingFields.join(', ')}`, 
      value: obj 
    }],
  };
}

/**
 * Validates custom regex pattern
 */
export function validatePattern(
  value: string, 
  pattern: RegExp, 
  fieldName: string, 
  message?: string
): ValidationResult {
  const isValid = pattern.test(value);
  
  return {
    isValid,
    errors: isValid ? [] : [{ 
      field: fieldName, 
      message: message || `${fieldName} format is invalid`, 
      value 
    }],
  };
}

/**
 * Validates conditional field
 */
export function validateConditional(
  value: any, 
  condition: boolean, 
  fieldName: string, 
  message?: string
): ValidationResult {
  const isValid = !condition || (value !== undefined && value !== null && value !== '');
  
  return {
    isValid,
    errors: isValid ? [] : [{ 
      field: fieldName, 
      message: message || `${fieldName} is required when condition is met`, 
      value 
    }],
  };
}

/**
 * Combines multiple validation results
 */
export function combineValidationResults(...results: ValidationResult[]): ValidationResult {
  const allErrors = results.flatMap(result => result.errors);
  const isValid = allErrors.length === 0;
  
  return {
    isValid,
    errors: allErrors,
  };
}

/**
 * Validates form data object
 */
export function validateFormData(
  data: Record<string, any>,
  rules: Record<string, (value: any) => ValidationResult>
): ValidationResult {
  const allErrors: ValidationError[] = [];
  
  Object.entries(rules).forEach(([field, validator]) => {
    const result = validator(data[field]);
    allErrors.push(...result.errors);
  });
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
}

/**
 * Creates a validation rule for required field
 */
export function createRequiredRule(fieldName: string) {
  return (value: any) => validateRequired(value, fieldName);
}

/**
 * Creates a validation rule for email
 */
export function createEmailRule() {
  return (value: string) => validateEmail(value);
}

/**
 * Creates a validation rule for phone
 */
export function createPhoneRule() {
  return (value: string) => validatePhone(value);
}

/**
 * Creates a validation rule for URL
 */
export function createUrlRule() {
  return (value: string) => validateUrl(value);
}

/**
 * Creates a validation rule for password
 */
export function createPasswordRule() {
  return (value: string) => validatePassword(value);
}

/**
 * Creates a validation rule for username
 */
export function createUsernameRule() {
  return (value: string) => validateUsername(value);
}

/**
 * Creates a validation rule for min length
 */
export function createMinLengthRule(minLength: number, fieldName: string) {
  return (value: string) => validateMinLength(value, minLength, fieldName);
}

/**
 * Creates a validation rule for max length
 */
export function createMaxLengthRule(maxLength: number, fieldName: string) {
  return (value: string) => validateMaxLength(value, maxLength, fieldName);
}

/**
 * Creates a validation rule for numeric range
 */
export function createNumericRangeRule(min: number, max: number, fieldName: string) {
  return (value: number) => validateNumericRange(value, min, max, fieldName);
}

/**
 * Creates a validation rule for pattern
 */
export function createPatternRule(pattern: RegExp, fieldName: string, message?: string) {
  return (value: string) => validatePattern(value, pattern, fieldName, message);
}

/**
 * Validates and formats error messages
 */
export function formatValidationErrors(errors: ValidationError[]): Record<string, string> {
  const formatted: Record<string, string> = {};
  
  errors.forEach(error => {
    formatted[error.field] = error.message;
  });
  
  return formatted;
}

/**
 * Checks if validation errors exist for a specific field
 */
export function hasValidationError(errors: ValidationError[], field: string): boolean {
  return errors.some(error => error.field === field);
}

/**
 * Gets validation error message for a specific field
 */
export function getValidationError(errors: ValidationError[], field: string): string | undefined {
  const error = errors.find(error => error.field === field);
  return error?.message;
} 