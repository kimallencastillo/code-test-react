import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import Launches from './view/Launches';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Launches />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
