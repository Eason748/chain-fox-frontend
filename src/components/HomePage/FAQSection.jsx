import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'framer-motion';
import { openDexScreenerSafe } from '../../utils/safeExternalLink';

function FAQSection() {
  const { t } = useTranslation(['home', 'common']);
  const [openIndex, setOpenIndex] = useState(null);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // 硬编码合约地址，防止被篡改
  const contractAddress = "RhFVq1Zt81VvcoSEMSyCGZZv5SwBdA8MV7w4HEMpump";

  // 使用安全的外部链接处理函数
  const openDexScreener = (e) => {
    // 使用自定义的国际化消息
    const warningMessage = t('common:externalLink.dexscreenerWarning',
      '您将被重定向到DexScreener查看合约信息。是否继续？');

    // 使用安全的链接打开函数
    openDexScreenerSafe(contractAddress, {
      warningMessage,
      onError: (error) => console.error('DexScreener链接错误:', error)
    }, e);
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
            {t('home:faq.title')}
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {t('home:faq.subtitle')}
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
                    {t(`home:faq.items.${item.key}.question`)}
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
                            {t('home:faq.items.contract_address.answer').split(contractAddress)[0]}
                            <span
                              className="font-mono text-blue-400 cursor-pointer hover:text-blue-300 transition-colors duration-200 inline-flex items-center group break-all"
                              onClick={openDexScreener}
                            >
                              <span className="truncate max-w-[180px] sm:max-w-[250px] md:max-w-full">{contractAddress}</span>
                              <span className="ml-2 text-blue-500 group-hover:text-blue-400 flex-shrink-0">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                </svg>
                              </span>
                            </span>
                            {t('home:faq.items.contract_address.answer').split(contractAddress)[1]}
                          </p>
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-2 text-xs text-blue-400"
                          >
                            {t('home:faq.clickToView')}
                          </motion.div>
                        </div>
                      ) : (
                        <p>{t(`home:faq.items.${item.key}.answer`)}</p>
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
