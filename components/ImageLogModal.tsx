import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { FoodItem } from '../types';
import Card from './common/Card';
import Spinner from './common/Spinner';
import { getFoodFromImage } from '../services/apiService';

interface ImageLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLog: (items: Omit<FoodItem, 'id'>[]) => void;
  ai: GoogleGenAI;
}

// FIX: Implemented the ImageLogModal component for analyzing food from an image.
const ImageLogModal: React.FC<ImageLogModalProps> = ({ isOpen, onClose, onLog, ai }) => {
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
      const foodItems = await getFoodFromImage(ai, imageFile);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">הוספה מתמונה</h2>
            <button onClick={handleClose} className="text-slate-500 hover:text-slate-800 text-2xl leading-none">&times;</button>
          </div>
          
          <div className="space-y-4">
            {!previewUrl ? (
                 <div 
                    className="h-48 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-slate-50 transition"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 mb-2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    <p className="text-slate-500">לחץ כאן כדי לבחור תמונה</p>
                </div>
            ) : (
              <div className="relative">
                <img src={previewUrl} alt="Food preview" className="w-full h-48 object-cover rounded-lg" />
                <button 
                  onClick={handleReset}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1.5 hover:bg-opacity-75"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            )}
            <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}
            
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={handleClose} className="px-6 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition">
                ביטול
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!imageFile || isLoading}
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
              >
                {isLoading ? <Spinner /> : 'נתח תמונה'}
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ImageLogModal;