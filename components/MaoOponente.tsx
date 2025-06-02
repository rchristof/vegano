import React from 'react';

interface MaoOponenteProps {
  quantidade: number;
}

const MaoOponente: React.FC<MaoOponenteProps> = ({ quantidade }) => {
  return (
    <div className="flex gap-2">
      {Array.from({ length: quantidade }).map((_, idx) => (
        <div
          key={idx}
          className="w-12 h-16 bg-gray-600 rounded-lg shadow-lg flex items-center justify-center"
        >
          <div className="w-8 h-12 bg-gray-300 rounded-sm" />
        </div>
      ))}
    </div>
  );
};

export default MaoOponente;
