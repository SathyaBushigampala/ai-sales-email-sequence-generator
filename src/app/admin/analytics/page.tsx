/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Star, Clock, Target, Briefcase } from "lucide-react";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/admin/analytics");
        if (!res.ok) throw new Error("Failed to fetch analytics");
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-center">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (error || !data) {
    return <div className="max-w-7xl mx-auto px-4 py-8 text-red-600">{error || "Failed to load"}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Analytics Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
          Overview of sequence generation usage and quality.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Generations</dt>
                  <dd className="text-2xl font-semibold text-gray-900 dark:text-white">{data.totalGenerations}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="h-6 w-6 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Avg Rating</dt>
                  <dd className="text-2xl font-semibold text-gray-900 dark:text-white">{data.avgRating} / 5</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-blue-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Avg AI Response Time</dt>
                  <dd className="text-2xl font-semibold text-gray-900 dark:text-white">{(data.avgResponseTime / 1000).toFixed(1)}s</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Quality Trend Over Time</h3>
          <div className="h-64">
            {data.qualityTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.qualityTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis domain={[0, 5]} stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }} />
                  <Line type="monotone" dataKey="avgRating" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">No data available</div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Top Objectives & Industries</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 flex items-center mb-2"><Target className="h-4 w-4 mr-1" /> Objectives</h4>
              <ul className="space-y-2">
                {data.topObjectives.map((obj: any, idx: number) => (
                  <li key={idx} className="text-sm flex justify-between bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                    <span className="truncate mr-2 dark:text-gray-300">{obj.name}</span>
                    <span className="font-semibold dark:text-white">{obj.count}</span>
                  </li>
                ))}
                {data.topObjectives.length === 0 && <li className="text-sm text-gray-500">No data</li>}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 flex items-center mb-2"><Briefcase className="h-4 w-4 mr-1" /> Industries</h4>
              <ul className="space-y-2">
                {data.topIndustries.map((ind: any, idx: number) => (
                  <li key={idx} className="text-sm flex justify-between bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                    <span className="truncate mr-2 dark:text-gray-300">{ind.name}</span>
                    <span className="font-semibold dark:text-white">{ind.count}</span>
                  </li>
                ))}
                {data.topIndustries.length === 0 && <li className="text-sm text-gray-500">No data</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
