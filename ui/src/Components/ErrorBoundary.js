import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error:{}, info:{} };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, errorInfo);
    this.setState({error:error,info:errorInfo})
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (<div>
        <h1>Something went wrong.</h1>
        <pre>{JSON.stringify(this.state,null,2)}</pre>
        <pre>{this?.state?.info?.componentStack}</pre>
      </div>);
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;