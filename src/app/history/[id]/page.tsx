/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ResultsPanel } from "@/components/ResultsPanel";
import { GenerationResult } from "@/types";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function HistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/history/${params.id}`);
        if (!res.ok) throw new Error("Failed to fetch history detail");
        const data = await res.json();
        
        setResult({
          id: data.id,
          emails: JSON.parse(data.emails),
          promptVersion: data.promptVersion,
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (params.id) {
      fetchDetail();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 flex justify-center">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">{error}</div>
        <button onClick={() => router.push("/history")} className="mt-4 text-blue-600 hover:underline">
          Back to History
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/history" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to History
        </Link>
      </div>
      
      <div className="h-full">
        <ResultsPanel 
          result={result} 
          onRegenerate={() => {
            alert("To regenerate, please use the Generator form on the home page with these inputs.");
            router.push("/");
          }} 
          isLoading={false} 
        />
      </div>
    </div>
  );
}
