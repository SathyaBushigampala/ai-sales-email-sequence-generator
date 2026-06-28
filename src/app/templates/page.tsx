/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/templates");
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleApply = (template: any) => {
    const profile = JSON.parse(template.prospectProfile);
    const constraints = template.constraints ? JSON.parse(template.constraints) : {};
    
    // In a real app we might pass this via context or url params to the generator form.
    // For simplicity, we can store it in sessionStorage and read it on the home page.
    sessionStorage.setItem("appliedTemplate", JSON.stringify({
      prospectName: profile.name,
      company: profile.company,
      role: profile.role,
      industry: profile.industry,
      painPoints: profile.painPoints,
      objective: template.objective,
      tone: constraints.tone || "",
      length: constraints.length || "",
      doNotMention: constraints.doNotMention || ""
    }));
    
    router.push("/");
  };

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Sequence Templates</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
            Use these pre-configured templates for common brandsparkx scenarios.
          </p>
        </div>
        {session?.user?.role === "ADMIN" && (
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
              onClick={() => alert("Admin template creation UI would open here")}
            >
              Add template
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => {
          const profile = JSON.parse(template.prospectProfile);
          return (
            <div key={template.id} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-2">
                  {template.name}
                </h3>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 space-y-2">
                  <p><span className="font-medium text-gray-700 dark:text-gray-300">Target Role:</span> {profile.role}</p>
                  <p><span className="font-medium text-gray-700 dark:text-gray-300">Industry:</span> {profile.industry}</p>
                  <p><span className="font-medium text-gray-700 dark:text-gray-300">Objective:</span> {template.objective}</p>
                </div>
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => handleApply(template)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 w-full justify-center transition-colors"
                  >
                    Use Template
                  </button>
                </div>
              </div>
            </div>
          )
        })}
        
        {templates.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No templates</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new template as an admin.</p>
          </div>
        )}
      </div>
    </div>
  );
}
