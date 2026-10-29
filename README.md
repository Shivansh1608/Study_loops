# QuizForge — AI Notes-to-Quiz & Spaced Repetition Study Engine

A high-retention, AI-powered study platform that automatically transforms lecture notes, PDFs, DOCX, and raw text into interactive multi-tier practice tests, active-recall flashcards with SuperMemo-2 (SM-2) scheduling, and executive revision summaries.

Built with a light UI/UX design (warm cream `#FFFDf8`, `#F3E8D9` borders, red `#DC2626` primary CTAs, feature tints, and Three.js ambient background scenes).

---

## ✨ Key Features

- **⚡ Fast Generation**: Paste notes or upload documents (PDF, DOCX, TXT) $\rightarrow$ get a customized quiz with explanations in $\sim 12$ seconds.
- **🎨 Light UI/UX Design System**:
  - Warm cream background (`#FFFDf8`) with soft radial gradient highlights.
  - Surface cards in crisp white with subtle `#F3E8D9` borders and soft drop shadows (`0 8px 32px rgba(185,28,28,0.06)`).
  - Feature tint badges: Rose (`#FFE4E6` for MCQs), Amber (`#FEF3C7` for Flashcards & Streaks), Sky (`#DBEAFE` for Summaries), Mint (`#D1FAE5` for Progress & Mastery).
  - Red gradient primary actions (`#DC2626` $\rightarrow$ `#EF4444`) with soft glow shadows.
- **🪐 Three.js Background Orbs**: Minimal floating light orb scene running behind the hero with gentle continuous physics.
- **🧪 Interactive Live Demo**:
  - One-click sample topics: *Photosynthesis*, *WWII*, and *Python*.
  - Live interactive quiz with option hover states, correct/wrong checks, explanations, SVG circular score animation, and celebratory confetti.
- **🧠 3D Active-Recall Flashcards**:
  - Full 3D perspective flip cards (spacebar or click to flip).
  - SuperMemo-2 (SM-2) algorithm tracking interval days, repetitions, and easiness factor.
- **📊 Unified Study Cockpit (Dashboard)**:
  - Track score history trends over time and topic-specific accuracy bars with Recharts.
  - Diagnostic warnings for weak topics ($< 70\%$ accuracy) with one-tap practice recommendations.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 / TypeScript / Vite
- **Styling**: Tailwind CSS with custom QuizForge design tokens
- **3D & Animation**: Three.js, Framer Motion, Canvas Confetti
- **State & Data**: React Router, TanStack Query, Zustand, Axios
- **Visualization & Icons**: Recharts, Lucide Icons

### Backend
- **Framework**: Python 3.11+, FastAPI, Uvicorn (ASGI)
- **Database**: SQLite (dev) / PostgreSQL (production) with SQLAlchemy 2.0 & Alembic migrations
- **Document Processing**: PyMuPDF (`fitz`), `python-docx` for smart text chunking ($\approx 1,500$ words/chunk)
- **AI Providers**: Agnostic multi-provider layer (`services/ai.py`) supporting Google Gemini (`google-genai`) & Anthropic Claude with strict Pydantic JSON validation and retry policies
- **Security & Rate Limiting**: Passlib (Bcrypt), Python-Jose (JWT), SlowAPI

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+) & npm
- Python 3.11+

### 2. Backend Setup
```bash
cd backend
python -m venv .venv

# Windows:
.\.venv\Scripts\activate
# macOS / Linux:
# source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```
- API Base URL: [http://localhost:8000](http://localhost:8000)
- Interactive Swagger Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | SQLAlchemy connection string | `sqlite:///./notes_quiz.db` |
| `SECRET_KEY` | JWT signing secret | dev key |
| `AI_PROVIDER` | AI provider (`gemini` or `claude`) | `gemini` |
| `GEMINI_API_KEY` | Google Gemini API key | — |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key | — |
| `MAX_UPLOAD_SIZE_MB` | Maximum document upload size | `20` |

### Frontend (`frontend/.env`)
| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend FastAPI server URL | `http://localhost:8000` |

---

## 📡 API Endpoints Reference

### Authentication
- `POST /auth/register`: Create a new user account with hashed credentials.
- `POST /auth/login`: Authenticate and receive a Bearer JWT token.
- `GET /auth/me`: Fetch current logged-in user profile.

### Documents
- `POST /documents/upload`: Upload PDF, DOCX, or text notes; automatically extracts and splits into chunks.
- `GET /documents`: List all uploaded study materials.
- `DELETE /documents/{document_id}`: Remove a document and cascaded questions.

### Quizzes & Active Recall
- `POST /documents/{document_id}/quizzes`: Generate AI quizzes distributed across document chunks with difficulty parameters (`easy`, `medium`, `hard`, `mixed`).
- `GET /quizzes`: List user quizzes with question count, attempt history, and personal best scores.
- `GET /quizzes/{quiz_id}`: Retrieve a quiz without exposing answers or explanations.
- `POST /quizzes/{quiz_id}/attempts`: Score answers server-side, returning performance diagnostics and full explanations.
- `POST /quizzes/{quiz_id}/retry-wrong`: Dynamically generate a retry set from previously missed questions.

### Spaced Repetition (Flashcards)
- `POST /documents/{document_id}/flashcards`: Extract active-recall flashcard pairs from notes.
- `GET /flashcards`: Fetch flashcard decks with SM-2 metrics.
- `POST /flashcards/{card_id}/review`: Submit a quality score ($0\text{--}5$) to schedule next review date via SuperMemo-2.

---

## 📄 License
MIT License. Built for students, self-learners, and educators.
