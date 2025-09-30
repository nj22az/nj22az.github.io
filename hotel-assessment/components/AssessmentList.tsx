
import React, { useState, useMemo } from 'react';
import type { Assessment } from '../types';
import { AssessmentCard } from './AssessmentCard';
import { DownloadIcon } from './icons/DownloadIcon';

interface AssessmentListProps {
  assessments: Assessment[];
  onDelete: (id: string) => void;
}

const Toggle: React.FC<{ isEnabled: boolean; onToggle: () => void; label: string; }> = ({ isEnabled, onToggle, label }) => (
    <div className="flex items-center">
        <span className="mr-3 text-sm font-medium text-gray-900">{label}</span>
        <button
            onClick={onToggle}
            type="button"
            className={`journal-toggle ${isEnabled ? 'bg-red-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2`}
            role="switch"
            aria-checked={isEnabled}
        >
            <span
                aria-hidden="true"
                className={`${isEnabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out toggle-thumb`}
            />
        </button>
    </div>
);


export const AssessmentList: React.FC<AssessmentListProps> = ({ assessments, onDelete }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [hideSeriousIssues, setHideSeriousIssues] = useState(false);

  const filteredAssessments = useMemo(() => {
    if (hideSeriousIssues) {
      return assessments.filter(a => !a.hasSeriousIssues);
    }
    return assessments;
  }, [assessments, hideSeriousIssues]);

  const handleExportCSV = () => {
    setIsExporting(true);

    setTimeout(() => {
      const assessmentsToExport = filteredAssessments;
      if (assessmentsToExport.length === 0) {
        setIsExporting(false);
        return;
      }

      const headers: (keyof Assessment)[] = [
        'id', 'hotelName', 'hotelFranchise', 'hotelWebsite', 'location', 'createdAt',
        'membershipLevel', 'membershipRecognition', 'membershipRecognitionOther',
        'parkingDetails', 'parkingDetailsOther',
        'overallVibe', 'overallVibeOther',
        'cleanliness', 'cleanlinessOther',
        'staffService', 'staffServiceOther',
        'amenities', 'amenitiesOther',
        'wifiService', 'wifiServiceOther',
        'valueForMoney', 'valueForMoneyOther',
        'otherObservations', 'hasSeriousIssues', 'seriousIssuesNotes', 'geminiReport', 'images'
      ];

      const escapeCsvCell = (cellData: string | boolean | undefined | null | string[]): string => {
        if (cellData == null) return '';
        const str = Array.isArray(cellData) ? cellData.join('; ') : String(cellData);
        if (/[",\n]/.test(str)) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const csvContent = [
        headers.join(','),
        ...assessmentsToExport.map(assessment =>
          headers.map(header => escapeCsvCell(assessment[header])).join(',')
        ),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const date = new Date().toISOString().split('T')[0];
      link.download = `hotel_journal_${date}.csv`;
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setIsExporting(false);
    }, 500);
  };

  return (
    <div className="journal-panel journal-panel--list">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Hotel Journal Archive</h2>
        <div className="flex items-center gap-4">
          {assessments.some(a => a.hasSeriousIssues) && (
             <Toggle 
              label="Hide Serious Issues"
              isEnabled={hideSeriousIssues}
              onToggle={() => setHideSeriousIssues(prev => !prev)}
            />
          )}
          {assessments.length > 0 && (
            <button
              onClick={handleExportCSV}
              disabled={isExporting}
              className="journal-button journal-button--ghost"
              aria-label="Export all journal entries to CSV"
            >
              {isExporting ? (
                <>
                  <span className="journal-button__spinner" aria-hidden="true" />
                  Exporting...
                </>
              ) : (
                <>
                  <DownloadIcon className="journal-button__icon" />
                  Export CSV
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {assessments.length === 0 ? (
        <div className="journal-empty">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="journal-empty__icon" aria-hidden="true"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
          <h3 className="journal-empty__title">Your Journal is Empty</h3>
          <p className="journal-empty__subtitle">
            Create your first hotel journal entry using the form to start building your personal field archive.
          </p>
        </div>
      ) : (
        <div className="journal-list">
          {filteredAssessments.length > 0 ? (
            filteredAssessments.map((assessment) => (
              <AssessmentCard key={assessment.id} assessment={assessment} onDelete={onDelete} />
            ))
          ) : (
            <div className="journal-empty">
              <h3 className="journal-empty__title">No Matching Entries</h3>
              <p className="journal-empty__subtitle">All entries flagged as critical are currently hidden.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
