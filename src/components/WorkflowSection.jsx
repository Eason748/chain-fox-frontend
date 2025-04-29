import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

function WorkflowSection() {
  const { t } = useTranslation(['home']);

  const workflowSteps = [
    {
      key: 'upload',
      icon: '📤',
      delay: 0
    },
    {
      key: 'detect',
      icon: '🔍',
      delay: 0.2
    },
    {
      key: 'report',
      icon: '📊',
      delay: 0.4
    },
    {
      key: 'upgrade',
      icon: '⚡',
      delay: 0.6
    }
  ];

  return (
    <section id="workflow" className="py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            {t('workflow.title')}
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {t('workflow.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {workflowSteps.map((step, index) => (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 + step.delay }}
              className="relative"
            >
              <div className="floating bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 h-full">
                <div className="text-4xl mb-4">{step.icon}</div>
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <h3 className="text-2xl font-bold mb-4 gradient-text">
                  {t(`workflow.steps.${step.key}.title`)}
                </h3>
                <p className="text-gray-400">
                  {t(`workflow.steps.${step.key}.description`)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WorkflowSection;
