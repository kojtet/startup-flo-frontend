/**
 * @fileoverview Form utility functions for managing form state, validation, and data handling.
 * 
 * This module provides comprehensive utilities for form management including state creation,
 * updates, validation, error handling, and form submission. It's designed to work with
 * the FormState and FormValidationError interfaces defined in the types module.
 * 
 * @author Fihankra Safety Sentinel Team
 * @version 1.0.0
 * @since 2024
 */

// ================================
// FORM UTILITIES
// ================================

import { FormState, FormValidationError, BaseFormData } from './types';

/**
 * Creates initial form state
 */
export function createFormState<T extends BaseFormData>(initialData: Partial<T> = {}): FormState<T> {
  return {
    data: initialData,
    errors: [],
    isDirty: false,
    isValid: true,
    isSubmitting: false,
    touched: {},
  };
}

/**
 * Updates form data and marks as dirty
 */
export function updateFormData<T extends BaseFormData>(
  state: FormState<T>,
  updates: Partial<T>
): FormState<T> {
  return {
    ...state,
    data: { ...state.data, ...updates },
    isDirty: true,
    touched: { ...state.touched },
  };
}

/**
 * Sets form field value
 */
export function setFieldValue<T extends BaseFormData>(
  state: FormState<T>,
  field: keyof T,
  value: any
): FormState<T> {
  return {
    ...state,
    data: { ...state.data, [field]: value },
    isDirty: true,
    touched: { ...state.touched, [field]: true },
  };
}

/**
 * Sets form errors
 */
export function setFormErrors<T extends BaseFormData>(
  state: FormState<T>,
  errors: FormValidationError[]
): FormState<T> {
  return {
    ...state,
    errors,
    isValid: errors.length === 0,
  };
}

/**
 * Clears form errors
 */
export function clearFormErrors<T extends BaseFormData>(state: FormState<T>): FormState<T> {
  return {
    ...state,
    errors: [],
    isValid: true,
  };
}

/**
 * Sets field error
 */
export function setFieldError<T extends BaseFormData>(
  state: FormState<T>,
  field: string,
  message: string,
  type: 'required' | 'invalid' | 'custom' = 'invalid'
): FormState<T> {
  const existingErrors = state.errors.filter(error => error.field !== field);
  const newError: FormValidationError = { field, message, type };
  
  return {
    ...state,
    errors: [...existingErrors, newError],
    isValid: false,
  };
}

/**
 * Clears field error
 */
export function clearFieldError<T extends BaseFormData>(
  state: FormState<T>,
  field: string
): FormState<T> {
  const errors = state.errors.filter(error => error.field !== field);
  
  return {
    ...state,
    errors,
    isValid: errors.length === 0,
  };
}

/**
 * Marks field as touched
 */
export function markFieldTouched<T extends BaseFormData>(
  state: FormState<T>,
  field: keyof T
): FormState<T> {
  return {
    ...state,
    touched: { ...state.touched, [field]: true },
  };
}

/**
 * Marks all fields as touched
 */
export function markAllFieldsTouched<T extends BaseFormData>(state: FormState<T>): FormState<T> {
  const touched: Record<string, boolean> = {};
  Object.keys(state.data).forEach(key => {
    touched[key] = true;
  });
  
  return {
    ...state,
    touched,
  };
}

/**
 * Resets form to initial state
 */
export function resetForm<T extends BaseFormData>(
  state: FormState<T>,
  initialData: Partial<T> = {}
): FormState<T> {
  return {
    data: initialData,
    errors: [],
    isDirty: false,
    isValid: true,
    isSubmitting: false,
    touched: {},
  };
}

/**
 * Sets form as submitting
 */
export function setSubmitting<T extends BaseFormData>(
  state: FormState<T>,
  isSubmitting: boolean
): FormState<T> {
  return {
    ...state,
    isSubmitting,
  };
}

/**
 * Validates form data against validation schema
 */
