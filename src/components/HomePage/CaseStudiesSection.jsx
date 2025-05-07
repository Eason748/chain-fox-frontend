import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import SafeExternalLink from '../common/SafeExternalLink';

function CaseStudiesSection() {
  const { t } = useTranslation(['home']);

  const caseStudies = [
    {
      key: 'solana',
      delay: 0,
      logo: '/imgs/solana.png',
      url: 'https://solana.com'
    },
    {
      key: 'ethereum',
      delay: 0.1,
      logo: '/imgs/ethereum.png',
      url: 'https://ethereum.org'
    },
    {
      key: 'polkadot',
      delay: 0.2,
      logo: '/imgs/polkadot.png',
      url: 'https://polkadot.network'
    },
    {
      key: 'foundry',
      delay: 0.3,
      logo: '/imgs/foundry.png',
      url: 'https://book.getfoundry.sh'
    },
    {
      key: 'conflux',
      delay: 0.4,
      logo: '/imgs/conflux.png',
      url: 'https://confluxnetwork.org'
    },
    {
      key: 'grin',
      delay: 0.5,
      logo: '/imgs/grin.png',
      url: 'https://grin.mw'
    }
  ];

  return (
    <section id="case-studies" className="py-20 bg-black/50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            {t('caseStudies.title')}
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {t('caseStudies.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-5xl mx-auto">
          {caseStudies.map((study) => (
            <motion.div
              key={study.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 + study.delay }}
              whileHover={{ scale: 1.05 }}
              className="floating bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 flex flex-col items-center justify-center text-center cursor-pointer"
            >
              <SafeExternalLink
                href={study.url}
                className="flex flex-col items-center justify-center w-full h-full"
                allowedDomains={[new URL(study.url).hostname]}
                warningMessage={t('common:externalLink.generalWarning')}
              >
                <div className="h-16 w-16 mb-4 flex items-center justify-center">
                  <img src={study.logo} alt={t(`caseStudies.projects.${study.key}`)} className="max-h-full max-w-full object-contain" />
                </div>
                <h3 className="text-xl font-bold gradient-text">
                  {t(`caseStudies.projects.${study.key}`)}
                </h3>
              </SafeExternalLink>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CaseStudiesSection;
