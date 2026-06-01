import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Oops! Something went wrong.</h2>
          <p style={{ color: 'red' }}>{this.state.error?.message}</p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="btn btn-primary"
            style={{ marginTop: '1rem' }}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
