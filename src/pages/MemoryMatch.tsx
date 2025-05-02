
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from '../components/Header';
import Footer from '../components/Footer';
import AdSpace from '../components/AdSpace';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CardType {
  id: number;
  value: string;
  flipped: boolean;
  matched: boolean;
}

const MemoryMatch: React.FC = () => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number | null>(null);

  // Card emojis for matching
  const emojis = ['🎮', '🎯', '🎲', '🎪', '🎭', '🎨', '🎬', '🎤'];

  // Initialize game
  const initializeGame = () => {
    // Create pairs of cards with emojis
    const cardValues = [...emojis, ...emojis];
    
    // Shuffle the cards
    const shuffledCards = cardValues
      .sort(() => Math.random() - 0.5)
      .map((value, index) => ({
        id: index,
        value,
        flipped: false,
        matched: false,
      }));
    
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setTimer(0);
    setGameStarted(false);
    setGameCompleted(false);
  };

  // Start game timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (gameStarted && !gameCompleted) {
      interval = setInterval(() => {
        setTimer(prevTime => prevTime + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStarted, gameCompleted]);

  // Initialize on first load
  useEffect(() => {
    initializeGame();
    // Check for best score in local storage
    const storedBestScore = localStorage.getItem('memoryMatchBestScore');
    if (storedBestScore) {
      setBestScore(parseInt(storedBestScore));
    }
  }, []);

  // Check if game is complete
  useEffect(() => {
    if (matchedPairs === emojis.length && gameStarted) {
      setGameCompleted(true);
      
      // Update best score if current score is better or no best score exists
      if (!bestScore || moves < bestScore) {
        setBestScore(moves);
        localStorage.setItem('memoryMatchBestScore', moves.toString());
        toast("New best score!", {
          description: `You completed the game in ${moves} moves!`,
        });
      } else {
        toast("Game completed!", {
          description: `You completed the game in ${moves} moves!`,
        });
      }
    }
  }, [matchedPairs, gameStarted]);

  // Handle card click
  const handleCardClick = (id: number) => {
    // Don't allow clicks if game is completed or the card is already flipped or matched
    if (
      gameCompleted || 
      cards[id].flipped || 
      cards[id].matched || 
      flippedCards.length >= 2
    ) {
      return;
    }
    
    // Start the game on first card click
    if (!gameStarted) {
      setGameStarted(true);
    }
    
    // Flip the card
    const newCards = [...cards];
    newCards[id].flipped = true;
    setCards(newCards);
    
    // Add to flipped cards
    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);
    
    // If two cards are flipped, check for match
    if (newFlippedCards.length === 2) {
      setMoves(prevMoves => prevMoves + 1);
      
      const [firstId, secondId] = newFlippedCards;
      
      // Check if cards match
      if (cards[firstId].value === cards[secondId].value) {
        // Cards match
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[firstId].matched = true;
          matchedCards[secondId].matched = true;
          setCards(matchedCards);
          setFlippedCards([]);
          setMatchedPairs(prevMatches => prevMatches + 1);
        }, 500);
      } else {
        // Cards don't match, flip them back
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[firstId].flipped = false;
          resetCards[secondId].flipped = false;
          setCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/" className="flex items-center text-funzone-purple hover:text-funzone-dark-purple transition-colors">
            <ArrowLeft size={20} className="mr-2" />
            Back to Games
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">Memory Match</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4 text-center">
                <div>
                  <p className="font-bold">Moves</p>
                  <p className="text-2xl">{moves}</p>
                </div>
                <div>
                  <p className="font-bold">Time</p>
                  <p className="text-2xl">{formatTime(timer)}</p>
                </div>
                <div>
                  <p className="font-bold">Matches</p>
                  <p className="text-2xl">{matchedPairs}/{emojis.length}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-2 mb-6">
                {cards.map(card => (
                  <div
                    key={card.id}
                    className={`aspect-square bg-white border-2 rounded-lg shadow-md flex items-center justify-center text-4xl cursor-pointer transition-all duration-300 transform 
                      ${card.flipped || card.matched ? 'rotate-y-0' : 'bg-funzone-purple text-transparent rotate-y-180'} 
                      ${card.matched ? 'border-green-500 shadow-green-200' : 'border-gray-200'}
                      ${(!card.matched && !card.flipped) ? 'hover:border-funzone-dark-purple' : ''}`}
                    onClick={() => handleCardClick(card.id)}
                  >
                    {card.flipped || card.matched ? card.value : '?'}
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center">
                <Button 
                  onClick={initializeGame} 
                  variant="default" 
                  className="bg-funzone-purple hover:bg-funzone-dark-purple"
                >
                  New Game
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>How to Play</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Click on cards to flip them over</li>
                  <li>Try to find matching pairs of cards</li>
                  <li>The game is complete when all pairs are matched</li>
                  <li>Try to finish in as few moves as possible</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Game Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">Current Game:</p>
                    <p>Moves: {moves}</p>
                    <p>Time: {formatTime(timer)}</p>
                  </div>
                  
                  <div>
                    <p className="font-medium">Best Score:</p>
                    <p>{bestScore ? `${bestScore} moves` : 'No games completed yet'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <AdSpace width="300px" height="250px" />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MemoryMatch;
