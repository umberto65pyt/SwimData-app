# SwimData-app

A web-based application for benchmarking age group swimmers' performance against international standards.

## Features

- Athlete profile management
- Personal best time tracking
- International benchmark comparisons (FINA standards)
- Performance analysis and percentile ratings
- Progress tracking over time
- Visual dashboards and reports
- Data export capabilities

## Tech Stack

- **Frontend**: React.js with TypeScript
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL
- **Styling**: Tailwind CSS
- **API**: RESTful API

## Project Structure

```
SwimData-app/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── styles/          # Tailwind CSS
│   │   └── App.jsx
│   └── package.json
├── backend/                  # Express server
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── controllers/      # Request handlers
│   │   ├── models/          # Database models
│   │   ├── middleware/      # Express middleware
│   │   ├── config/          # Configuration files
│   │   └── server.js
│   └── package.json
├── database/                # Database setup
│   └── schema.sql           # PostgreSQL schema
└── .gitignore
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/umberto65pyt/SwimData-app.git
cd SwimData-app
```

#### 2. Database Setup

```bash
createdb swimdata_db
psql swimdata_db < database/schema.sql
```

#### 3. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm start
```

The backend will run on `http://localhost:5000`

#### 4. Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Athletes
- `GET /api/athletes` - Get all athletes
- `POST /api/athletes` - Create new athlete
- `GET /api/athletes/:id` - Get athlete by ID
- `PUT /api/athletes/:id` - Update athlete
- `DELETE /api/athletes/:id` - Delete athlete

### Times
- `GET /api/times/:athleteId` - Get athlete's times
- `POST /api/times` - Record new time
- `GET /api/times/:id` - Get specific time record

### Benchmarks
- `GET /api/benchmarks` - Get international benchmarks
- `GET /api/benchmarks/:ageGroup/:distance/:stroke` - Get specific benchmark

## Environment Variables

Create a `.env` file in the backend directory:

```
DATABASE_URL=postgresql://user:password@localhost:5432/swimdata_db
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key_here
```

## Development

### Available Scripts

**Frontend:**
```bash
npm start       # Start development server
npm test        # Run tests
npm build       # Build for production
```

**Backend:**
```bash
npm start       # Start server
npm run dev     # Start with nodemon (auto-reload)
npm test        # Run tests
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Contact

Created by umberto65pyt

---

**Next Steps:**
1. Clone the repository locally
2. Follow the Getting Started guide
3. Open the project in VS Code
4. Start developing!
