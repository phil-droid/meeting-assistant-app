# Meeting Assistant App

A comprehensive application for recording meetings, generating notes, creating reports, and providing AI-powered insights.

## Features

- 🎥 **Screen Recording** - Capture meeting sessions with high quality
- 📝 **Meeting Notes** - Auto-generate notes during recordings
- 📊 **Report Generation** - Create detailed meeting reports
- 💡 **Smart Suggestions** - AI-powered recommendations based on meeting outcomes
- ✉️ **Email Drafting** - Auto-generate follow-up emails
- 🤖 **Integrated Chatbot** - Connected via LiteLLM for meeting insights

## Project Structure

```
meeting-assistant-app/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── config/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── utils/
│   ├── package.json
│   └── .env.example
├── frontend/                # React UI
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── styles/
│   │   └── App.jsx
│   ├── package.json
│   └── .env.example
├── docker-compose.yml
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Docker (optional)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## API Documentation

API documentation will be available at `http://localhost:5000/api/docs` once the server is running.

## Technologies Used

- **Backend**: Node.js, Express.js, LiteLLM
- **Frontend**: React, Tailwind CSS, Axios
- **Recording**: MediaRecorder API, FFmpeg
- **AI/ML**: OpenAI API (via LiteLLM), Whisper for transcription
- **Database**: MongoDB/PostgreSQL
- **Deployment**: Docker, Docker Compose

## License

MIT
