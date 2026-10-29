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
          <h1 className="text-3xl font-extrabold tracking-tight font-serif-title text-[#1C1917]">
            Flashcards Deck
          </h1>
          <p className="text-sm text-[#78716C]">
            Interactive active-recall cards generated from your notes with SM-2 spaced repetition tracking.
          </p>
        </div>

        <Link
          to="/review"
          className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-[#DC2626] to-[#EF4444] text-white font-semibold text-xs rounded-full shadow-glow-red hover:opacity-95 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <BookOpen className="w-4 h-4 text-white" />
          <span>Launch Spaced Review Session</span>
        </Link>
      </div>

      {/* Filter and Generator Bar */}
      <div className="bg-white rounded-2xl p-6 border border-[#F3E8D9] shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <label className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider whitespace-nowrap">
            Filter Document:
          </label>
          <select
            value={selectedDocId || ''}
            onChange={(e) => setSelectedDocId(e.target.value ? Number(e.target.value) : undefined)}
            className="px-3 py-2 rounded-xl border border-[#F3E8D9] bg-stone-50/50 text-xs font-semibold text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#EF4444]/30"
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
              className="px-3 py-2 rounded-xl border border-[#F3E8D9] bg-stone-50/50 text-xs font-semibold text-[#1C1917]"
            >
              <option value={5}>Generate 5 Cards</option>
              <option value={10}>Generate 10 Cards</option>
              <option value={15}>Generate 15 Cards</option>
            </select>

            <button
              onClick={handleGenerateCards}
              disabled={generating}
              className="flex items-center space-x-1.5 px-4 py-2 bg-[#FFE4E6] hover:bg-rose-200 text-rose-800 font-semibold text-xs rounded-full border border-rose-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#DC2626]" />
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
          <Loader2 className="w-8 h-8 animate-spin text-[#DC2626]" />
        </div>
      ) : cards.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between max-w-xl mx-auto px-2 text-xs font-bold text-[#78716C]">
            <span>
              Card {currentIndex + 1} of {cards.length}
            </span>
            <span className="text-[#DC2626] font-semibold">
              Tip: Press Space to Flip
            </span>
          </div>

          <FlipCard card={cards[currentIndex]} />

          {/* Navigation Controls */}
          <div className="flex items-center justify-center space-x-4 pt-2">
            <button
              onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1))}
              className="p-3 bg-white border border-[#F3E8D9] hover:bg-stone-50 text-[#1C1917] rounded-full shadow-soft transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="Previous card"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-xs font-semibold text-[#78716C]">
              {currentIndex + 1} / {cards.length}
            </span>

            <button
              onClick={() => setCurrentIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0))}
              className="p-3 bg-white border border-[#F3E8D9] hover:bg-stone-50 text-[#1C1917] rounded-full shadow-soft transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="Next card"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#F3E8D9] p-12 text-center space-y-4 shadow-soft max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#FEF3C7] text-amber-600 flex items-center justify-center mx-auto">
            <Layers className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold font-serif-title text-[#1C1917]">
              No Flashcards in this Deck
            </h3>
            <p className="text-xs text-[#78716C] leading-relaxed">
              Select a document above and click &quot;AI Generate Flashcards&quot; to extract high-yield active-recall cards from your notes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
