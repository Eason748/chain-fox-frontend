import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { repositories } from '../services/supabase';
import AuthRequired from '../components/AuthRequired';
import { Link } from 'react-router-dom';

const RepositoryStatusPage = () => {
  const { t } = useTranslation('repository'); // 指定 repository namespace
  const [userRepositories, setUserRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch user repositories on component mount
  useEffect(() => {
    const fetchRepositories = async () => {
      setLoading(true);
      try {
        const { data, error } = await repositories.getUserRepositories();
        
        if (error) {
          throw error;
        }
        
        setUserRepositories(data || []);
      } catch (err) {
        console.error('Error fetching repositories:', err);
        setError(err.message || t('repositoryStatus.error.fetchFailed'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchRepositories();
  }, [t]);

  // Filter repositories based on search term and status filter
  const filteredRepositories = userRepositories.filter(repo => {
    const matchesSearch = 
      repo.repository_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.repository_owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.repository_url.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || repo.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get status badge color based on status
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'processing':
        return 'bg-blue-500/20 text-blue-300';
      case 'completed':
        return 'bg-green-500/20 text-green-300';
      case 'failed':
        return 'bg-red-500/20 text-red-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

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

  // Render repository list
  const renderRepositoryList = () => {
    if (filteredRepositories.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-400">
            {searchTerm || statusFilter !== 'all'
              ? t('repositoryStatus.noMatchingRepositories')
              : t('repositoryStatus.noRepositories')}
          </p>
          {userRepositories.length === 0 && (
            <Link
              to="/repository-submission"
              className="mt-4 inline-block px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white hover:shadow-lg hover:shadow-purple-500/40 transition-all"
            >
              {t('repositoryStatus.submitRepository')}
            </Link>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4">
        {filteredRepositories.map((repo, index) => (
          <motion.div
            key={repo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-black/30 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden hover:border-purple-500/50 transition-colors"
          >
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">
                    {repo.repository_owner}/{repo.repository_name}
                  </h3>
                  <a 
                    href={repo.repository_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {repo.repository_url}
                  </a>
                  <div className="mt-2 text-sm text-gray-400">
                    {t('repositoryStatus.submitted')}: {formatDate(repo.created_at)}
                  </div>
                  
                  {repo.completed_at && (
                    <div className="mt-1 text-sm text-gray-400">
                      {t('repositoryStatus.completed')}: {formatDate(repo.completed_at)}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-start md:items-end gap-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(repo.status)}`}>
                    {t(`repositoryStatus.statusLabels.${repo.status}`)}
                  </div>
                  
                  {repo.status === 'completed' && (
                    <Link
                      to={`/repository-result/${repo.id}`}
                      className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      {t('repositoryStatus.viewResults')}
                    </Link>
                  )}
                  
                  {repo.status === 'failed' && repo.error_message && (
                    <div className="mt-2 text-sm text-red-400">
                      {t('repositoryStatus.error')}: {repo.error_message}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  // Render search and filters
  const renderSearchAndFilters = () => {
    return (
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        {/* Search box */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('repositoryStatus.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-black/30 border border-white/20 text-gray-300 
                backdrop-blur-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30"
            />
          </div>
        </div>
        
        {/* Status filter */}
        <div className="w-full md:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/20 text-gray-300 
              backdrop-blur-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30"
          >
            <option value="all">{t('repositoryStatus.filters.all')}</option>
            <option value="pending">{t('repositoryStatus.filters.pending')}</option>
            <option value="processing">{t('repositoryStatus.filters.processing')}</option>
            <option value="completed">{t('repositoryStatus.filters.completed')}</option>
            <option value="failed">{t('repositoryStatus.filters.failed')}</option>
          </select>
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
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold mb-2">{t('repositoryStatus.title')}</h1>
              <p className="text-gray-400">{t('repositoryStatus.description')}</p>
            </div>
            
            {/* Submit New Repository button removed */}
          </motion.div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-500/30 text-red-300"
            >
              <h3 className="font-semibold mb-1">{t('repositoryStatus.error.title')}</h3>
              <p>{error}</p>
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
                {userRepositories.length > 0 && renderSearchAndFilters()}
                {renderRepositoryList()}
              </>
            )}
          </motion.div>
        </AuthRequired>
      </div>
    </motion.div>
  );
};

export default RepositoryStatusPage;
