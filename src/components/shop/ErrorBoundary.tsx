
import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showDebug?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console
    console.error("ErrorBoundary caught an error:", error);
    console.error("Component stack trace:", errorInfo.componentStack);
    
    // Update state to include the error info
    this.setState({ errorInfo });
  }

  public resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <Card className="w-full">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-medium">Something went wrong</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {this.state.error?.message || "An unexpected error occurred"}
                </p>
                
                {/* Show detailed error info if showDebug is true */}
                {this.props.showDebug && (
                  <div className="mt-4 text-left">
                    <h4 className="text-sm font-medium">Error Details:</h4>
                    <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-24">
                      {this.state.error?.stack}
                    </pre>
                    
                    {this.state.errorInfo && (
                      <>
                        <h4 className="text-sm font-medium mt-2">Component Stack:</h4>
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-24">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </>
                    )}
                  </div>
                )}
              </div>
              <Button onClick={this.resetError}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
