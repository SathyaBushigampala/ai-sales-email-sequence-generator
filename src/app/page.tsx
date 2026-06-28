/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { GeneratorForm, GenerateFormValues } from "@/components/GeneratorForm";
import { ResultsPanel } from "@/components/ResultsPanel";
import { GenerationResult } from "@/types";
import { useState, useRef } from "react";

export default function Home() {
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastSubmittedData = useRef<GenerateFormValues | null>(null);

  const handleGenerate = async (data: GenerateFormValues, isRegeneration = false) => {
    setIsLoading(true);
    setError(null);
    lastSubmittedData.current = data;
    
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, isRegeneration }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to generate sequence");
      }

      const responseData = await response.json();
      setResult(responseData);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (lastSubmittedData.current) {
      handleGenerate(lastSubmittedData.current, true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          Email Sequence Generator
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Create highly personalized, 5-step drip sequences tailored to your prospect.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <GeneratorForm onSubmit={(data) => handleGenerate(data, false)} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-7 h-full">
          <ResultsPanel result={result} onRegenerate={handleRegenerate} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
