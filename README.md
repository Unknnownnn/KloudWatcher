# KloudWatcher - Disaster Management System

A comprehensive disaster management system that helps track, respond to, and manage resources for various disasters.

## Features

- Interactive map visualization using Python-based mapping
- Real-time disaster tracking and management
- Resource allocation and management
- Response coordination system
- Analytics and reporting

## Prerequisites

- Node.js (v18 or higher)
- Python (v3.8 or higher)
- pip (Python package manager)

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd kloudwatcher2
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
cd ..
```

## Running the Application

1. Start the Python backend server:
```bash
cd backend
python -m uvicorn app.main:app --reload
```

2. In a new terminal, start the frontend development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## Architecture

- Frontend: Next.js with TypeScript and Tailwind CSS
- Backend: FastAPI (Python) with Folium for map generation
- Real-time updates using React state management
- Modern UI components using shadcn/ui

## Development

The application is structured as follows:

- `/app` - Next.js pages and routing
- `/components` - React components
- `/backend` - Python FastAPI server
- `/public` - Static assets
- `/styles` - Global styles and Tailwind configuration

## API Endpoints

- `GET /api/map` - Get the disaster map visualization
- `POST /api/disasters/{disaster_id}/respond` - Submit a disaster response
- `GET /api/disasters/{disaster_id}/resources` - Get resources for a specific disaster

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 