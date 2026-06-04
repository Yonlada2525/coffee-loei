import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'เกิดข้อผิดพลาดในระบบ' };
  }

  componentDidCatch(error, info) {
    console.error('React ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="shell py-10">
          <section className="card p-8 text-center">
            <h1 className="text-3xl font-black text-coffee">ระบบขัดข้องชั่วคราว</h1>
            <p className="mt-2 text-brown">{this.state.message}</p>
            <button className="btn btn-primary mt-5" onClick={() => location.reload()}>
              โหลดหน้าใหม่
            </button>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}
