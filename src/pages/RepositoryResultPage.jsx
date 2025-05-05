import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { repositories } from '../services/supabase';
import AuthRequired from '../components/AuthRequired';

const RepositoryResultPage = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [repository, setRepository] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch repository details on component mount
  useEffect(() => {
    const fetchRepository = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const { data, error } = await repositories.getRepositoryById(id);
        
        if (error) {
          throw error;
        }
        
        if (!data) {
          throw new Error(t('repositoryResult.error.notFound'));
        }
        
        setRepository(data);
      } catch (err) {
        console.error('Error fetching repository:', err);
        setError(err.message || t('repositoryResult.error.fetchFailed'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchRepository();
  }, [id, t]);

  // Format date for better readability
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render repository details
  const renderRepositoryDetails = () => {
    if (!repository) return null;

    return (
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {repository.repository_owner}/{repository.repository_name}
            </h2>
            <a 
              href={repository.repository_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              {repository.repository_url}
            </a>
          </div>
          
          <div className="flex flex-col items-start md:items-end gap-2">
            <div className="text-sm text-gray-400">
              {t('repositoryResult.submitted')}: {formatDate(repository.created_at)}
            </div>
            {repository.completed_at && (
              <div className="text-sm text-gray-400">
                {t('repositoryResult.completed')}: {formatDate(repository.completed_at)}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render audit results
  const renderAuditResults = () => {
    if (!repository || !repository.audit_result) {
      return (
        <div className="p-6 rounded-lg bg-yellow-900/20 border border-yellow-500/30">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-yellow-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">{t('repositoryResult.noResults.title')}</h3>
              <p className="text-gray-300">{t('repositoryResult.noResults.message')}</p>
            </div>
          </div>
        </div>
      );
    }

    // This is a placeholder for the actual audit results display
    // In a real implementation, you would parse and display the audit_result JSON data
    return (
      <div className="space-y-6">
        <div className="p-6 rounded-lg bg-blue-900/20 border border-blue-500/30">
          <h3 className="text-lg font-semibold text-white mb-4">{t('repositoryResult.summary')}</h3>
          <pre className="bg-black/50 p-4 rounded-lg overflow-x-auto text-gray-300 text-sm">
            {JSON.stringify(repository.audit_result, null, 2)}
          </pre>
        </div>
        
        <div className="p-6 rounded-lg bg-purple-900/20 border border-purple-500/30">
          <h3 className="text-lg font-semibold text-white mb-4">{t('repositoryResult.implementation')}</h3>
          <p className="text-gray-300">
            {t('repositoryResult.implementationNote')}
          </p>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-white p-8 pt-16 md:pt-24"
    >
      <div className="max-w-4xl mx-auto">
        <AuthRequired>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <Link
                to="/repository-status"
                className="text-gray-400 hover:text-white transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {t('repositoryResult.backToList')}
              </Link>
            </div>
            
            <h1 className="text-3xl font-bold mb-2">{t('repositoryResult.title')}</h1>
            <p className="text-gray-400">{t('repositoryResult.description')}</p>
          </motion.div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-500/30 text-red-300"
            >
              <h3 className="font-semibold mb-1">{t('repositoryResult.error.title')}</h3>
              <p>{error}</p>
              <Link
                to="/repository-status"
                className="mt-3 inline-block text-red-400 hover:text-red-300 transition-colors"
              >
                {t('repositoryResult.backToList')}
              </Link>
            </motion.div>
          )}

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-md p-6 md:p-8 rounded-xl shadow-2xl border border-white/10"
          >
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            ) : (
              <>
                {renderRepositoryDetails()}
                {renderAuditResults()}
              </>
            )}
          </motion.div>
        </AuthRequired>
      </div>
    </motion.div>
  );
};

export default RepositoryResultPage;
