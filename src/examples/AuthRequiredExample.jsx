import React from 'react';
import AuthRequired from '../components/AuthRequired';
import { useTranslation } from 'react-i18next';

/**
 * Example component demonstrating how to use AuthRequired
 */
function AuthRequiredExample() {
  const { t } = useTranslation();

  // This is the content that will only be visible to authenticated users
  const renderProtectedContent = () => (
    <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-lg rounded-2xl p-8 border border-purple-400/20 shadow-lg shadow-blue-500/10">
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
        Protected Content
      </h2>
      <p className="text-white/80 mb-4">
        This content is only visible to authenticated users. You're seeing this because you're logged in!
      </p>
      <div className="p-4 bg-black/20 rounded-lg">
        <pre className="text-green-300 text-sm">
          {JSON.stringify({ message: "This could be sensitive user data or protected API results" }, null, 2)}
        </pre>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Authentication Example</h1>
      
      {/* Public content visible to everyone */}
      <div className="mb-12 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
        <h2 className="text-xl font-bold mb-4">Public Content</h2>
        <p className="text-gray-300">
          This content is visible to all users, whether they are logged in or not.
        </p>
      </div>
      
      {/* Protected content only visible to authenticated users */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-4">Protected Content Example</h2>
        <p className="text-gray-300 mb-6">
          The content below is wrapped in an AuthRequired component and will only be visible if you're logged in.
        </p>
        
        {/* Example 1: Redirect to login if not authenticated */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Example 1: Redirect to Login</h3>
          <p className="text-gray-400 mb-4">
            If you're not logged in, you'll be redirected to the login page.
          </p>
          
          <AuthRequired>
            {renderProtectedContent()}
          </AuthRequired>
        </div>
        
        {/* Example 2: Show message instead of redirecting */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Example 2: Show Message</h3>
          <p className="text-gray-400 mb-4">
            If you're not logged in, a message will be displayed instead of redirecting.
          </p>
          
          <AuthRequired redirectToLogin={false}>
            {renderProtectedContent()}
          </AuthRequired>
        </div>
      </div>
      
      {/* Example with custom message */}
      <div>
        <h2 className="text-xl font-bold mb-4">Custom Message Example</h2>
        <p className="text-gray-300 mb-6">
          You can customize the message shown when a user is not authenticated.
        </p>
        
        <AuthRequired 
          redirectToLogin={false}
          fallbackMessage="This is a custom message. You need special permissions to view this content."
        >
          {renderProtectedContent()}
        </AuthRequired>
      </div>
    </div>
  );
}

export default AuthRequiredExample;
