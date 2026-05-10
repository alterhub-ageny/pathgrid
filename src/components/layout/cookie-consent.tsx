'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('cookie-consent');
    if (!accepted) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
        >
          <div className="max-w-7xl mx-auto bg-white dark:bg-navy-800 border border-navy-100 dark:border-navy-700 rounded-2xl shadow-2xl p-4 flex items-center justify-between gap-4">
            <p className="text-sm text-navy-600 dark:text-navy-300">
              We use cookies to improve your experience. By using this site you accept our cookie policy.
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={accept}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-navy-700 dark:bg-gold-500 text-white dark:text-navy-900 hover:opacity-90 transition-opacity">
                Accept
              </button>
              <button onClick={() => setVisible(false)}
                className="p-2 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-700 transition-colors">
                <X className="w-4 h-4 text-navy-400" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
