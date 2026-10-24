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

      // Simulate step progress while processing PyMuPDF extraction and chunking
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
        <h1 className="text-3xl font-extrabold tracking-tight font-heading text-slate-900">
          Upload Study Documents
        </h1>
        <p className="text-sm text-slate-500">
          Upload PDF lecture notes, Word documents (.docx), or Markdown/Text files (max 20 MB). Our extraction engine automatically cleans whitespace, removes page headers, and splits notes into ~1,500 word chunks.
        </p>
      </div>

      {/* Upload Box */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <form onSubmit={handleUploadSubmit} className="space-y-6">
          {/* Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-purple-600 bg-purple-50/60 scale-[1.01]'
                : selectedFile
                ? 'border-emerald-500 bg-emerald-50/30'
                : 'border-slate-300 hover:border-purple-400 bg-slate-50/50 hover:bg-slate-50'
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
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-base">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to process
                  </p>
                </div>
                <span className="text-xs text-purple-600 font-semibold underline">Click or drag another file to replace</span>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-xs">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-base">
                    Click to upload or drag and drop lecture notes
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports PDF, DOCX, TXT, or MD (up to 20 MB)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Title Input & Submit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Document Title (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Molecular Biology - Chapter 4"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                selectedFile && !uploading
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-500/25 hover:opacity-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
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
              <div className="flex justify-between text-xs text-slate-500 font-semibold">
                <span>Extracting clean text & creating chunks...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-purple-600 h-2 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Notifications */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}
        </form>
      </div>

      {/* Uploaded Documents List */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-bold font-heading text-slate-900">Your Documents Library</h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            {documents.length} item(s)
          </span>
        </div>

        {loading ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          </div>
        ) : documents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-bold">Document Title</th>
                  <th className="px-4 py-3 font-bold">Format</th>
                  <th className="px-4 py-3 font-bold">Pages</th>
                  <th className="px-4 py-3 font-bold">Text Chunks</th>
                  <th className="px-4 py-3 font-bold">Uploaded</th>
                  <th className="px-4 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="px-4 py-4 font-bold text-slate-900 flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <span className="line-clamp-1">{doc.title}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {doc.file_type}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs font-mono">{doc.page_count}</td>
                    <td className="px-4 py-4 text-xs font-mono font-semibold text-purple-700">
                      {doc.chunk_count} chunk(s)
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-400">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Quiz Action */}
                        <Link
                          to={`/configure/${doc.id}`}
                          title="Generate & Take Quiz"
                          className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors flex items-center space-x-1 text-xs font-semibold"
                        >
                          <PlayCircle className="w-4 h-4" />
                          <span className="hidden sm:inline">Quiz</span>
                        </Link>

                        {/* Flashcards Action */}
                        <Link
                          to={`/flashcards?docId=${doc.id}`}
                          title="Flashcards"
                          className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors flex items-center space-x-1 text-xs font-semibold"
                        >
                          <Layers className="w-4 h-4" />
                          <span className="hidden sm:inline">Cards</span>
                        </Link>

                        {/* Summary Action */}
                        <Link
                          to={`/summary/${doc.id}`}
                          title="Revision Summary"
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors flex items-center space-x-1 text-xs font-semibold"
                        >
                          <BookOpen className="w-4 h-4" />
                          <span className="hidden sm:inline">Summary</span>
                        </Link>

                        {/* Delete Action */}
                        <button
                          onClick={() => handleDelete(doc.id)}
                          title="Delete Document"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
          <div className="py-8 text-center text-slate-400 text-sm">
            No documents in your library yet. Upload notes using the dropzone above.
          </div>
        )}
      </div>
    </div>
  );
}
