import React from 'react';
import type { AssessmentInput } from '../types';

import { CoffeeIcon } from '../components/icons/CoffeeIcon';
import { DropletIcon } from '../components/icons/DropletIcon';
import { UsersIcon } from '../components/icons/UsersIcon';
import { AwardIcon } from '../components/icons/AwardIcon';
import { DollarSignIcon } from '../components/icons/DollarSignIcon';
import { StarIcon } from '../components/icons/StarIcon';
import { CarIcon } from '../components/icons/CarIcon';
import { KeyIcon } from '../components/icons/KeyIcon';
import { Volume2Icon } from '../components/icons/Volume2Icon';
import { WifiIcon } from '../components/icons/WifiIcon';

export const getInitialFormState = (): AssessmentInput => ({
  hotelName: '',
  hotelLogo: '',
  hotelFranchise: '',
  hotelWebsite: '',
  location: '',
  membershipLevel: '',
  membershipRecognition: [],
  membershipRecognitionOther: '',
  parkingDetails: [],
  parkingDetailsOther: '',
  roomNumber: '',
  floor: '',
  roomDetails: [],
  roomDetailsOther: '',
  noiseLevel: [],
  noiseLevelOther: '',
  overallVibe: [],
  overallVibeOther: '',
  cleanliness: [],
  cleanlinessOther: '',
  staffService: [],
  staffServiceOther: '',
  amenities: [],
  amenitiesOther: '',
  wifiService: [],
  wifiServiceOther: '',
  valueForMoney: [],
  valueForMoneyOther: '',
  otherObservations: '',
  hasSeriousIssues: false,
  seriousIssuesNotes: '',
  images: [],
});

export const checklistData = {
  membershipRecognition: {
    label: 'Membership Recognition',
    icon: StarIcon,
    color: 'text-yellow-500',
    options: ['Acknowledged at Check-in', 'Upgrade Offered', 'Room Upgrade Received', 'Welcome Amenity Provided', 'No Recognition'],
  },
  parkingDetails: {
    label: 'Parking',
    icon: CarIcon,
    color: 'text-slate-600',
    options: ['On-site Parking', 'Free Parking', 'Paid Parking', 'Valet Available', 'Street Parking Only', 'No Parking Nearby'],
  },
  roomDetails: {
    label: 'Room Details',
    icon: KeyIcon,
    color: 'text-gray-500',
    options: ['Corner Room', 'Near Elevator', 'Far from Elevator', 'Connecting Room'],
  },
  noiseLevel: {
    label: 'Noise Level',
    icon: Volume2Icon,
    color: 'text-cyan-500',
    options: ['Quiet Room', 'Noisy from Street', 'Noisy from Hallway', 'Noisy Neighbors'],
  },
  overallVibe: {
    label: 'Overall Vibe & Ambiance',
    icon: CoffeeIcon,
    color: 'text-purple-500',
    options: ['Stylish Decor', 'Quiet Atmosphere', 'Lively Social Scene', 'Family-Friendly', 'Business-Oriented', 'Felt Dated', 'Impersonal/Corporate'],
  },
  cleanliness: {
    label: 'Cleanliness',
    icon: DropletIcon,
    color: 'text-blue-500',
    options: ['Spotless Room', 'Pristine Bathroom', 'Fresh Linens', 'Well-kept Common Areas', 'Visible Dust', 'Grime in Bathroom', 'Stained Upholstery/Carpet'],
  },
  staffService: {
    label: 'Staff & Service',
    icon: UsersIcon,
    color: 'text-green-500',
    options: ['Proactive & Attentive', 'Warm & Welcoming', 'Quick Check-in/Out', 'Knowledgeable Concierge', 'Slow Service', 'Indifferent Attitude', 'Language Barrier'],
  },
  amenities: {
    label: 'Amenities & Facilities',
    icon: AwardIcon,
    color: 'text-amber-500',
    options: ['High-Quality Toiletries', 'Well-Equipped Gym', 'Relaxing Pool Area', 'Fast & Free Wi-Fi', 'Good In-Room Coffee/Tea', 'Broken Equipment', 'Overcrowded Facilities'],
  },
  wifiService: {
    label: 'Wi-Fi Service',
    icon: WifiIcon,
    color: 'text-sky-500',
    options: ['Fast & Free', 'Slow & Paid', 'Unreliable', 'Good Signal Strength', 'Easy to Connect'],
  },
  valueForMoney: {
    label: 'Value for Money',
    icon: DollarSignIcon,
    color: 'text-emerald-600',
    options: ['Exceeded Expectations for Price', 'Price Felt Justified', 'Included Perks (Breakfast, etc.)', 'Expensive for the Quality', 'Hidden Fees/Charges', 'Better Options Nearby'],
  },
};

export type ChecklistCategory = keyof typeof checklistData;

export const loyaltyParkingCategories: ChecklistCategory[] = ['membershipRecognition', 'parkingDetails'];
export const stayDetailsCategories: ChecklistCategory[] = ['roomDetails', 'noiseLevel'];
export const coreAssessmentCategories: ChecklistCategory[] = ['overallVibe', 'cleanliness', 'staffService', 'amenities', 'wifiService', 'valueForMoney'];

export const mutuallyExclusivePairs: Partial<Record<ChecklistCategory, string[][]>> = {
    membershipRecognition: [
        ['No Recognition', 'Acknowledged at Check-in'],
        ['No Recognition', 'Upgrade Offered'],
        ['No Recognition', 'Room Upgrade Received'],
        ['No Recognition', 'Welcome Amenity Provided'],
    ],
    parkingDetails: [
        ['On-site Parking', 'No Parking Nearby'],
        ['On-site Parking', 'Street Parking Only'],
        ['Free Parking', 'Paid Parking'],
    ],
    roomDetails: [
        ['Near Elevator', 'Far from Elevator'],
    ],
    noiseLevel: [
        ['Quiet Room', 'Noisy from Street'],
        ['Quiet Room', 'Noisy from Hallway'],
        ['Quiet Room', 'Noisy Neighbors'],
    ],
    overallVibe: [
        ['Quiet Atmosphere', 'Lively Social Scene'],
    ],
    cleanliness: [
        ['Spotless Room', 'Visible Dust'],
        ['Spotless Room', 'Grime in Bathroom'],
        ['Spotless Room', 'Stained Upholstery/Carpet'],
        ['Pristine Bathroom', 'Grime in Bathroom'],
    ],
    staffService: [
        ['Proactive & Attentive', 'Indifferent Attitude'],
        ['Warm & Welcoming', 'Indifferent Attitude'],
        ['Quick Check-in/Out', 'Slow Service'],
    ],
    amenities: [
        ['Well-Equipped Gym', 'Broken Equipment'],
    ],
    wifiService: [
        ['Fast & Free', 'Slow & Paid'],
        ['Unreliable', 'Good Signal Strength'],
        ['Unreliable', 'Fast & Free'],
    ],
    valueForMoney: [
        ['Exceeded Expectations for Price', 'Expensive for the Quality'],
        ['Price Felt Justified', 'Expensive for the Quality'],
    ],
};