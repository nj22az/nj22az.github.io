import React, { useState, useRef } from 'react';
import type { AssessmentInput } from '../types';
import { ImageIcon } from './icons/ImageIcon';
import { XIcon } from './icons/XIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { generateRandomAssessmentData } from '../services/randomDataService';
import { 
    checklistData, 
    coreAssessmentCategories, 
    loyaltyParkingCategories,
    stayDetailsCategories,
    mutuallyExclusivePairs,
    getInitialFormState,
    ChecklistCategory
} from '../data/assessmentData';


interface AssessmentFormProps {
  onSubmit: (data: AssessmentInput) => void;
  isLoading: boolean;
}

const FormField: React.FC<{
  id: keyof AssessmentInput | 'seriousIssuesNotes';
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder: string;
  isTextArea?: boolean;
}> = ({ id, label, value, onChange, placeholder, isTextArea = false }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    {isTextArea ? (
      <textarea
        id={id}
        name={id}
        rows={3}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition duration-150"
      />
    ) : (
      <input
        type="text"
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition duration-150"
      />
    )}
  </div>
);

const ChecklistField: React.FC<{
    category: ChecklistCategory;
    selectedValues: string[];
    otherValue: string;
    onToggle: (category: ChecklistCategory, value: string) => void;
    onOtherChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClear: (category: ChecklistCategory) => void;
}> = ({ category, selectedValues, otherValue, onToggle, onOtherChange, onClear }) => {
    const { label, icon: Icon, color } = checklistData[category];
    const hasContent = selectedValues.length > 0 || otherValue.trim() !== '';
    const options = checklistData[category].options || [];


    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${color}`} />
                    {label}
                </label>
                {hasContent && (
                    <button
                        type="button"
                        onClick={() => onClear(category)}
                        className="text-xs text-gray-500 hover:text-indigo-600 font-semibold transition-colors flex items-center gap-1"
                        aria-label={`Clear selections for ${label}`}
                    >
                        <XIcon className="w-3 h-3" />
                        Clear
                    </button>
                )}
            </div>
            <div className="flex flex-wrap gap-2">
                {options.map((option) => (
                    <button
                        key={option}
                        type="button"
                        onClick={() => onToggle(category, option)}
                        className={`px-3 py-1.5 text-sm rounded-full border transition-all duration-150 ${
                            selectedValues.includes(option)
                                ? 'bg-indigo-600 border-indigo-600 text-white font-semibold shadow-sm'
                                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400'
                        }`}
                        aria-pressed={selectedValues.includes(option)}
                    >
                        {option}
                    </button>
                ))}
            </div>
            <div className="mt-3">
                 <input
                    type="text"
                    name={`${category}Other`}
                    value={otherValue}
                    onChange={onOtherChange}
                    placeholder="Other observations for this category..."
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition duration-150"
                  />
            </div>
        </div>
    )
}

const MAX_LOGO_SIZE_MB = 1;
const MAX_LOGO_SIZE_BYTES = MAX_LOGO_SIZE_MB * 1024 * 1024;

export const AssessmentForm: React.FC<AssessmentFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<AssessmentInput>(getInitialFormState);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleChecklistToggle = (category: ChecklistCategory, value: string) => {
    setFormData((prev) => {
      const currentValues = prev[category] as string[];

      if (currentValues.includes(value)) {
        return {
          ...prev,
          [category]: currentValues.filter((item) => item !== value),
        };
      }

      const contradictions: string[] = [];
      const exclusivePairsForCategory = mutuallyExclusivePairs[category] || [];
      for (const pair of exclusivePairsForCategory) {
        if (pair.includes(value)) {
          const other = pair.find(item => item !== value);
          if (other) {
            contradictions.push(other);
          }
        }
      }
      
      let updatedValues = currentValues.filter(v => !contradictions.includes(v));
      
      updatedValues.push(value);

      return { ...prev, [category]: updatedValues };
    });
  };

  const handleClearCategory = (category: ChecklistCategory) => {
    setFormData(prev => ({
        ...prev,
        [category]: [],
        [`${category}Other`]: '',
    }));
  };

  const handleChecklistOtherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_LOGO_SIZE_BYTES) {
        alert(`Logo image is too large. Please upload a file smaller than ${MAX_LOGO_SIZE_MB}MB.`);
        if (logoInputRef.current) {
          logoInputRef.current.value = '';
        }
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, hotelLogo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, hotelLogo: '' }));
    if (logoInputRef.current) {
        logoInputRef.current.value = '';
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (formData.images.length + files.length > 10) {
        alert('You can upload a maximum of 10 images.');
        return;
      }
      // FIX: Replace Array.from().forEach() with a standard for loop for iterating the FileList.
      // This avoids potential TypeScript type inference issues with DOM collections.
      for (let i = 0; i < files.length; i++) {
        const file = files.item(i);
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setFormData(prev => ({ ...prev, images: [...prev.images, reader.result as string] }));
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleFillWithRandomData = () => {
    const randomData = generateRandomAssessmentData();
    setFormData({
        ...randomData,
        hotelLogo: '',
        images: []
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
     if (!formData.hotelName || !formData.location) {
        alert('Please fill in at least the Hotel Name and Location.');
        return;
    }
    onSubmit(formData);
    setFormData(getInitialFormState());
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (logoInputRef.current) logoInputRef.current.value = '';
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Hotel Details</h3>
                <div className="space-y-4 mt-4">
                    <FormField id="hotelName" label="Hotel Name" value={formData.hotelName} onChange={handleTextChange} placeholder="e.g., The Grand Budapest Hotel" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hotel Logo
                      </label>
                      <div className="mt-1 flex items-center gap-4">
                        <span className="inline-block h-16 w-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                          {formData.hotelLogo ? (
                            <img src={formData.hotelLogo} alt="Hotel Logo Preview" className="h-full w-full object-contain" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                                <ImageIcon className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </span>
                        <input
                            ref={logoInputRef}
                            type="file"
                            id="hotelLogo"
                            name="hotelLogo"
                            accept="image/png, image/jpeg, image/webp, image/svg+xml"
                            onChange={handleLogoChange}
                            className="hidden"
                        />
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => logoInputRef.current?.click()}
                            className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                          >
                            {formData.hotelLogo ? 'Change' : 'Upload'}
                          </button>
                          {formData.hotelLogo && (
                            <button
                              type="button"
                              onClick={handleRemoveLogo}
                              className="text-xs text-red-600 hover:text-red-800 font-semibold"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <FormField id="hotelFranchise" label="Franchise / Group" value={formData.hotelFranchise} onChange={handleTextChange} placeholder="e.g., Marriott, Hyatt, Independent" />
                    <FormField id="hotelWebsite" label="Website" value={formData.hotelWebsite} onChange={handleTextChange} placeholder="e.g., example.com" />
                    <FormField id="location" label="Location" value={formData.location} onChange={handleTextChange} placeholder="e.g., City, Country" />
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Stay Details</h3>
                <div className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField id="roomNumber" label="Room Number" value={formData.roomNumber} onChange={handleTextChange} placeholder="e.g., 1208" />
                        <FormField id="floor" label="Floor" value={formData.floor} onChange={handleTextChange} placeholder="e.g., 12" />
                    </div>
                    <FormField id="membershipLevel" label="Membership Level" value={formData.membershipLevel} onChange={handleTextChange} placeholder="e.g., Gold, Platinum, None" />
                </div>
            </div>
             <div className="space-y-6">
                {loyaltyParkingCategories.map(category => (
                    <ChecklistField
                        key={category}
                        category={category}
                        selectedValues={formData[category] as string[]}
                        otherValue={formData[`${category}Other`] as string}
                        onToggle={handleChecklistToggle}
                        onOtherChange={handleChecklistOtherChange}
                        onClear={handleClearCategory}
                    />
                ))}
            </div>
            <div className="space-y-6">
                {stayDetailsCategories.map(category => (
                    <ChecklistField
                        key={category}
                        category={category}
                        selectedValues={formData[category] as string[]}
                        otherValue={formData[`${category}Other`] as string}
                        onToggle={handleChecklistToggle}
                        onOtherChange={handleChecklistOtherChange}
                        onClear={handleClearCategory}
                    />
                ))}
            </div>
             <div className="space-y-6">
                {coreAssessmentCategories.map(category => (
                    <ChecklistField
                        key={category}
                        category={category}
                        selectedValues={formData[category] as string[]}
                        otherValue={formData[`${category}Other`] as string}
                        onToggle={handleChecklistToggle}
                        onOtherChange={handleChecklistOtherChange}
                        onClear={handleClearCategory}
                    />
                ))}
            </div>
            <FormField id="otherObservations" label="General Observations" value={formData.otherObservations} onChange={handleTextChange} placeholder="Any other notes, highlights, or general feelings about the stay..." isTextArea />
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image Attachments
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <span>Upload files</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handleImageChange} ref={fileInputRef} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each. Max 10 images.</p>
                </div>
              </div>
              {formData.images.length > 0 && (
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img src={image} alt={`upload-preview-${index}`} className="w-full h-full object-cover rounded-md border border-gray-200" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-600 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove image"
                      >
                        <XCircleIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Critical Issues</h3>
          <div className="mt-4 space-y-4">
            <div className="relative flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="hasSeriousIssues"
                  name="hasSeriousIssues"
                  type="checkbox"
                  checked={formData.hasSeriousIssues}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 transition"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="hasSeriousIssues" className="font-medium text-gray-700 flex items-center gap-2">
                   <AlertTriangleIcon className="w-5 h-5 text-red-500" />
                  Report any serious, deal-breaking issues
                </label>
                <p className="text-gray-500">e.g., safety concerns, theft, major hygiene failures, etc.</p>
              </div>
            </div>
            {formData.hasSeriousIssues && (
              <div className="pl-8 transition-all duration-300">
                <FormField
                  id="seriousIssuesNotes"
                  label="Serious Issue Notes"
                  value={formData.seriousIssuesNotes}
                  onChange={handleTextChange}
                  placeholder="Describe the critical issue in detail..."
                  isTextArea
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-8">
        <button
          type="button"
          onClick={handleFillWithRandomData}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          Generate Random
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center items-center gap-2 px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all duration-150"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Generating...</span>
            </>
          ) : (
            'Create Assessment'
          )}
        </button>
      </div>
    </form>
  );
};
