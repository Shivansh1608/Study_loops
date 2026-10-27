# QuizForge (NoteWise AI / Study Loop)

A production-grade, AI-powered study companion that converts lecture notes and PDFs into interactive quizzes, active recall flashcards with spaced repetition (SM-2), and revision summaries.

## Tech Stack
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, React Router v6/v7, TanStack Query, Zustand, Axios, Recharts, Lucide Icons.
- **Backend**: Python 3.11+, FastAPI, Uvicorn, SQLAlchemy 2.0, Alembic, Pydantic v2, PyMuPDF, SlowAPI.
- **AI Service**: Agnostic multi-provider layer (`services/ai.py`) supporting Google Gemini & Anthropic Claude with strict Pydantic JSON validation, fallback simulation, and retry policies.
- **Database**: SQLite (dev) / PostgreSQL (production) with Alembic migrations.

---

## Getting Started

### 1. Prerequisites
- Node.js (v18+) & npm
- Python 3.11+

### 2. Backend Setup
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```
- API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health check: [http://localhost:8000/health](http://localhost:8000/health)

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | SQLAlchemy connection string | `sqlite:///./notes_quiz.db` |
| `SECRET_KEY` | JWT signing secret | dev key |
| `AI_PROVIDER` | AI provider (`gemini` or `claude`) | `gemini` |
| `GEMINI_API_KEY` | Google Gemini API key | |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key | |
| `MAX_UPLOAD_SIZE_MB` | Maximum document upload size | `20` |

### Frontend (`frontend/.env`)
| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8000` |

---

## API Endpoints Reference

### Quizzes Module
All endpoints require a valid Bearer JWT and isolate data by user:
- `POST /documents/{document_id}/quizzes`: Generate and persist a quiz distributed across chunks with deduplication and difficulty rules (`easy`, `medium`, `hard`, `mixed`). Returns questions without correct answers.
- `GET /quizzes`: List the current user's quizzes with question count, attempt count, and best score.
- `GET /quizzes/{quiz_id}`: Retrieve a quiz without exposing answers/explanations.
- `DELETE /quizzes/{quiz_id}`: Delete a quiz and its attempts.
- `POST /quizzes/{quiz_id}/attempts`: Submit and score answers server-side, storing `time_spent_sec` and answers, returning score, accuracy, and full explanations.
- `GET /attempts/{attempt_id}`: Retrieve full details of a past attempt.
- `GET /quizzes/{quiz_id}/attempts`: List all past attempts for a specific quiz.
- `POST /quizzes/{quiz_id}/retry-wrong`: Generate a new quiz from questions the user got wrong in their previous attempt.

### Interactive Swagger UI
Interactive Swagger UI is available at `/docs` when the backend is running.
