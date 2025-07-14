import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    console.error("Uncaught error:", error, errorInfo);
    // You could also log the error to an error reporting service here
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4 text-center">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Ops! Algo deu errado.
            </h1>
            <p className="text-slate-700 mb-2">
              Desculpe pelo inconveniente. Por favor, tente atualizar a página.
            </p>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-4 text-left bg-slate-50 p-3 rounded border border-slate-200">
                <summary className="text-sm text-slate-600 cursor-pointer">
                  Detalhes do erro
                </summary>
                <pre className="mt-2 text-xs text-red-500 whitespace-pre-wrap">
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
