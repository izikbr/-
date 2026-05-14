
import React from 'react';

interface BmiChartProps {
  bmi: number;
}

const BmiChart: React.FC<BmiChartProps> = ({ bmi }) => {
  const MIN_BMI = 15;
  const MAX_BMI = 40;
  const totalRange = MAX_BMI - MIN_BMI;

  const categories = [
    { name: 'תת משקל', min: MIN_BMI, max: 18.5, color: 'bg-sky-400', textColor: 'text-sky-600' },
    { name: 'תקין', min: 18.5, max: 25, color: 'bg-green-500', textColor: 'text-green-600' },
    { name: 'עודף משקל', min: 25, max: 30, color: 'bg-amber-400', textColor: 'text-amber-600' },
    { name: 'השמנת יתר', min: 30, max: MAX_BMI, color: 'bg-red-500', textColor: 'text-red-600' }
  ];

  // Calculate percentage width for each category
  const categoriesWithWidth = categories.map(cat => ({
    ...cat,
    width: ((cat.max - cat.min) / totalRange) * 100,
  }));

  const getIndicatorPosition = (bmiValue: number) => {
    const clampedBmi = Math.max(MIN_BMI, Math.min(MAX_BMI, bmiValue));
    return ((clampedBmi - MIN_BMI) / totalRange) * 100;
  };
  
  const userBmiPositionPercent = getIndicatorPosition(bmi);
  const currentCategory = categories.find(cat => bmi >= cat.min && bmi < cat.max) || categories[categories.length - 1];

  return (
    <div className="p-6">
      <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">מדד מסת גוף (BMI)</h3>
      
      <div className="relative w-full pt-10 pb-8">
        
        {/* User BMI Indicator */}
        <div 
            className="absolute top-0 z-10 flex flex-col items-center transition-all duration-300 ease-out" 
            style={{ left: `${userBmiPositionPercent}%`, transform: 'translateX(-50%)' }}
            aria-label={`ה-BMI שלך הוא ${bmi.toFixed(1)}`}
        >
            <span className="px-2 py-0.5 bg-slate-800 text-white text-sm font-bold rounded-full shadow-lg whitespace-nowrap">
                {bmi.toFixed(1)}
            </span>
            <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-6 border-t-slate-800 mt-1"></div>
        </div>

        {/* The colored bar */}
        <div className="flex h-4 rounded-md overflow-hidden shadow-inner bg-slate-200">
          {categoriesWithWidth.map(cat => (
            <div 
              key={cat.name} 
              className={cat.color} 
              style={{ width: `${cat.width}%` }}
              title={cat.name}
            />
          ))}
        </div>
        
        {/* Ticks and Labels below the bar */}
        <div className="relative w-full h-4 mt-1">
            {categoriesWithWidth.map((cat, index) => {
                if (index === categoriesWithWidth.length -1) return null;
                const position = ((cat.max - MIN_BMI) / totalRange) * 100;
                return (
                    <div key={cat.max} className="absolute top-0 h-full flex flex-col items-center" style={{ left: `${position}%`, transform: 'translateX(-50%)' }}>
                        <div className="w-px h-2 bg-slate-400"></div>
                        <span className="text-xs text-slate-500 mt-1">{cat.max}</span>
                    </div>
                );
            })}
        </div>
        
      </div>
      
      <div className="text-center mt-2">
          <p className="text-slate-600 text-lg">
            הקטגוריה שלך: <span className={`font-semibold ${currentCategory.textColor}`}>{currentCategory.name}</span>
          </p>
      </div>
    </div>
  );
};

export default BmiChart;