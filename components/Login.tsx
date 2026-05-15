import React from 'react';
import { motion } from 'motion/react';
import { LogIn, Flame } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';

const Login: React.FC = () => {
  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      alert("שגיאה בהתחברות. נסה שוב.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="w-20 h-20 bg-primary-600 rounded-3xl flex items-center justify-center shadow-xl shadow-primary-200 mb-6 mx-auto">
          <Flame size={48} className="text-white" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-2">קלוריק</h1>
        <p className="text-slate-500 text-lg max-w-sm mx-auto">
          מעקב תזונה חכם מבוסס AI. 
          התחבר כדי להתחיל את המסע שלך.
        </p>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleLogin}
        className="flex items-center gap-3 px-8 py-4 bg-white border-2 border-slate-200 rounded-2xl font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all"
      >
        <LogIn size={20} className="text-primary-600" />
        התחבר באמצעות Google
      </motion.button>

      <p className="mt-8 text-sm text-slate-400">
        על ידי התחברות, אתה מסכים לתנאי השימוש שלנו.
      </p>
    </div>
  );
};

export default Login;
