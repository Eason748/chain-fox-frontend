import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'framer-motion';

function FAQSection() {
  const { t } = useTranslation(['home', 'common']);
  const [openIndex, setOpenIndex] = useState(null);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const contractAddress = "RhFVq1Zt81VvcoSEMSyCGZZv5SwBdA8MV7w4HEMpump";

  const copyToClipboard = (e) => {
    e.stopPropagation(); // Prevent toggling the FAQ when clicking the copy button
    navigator.clipboard.writeText(contractAddress).then(() => {
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    });
  };

  const faqItems = [
    { key: 'replace_audit' },
    { key: 'bug_types' },
    { key: 'private_code' },
    { key: 'ci_cd' },
    { key: 'languages' },
    { key: 'vulnerabilities' },
    { key: 'contract_address' }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            {t('faq.title')}
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {t('faq.subtitle')}
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {faqItems.map((item, index) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="mb-6"
            >
              <div
                className="floating bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 cursor-pointer"
                onClick={() => toggleFAQ(index)}
              >
                <div className="flex justify-between items-center">
                  {/* Changed gradient-text to text-white */}
                  <h3 className="text-xl font-bold text-white">
                    {t(`faq.items.${item.key}.question`)}
                  </h3>
                  <div className="text-2xl transition-transform duration-300 text-white" style={{ transform: openIndex === index ? 'rotate(45deg)' : 'rotate(0)' }}> {/* Also changed '+' color */}
                    +
                  </div>
                </div>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 text-gray-300"
                    >
                      {item.key === 'contract_address' ? (
                        <div>
                          <p>
                            {t('faq.items.contract_address.answer').split(contractAddress)[0]}
                            <span
                              className="font-mono text-blue-400 cursor-pointer hover:text-blue-300 transition-colors duration-200 select-all inline-flex items-center group"
                              onClick={copyToClipboard}
                            >
                              {contractAddress}
                              <span className="ml-2 text-blue-500 group-hover:text-blue-400">
                                {copiedAddress ? (
                                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                                  </svg>
                                )}
                              </span>
                            </span>
                            {t('faq.items.contract_address.answer').split(contractAddress)[1]}
                          </p>
                          {copiedAddress && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="mt-2 text-xs text-green-400"
                            >
                              {t('common:copied')}
                            </motion.div>
                          )}
                        </div>
                      ) : (
                        <p>{t(`faq.items.${item.key}.answer`)}</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
