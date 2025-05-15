import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * NarrativeSection - Component for displaying narrative text sections
 * Used to tell the story of the exploration journey
 */
const NarrativeSection = ({ content }) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="mb-16 bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-md p-6 md:p-8 rounded-xl shadow-2xl border border-white/10"
    >
      <div className="flex items-start">
        <div className="hidden md:block mr-6 text-4xl">🚀</div>
        <p className="text-lg text-gray-300 leading-relaxed italic">
          {content}
        </p>
      </div>
    </motion.div>
  );
};

NarrativeSection.propTypes = {
  content: PropTypes.string.isRequired
};

export default NarrativeSection;
