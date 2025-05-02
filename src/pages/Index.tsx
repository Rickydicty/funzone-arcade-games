
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import GameCard from '../components/GameCard';
import AdSpace from '../components/AdSpace';

const Index: React.FC = () => {
  const games = [
    {
      id: 1,
      title: 'Tic-Tac-Toe',
      description: 'The classic game of X's and O's. Challenge a friend or play against the computer!',
      imageUrl: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?q=80&w=2070&auto=format&fit=crop',
      gameUrl: '/games/tic-tac-toe.html',
    },
    {
      id: 2,
      title: 'Sudoku',
      description: 'Test your logical thinking with this number placement puzzle. Multiple difficulty levels available.',
      imageUrl: 'https://images.unsplash.com/photo-1574492909706-09f2b2f0d25f?q=80&w=1974&auto=format&fit=crop',
      gameUrl: '/games/sudoku.html',
    },
    {
      id: 3,
      title: 'Memory Match',
      description: 'Find matching pairs of cards in this classic memory game. How fast can you clear the board?',
      imageUrl: 'https://images.unsplash.com/photo-1630343710506-89f324d4e3e9?q=80&w=2070&auto=format&fit=crop',
      gameUrl: '/games/memory-match.html',
    },
    {
      id: 4,
      title: 'Snake Game',
      description: 'Control a growing snake as you collect food and avoid hitting walls or yourself!',
      imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop',
      gameUrl: '/games/snake.html',
    },
    {
      id: 5,
      title: 'Hangman',
      description: 'Guess the hidden word one letter at a time. But be careful - you only have 6 attempts!',
      imageUrl: 'https://images.unsplash.com/photo-1599508704512-2f19efd1e35f?q=80&w=2035&auto=format&fit=crop',
      gameUrl: '/games/hangman.html',
    },
    {
      id: 6,
      title: '2048',
      description: 'Join the numbers and get to the 2048 tile in this addictive puzzle game!',
      imageUrl: 'https://images.unsplash.com/photo-1611309454921-16cef3e3db2f?q=80&w=2070&auto=format&fit=crop',
      gameUrl: '/games/2048.html',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen font-roboto">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            Welcome to FunZone!
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Enjoy our collection of simple and fun web games. Perfect for quick breaks or casual gaming sessions.
          </p>
        </div>

        {/* Top Ad Space */}
        <div className="mb-8 flex justify-center">
          <AdSpace width="728px" height="90px" className="hidden md:flex" />
          <AdSpace width="320px" height="100px" className="md:hidden" />
        </div>
        
        {/* Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {games.map((game) => (
            <GameCard
              key={game.id}
              title={game.title}
              description={game.description}
              imageUrl={game.imageUrl}
              gameUrl={game.gameUrl}
            />
          ))}
        </div>
        
        {/* Bottom Ad Space */}
        <div className="mt-12 flex justify-center">
          <AdSpace width="728px" height="90px" className="hidden md:flex" />
          <AdSpace width="320px" height="100px" className="md:hidden" />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
