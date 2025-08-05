import React from 'react';

interface CartaType {
  name: string;
  image?: string;
}

interface CartaProps {
  carta: CartaType;
}

const Carta: React.FC<CartaProps> = ({ carta }) => {
  return (
    <div
      className="w-20 h-32 rounded-lg shadow-lg flex items-center justify-center border border-gray-300 hover:scale-105 transition-transform relative overflow-hidden"
      style={
        carta.image
          ? {
              backgroundImage: `url(${carta.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : {}
      }
    >
      <span className="font-semibold text-xs text-center text-white drop-shadow-md bg-black bg-opacity-40 px-2 py-1 rounded">
        {carta.name}
      </span>
    </div>
  );
};

export default Carta;
