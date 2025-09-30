import type { AssessmentInput } from '../types';

// --- HELPERS ---

/**
 * Escapes HTML special characters in a string to prevent XSS.
 * @param unsafe The string to escape.
 * @returns The escaped string, or an empty string if input is null/undefined.
 */
const escapeHtml = (unsafe: string | undefined | null): string => {
    if (!unsafe) return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
};

/**
 * Builds a paragraph for a simple key-value field if the value exists.
 * @param label The bolded label for the field.
 * @param value The value to display.
 * @returns An HTML string for the field, or an empty string.
 */
const buildSimpleField = (label: string, value: string | undefined | null): string => {
    if (!value?.trim()) return '';
    return `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value.trim())}</p>`;
}

/**
 * Builds an anchor tag for a website link if the URL exists.
 * @param label The bolded label for the link.
 * @param url The URL.
 * @returns An HTML string for the link, or an empty string.
 */
const buildLinkField = (label: string, url: string | undefined | null): string => {
    if (!url?.trim()) return '';
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    return `<p><strong>${escapeHtml(label)}:</strong> <a href="${escapeHtml(fullUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(url)}</a></p>`;
}

/**
 * Builds a checklist section with a title, list items, and other notes.
 * Returns an empty string if there's no content to display.
 * @param title The title of the section.
 * @param items An array of strings for the list.
 * @param otherNotes A string for any other notes.
 * @returns An HTML string for the section, or an empty string.
 */
const buildChecklistSection = (title: string, items: string[] | undefined, otherNotes: string | undefined): string => {
  const validItems = items?.filter(item => item?.trim()) || [];
  const trimmedOtherNotes = otherNotes?.trim();

  if (validItems.length === 0 && !trimmedOtherNotes) {
    return '';
  }

  let listItems = validItems.map(item => `<li>${escapeHtml(item)}</li>`).join('');
  if (trimmedOtherNotes) {
    listItems += `<li><strong>Other Notes:</strong> ${escapeHtml(trimmedOtherNotes)}</li>`;
  }
  
  return `
    <div>
      <h5>${escapeHtml(title)}</h5>
      <ul>${listItems}</ul>
    </div>
  `;
};

/**
 * Wraps content in a section with a <h4> title if the content is not empty.
 * @param title The title for the section.
 * @param content The HTML content of the section.
 * @returns The full section HTML, or an empty string.
 */
const buildTitledSection = (title: string, content: string): string => {
    if (!content.trim()) return '';
    return `
        <div>
            <h4>${escapeHtml(title)}</h4>
            ${content}
        </div>
    `;
}

// --- MAIN REPORT GENERATOR ---

/**
 * Generates a structured, human-readable report from the assessment input
 * in HTML format. This is a local operation and does not make an API call.
 * @param input The assessment data.
 * @returns A promise that resolves to the generated HTML report string.
 */
export async function generateScrutinyReport(input: AssessmentInput): Promise<string> {
  const reportParts: string[] = [];

  // 1. Hotel Logo
  if (input.hotelLogo) {
    reportParts.push(`
      <div style="margin-bottom: 20px;">
        <img src="${input.hotelLogo}" alt="${escapeHtml(input.hotelName)} Logo" style="max-height: 80px; max-width: 200px; display: block; border-radius: 8px; border: 1px solid #eee;" />
      </div>
    `);
  }

  // 2. Basic Information
  const basicInfoContent = [
    buildSimpleField('Franchise', input.hotelFranchise),
    buildSimpleField('Location', input.location),
    buildLinkField('Website', input.hotelWebsite),
  ].filter(Boolean).join('');
  reportParts.push(basicInfoContent);

  // 3. Critical Warning
  if (input.hasSeriousIssues && input.seriousIssuesNotes?.trim()) {
    const warningContent = `<p>${escapeHtml(input.seriousIssuesNotes.trim())}</p>`;
    reportParts.push(buildTitledSection('CRITICAL WARNING', warningContent));
  }
  
  // 4. Stay Details
  let stayDetailsHeader = '';
  if (input.roomNumber?.trim() || input.floor?.trim()) {
    const room = input.roomNumber?.trim() ? `<strong>Room:</strong> ${escapeHtml(input.roomNumber)}` : '';
    const floor = input.floor?.trim() ? `<strong>Floor:</strong> ${escapeHtml(input.floor)}` : '';
    const separator = room && floor ? ' on ' : '';
    stayDetailsHeader = `<p>${room}${separator}${floor}</p>`;
  }
  const stayDetailsChecklists = [
    buildChecklistSection('Room Details', input.roomDetails, input.roomDetailsOther),
    buildChecklistSection('Noise Level', input.noiseLevel, input.noiseLevelOther)
  ].filter(Boolean).join('');
  reportParts.push(buildTitledSection('Stay Details', stayDetailsHeader + stayDetailsChecklists));

  // 5. Loyalty & Parking
  const membershipTitle = `Membership Recognition (${escapeHtml(input.membershipLevel) || 'N/A'})`;
  const loyaltyParkingContent = [
    buildChecklistSection(membershipTitle, input.membershipRecognition, input.membershipRecognitionOther),
    buildChecklistSection('Parking', input.parkingDetails, input.parkingDetailsOther)
  ].filter(Boolean).join('');
  reportParts.push(buildTitledSection('Loyalty & Parking', loyaltyParkingContent));

  // 6. Core Assessment
  const coreAssessmentContent = [
    buildChecklistSection('Overall Vibe & Ambiance', input.overallVibe, input.overallVibeOther),
    buildChecklistSection('Cleanliness', input.cleanliness, input.cleanlinessOther),
    buildChecklistSection('Staff & Service', input.staffService, input.staffServiceOther),
    buildChecklistSection('Amenities & Facilities', input.amenities, input.amenitiesOther),
    buildChecklistSection('Wi-Fi Service', input.wifiService, input.wifiServiceOther),
    buildChecklistSection('Value for Money', input.valueForMoney, input.valueForMoneyOther)
  ].filter(Boolean).join('');
  reportParts.push(buildTitledSection('Core Assessment', coreAssessmentContent));

  // 7. General Observations
  if (input.otherObservations?.trim()) {
    const observationsContent = `<p>${escapeHtml(input.otherObservations.trim())}</p>`;
    reportParts.push(buildTitledSection('General Observations', observationsContent));
  }

  // Filter out any empty parts and join
  return Promise.resolve(reportParts.filter(p => p.trim()).join(''));
}
