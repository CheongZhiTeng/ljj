import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  message: string;
  reload: string;
}

export class ErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <div className="panel fatal" role="alert">
          <p>{this.props.message}</p>
          <button className="button" onClick={() => location.reload()}>
            {this.props.reload}
          </button>
        </div>
      );
    return this.props.children;
  }
}
