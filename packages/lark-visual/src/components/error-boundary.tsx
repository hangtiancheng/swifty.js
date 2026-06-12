import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";
import { CircleAlert, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex h-full items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
            <CircleAlert className="h-6 w-6 text-red-500" />
          </div>
          <h2 className="mb-1 text-sm font-medium text-slate-700">
            {this.props.fallbackTitle ?? "Component crashed"}
          </h2>
          <p className="mb-4 font-mono text-[10px] break-all text-red-500">
            {error.message}
          </p>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-1.5 rounded-md bg-sky-600 px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-sky-700"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </button>
        </div>
      </div>
    );
  }
}
