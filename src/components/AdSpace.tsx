
import React from 'react';

interface AdSpaceProps {
  width: string;
  height: string;
  className?: string;
}

const AdSpace: React.FC<AdSpaceProps> = ({ width, height, className }) => {
  return (
    <div 
      className={`bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center ${className}`} 
      style={{ width, height }}
    >
      <p className="text-gray-500 text-sm font-roboto">Advertisement Space</p>
    </div>
  );
};

export default AdSpace;
