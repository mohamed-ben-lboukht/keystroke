# Full Stack Chat App with Challenge Game

A modern chat application built with the MERN stack, featuring real-time messaging, user authentication, and an interactive challenge game.

## Features

- Real-time messaging with Socket.io
- User authentication with JWT
- Online user status tracking
- Global state management with Zustand
- Profile Challenge Game with points system
- Leaderboard for tracking top players
- Personal profile with preferences
- Modern UI with TailwindCSS and DaisyUI

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB
- Real-time: Socket.io
- Styling: TailwindCSS + DaisyUI
- State Management: Zustand

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/fullstack-chat-app.git
cd fullstack-chat-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the backend directory:
```env
MONGODB_URI=your_mongodb_uri
PORT=5001
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

4. Add avatar images:
Add cartoon avatars to the `frontend/public/avatars` folder:
- avatar1.png
- avatar2.png
- avatar3.png
- avatar4.png
- avatar5.png
- avatar6.png

### Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to:
```
http://localhost:5173
```

## Challenge Game Features

- Create a profile with personal preferences
- Choose a cartoon avatar
- Challenge other users to a 5-minute profile guessing game
- Earn points by correctly identifying if a profile is real or fake
- Track progress on the leaderboard
- Analyze typing patterns during conversations

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ENSICAEN License - see the [LICENSE](LICENSE) file for details.
