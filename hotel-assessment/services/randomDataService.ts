import type { AssessmentInput } from '../types';
import { 
    checklistData, 
    mutuallyExclusivePairs,
    getInitialFormState,
    ChecklistCategory
} from '../data/assessmentData';


// --- UTILITY FUNCTIONS ---
const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const coinFlip = (probability = 0.5): boolean => Math.random() < probability;
const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

// --- DATA SETS ---
const hotelNamePrefixes = ['Grand', 'Royal', 'The', 'Park', 'City', 'Lakefront', 'Oceanview', 'Mountain', 'Starlight'];
const hotelNameSuffixes = ['Plaza', 'Hotel', 'Inn', 'Resort', 'Suites', 'Palace', 'Lodge', 'Retreat', 'Tower'];
const locations = ['Paris, France', 'Tokyo, Japan', 'New York, USA', 'London, UK', 'Rome, Italy', 'Sydney, Australia', 'Cairo, Egypt', 'Rio de Janeiro, Brazil', 'Stockholm, Sweden'];

const personas = {
    luxury: {
        franchises: ['Four Seasons', 'Ritz-Carlton', 'St. Regis', 'Mandarin Oriental', 'Independent'],
        membershipLevels: ['Platinum Elite', 'Diamond', 'Ambassador'],
        positiveVibes: ['Stylish Decor', 'Quiet Atmosphere'],
        negativeVibes: ['Impersonal/Corporate'],
        positiveAmenities: ['High-Quality Toiletries', 'Well-Equipped Gym', 'Relaxing Pool Area'],
        positiveWifiService: ['Fast & Free', 'Good Signal Strength', 'Easy to Connect'],
        positiveService: ['Proactive & Attentive', 'Warm & Welcoming', 'Knowledgeable Concierge'],
        positiveValue: ['Price Felt Justified', 'Exceeded Expectations for Price'],
        negativeValue: ['Expensive for the Quality'],
        positiveRoomDetails: ['Corner Room', 'Far from Elevator'],
        positiveNoiseLevel: ['Quiet Room'],
        seriousIssueChance: 0.02,
    },
    budget: {
        franchises: ['Holiday Inn Express', 'Best Western', 'Motel 6', 'Super 8', 'Independent'],
        membershipLevels: ['Member', 'Silver', 'None'],
        positiveVibes: ['Family-Friendly', 'Lively Social Scene'],
        negativeVibes: ['Felt Dated', 'Impersonal/Corporate'],
        negativeCleanliness: ['Visible Dust', 'Grime in Bathroom', 'Stained Upholstery/Carpet'],
        negativeService: ['Slow Service', 'Indifferent Attitude'],
        negativeAmenities: ['Broken Equipment', 'Overcrowded Facilities'],
        negativeWifiService: ['Slow & Paid', 'Unreliable'],
        positiveValue: ['Exceeded Expectations for Price', 'Better Options Nearby'],
        negativeValue: ['Expensive for the Quality', 'Hidden Fees/Charges'],
        negativeRoomDetails: ['Near Elevator'],
        negativeNoiseLevel: ['Noisy from Street', 'Noisy from Hallway', 'Noisy Neighbors'],
        seriousIssueChance: 0.2
    },
    business: {
        franchises: ['Hyatt Regency', 'Marriott', 'Hilton', 'Sheraton', 'Westin'],
        membershipLevels: ['Gold Elite', 'Globalist', 'Platinum'],
        positiveVibes: ['Business-Oriented', 'Quiet Atmosphere'],
        negativeVibes: ['Impersonal/Corporate'],
        positiveService: ['Quick Check-in/Out', 'Proactive & Attentive'],
        positiveAmenities: ['Fast & Free Wi-Fi', 'Good In-Room Coffee/Tea'],
        positiveWifiService: ['Fast & Free', 'Good Signal Strength', 'Easy to Connect'],
        positiveValue: ['Price Felt Justified'],
        negativeValue: ['Expensive for the Quality'],
        positiveRoomDetails: ['Far from Elevator'],
        positiveNoiseLevel: ['Quiet Room'],
        seriousIssueChance: 0.05,
    }
};