export async function validateForm<T extends BaseFormData>(
  data: Partial<T>,
  validationSchema?: any
): Promise<FormValidationError[]> {
  if (!validationSchema) {
    return [];
  }

  try {
    await validationSchema.validate(data, { abortEarly: false });
    return [];
  } catch (error: any) {
    if (error.inner) {
      return error.inner.map((err: any) => ({
        field: err.path,
        message: err.message,
        type: 'invalid' as const,
      }));
    }
    return [];
  }
}

/**
 * Gets field error message
 */
export function getFieldError(
  errors: FormValidationError[],
  field: string
): string | undefined {
  const error = errors.find(err => err.field === field);
  return error?.message;
}

/**
 * Checks if field has error
 */
export function hasFieldError(errors: FormValidationError[], field: string): boolean {
  return errors.some(error => error.field === field);
}

/**
 * Checks if field is touched
 */
export function isFieldTouched<T extends BaseFormData>(
  state: FormState<T>,
  field: keyof T
): boolean {
  return state.touched[field] || false;
}

/**
 * Gets form data as FormData object
 */
export function getFormData<T extends BaseFormData>(data: Partial<T>): FormData {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach(item => formData.append(key, String(item)));
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    }
  });
  
  return formData;
}

/**
 * Converts form data to URL search params
 */
export function getSearchParams<T extends BaseFormData>(data: Partial<T>): URLSearchParams {
  const params = new URLSearchParams();
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(item => params.append(key, String(item)));
      } else if (typeof value === 'object') {
        params.append(key, JSON.stringify(value));
      } else {
        params.append(key, String(value));
      }
    }
  });
  
  return params;
}

/**
 * Debounces form validation
 */
export function debounceValidation<T extends BaseFormData>(
  validationFn: (data: Partial<T>) => Promise<FormValidationError[]>,
  delay: number = 300
): (data: Partial<T>) => Promise<FormValidationError[]> {
  let timeoutId: NodeJS.Timeout;
  
  return (data: Partial<T>) => {
    return new Promise((resolve) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        validationFn(data).then(resolve);
      }, delay);
    });
  };
}

/**
 * Compares two form data objects to check if they're equal
 */
export function isFormDataEqual<T extends BaseFormData>(
  data1: Partial<T>,
  data2: Partial<T>
): boolean {
  const keys1 = Object.keys(data1);
  const keys2 = Object.keys(data2);
  
  if (keys1.length !== keys2.length) {
    return false;
  }
  
  return keys1.every(key => {
    const val1 = (data1 as any)[key];
    const val2 = (data2 as any)[key];
    
    if (val1 instanceof Date && val2 instanceof Date) {
      return val1.getTime() === val2.getTime();
    }
    
    if (Array.isArray(val1) && Array.isArray(val2)) {
      return JSON.stringify(val1) === JSON.stringify(val2);
    }
    
    if (typeof val1 === 'object' && typeof val2 === 'object') {
      return JSON.stringify(val1) === JSON.stringify(val2);
    }
    
    return val1 === val2;
  });
}

/**
 * Creates a form field change handler
 */
export function createFieldChangeHandler<T extends BaseFormData>(
  state: FormState<T>,
  setState: (state: FormState<T>) => void,
  field: keyof T
) {
  return (value: any) => {
    setState(setFieldValue(state, field, value));
  };
}

/**
 * Creates a form field blur handler
 */
export function createFieldBlurHandler<T extends BaseFormData>(
  state: FormState<T>,
  setState: (state: FormState<T>) => void,
  field: keyof T
) {
  return () => {
    setState(markFieldTouched(state, field));
  };
}

/**
 * Creates a form submit handler
 */
export function createSubmitHandler<T extends BaseFormData>(
  state: FormState<T>,
  setState: (state: FormState<T>) => void,
  onSubmit: (data: T) => Promise<void>,
  validationSchema?: any
) {
  return async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    setState(setSubmitting(state, true));
    
    try {
      // Mark all fields as touched
      setState(markAllFieldsTouched(state));
      
      // Validate form
      const errors = await validateForm(state.data, validationSchema);
      setState(setFormErrors(state, errors));
      
      if (errors.length === 0) {
        await onSubmit(state.data as T);
      }
    } catch (error) {
      // Error would be handled by calling code with proper logging
    } finally {
      setState(setSubmitting(state, false));
    }
  };
} 