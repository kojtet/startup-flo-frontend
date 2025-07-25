import React, { ReactNode, ComponentType } from 'react';

// ================================
// CONTEXT COMPOSITION UTILITY
// ================================

interface ProviderComponent {
  (props: { children: ReactNode }): JSX.Element;
}

interface ProviderWithProps<T = any> {
  component: ComponentType<T & { children: ReactNode }>;
  props?: Omit<T, 'children'>;
}

export interface ContextComposerConfig {
  providers: Array<ProviderComponent | ProviderWithProps>;
  errorBoundaries?: boolean;
  performance?: {
    enableProfiling?: boolean;
    enableSuspense?: boolean;
  };
}

/**
 * Combines multiple context providers into a single flat component
 * Eliminates provider hell and improves performance
 */
export function combineContexts(config: ContextComposerConfig) {
  const { providers, errorBoundaries = false, performance = {} } = config;

  return function CombinedProviders({ children }: { children: ReactNode }) {
    // Build provider tree from inside out
    const tree = providers.reduceRight<ReactNode>((acc, provider) => {
      if (typeof provider === 'function') {
        // Simple provider component
        const Provider = provider as ProviderComponent;
        return <Provider>{acc}</Provider>;
      } else {
        // Provider with props
        const { component: Provider, props = {} } = provider as ProviderWithProps;
        return <Provider {...props}>{acc}</Provider>;
      }
    }, children);

    // Wrap with performance optimizations if enabled
    if (performance.enableSuspense) {
      return (
        <React.Suspense fallback={<div>Loading contexts...</div>}>
          {tree}
        </React.Suspense>
      );
    }

    return <>{tree}</>;
  };
}

/**
 * Helper to create provider with props
 */
export function createProviderWithProps<T>(
  component: ComponentType<T & { children: ReactNode }>,
  props: Omit<T, 'children'>
): ProviderWithProps<T> {
  return { component, props };
}

/**
 * Context group for related providers
 */
export function createContextGroup(
  name: string,
  providers: Array<ProviderComponent | ProviderWithProps>
) {
  const GroupProvider = combineContexts({ providers });
  GroupProvider.displayName = `${name}ContextGroup`;
  return GroupProvider;
}

// ================================
// ERROR BOUNDARY INTEGRATION
// ================================

interface ContextErrorBoundaryProps {
  children: ReactNode;
  contextName: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class ContextErrorBoundary extends React.Component<
  ContextErrorBoundaryProps,
  { hasError: boolean; error?: Error }
> {
  constructor(props: ContextErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Context Error in ${this.props.contextName}:`, error);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="context-error-fallback">
          <h3>Context Error: {this.props.contextName}</h3>
          <p>Something went wrong in {this.props.contextName} context.</p>
          <button onClick={() => this.setState({ hasError: false, error: undefined })}>
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Wraps provider with error boundary
 */
export function withErrorBoundary<P extends { children: ReactNode }>(
  Provider: ComponentType<P>,
  contextName: string
) {
  return function BoundedProvider(props: P) {
    return (
      <ContextErrorBoundary contextName={contextName}>
        <Provider {...props} />
      </ContextErrorBoundary>
    );
  };
}

// ================================
// PERFORMANCE OPTIMIZATIONS
// ================================

/**
 * Lazy load provider for code splitting
 */
export function createLazyProvider<P extends { children: ReactNode }>(
  importProvider: () => Promise<{ default: ComponentType<P> }>,
  fallback?: ReactNode
) {
  const LazyProvider = React.lazy(importProvider);
  
  return function LazyProviderWrapper(props: P) {
    return (
      <React.Suspense fallback={fallback || <div>Loading...</div>}>
        <LazyProvider {...props} />
      </React.Suspense>
    );
  };
}

/**
 * Memoized provider wrapper
 */
export function createMemoizedProvider<P extends { children: ReactNode }>(
  Provider: ComponentType<P>,
  dependencies: (props: P) => any[]
) {
  return React.memo(Provider, (prevProps, nextProps) => {
    const prevDeps = dependencies(prevProps);
    const nextDeps = dependencies(nextProps);
    
    return prevDeps.length === nextDeps.length && 
           prevDeps.every((dep, index) => dep === nextDeps[index]);
  });
} 