
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
    <div className="app-shell">
      <div className="main-content" style={{ marginLeft: 0 }}>
        <header className="masthead">
          <div className="masthead__inner">
            <button
              onClick={handleBackToMain}
              className="masthead__brand"
              aria-label="Back to main site"
            >
              <ChevronLeftIcon style={{ width: '20px', height: '20px' }} />
              <span>Back</span>
            </button>
            <h1 style={{ fontSize: 'var(--font-title2)', fontWeight: 600, margin: 0 }}>
              Hotel Assessment
            </h1>
          </div>
        </header>
        <main className="app-main">
          {error && (
            <div className="error-banner" role="alert">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <svg style={{ width: '20px', height: '20px', color: 'var(--system-red)', flexShrink: 0 }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 style={{ fontSize: 'var(--font-callout)', fontWeight: 600, margin: '0 0 4px' }}>Error</h3>
                  <p style={{ fontSize: 'var(--font-body)', margin: 0 }}>{error}</p>
                </div>
              </div>
            </div>
          )}
          <div className="assessment-layout">
            <div className="assessment-form-column">
              <AssessmentForm onSubmit={handleCreateAssessment} isLoading={isLoading} />
            </div>
            <div className="assessment-list-column">
              <AssessmentList assessments={sortedAssessments} onDelete={handleDeleteAssessment} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
