
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TicTacToe from "./pages/TicTacToe";
import MemoryMatch from "./pages/MemoryMatch";
import Snake from "./pages/Snake";
import Sudoku from "./pages/Sudoku";
import Hangman from "./pages/Hangman";
import Game2048 from "./pages/Game2048";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/games/tic-tac-toe" element={<TicTacToe />} />
          <Route path="/games/memory-match" element={<MemoryMatch />} />
          <Route path="/games/snake" element={<Snake />} />
          <Route path="/games/sudoku" element={<Sudoku />} />
          <Route path="/games/hangman" element={<Hangman />} />
          <Route path="/games/2048" element={<Game2048 />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
