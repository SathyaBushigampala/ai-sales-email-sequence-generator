"use client";

import { GenerationResult } from "@/types";
import { Download, Copy, FileText, Check, Star, ThumbsUp, ThumbsDown } from "lucide-react";
import { useState } from "react";

interface ResultsPanelProps {
  result: GenerationResult | null;
  onRegenerate: () => void;
  isLoading: boolean;
}

export function ResultsPanel({ result, onRegenerate, isLoading }: ResultsPanelProps) {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [thumbsUp, setThumbsUp] = useState<boolean | null>(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Reset feedback when result changes
  useState(() => {
    setRating(0);
    setHoverRating(0);
    setComment("");
    setThumbsUp(null);
    setFeedbackSubmitted(false);
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 min-h-[500px]">
        <div className="text-center">
          <svg className="animate-spin mx-auto h-12 w-12 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg text-gray-600 dark:text-gray-400">Crafting your personalized sequence...</p>
          <p className="text-sm text-gray-500 mt-2">This usually takes about 10-15 seconds.</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 min-h-[500px]">
        <div className="text-center px-4">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No sequence generated yet</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Fill out the form on the left to generate your 5-email drip sequence.
          </p>
        </div>
      </div>
    );
  }

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(index);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExport = (format: string) => {
    window.open(`/api/export/${result.id}?format=${format}`, '_blank');
  };

  const submitFeedback = async () => {
    if (rating === 0) return;
    setIsSubmittingFeedback(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generationId: result.id,
          rating,
          thumbsUp,
          comment
        })
      });
      if (res.ok) setFeedbackSubmitted(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-full max-h-[800px]">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center shrink-0">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Generated Sequence</h3>
        <div className="flex space-x-2">
          <div className="relative group inline-block">
            <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 focus:outline-none">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <div className="hidden group-hover:block absolute right-0 mt-1 w-32 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1">
                <button onClick={() => handleExport('pdf')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">PDF</button>
                <button onClick={() => handleExport('docx')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">DOCX</button>
                <button onClick={() => handleExport('txt')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">TXT</button>
              </div>
            </div>
          </div>
          <button
            onClick={onRegenerate}
            className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 dark:text-blue-100 dark:bg-blue-900/60 dark:hover:bg-blue-800/80 focus:outline-none"
          >
            Regenerate
          </button>
        </div>
      </div>
      
      <div className="overflow-y-auto p-6 space-y-8 flex-1">
        {result.emails.map((email, index) => (
          <div key={index} className="relative">
            <div className="absolute top-0 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true" />
            <div className="relative flex items-start space-x-3">
              <div className="relative">
                <span className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-300">{email.day}</span>
                </span>
              </div>
              <div className="min-w-0 flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm">
                    <span className="font-semibold text-gray-900 dark:text-white">Day {email.day}</span>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(`Subject: ${email.subject}\n\n${email.body}`, index)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="Copy to clipboard"
                  >
                    {copiedId === index ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    <span className="text-gray-500 dark:text-gray-400">Subject: </span>
                    {email.subject}
                  </p>
                </div>
                <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {email.body}
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">CTA Focus:</span> {email.cta}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Feedback Section */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Rate this sequence</h4>
          {feedbackSubmitted ? (
            <p className="text-green-600 dark:text-green-400 text-sm flex items-center"><Check className="h-4 w-4 mr-1" /> Thank you for your feedback!</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none transition-colors"
                  >
                    <Star 
                      className={`h-6 w-6 ${(hoverRating || rating) >= star ? "text-yellow-400 fill-current" : "text-gray-300 dark:text-gray-600"}`} 
                    />
                  </button>
                ))}
              </div>
              <div className="flex space-x-4">
                <button 
                  onClick={() => setThumbsUp(true)}
                  className={`flex items-center px-3 py-1.5 rounded border text-sm ${thumbsUp === true ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-500' : 'border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300'}`}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" /> Good Tone
                </button>
                <button 
                  onClick={() => setThumbsUp(false)}
                  className={`flex items-center px-3 py-1.5 rounded border text-sm ${thumbsUp === false ? 'bg-red-50 border-red-500 text-red-700 dark:bg-red-900/30 dark:border-red-500' : 'border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300'}`}
                >
                  <ThumbsDown className="h-4 w-4 mr-2" /> Needs Work
                </button>
              </div>
              <div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Optional: How could this sequence be improved?"
                  rows={2}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
              <button
                onClick={submitFeedback}
                disabled={rating === 0 || isSubmittingFeedback}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded shadow-sm hover:bg-blue-700 focus:outline-none disabled:opacity-50"
              >
                {isSubmittingFeedback ? "Submitting..." : "Submit Feedback"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
