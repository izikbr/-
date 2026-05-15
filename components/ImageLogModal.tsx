import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, X, ImageIcon, Trash2, Send } from 'lucide-react';
import { FoodItem } from '../types';
import Card from './common/Card';
import Spinner from './common/Spinner';
import { getFoodFromImage } from '../services/apiService';

interface ImageLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLog: (items: Omit<FoodItem, 'id'>[]) => void;
}

const ImageLogModal: React.FC<ImageLogModalProps> = ({ isOpen, onClose, onLog }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleReset = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setError(null);
    setIsLoading(false);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
      handleReset();
      onClose();
  }

  const handleSubmit = async () => {
    if (!imageFile) {
      setError("אנא בחר קובץ תמונה.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const foodItems = await getFoodFromImage(imageFile);
      if (foodItems.length > 0) {
        onLog(foodItems);
        handleClose();
      } else {
        setError("לא הצלחנו לזהות מזון בתמונה. אנא נסה תמונה אחרת.");
      }
    } catch (err) {
      console.error(err);
      setError("אירעה שגיאה בניתוח התמונה. אנא נסה שוב.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md relative z-10"
          >
            <Card className="overflow-visible">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Camera size={22} className="text-primary-500" /> הוספה מתמונה ב-AI
                  </h2>
                  <button onClick={handleClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-6">
                  {!previewUrl ? (
                      <motion.div 
                          whileHover={{ scale: 1.01, borderColor: '#0ea5e9' }}
                          whileTap={{ scale: 0.99 }}
                          className="h-64 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-primary-50/30 transition-all group"
                          onClick={() => fileInputRef.current?.click()}
                      >
                          <div className="p-4 bg-white rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform">
                            <ImageIcon size={48} className="text-slate-400 group-hover:text-primary-500 transition-colors" />
                          </div>
                          <p className="text-slate-600 font-bold">לחץ כאן לבחירת תמונה</p>
                          <p className="text-slate-400 text-sm mt-1">או גרור תמונה לכאן</p>
                      </motion.div>
                  ) : (
                    <div className="relative">
                      <motion.img 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        src={previewUrl} 
                        alt="Food preview" 
                        className="w-full h-64 object-cover rounded-3xl shadow-lg border border-white" 
                      />
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleReset}
                        className="absolute top-3 right-3 bg-white/80 backdrop-blur-md text-red-500 rounded-full p-2 hover:bg-white shadow-lg transition-all"
                      >
                        <Trash2 size={20} />
                      </motion.button>
                    </div>
                  )}
                  <input 
                      type="file" 
                      accept="image/*" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                  />

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm text-center rounded-xl font-medium"
                    >
                      {error}
                    </motion.div>
                  )}
                  
                  <div className="flex gap-3">
                    <button 
                      type="button" 
                      onClick={handleClose} 
                      className="flex-1 py-4 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
                    >
                      ביטול
                    </button>
                    <motion.button
                      whileHover={imageFile && !isLoading ? { scale: 1.02 } : {}}
                      whileTap={imageFile && !isLoading ? { scale: 0.98 } : {}}
                      type="button"
                      onClick={handleSubmit}
                      disabled={!imageFile || isLoading}
                      className="flex-[2] py-4 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary-200"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Spinner />
                          <span>מנתח תמונה...</span>
                        </div>
                      ) : (
                        <>
                          <Send size={18} />
                          <span>נתח תמונה</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ImageLogModal;