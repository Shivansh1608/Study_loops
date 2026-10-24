import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Markdown from 'react-markdown';
import { 
  fetchSummary, 
  generateSummary, 
  fetchDocument, 
  type Summary as SummaryType, 
  type DocumentDetail 
} from '../api/client';
import { 
  BookOpen, 
  Download, 
  Sparkles, 
  RotateCw, 
  ArrowLeft, 
  Loader2, 
  FileText,
  Copy,
  Check
} from 'lucide-react';

export default function Summary() {
  const { documentId } = useParams<{ documentId: string }>();

  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [summary, setSummary] = useState<SummaryType | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!documentId) return;
      try {
        setLoading(true);
        const [docData, sumData] = await Promise.allSettled([
          fetchDocument(Number(documentId)),
          fetchSummary(Number(documentId)),
        ]);

        if (docData.status === 'fulfilled') {
          setDocument(docData.value);
        }
        if (sumData.status === 'fulfilled') {
          setSummary(sumData.value);
        }
      } catch (err) {
        console.error('Failed to load summary data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [documentId]);

  const handleGenerate = async () => {
    if (!documentId) return;
    try {
      setGenerating(true);
      const newSummary = await generateSummary(Number(documentId));
      setSummary(newSummary);
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to generate summary.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!summary) return;
    const blob = new Blob([summary.content_markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${document?.title || 'study_notes'}_summary.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary.content_markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <p className="text-sm font-semibold text-slate-500">Loading revision summary...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Back button */}
      <Link
        to="/upload"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Documents</span>
      </Link>

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>AI Revision Summary</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
            {document?.title || 'Document Summary'}
          </h1>
          <p className="text-xs text-slate-400">
            Synthesized core principles, bullet definitions, and key formulas from your lecture notes.
          </p>
        </div>

        {summary && (
          <div className="flex items-center space-x-2.5 w-full sm:w-auto">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-500/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download .md</span>
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      {generating ? (
        <div className="bg-white rounded-3xl p-16 border border-slate-200/80 text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-purple-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">Synthesizing Notes into Revision Guide...</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Our AI engine is analyzing all document text chunks to extract definitions, formulas, and main takeaways.
          </p>
        </div>
      ) : summary ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm space-y-6">
          <div className="prose prose-purple max-w-none text-slate-800 leading-relaxed font-sans prose-headings:font-heading prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-sm prose-li:text-sm prose-code:text-purple-600 prose-code:bg-purple-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
            <Markdown>{summary.content_markdown}</Markdown>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Generated on {new Date(summary.created_at).toLocaleString()}</span>
            <button
              onClick={handleGenerate}
              className="text-purple-600 hover:text-purple-700 font-semibold flex items-center space-x-1 cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Regenerate Summary</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-16 border border-slate-200/80 text-center space-y-4">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Summary Generated Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Extract and synthesize all main concepts and formulas from this document into a structured revision guide.
          </p>
          <button
            onClick={handleGenerate}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-500/25 transition-all inline-flex items-center space-x-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-purple-200" />
            <span>Generate Revision Summary</span>
          </button>
        </div>
      )}
    </div>
  );
}
