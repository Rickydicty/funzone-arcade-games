
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from '../components/Header';
import Footer from '../components/Footer';
import AdSpace from '../components/AdSpace';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TicTacToe: React.FC = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [gameHistory, setGameHistory] = useState<{winner: string | null, date: string}[]>([]);

  // Check for winner
  useEffect(() => {
    const calculatedWinner = calculateWinner(board);
    if (calculatedWinner) {
      setWinner(calculatedWinner);
      const newHistory = [...gameHistory, { winner: calculatedWinner, date: new Date().toLocaleString() }];
      setGameHistory(newHistory);
      toast(`${calculatedWinner} wins the game!`, {
        description: "Congratulations!",
      });
    } else if (!board.includes(null) && !calculatedWinner) {
      setWinner("Draw");
      const newHistory = [...gameHistory, { winner: "Draw", date: new Date().toLocaleString() }];
      setGameHistory(newHistory);
      toast("Game ended in a draw!", {
        description: "Try again!",
      });
    }
  }, [board]);

  // Handle click on a square
  const handleClick = (index: number) => {
    if (board[index] || winner) {
      return;
    }

    const newBoard = board.slice();
    newBoard[index] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  };

  // Reset the game
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setXIsNext(true);
  };

  // Render a single square
  const renderSquare = (index: number) => (
    <button
      className={`w-20 h-20 text-3xl font-bold border border-gray-400 flex items-center justify-center 
        ${board[index] === 'X' ? 'text-blue-500' : 'text-red-500'} 
        hover:bg-gray-100 transition-colors`}
      onClick={() => handleClick(index)}
    >
      {board[index]}
    </button>
  );

  // Calculate winner
  function calculateWinner(squares: Array<string | null>): string | null {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a] as string;
      }
    }
    return null;
  }

  const status = winner
    ? winner === "Draw"
      ? "Game ended in a draw!"
      : `Winner: ${winner}`
    : `Next player: ${xIsNext ? 'X' : 'O'}`;

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
              <CardTitle className="text-2xl font-bold text-center">Tic-Tac-Toe</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="mb-4 text-xl font-medium">{status}</div>
              <div className="mb-8">
                <div className="grid grid-cols-3">
                  {renderSquare(0)}
                  {renderSquare(1)}
                  {renderSquare(2)}
                </div>
                <div className="grid grid-cols-3">
                  {renderSquare(3)}
                  {renderSquare(4)}
                  {renderSquare(5)}
                </div>
                <div className="grid grid-cols-3">
                  {renderSquare(6)}
                  {renderSquare(7)}
                  {renderSquare(8)}
                </div>
              </div>
              <Button onClick={resetGame} variant="default" className="bg-funzone-purple hover:bg-funzone-dark-purple">
                New Game
              </Button>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>How to Play</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Players take turns placing X or O on the board</li>
                  <li>First to get 3 in a row (horizontal, vertical, or diagonal) wins</li>
                  <li>If the board fills up with no winner, the game is a draw</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Game History</CardTitle>
              </CardHeader>
              <CardContent>
                {gameHistory.length > 0 ? (
                  <ul className="space-y-2">
                    {gameHistory.map((game, index) => (
                      <li key={index} className="text-sm border-b pb-2">
                        {game.winner === "Draw" ? "Draw" : `Winner: ${game.winner}`} 
                        <span className="text-gray-500 text-xs block">{game.date}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No games played yet.</p>
                )}
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

export default TicTacToe;
