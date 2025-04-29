import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

function FAQSection() {
  const { t } = useTranslation(['home']);
  const [openIndex, setOpenIndex] = useState(null);

  const faqItems = [
    { key: 'replace_audit' },
    { key: 'bug_types' },
    { key: 'private_code' },
    { key: 'ci_cd' },
    { key: 'languages' },
    { key: 'vulnerabilities' }
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
                
                {openIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 text-gray-300"
                  >
                    <p>{t(`faq.items.${item.key}.answer`)}</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
