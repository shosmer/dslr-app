import { Component, type ReactNode } from "react";

/** Catches render/runtime errors in a subtree (e.g. the WebGL 3D viewer) so a
 *  failure degrades to a fallback instead of blanking the whole screen. */
export class ErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.warn("ErrorBoundary caught:", error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