const seriousIssueNotes = [
    'Evidence of bedbugs found on the mattress seams. Immediately requested a room change and full refund.',
    'Safety latch on the window was broken, posing a significant security risk as the room was on a low floor.',
    'The fire alarm in the room was disabled, with its battery removed. A major safety violation.',
    'Cash was stolen from a closed suitcase inside the room while I was out for dinner. Hotel management was unhelpful.',
];

const generalObservations = [
    'The room had a fantastic view of the city skyline.',
    'Street noise was audible throughout the night, making it difficult to sleep.',
    'The hotel is conveniently located next to a major subway station.',
    'The complimentary breakfast was surprisingly good with a wide variety of options.',
    'Room service was incredibly fast and the food was excellent.',
];

// --- LOGIC ---
const selectChecklistItems = (category: ChecklistCategory, selectedPersona: any): string[] => {
    const categoryData = checklistData[category];
    if (!categoryData || !categoryData.options) return [];
    
    const { options } = categoryData;
    const contradictions = mutuallyExclusivePairs[category] || [];
    const selected = new Set<string>();
    
    // Bias selection based on persona
    const positiveBias = selectedPersona[`positive${category.charAt(0).toUpperCase() + category.slice(1)}` as keyof typeof selectedPersona] || [];
    const negativeBias = selectedPersona[`negative${category.charAt(0).toUpperCase() + category.slice(1)}` as keyof typeof selectedPersona] || [];
    
    let potentialSelections = [...options];
    if(coinFlip(0.7)) potentialSelections.unshift(...positiveBias);
    if(coinFlip(0.3)) potentialSelections.unshift(...negativeBias);

    const numToSelect = getRandomInt(1, 2);

    while (selected.size < numToSelect && potentialSelections.length > 0) {
        const item = getRandomElement(potentialSelections);
        potentialSelections = potentialSelections.filter(i => i !== item);

        let hasContradiction = false;
        for (const pair of contradictions) {
            if (pair.includes(item)) {
                const other = pair.find(p => p !== item);
                if (other && selected.has(other)) {
                    hasContradiction = true;
                    break;
                }
            }
        }

        if (!hasContradiction) {
            selected.add(item);
        }
    }

    return Array.from(selected);
};


export const generateRandomAssessmentData = (): AssessmentInput => {
    const data = getInitialFormState();
    const personaType = getRandomElement(Object.keys(personas) as (keyof typeof personas)[]);
    const selectedPersona = personas[personaType];

    // Basic Info
    data.hotelName = `${getRandomElement(hotelNamePrefixes)} ${getRandomElement(hotelNameSuffixes)}`;
    data.hotelFranchise = getRandomElement(selectedPersona.franchises);
    data.location = getRandomElement(locations);
    data.hotelWebsite = `www.${data.hotelName.toLowerCase().replace(/\s+/g, '-')}.com`;
    data.membershipLevel = getRandomElement(selectedPersona.membershipLevels);
    
    // Stay Details
    data.floor = String(getRandomInt(2, 25));
    data.roomNumber = `${data.floor}${String(getRandomInt(1, 40)).padStart(2, '0')}`;
    
    // Checklists
    (Object.keys(checklistData) as ChecklistCategory[]).forEach(category => {
        const selectedItems = selectChecklistItems(category, selectedPersona);
        data[category] = selectedItems as any; // Type assertion needed due to dynamic keys
        
        // Add "Other" notes occasionally
        if (coinFlip(0.2)) {
            const key = `${category}Other` as keyof AssessmentInput;
            (data[key] as string) = 'Additional note for this section.';
        }
    });
    
    // Observations & Issues
    if (coinFlip(0.4)) {
        data.otherObservations = getRandomElement(generalObservations);
    }
    
    data.hasSeriousIssues = coinFlip(selectedPersona.seriousIssueChance || 0.05);
    if (data.hasSeriousIssues) {
        data.seriousIssuesNotes = getRandomElement(seriousIssueNotes);
    }

    return data;
};