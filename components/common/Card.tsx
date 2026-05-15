
import React from 'react';
import { motion } from 'motion/react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', delay = 0, hover = false }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: delay * 0.1 }}
      className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden ${hover ? 'hover:shadow-md transition-all hover:-translate-y-0.5' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Card;
