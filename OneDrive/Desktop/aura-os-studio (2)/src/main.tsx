import React, { StrictMode, Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children: ReactNode;
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

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleClearStorage = () => {
    // Only clear error state, preserve conversations
    localStorage.removeItem('error-boundary-state');
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#07070B',
          color: '#e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '20px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            maxWidth: '800px',
            width: '100%',
            backgroundColor: 'rgba(15, 15, 25, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '40px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
          }}>
            <h1 style={{
              fontSize: '28px',
              fontWeight: 900,
              color: '#f87171',
              margin: '0 0 16px 0',
              letterSpacing: '-0.025em'
            }}>
              Aura OS: Runtime Exception Detected
            </h1>
            <p style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '14px',
              lineHeight: '1.6',
              margin: '0 0 24px 0'
            }}>
              The system encountered an unhandled exception during boot or render. You can view the diagnostic telemetry below.
            </p>
            
            <div style={{
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '20px',
              fontFamily: 'monospace',
              fontSize: '12px',
              overflowX: 'auto',
              marginBottom: '24px',
              color: '#fca5a5',
              whiteSpace: 'pre-wrap',
              textAlign: 'left'
            }}>
              <strong>Error:</strong> {this.state.error?.toString()}
              {this.state.error?.stack && (
                <>
                  <br /><br />
                  <strong>Stack Trace:</strong>
                  <br />
                  {this.state.error.stack}
                </>
              )}
              {this.state.errorInfo?.componentStack && (
                <>
                  <br /><br />
                  <strong>Component Stack:</strong>
                  {this.state.errorInfo.componentStack}
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => window.location.reload()} 
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                Soft Reboot (Refresh)
              </button>
              <button 
                onClick={this.handleClearStorage} 
                style={{
                  backgroundColor: '#6d28d9',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                Hard Reset (Clear Cache & Keys)
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
