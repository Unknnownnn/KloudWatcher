![Image](https://github.com/user-attachments/assets/1da6a8b3-e147-4bde-b05f-b9a3b7e552c6)
# KloudWatcher - Disaster Management System

A comprehensive disaster management system that helps track, respond to, and manage resources for various disasters.

<br/>

![Image](https://github.com/user-attachments/assets/a61ce073-045d-4729-a5a1-1d33deedcfa8)
![Image](https://github.com/user-attachments/assets/0cd81722-c1bb-484e-a08d-46cd0629a5e6)
![Image](https://github.com/user-attachments/assets/d6588f82-8785-4daa-af24-629205f2a603)

<br/>

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
git clone https://github.com/Unknnownnn/KloudWatcher.git
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

## Screenshots
- DashBoard
![Image](https://github.com/user-attachments/assets/e975a173-9834-4376-86cc-0ed355195073)
![Image](https://github.com/user-attachments/assets/cc0123b4-bfae-4e0e-9d1f-b86c9a41c602)

- Disaster Overview

![Image](https://github.com/user-attachments/assets/4df52770-c8d4-41aa-9dc1-646b62a42a54)
![Image](https://github.com/user-attachments/assets/13ce3bb5-6ca8-4fd8-bc00-8ff9feb61309)

- Resource Management

![Image](https://github.com/user-attachments/assets/6b5a6087-361e-4b61-81a4-b29e4ca5ea2e)
![Image](https://github.com/user-attachments/assets/e79ad2ba-dc34-47e3-a7d6-4f2b54eb7a36)

- Calender

![Image](https://github.com/user-attachments/assets/66da5ccf-2679-4251-8593-d018f37d4da4)

- Team Overview

![Image](https://github.com/user-attachments/assets/48d7706f-0ea3-42ae-85e4-2e7d9135c6b2)

## Development

The application is structured as follows:

- `/app` - Next.js pages and routing
- `/components` - React components
- `/backend` - Python FastAPI server
- `/public` - Static assets
- `/styles` - Global styles and Tailwind configuration
  

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
