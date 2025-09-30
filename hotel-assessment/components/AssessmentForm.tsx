import React, { useState, useRef } from 'react';
import type { AssessmentInput } from '../types';
import { ImageIcon } from './icons/ImageIcon';
import { XIcon } from './icons/XIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { SparklesIcon } from './icons/SparklesIcon';
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
  <div className="journal-field">
    <label htmlFor={id} className="journal-label">
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
        className="journal-input journal-input--textarea"
      />
    ) : (
      <input
        type="text"
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="journal-input"
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
    const { label, icon: Icon } = checklistData[category];
    const hasContent = selectedValues.length > 0 || otherValue.trim() !== '';
    const options = checklistData[category].options || [];

    return (
        <section className="journal-subsection">
            <div className="journal-subsection__header">
                <label className="journal-label journal-label--icon">
                    <Icon className="journal-label__icon" />
                    {label}
                </label>
                {hasContent && (
                    <button
                        type="button"
                        onClick={() => onClear(category)}
                        className="journal-link-button"
                        aria-label={`Clear selections for ${label}`}
                    >
                        <XIcon className="journal-link-button__icon" />
                        Clear
                    </button>
                )}
            </div>
            {options.length > 0 && (
              <div className="journal-chip-group">
                  {options.map((option) => {
                      const isActive = selectedValues.includes(option);
                      return (
                          <button
                              key={option}
                              type="button"
                              onClick={() => onToggle(category, option)}
                              className={`journal-chip ${isActive ? 'journal-chip--active' : ''}`}
                              aria-pressed={isActive}
                          >
                              {option}
                          </button>
                      );
                  })}
              </div>
            )}
            <input
                type="text"
                name={`${category}Other`}
                value={otherValue}
                onChange={onOtherChange}
                placeholder="Other observations for this category..."
                className="journal-input journal-input--inline"
            />
        </section>
    );
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
    <form onSubmit={handleSubmit} className="journal-form">
      <section className="journal-panel">
        <div className="journal-panel__header">
          <h3 className="journal-panel__title">Hotel Profile</h3>
          <p className="journal-panel__subtitle">Core details that anchor this entry in the journal.</p>
        </div>
        <div className="journal-panel__body">
          <FormField id="hotelName" label="Hotel Name" value={formData.hotelName} onChange={handleTextChange} placeholder="e.g., The Grand Budapest Hotel" />
          <FormField id="hotelFranchise" label="Franchise / Group" value={formData.hotelFranchise} onChange={handleTextChange} placeholder="e.g., Marriott, Hyatt, Independent" />
          <FormField id="hotelWebsite" label="Website" value={formData.hotelWebsite} onChange={handleTextChange} placeholder="e.g., example.com" />
          <FormField id="location" label="Location" value={formData.location} onChange={handleTextChange} placeholder="e.g., City, Country" />

          <div className="journal-upload">
            <div className="journal-upload__preview" aria-label="Hotel logo preview">
              {formData.hotelLogo ? (
                <img src={formData.hotelLogo} alt="Hotel logo preview" className="journal-upload__image" />
              ) : (
                <ImageIcon className="journal-upload__placeholder" />
              )}
            </div>
            <input
              ref={logoInputRef}
              type="file"
              id="hotelLogo"
              name="hotelLogo"
              accept="image/png, image/jpeg, image/webp, image/svg+xml"
              onChange={handleLogoChange}
              className="journal-upload__input"
            />
            <div className="journal-upload__actions">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="journal-button journal-button--ghost"
              >
                {formData.hotelLogo ? 'Replace Logo' : 'Upload Logo'}
              </button>
              {formData.hotelLogo && (
                <button type="button" onClick={handleRemoveLogo} className="journal-link-button">
                  <XIcon className="journal-link-button__icon" />
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="journal-panel">
        <div className="journal-panel__header">
          <h3 className="journal-panel__title">Stay Details</h3>
          <p className="journal-panel__subtitle">Capture where you stayed and how the visit was staged.</p>
        </div>
        <div className="journal-panel__body">
          <div className="journal-field-row">
            <FormField id="roomNumber" label="Room Number" value={formData.roomNumber} onChange={handleTextChange} placeholder="e.g., 1208" />
            <FormField id="floor" label="Floor" value={formData.floor} onChange={handleTextChange} placeholder="e.g., 12" />
          </div>
          <FormField id="membershipLevel" label="Membership Level" value={formData.membershipLevel} onChange={handleTextChange} placeholder="e.g., Gold, Platinum, None" />

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
      </section>

      <section className="journal-panel">
        <div className="journal-panel__header">
          <h3 className="journal-panel__title">Experience & Amenities</h3>
          <p className="journal-panel__subtitle">Record the overall feel and quality of the property.</p>
        </div>
        <div className="journal-panel__body">
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
      </section>

      <section className="journal-panel">
        <div className="journal-panel__header">
          <h3 className="journal-panel__title">Notes & Escalations</h3>
          <p className="journal-panel__subtitle">Add narrative context or flag critical findings.</p>
        </div>
        <div className="journal-panel__body">
          <FormField
            id="otherObservations"
            label="General Observations"
            value={formData.otherObservations}
            onChange={handleTextChange}
            placeholder="Any other notes, highlights, or general feelings about the stay..."
            isTextArea
          />

          <div className="journal-alert-toggle">
            <input
              id="hasSeriousIssues"
              name="hasSeriousIssues"
              type="checkbox"
              checked={formData.hasSeriousIssues}
              onChange={handleCheckboxChange}
            />
            <label htmlFor="hasSeriousIssues" className="journal-label journal-label--inline">
              <AlertTriangleIcon className="journal-label__icon journal-label__icon--alert" />
              Report any serious, deal-breaking issues
            </label>
            <p className="journal-helper-text">Examples: safety concerns, theft, major hygiene failures.</p>
          </div>

          {formData.hasSeriousIssues && (
            <FormField
              id="seriousIssuesNotes"
              label="Serious Issue Notes"
              value={formData.seriousIssuesNotes}
              onChange={handleTextChange}
              placeholder="Describe the critical issue in detail..."
              isTextArea
            />
          )}
        </div>
      </section>

      <section className="journal-panel">
        <div className="journal-panel__header">
          <h3 className="journal-panel__title">Attachments</h3>
          <p className="journal-panel__subtitle">Optional visuals that support the entry.</p>
        </div>
        <div className="journal-panel__body">
          <div className="journal-dropzone" role="group" aria-label="Upload supporting images">
            <ImageIcon className="journal-dropzone__icon" />
            <div className="journal-dropzone__content">
              <span className="journal-dropzone__title">Upload files</span>
              <span className="journal-dropzone__hint">Drag & drop or select from Finder</span>
            </div>
            <label className="journal-dropzone__trigger">
              Browse
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                ref={fileInputRef}
                className="journal-dropzone__input"
              />
            </label>
            <p className="journal-dropzone__note">PNG, JPG, GIF up to 10MB each. Max 10 images.</p>
          </div>

          {formData.images.length > 0 && (
            <div className="journal-image-grid">
              {formData.images.map((image, index) => (
                <figure key={index} className="journal-image">
                  <img src={image} alt={`upload-preview-${index}`} />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="journal-image__remove"
                    aria-label="Remove uploaded image"
                  >
                    <XIcon className="journal-image__remove-icon" />
                  </button>
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="journal-form__footer">
        <button
          type="button"
          onClick={handleFillWithRandomData}
          className="journal-button journal-button--ghost"
        >
          <SparklesIcon className="journal-button__icon" />
          Generate Sample Entry
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="journal-button journal-button--primary"
        >
          {isLoading ? (
            <>
              <span className="journal-button__spinner" aria-hidden="true" />
              Generating...
            </>
          ) : (
            'Create Journal Entry'
          )}
        </button>
      </div>
    </form>
  );
};
