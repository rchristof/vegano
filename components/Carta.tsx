import React from 'react';

interface CartaType {
  name: string;
  image: string;
}

interface CartaProps {
  carta: CartaType;
}

const Carta: React.FC<CartaProps> = ({ carta }) => {
  return (
    <div className="w-20 h-32 rounded-lg shadow-lg flex items-center justify-center border border-gray-300 bg-gradient-to-br from-white to-gray-200 hover:scale-105 transition-transform">
      {/* Substitua por <img src={carta.image} /> se tiver imagens */}
      <span className="font-semibold text-xs text-center text-gray-700">{carta.name}</span>
    </div>
  );
};

export default Carta;
