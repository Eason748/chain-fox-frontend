import React, { Component } from 'react';
import { motion } from 'framer-motion';
import { withTranslation } from 'react-i18next';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('ErrorBoundary caught an error', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Customized fallback UI with dark theme matching AuthPage style
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-black bg-grid text-white overflow-hidden">
          {/* Base dark background */}
          <div
            className="fixed top-0 left-0 w-full h-full"
            style={{
              background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
              zIndex: -10
            }}
          />

          {/* Animated background sphere */}
          <motion.div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-30"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <div
              className="w-full h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 blur-[100px]"
            />
          </motion.div>

          {/* Error content */}
          <motion.div
            className="relative z-10 w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="max-w-md mx-auto bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-md p-8 rounded-xl shadow-2xl border border-white/10">
              <motion.div
                className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 border border-red-500/30"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.div>

              <motion.h2
                className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {this.props.t('error.title', 'Something went wrong')}
              </motion.h2>

              <motion.p
                className="text-gray-300 mb-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {this.props.t('error.message', 'The application encountered an error.')}
              </motion.p>

              {this.state.error && (
                <motion.div
                  className="p-4 mb-6 bg-red-900/50 border border-red-700/70 text-red-200 rounded-lg shadow-md"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <p className="font-medium">{this.props.t('error.errorMessage', 'Error message:')}</p>
                  <p className="mt-1 text-sm font-mono">{this.state.error.toString()}</p>
                </motion.div>
              )}

              <motion.button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 rounded-full text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg hover:shadow-purple-500/40 transition-all duration-300"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {this.props.t('error.refreshPage', 'Refresh page')}
              </motion.button>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default withTranslation(['common'])(ErrorBoundary);
