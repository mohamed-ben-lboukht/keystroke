import React, { useState, useEffect, useRef } from 'react';
import { User, Clock, Trophy, Send } from 'lucide-react';
import './ChatGameInterface.css';

const ChatGameInterface = () => {
  // Game state
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [gameActive, setGameActive] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [timeUp, setTimeUp] = useState(false);
  
  const chatAreaRef = useRef(null);
  
  // Format time as M:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  // Handle sending a question
  const handleSendQuestion = () => {
    if (!gameActive || !inputValue.trim()) return;
    
    // Add user message
    const newMessages = [...messages, { text: inputValue, sender: 'user' }];
    setMessages(newMessages);
    setInputValue('');
    
    // Generate opponent response
    setTimeout(() => {
      const responses = ['Oui', 'Non', 'Peut-être'];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setMessages(prev => [...prev, { text: randomResponse, sender: 'opponent' }]);
    }, 800);
  };
  
  // Handle key press for input field
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendQuestion();
    }
  };
  
  // Start timer countdown
  useEffect(() => {
    if (!gameActive) return;
    
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setGameActive(false);
          setTimeUp(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [gameActive]);
  
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);
  
  return (
    <div className="game-container">
      {/* Left panel - Player info */}
      <div className="left-panel">
        <div className="player-info">
          <div className="player-info-icon">
            <User size={20} />
          </div>
          <div>
            <div className="player-name">Marie</div>
            <div className="player-name">Laurent</div>
          </div>
        </div>
        
        <div className="character-badge">
          Personnage de manga
        </div>
        
        <div className="stats-container">
          <div className="timer">
            <div className="timer-icon">
              <Clock size={18} />
            </div>
            <span>{formatTime(timeRemaining)}</span>
          </div>
          <div className="points">
            <div className="points-icon">
              <Trophy size={18} />
            </div>
            <span className="points-value">125 pts</span>
          </div>
        </div>
      </div>
      
      {/* Center panel - Game content */}
      <div className="center-panel">
        {messages.length === 0 && (
          <div className="game-instructions">
            <p>Posez des questions pour deviner le personnage de votre adversaire !</p>
            <p>Vous avez 5 minutes pour le découvrir.</p>
          </div>
        )}
        
        <div className="chat-area" ref={chatAreaRef}>
          {/* Chat messages will appear here */}
        </div>
        
        {timeUp && (
          <div className="time-up">
            Le temps est écoulé !
          </div>
        )}
        
        <div className="message-input">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Posez votre question ici..."
            disabled={!gameActive}
          />
          <button
            className="send-button"
            onClick={handleSendQuestion}
            disabled={!gameActive}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
      
      {/* Right panel - Opponent info */}
      <div className="right-panel">
        <div className="opponent-info">
          <div className="opponent-name">Thomas Dupont</div>
          <div className="opponent-rank">Rang #7</div>
        </div>
        
        <div className="character-container">
          <div className="character-placeholder">
            <div>400</div>
            <div>×</div>
            <div>400</div>
            <div className="character-label">
              Votre personnage mystère
            </div>
          </div>
        </div>
        
        <div className="rules-section">
          <h3 className="rules-title">Règles du jeu</h3>
          <ul className="rules-list">
            <li>
              <span className="bullet">•</span>
              <span>Posez des questions pour deviner le personnage</span>
            </li>
            <li>
              <span className="bullet">•</span>
              <span>L'adversaire ne peut répondre que par <span className="highlight">oui/non/peut-être</span></span>
            </li>
            <li>
              <span className="bullet">•</span>
              <span>Vous avez 5 minutes pour trouver</span>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Bottom bar - Time's up message */}
      {timeUp && (
        <div className="bottom-bar">
          <span>Le temps est écoulé !</span>
          <button className="send-button">
            <Send size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatGameInterface;