import {
  Suspense,
  lazy,
  type ComponentProps,
  type ComponentType,
  type ReactNode,
} from "react";

export function PageSplash() {
  return (
    <div className="d-flex align-items-center justify-content-center vh-100">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading…</span>
      </div>
    </div>
  );
}

export function withSuspense(node: ReactNode) {
  return <Suspense fallback={<PageSplash />}>{node}</Suspense>;
}

/** Lazy-load a page component; returns a component you can render as `<Page />`. */
export function lazyPage<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  const Comp = lazy(factory);
  return function LazyPage(props: ComponentProps<T>) {
    return (
      <Suspense fallback={<PageSplash />}>
        <Comp {...props} />
      </Suspense>
    );
  };
}
