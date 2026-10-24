import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchDueFlashcards, reviewFlashcard, type Flashcard } from '../api/client';
import { FlipCard } from '../components/FlipCard';
import { 
  CheckCircle2, 
  BookOpen, 
  Loader2 
} from 'lucide-react';

export default function Review() {
  const [dueCards, setDueCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    async function loadDueCards() {
      try {
        setLoading(true);
        const cards = await fetchDueFlashcards();
        setDueCards(cards);
      } catch (err) {
        console.error('Failed to load due flashcards:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDueCards();
  }, []);

  const handleRate = async (quality: number) => {
    if (currentIndex >= dueCards.length) return;
    const currentCard = dueCards[currentIndex];

    try {
      await reviewFlashcard(currentCard.id, quality);
      setReviewedCount((prev) => prev + 1);

      if (currentIndex + 1 < dueCards.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsCompleted(true);
      }
    } catch (err) {
      console.error('Failed to rate card:', err);
      alert('Failed to record review rating');
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <p className="text-sm font-semibold text-slate-500">Checking your spaced repetition queue...</p>
      </div>
    );
  }

  if (isCompleted || dueCards.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
            {reviewedCount > 0 ? "You're All Caught Up!" : "No Flashcards Due Today"}
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {reviewedCount > 0
              ? `You reviewed ${reviewedCount} card(s) today using SuperMemo SM-2. Your next study sessions have been rescheduled based on your recall quality.`
              : 'Great work maintaining your study habit. Check back tomorrow or browse all flashcards in your deck.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            to="/flashcards"
            className="w-full sm:w-auto px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-500/20"
          >
            Browse All Flashcards
          </Link>
          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const currentCard = dueCards[currentIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Session Progress Header */}
      <div className="flex items-center justify-between max-w-xl mx-auto">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-purple-600" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Daily SM-2 Review
          </span>
        </div>
        <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
          Card {currentIndex + 1} of {dueCards.length}
        </span>
      </div>

      {/* Spaced Review Interactive FlipCard */}
      <FlipCard
        card={currentCard}
        onRate={handleRate}
        isReviewMode={true}
      />
    </div>
  );
}
