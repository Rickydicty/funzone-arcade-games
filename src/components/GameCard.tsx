
import React from 'react';

interface GameCardProps {
  title: string;
  description: string;
  imageUrl: string;
  gameUrl: string;
}

const GameCard: React.FC<GameCardProps> = ({ title, description, imageUrl, gameUrl }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
      <div className="h-48 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <h2 className="text-xl font-bold mb-2 font-roboto text-gray-800">{title}</h2>
        <p className="text-gray-600 mb-4 flex-grow font-roboto text-sm">{description}</p>
        <a 
          href={gameUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="bg-funzone-purple hover:bg-funzone-dark-purple text-white py-2 px-4 rounded-lg font-medium transition-colors duration-300 text-center font-roboto"
        >
          Play Now
        </a>
      </div>
    </div>
  );
};

export default GameCard;
