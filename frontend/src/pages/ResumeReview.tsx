import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeResume } from '../services/aiService';

const ResumeReview = () => {
  const { t, language } = useAppContext();
  const [file, setFile] = useState<File | null>(null);
  const [targetJob, setTargetJob] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !targetJob) return;

    setIsAnalyzing(true);
    setError('');
    
    try {
      // In a real app, we'd extract text from the PDF/DOCX here
      // For this demo, we'll simulate text extraction
      const simulatedText = "Experience: 5 years in software development. Skills: React, Node, SQL. Education: BS in CS.";
      const analysis = await analyzeResume(simulatedText, targetJob, language);
      setResult(analysis);
    } catch (err) {
      setError('Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-zinc-900 mb-4">{t.resume.uploadTitle}</h1>
        <p className="text-zinc-600">{t.resume.uploadSubtitle}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Upload Form */}
        <section>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700">{t.resume.targetJob}</label>
              <input
                type="text"
                value={targetJob}
                onChange={(e) => setTargetJob(e.target.value)}
                placeholder={t.resume.targetJobPlaceholder}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                required
              />
            </div>

            <div className="relative group">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.docx"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`p-12 border-2 border-dashed rounded-2xl text-center transition-all ${
                file ? 'border-emerald-500 bg-emerald-50' : 'border-zinc-200 group-hover:border-emerald-400'
              }`}>
                <Upload className={`w-12 h-12 mx-auto mb-4 ${file ? 'text-emerald-600' : 'text-zinc-400'}`} />
                <p className="text-zinc-600 font-medium">
                  {file ? file.name : 'Click or drag to upload resume'}
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={!file || !targetJob || isAnalyzing}
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t.resume.analyzing}</span>
                </>
              ) : (
                <span>{t.resume.submit}</span>
              )}
            </button>
          </form>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}
        </section>

        {/* Results Display */}
        <section>
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm"
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-zinc-900">Analysis Result</h2>
                  <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full font-bold">
                    <span className="text-3xl">{result.score}</span>
                    <span className="text-sm">/ 100</span>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Strengths</h3>
                    <ul className="space-y-2">
                      {result.feedback.strengths.map((s: string, i: number) => (
                        <li key={i} className="flex items-start space-x-2 text-zinc-700">
                          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Suggestions</h3>
                    <ul className="space-y-2">
                      {result.feedback.suggestions.map((s: string, i: number) => (
                        <li key={i} className="flex items-start space-x-2 text-zinc-700">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0 mt-2" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-zinc-50 rounded-2xl border border-zinc-100">
                <FileText className="w-16 h-16 text-zinc-200 mb-4" />
                <p className="text-zinc-400">Analysis results will appear here after upload</p>
              </div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
};

export default ResumeReview;
