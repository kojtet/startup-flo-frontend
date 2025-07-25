// ================================
// ERROR BOUNDARY EXPORTS
// ================================

// Base error boundary
export { BaseErrorBoundary } from './BaseErrorBoundary';
export type { 
  ErrorBoundaryProps, 
  ErrorBoundaryState, 
  ErrorDetails, 
  ErrorFallbackProps 
} from './BaseErrorBoundary';

// Specialized error boundaries
export {
  AuthErrorBoundary,
  APIErrorBoundary,
  ContextErrorBoundary,
  PageErrorBoundary,
  SectionErrorBoundary,
  ComponentErrorBoundary,
  RouteErrorBoundary
} from './SpecializedErrorBoundaries';

// Error boundary hooks
export {
  useErrorBoundary,
  useAsyncError,
  useSafeAsync,
  useErrorReporting,
  useSafeComponent,
  withErrorBoundary,
  withSafeExecution
} from './hooks/useErrorBoundary';

export type {
  ErrorInfo,
  UseErrorBoundaryOptions,
  UseErrorBoundaryReturn,
  UseAsyncErrorOptions,
  UseAsyncErrorReturn,
  UseSafeAsyncOptions,
  UseErrorReportingOptions
} from './hooks/useErrorBoundary';

// ================================
// CONVENIENCE EXPORTS
// ================================

// Import the components for convenience exports
import { BaseErrorBoundary } from './BaseErrorBoundary';
import {
  AuthErrorBoundary,
  APIErrorBoundary,
  ContextErrorBoundary,
  PageErrorBoundary,
  SectionErrorBoundary,
  ComponentErrorBoundary,
  RouteErrorBoundary
} from './SpecializedErrorBoundaries';
import {
  useErrorBoundary,
  useAsyncError,
  useSafeAsync,
  useErrorReporting,
  useSafeComponent,
  withErrorBoundary,
  withSafeExecution
} from './hooks/useErrorBoundary';

// Quick access to commonly used boundaries
export const ErrorBoundary = BaseErrorBoundary;
export const Auth = AuthErrorBoundary;
export const API = APIErrorBoundary;
export const Context = ContextErrorBoundary;
export const Page = PageErrorBoundary;
export const Section = SectionErrorBoundary;
export const Component = ComponentErrorBoundary;
export const Route = RouteErrorBoundary;

// Default export for easy importing
export default {
  // Components
  Base: BaseErrorBoundary,
  Auth: AuthErrorBoundary,
  API: APIErrorBoundary,
  Context: ContextErrorBoundary,
  Page: PageErrorBoundary,
  Section: SectionErrorBoundary,
  Component: ComponentErrorBoundary,
  Route: RouteErrorBoundary,
  
  // Hooks
  useErrorBoundary,
  useAsyncError,
  useSafeAsync,
  useErrorReporting,
  useSafeComponent,
  
  // Utilities
  withErrorBoundary,
  withSafeExecution,
}; 