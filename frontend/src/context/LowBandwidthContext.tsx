import React, { createContext, useContext, useState, useEffect } from 'react';

interface LowBandwidthContextType {
  isLowBandwidth: boolean;
  toggleLowBandwidth: () => void;
}

const LowBandwidthContext = createContext<LowBandwidthContextType | undefined>(undefined);

export const LowBandwidthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLowBandwidth, setIsLowBandwidth] = useState<boolean>(() => {
    return localStorage.getItem('lifelink_low_bandwidth') === 'true';
  });

  useEffect(() => {
    if (isLowBandwidth) {
      document.body.classList.add('low-bandwidth');
    } else {
      document.body.classList.remove('low-bandwidth');
    }
    localStorage.setItem('lifelink_low_bandwidth', String(isLowBandwidth));
  }, [isLowBandwidth]);

  const toggleLowBandwidth = () => {
    setIsLowBandwidth((prev) => !prev);
  };

  return (
    <LowBandwidthContext.Provider value={{ isLowBandwidth, toggleLowBandwidth }}>
      {children}
    </LowBandwidthContext.Provider>
  );
};

export const useLowBandwidth = () => {
  const context = useContext(LowBandwidthContext);
  if (!context) {
    throw new Error('useLowBandwidth must be used within LowBandwidthProvider');
  }
  return context;
};
