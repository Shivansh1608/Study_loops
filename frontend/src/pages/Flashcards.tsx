import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  fetchAllFlashcards, 
  createFlashcards, 
  fetchDocuments, 
  type Flashcard, 
  type DocumentItem 
} from '../api/client';
import { FlipCard } from '../components/FlipCard';
import { 
  Layers, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  BookOpen 
} from 'lucide-react';

export default function Flashcards() {
  const [searchParams] = useSearchParams();
  const docIdParam = searchParams.get('docId');

  const [cards, setCards] = useState<Flashcard[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<number | undefined>(
    docIdParam ? Number(docIdParam) : undefined
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [cardCountToGen, setCardCountToGen] = useState(5);

  const loadCardsAndDocs = async () => {
    try {
      setLoading(true);
      const [cardsData, docsData] = await Promise.all([
        fetchAllFlashcards(selectedDocId),
        fetchDocuments(),
      ]);
      setCards(cardsData);
      setDocuments(docsData);
      setCurrentIndex(0);
    } catch (err) {
      console.error('Failed to load flashcards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCardsAndDocs();
  }, [selectedDocId]);

  const handleGenerateCards = async () => {
    if (!selectedDocId) {
      alert('Please select a document first.');
      return;
    }
    try {
      setGenerating(true);
      const newCards = await createFlashcards(selectedDocId, cardCountToGen);
      setCards((prev) => [...prev, ...newCards]);
      alert(`Generated ${newCards.length} flashcards!`);
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to generate flashcards');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-heading text-slate-900">
            Flashcards Deck
          </h1>
          <p className="text-sm text-slate-500">
            Interactive active-recall cards generated from your notes with SM-2 spaced repetition tracking.
          </p>
        </div>

        <Link
          to="/review"
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-500/25"
        >
          <BookOpen className="w-4 h-4 text-purple-200" />
          <span>Launch Spaced Review Session</span>
        </Link>
      </div>

      {/* Filter and Generator Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
            Filter Document:
          </label>
          <select
            value={selectedDocId || ''}
            onChange={(e) => setSelectedDocId(e.target.value ? Number(e.target.value) : undefined)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="">All Documents ({documents.length})</option>
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title}
              </option>
            ))}
          </select>
        </div>

        {selectedDocId && (
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <select
              value={cardCountToGen}
              onChange={(e) => setCardCountToGen(Number(e.target.value))}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
            >
              <option value={5}>Generate 5 Cards</option>
              <option value={10}>Generate 10 Cards</option>
              <option value={15}>Generate 15 Cards</option>
            </select>

            <button
              onClick={handleGenerateCards}
              disabled={generating}
              className="flex items-center space-x-1.5 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl border border-purple-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>AI Generate Flashcards</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Main Flashcard Viewer */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : cards.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between max-w-xl mx-auto px-2 text-xs font-bold text-slate-500">
            <span>
              Card {currentIndex + 1} of {cards.length}
            </span>
            <span className="text-purple-600 font-semibold">
              Tip: Press Space to Flip
            </span>
          </div>

          {/* 3D FlipCard */}
          <FlipCard card={cards[currentIndex]} />

          {/* Navigation Controls */}
          <div className="flex items-center justify-center space-x-4 max-w-xl mx-auto pt-4">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="p-3 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-xs font-mono font-bold text-slate-600 px-4 py-2 bg-slate-100 rounded-lg">
              {currentIndex + 1} / {cards.length}
            </span>

            <button
              onClick={() => setCurrentIndex((prev) => Math.min(cards.length - 1, prev + 1))}
              disabled={currentIndex === cards.length - 1}
              className="p-3 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <Layers className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Flashcards in this Deck</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Select a document above and click "AI Generate Flashcards" to extract high-yield active-recall cards from your notes.
          </p>
        </div>
      )}
    </div>
  );
}
