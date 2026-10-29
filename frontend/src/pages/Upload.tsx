import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  uploadDocument, 
  fetchDocuments, 
  deleteDocument, 
  type DocumentItem 
} from '../api/client';
import { 
  UploadCloud, 
  FileText, 
  Trash2, 
  PlayCircle, 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  FileSpreadsheet
} from 'lucide-react';

export default function Upload() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadDocs = async () => {
    try {
      setLoading(true);
      const data = await fetchDocuments();
      setDocuments(data);
    } catch (err: any) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const handleFileSelect = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'doc', 'txt', 'md'].includes(ext || '')) {
      setError('Unsupported file type. Please upload a PDF, DOCX, TXT, or Markdown file.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('File size exceeds the 20 MB limit.');
      return;
    }
    setError(null);
    setSelectedFile(file);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);
      setUploadProgress(20);

      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 15 : prev));
      }, 300);

      const createdDoc = await uploadDocument(selectedFile, title);
      clearInterval(progressTimer);
      setUploadProgress(100);

      setSuccess(`Successfully uploaded and chunked "${createdDoc.title}" into ${createdDoc.chunks.length} section(s).`);
      setSelectedFile(null);
      setTitle('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      await loadDocs();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to delete document');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight font-serif-title text-[#1C1917]">
          Upload Study Documents
        </h1>
        <p className="text-sm text-[#78716C]">
          Upload PDF lecture notes, Word documents (.docx), or Markdown/Text files (max 20 MB). Our extraction engine automatically cleans whitespace, removes page headers, and splits notes into ~1,500 word chunks.
        </p>
      </div>

      {/* Upload Box */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#F3E8D9] shadow-soft space-y-6">
        <form onSubmit={handleUploadSubmit} className="space-y-6">
          {/* Dropzone with warm light styling */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-[#EF4444] bg-[#FFE4E6]/40 scale-[1.01]'
                : selectedFile
                ? 'border-[#22C55E] bg-[#D1FAE5]/30'
                : 'border-[#F3E8D9] hover:border-[#EF4444] bg-stone-50/50 hover:bg-stone-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt,.md"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            {selectedFile ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#D1FAE5] text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-[#1C1917] text-base">{selectedFile.name}</p>
                  <p className="text-xs text-[#78716C] mt-0.5">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to process
                  </p>
                </div>
                <span className="text-xs text-[#DC2626] font-semibold underline">Click or drag another file to replace</span>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#FFE4E6] text-[#DC2626] flex items-center justify-center shadow-xs">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-bold text-[#1C1917] text-base">
                    Click to upload or drag and drop lecture notes
                  </p>
                  <p className="text-xs text-[#78716C] mt-1">
                    Supports PDF, DOCX, TXT, or MD (up to 20 MB)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Title Input & Submit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">
                Document Title (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Molecular Biology - Chapter 4"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#F3E8D9] bg-stone-50/50 text-sm text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#EF4444]/30 focus:border-[#EF4444] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className={`w-full py-2.5 px-4 rounded-full font-semibold text-sm transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                selectedFile && !uploading
                  ? 'bg-gradient-to-r from-[#DC2626] to-[#EF4444] text-white shadow-glow-red hover:opacity-95'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Extracting & Chunking...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Process Document</span>
                </>
              )}
            </button>
          </div>

          {/* Progress Bar when uploading */}
          {uploading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-[#78716C] font-semibold">
                <span>Extracting clean text & creating chunks...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#DC2626] h-2 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Notifications */}
          {error && (
            <div className="p-4 rounded-xl bg-[#FFE4E6] border border-[#FECDD3] text-[#DC2626] text-xs font-medium flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-[#D1FAE5] border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}
        </form>
      </div>

      {/* Uploaded Documents List */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#F3E8D9] shadow-soft space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#FFE4E6] text-[#DC2626] flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold font-serif-title text-[#1C1917]">Your Documents Library</h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-[#78716C]">
            {documents.length} item(s)
          </span>
        </div>

        {loading ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#DC2626]" />
          </div>
        ) : documents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#1C1917]">
              <thead className="text-[10px] uppercase bg-stone-50 text-[#78716C] border-b border-[#F3E8D9]">
                <tr>
                  <th className="px-4 py-3 font-bold">Document Title</th>
                  <th className="px-4 py-3 font-bold">Format</th>
                  <th className="px-4 py-3 font-bold">Pages</th>
                  <th className="px-4 py-3 font-bold">Text Chunks</th>
                  <th className="px-4 py-3 font-bold">Uploaded</th>
                  <th className="px-4 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3E8D9]">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="px-4 py-4 font-bold text-[#1C1917] flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-stone-400 shrink-0" />
                      <span className="line-clamp-1">{doc.title}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-stone-100 text-[#78716C]">
                        {doc.file_type}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs font-mono">{doc.page_count}</td>
                    <td className="px-4 py-4 text-xs font-mono font-semibold text-[#DC2626]">
                      {doc.chunk_count} chunk(s)
                    </td>
                    <td className="px-4 py-4 text-xs text-[#78716C]">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Quiz Action */}
                        <Link
                          to={`/configure/${doc.id}`}
                          title="Generate & Take Quiz"
                          className="px-3 py-1.5 bg-[#FFE4E6] hover:bg-rose-200 text-rose-800 rounded-full transition-colors flex items-center space-x-1 text-xs font-semibold"
                        >
                          <PlayCircle className="w-3.5 h-3.5 text-[#DC2626]" />
                          <span className="hidden sm:inline">Quiz</span>
                        </Link>

                        {/* Flashcards Action */}
                        <Link
                          to={`/flashcards?docId=${doc.id}`}
                          title="Flashcards"
                          className="px-3 py-1.5 bg-[#FEF3C7] hover:bg-amber-200 text-amber-900 rounded-full transition-colors flex items-center space-x-1 text-xs font-semibold"
                        >
                          <Layers className="w-3.5 h-3.5 text-amber-700" />
                          <span className="hidden sm:inline">Cards</span>
                        </Link>

                        {/* Summary Action */}
                        <Link
                          to={`/summary/${doc.id}`}
                          title="Revision Summary"
                          className="px-3 py-1.5 bg-[#DBEAFE] hover:bg-sky-200 text-sky-900 rounded-full transition-colors flex items-center space-x-1 text-xs font-semibold"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-sky-700" />
                          <span className="hidden sm:inline">Summary</span>
                        </Link>

                        {/* Delete Action */}
                        <button
                          onClick={() => handleDelete(doc.id)}
                          title="Delete Document"
                          className="p-1.5 text-stone-400 hover:text-[#FF1A1A] hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-[#78716C] text-sm">
            No documents in your library yet. Upload notes using the dropzone above.
          </div>
        )}
      </div>
    </div>
  );
}
