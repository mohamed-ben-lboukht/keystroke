import React from 'react';
import ChatGameInterface from './ChatGameInterface';

function App() {
  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div className="fixed top-4 right-4 z-50">
        <a
          href="../enrollment/index.html"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          S'inscrire
        </a>
      </div>
      <ChatGameInterface />
    </div>
  );
}

export default App;