
import React, { useState, useEffect } from 'react';
import type { Assessment, AssessmentInput } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { generateScrutinyReport } from './services/geminiService';
import { AssessmentForm } from './components/AssessmentForm';
import { AssessmentList } from './components/AssessmentList';
import { ChevronLeftIcon } from './components/icons/ChevronLeftIcon';

function App() {
  const [assessments, setAssessments] = useLocalStorage<Assessment[]>('hotel-assessments', []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sort assessments by date, newest first
  const sortedAssessments = [...assessments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleCreateAssessment = async (data: AssessmentInput) => {
    setIsLoading(true);
    setError(null);
    
    // Duplicate check
    const isDuplicate = assessments.some(assessment => {
      const { id, geminiReport, createdAt, ...existingInputData } = assessment;
      // Compare stringified versions of the input data
      return JSON.stringify(existingInputData) === JSON.stringify(data);
    });

    if (isDuplicate) {
      setError("Duplicate Report: An assessment with these exact details already exists.");
      setIsLoading(false);
      return;
    }

    try {
      const report = await generateScrutinyReport(data);
      const newAssessment: Assessment = {
        ...data,
        id: crypto.randomUUID(),
        geminiReport: report,
        createdAt: new Date().toISOString(),
      };
      setAssessments((prev) => [newAssessment, ...prev]);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAssessment = (id: string) => {
    setAssessments((prev) => prev.filter((assessment) => assessment.id !== id));
  };

  const handleBackToMain = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto py-3 sm:py-5 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToMain}
              className="back-button flex items-center gap-1 text-sm font-medium"
              aria-label="Back to main site"
            >
              <ChevronLeftIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <h1 className="text-lg sm:text-2xl font-bold leading-tight text-gray-900 tracking-tight">
              Hotel Journal - By Nils Johansson
            </h1>
          </div>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4" role="alert">
              <div className="flex">
                <div className="flex-shrink-0">
                   <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1">
              <AssessmentForm onSubmit={handleCreateAssessment} isLoading={isLoading} />
            </div>
            <div className="lg:col-span-2">
              <AssessmentList assessments={sortedAssessments} onDelete={handleDeleteAssessment} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
