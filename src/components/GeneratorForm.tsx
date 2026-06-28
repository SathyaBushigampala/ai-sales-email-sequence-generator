/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

export const generateSchema = z.object({
  prospectName: z.string().min(1, "Required"),
  company: z.string().min(1, "Required"),
  role: z.string().min(1, "Required"),
  industry: z.string().min(1, "Required"),
  painPoints: z.string().min(1, "Required"),
  objective: z.string().min(1, "Required"),
  tone: z.string().optional(),
  length: z.string().optional(),
  doNotMention: z.string().optional(),
});

export type GenerateFormValues = z.infer<typeof generateSchema>;

interface GeneratorFormProps {
  onSubmit: (data: GenerateFormValues) => Promise<void>;
  isLoading: boolean;
}

export function GeneratorForm({ onSubmit, isLoading }: GeneratorFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GenerateFormValues>({
    resolver: zodResolver(generateSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Prospect Profile</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prospect Name</label>
            <input
              type="text"
              {...register("prospectName")}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white"
            />
            {errors.prospectName && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.prospectName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company</label>
            <input
              type="text"
              {...register("company")}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white"
            />
            {errors.company && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.company.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
            <input
              type="text"
              {...register("role")}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white"
              placeholder="e.g. VP of Sales"
            />
            {errors.role && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.role.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Industry</label>
            <input
              type="text"
              {...register("industry")}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white"
            />
            {errors.industry && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.industry.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pain Points</label>
            <textarea
              {...register("painPoints")}
              rows={3}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white"
              placeholder="What problems are they facing?"
            />
            {errors.painPoints && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.painPoints.message}</p>}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Outreach Details</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Objective</label>
            <select
              {...register("objective")}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              <option value="">Select objective...</option>
              <option value="Book a demo">Book a demo</option>
              <option value="Re-engage old lead">Re-engage old lead</option>
              <option value="Upsell current customer">Upsell current customer</option>
              <option value="Invite to webinar/event">Invite to webinar/event</option>
            </select>
            {errors.objective && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.objective.message}</p>}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tone (Optional)</label>
              <input
                type="text"
                {...register("tone")}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white"
                placeholder="e.g. Professional, friendly, urgent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Length (Optional)</label>
              <select
                {...register("length")}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="">Any</option>
                <option value="Short (under 100 words)">Short</option>
                <option value="Medium (100-200 words)">Medium</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Do Not Mention (Optional)</label>
            <input
              type="text"
              {...register("doNotMention")}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white"
              placeholder="e.g. Competitor names, specific features"
            />
          </div>
        </div>
      </div>

      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="ml-3 inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </span>
            ) : (
              "Generate Sequence"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
