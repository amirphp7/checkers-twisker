import React from 'react';
import { BrowserRouter } from 'react-router-dom'
import GameBoard from './components/GameBoard'


function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <GameBoard />
      </div>
    </BrowserRouter>    
  );
}

export default App;
