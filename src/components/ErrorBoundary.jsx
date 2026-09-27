import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    const errStr = error?.toString() || '';
    if (errStr.includes('removeChild') || errStr.includes('NotFoundError')) {
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("WU BUS App Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: '20px',
          background: '#5C068C',
          color: '#fff',
          fontFamily: 'sans-serif',
          textAlign: 'center'
        }}>
          <div>
            <h2>เกิดข้อผิดพลาดในการโหลดระบบ (WU BUS)</h2>
            <p style={{ opacity: 0.8, margin: '10px 0 20px' }}>{this.state.error?.toString()}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                background: '#fff',
                color: '#5C068C',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              โหลดหน้าเว็บใหม่อีกครั้ง
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
