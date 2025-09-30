import React, { useState, useEffect } from 'react';
import type { Assessment } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { ShareIcon } from './icons/ShareIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface AssessmentCardProps {
  assessment: Assessment;
  onDelete: (id: string) => void;
}

export const AssessmentCard: React.FC<AssessmentCardProps> = ({ assessment, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [animationClass, setAnimationClass] = useState('opacity-0 translate-y-4');

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationClass('opacity-100 translate-y-0');
    }, 10);
    return () => clearTimeout(timer);
  }, []);

  const handleDelete = () => {
    setAnimationClass('opacity-0 scale-95');
    setTimeout(() => {
      onDelete(assessment.id);
    }, 500);
  };
  
  const handleShare = async () => {
    const formatShareSection = (title: string, items: string[], otherNotes?: string): string => {
        if (items.length === 0 && !otherNotes?.trim()) return '';
        let section = `${title}:\n`;
        items.forEach(item => { section += `- ${item}\n`; });
        if (otherNotes?.trim()) section += `- Other Notes: ${otherNotes.trim()}\n`;
        return section + '\n';
    };
    
    let textReport = '';
    
    const stayDetailsSection = [
        formatShareSection('Room Details', assessment.roomDetails, assessment.roomDetailsOther),
        formatShareSection('Noise Level', assessment.noiseLevel, assessment.noiseLevelOther)
    ].filter(Boolean).join('');
    if (stayDetailsSection) textReport += 'Stay Details\n---------------------\n' + stayDetailsSection;

    const loyaltySection = [
        formatShareSection(`Membership Recognition (${assessment.membershipLevel || 'N/A'})`, assessment.membershipRecognition, assessment.membershipRecognitionOther),
        formatShareSection('Parking', assessment.parkingDetails, assessment.parkingDetailsOther)
    ].filter(Boolean).join('');
    if (loyaltySection) textReport += 'Loyalty & Parking\n---------------------\n' + loyaltySection;

    const coreSection = [
        formatShareSection('Overall Vibe & Ambiance', assessment.overallVibe, assessment.overallVibeOther),
        formatShareSection('Cleanliness', assessment.cleanliness, assessment.cleanlinessOther),
        formatShareSection('Staff & Service', assessment.staffService, assessment.staffServiceOther),
        formatShareSection('Amenities & Facilities', assessment.amenities, assessment.amenitiesOther),
        formatShareSection('Wi-Fi Service', assessment.wifiService, assessment.wifiServiceOther),
        formatShareSection('Value for Money', assessment.valueForMoney, assessment.valueForMoneyOther)
    ].filter(Boolean).join('');
    if (coreSection) textReport += 'Core Assessment\n---------------------\n' + coreSection;

    if (assessment.otherObservations?.trim()) {
        textReport += 'General Observations\n---------------------\n' + assessment.otherObservations.trim() + '\n';
    }
    
    const shareText = `
Hotel Journal Report
=====================
Hotel: ${assessment.hotelName}
Location: ${assessment.location}
Assessed on: ${new Date(assessment.createdAt).toLocaleDateString()}
${assessment.hotelFranchise ? `Franchise: ${assessment.hotelFranchise}` : ''}
${assessment.hotelWebsite ? `Website: ${assessment.hotelWebsite}` : ''}
${assessment.roomNumber ? `Room: ${assessment.roomNumber}` : ''}
${assessment.floor ? `Floor: ${assessment.floor}` : ''}
${assessment.hasSeriousIssues ? `
CRITICAL WARNING:
-----------------
${assessment.seriousIssuesNotes}
` : ''}

${textReport.trim()}
    `.trim().replace(/\n{2,}/g, '\n\n');

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (err) {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy report to clipboard.');
      }
    } else {
      alert('Clipboard API is not available in your browser.');
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleShare();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleDelete();
  };


  return (
    <div className={`bg-white rounded-2xl shadow-lg border ${assessment.hasSeriousIssues ? 'border-red-300' : 'border-gray-200'} overflow-hidden group transition-all duration-500 ease-out hover:shadow-xl ${animationClass}`}>
      <div className="p-6">
        <div className="flex justify-between items-start cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex items-start gap-4">
              {assessment.hotelLogo && (
                  <img 
                      src={assessment.hotelLogo} 
                      alt={`${assessment.hotelName} logo`} 
                      className="w-14 h-14 object-contain rounded-lg border border-gray-200 flex-shrink-0" 
                  />
              )}
              <div className="flex-grow">
                  <div className="flex items-center gap-3">
                      {assessment.hasSeriousIssues && (
                      <div className="flex-shrink-0 bg-red-100 p-2 rounded-full">
                          <AlertTriangleIcon className="w-5 h-5 text-red-600" />
                      </div>
                      )}
                      <h3 className="text-xl font-bold text-gray-900">{assessment.hotelName}</h3>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{assessment.location}</p>
                  <p className="text-xs text-gray-400 mt-2">
                      Assessed on: {new Date(assessment.createdAt).toLocaleDateString()}
                  </p>
              </div>
          </div>
          <div className="flex items-center gap-2 pl-4 flex-shrink-0">
             <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="relative">
                <button
                    onClick={handleShareClick}
                    className="p-2 rounded-full text-gray-400 hover:bg-indigo-100 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-150 transform hover:scale-110"
                    aria-label="Share assessment"
                >
                    <ShareIcon className="w-5 h-5" />
                </button>
                {copied && (
                    <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 bg-gray-900 text-white text-xs rounded py-1 px-2 pointer-events-none transition-opacity duration-300 whitespace-nowrap">
                    Copied!
                    </span>
                )}
                </div>
                <button
                onClick={handleDeleteClick}
                className="p-2 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-150 transform hover:scale-110"
                aria-label="Delete assessment"
                >
                <TrashIcon className="w-5 h-5" />
                </button>
            </div>
            <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
        
        <div className={`transition-[max-height,opacity,padding,margin] duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[5000px] opacity-100 pt-4 mt-4 border-t border-gray-200' : 'max-h-0 opacity-0 p-0 m-0'}`}>
            {assessment.hasSeriousIssues && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200">
                <h4 className="font-bold text-red-800">Critical Warning Reported</h4>
                <p className="mt-1 text-sm text-red-700">{assessment.seriousIssuesNotes}</p>
            </div>
            )}

            {assessment.images && assessment.images.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">Attached Images</h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {assessment.images.map((image, index) => (
                        <div key={index} className="aspect-square">
                        <a href={image} target="_blank" rel="noopener noreferrer" aria-label={`View image ${index + 1}`}>
                            <img
                            src={image}
                            alt={`Assessment image ${index + 1}`}
                            className="w-full h-full object-cover rounded-md border border-gray-200 hover:opacity-80 transition-opacity"
                            />
                        </a>
                        </div>
                    ))}
                    </div>
                </div>
            )}

            <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Scrutiny Report</h4>
            <div
                className="prose prose-sm max-w-none text-gray-600
                        prose-headings:font-semibold prose-headings:text-gray-900 prose-headings:mt-4 prose-headings:mb-2 first:prose-headings:mt-0
                        prose-h4:text-sm prose-h4:uppercase prose-h4:tracking-wider prose-h4:text-indigo-700
                        prose-h5:text-sm prose-h5:text-gray-700 prose-h5:font-medium prose-h5:mb-1
                        prose-p:my-1 prose-ul:mt-1 prose-ul:mb-3 prose-ul:list-disc prose-ul:marker:text-gray-400
                        prose-li:my-0.5 prose-li:ml-4
                        prose-a:text-indigo-600 hover:prose-a:text-indigo-800 prose-a:font-medium prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: assessment.geminiReport }}
            />
            </div>
        </div>
      </div>
    </div>
  );
};
