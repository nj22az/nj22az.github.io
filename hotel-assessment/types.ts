
export interface AssessmentInput {
  hotelName: string;
  hotelLogo?: string;
  hotelFranchise: string;
  hotelWebsite: string;
  location: string;
  membershipLevel: string;
  membershipRecognition: string[];
  membershipRecognitionOther: string;
  parkingDetails: string[];
  parkingDetailsOther: string;
  roomNumber: string;
  floor: string;
  roomDetails: string[];
  roomDetailsOther: string;
  noiseLevel: string[];
  noiseLevelOther: string;
  overallVibe: string[];
  overallVibeOther: string;
  cleanliness: string[];
  cleanlinessOther: string;
  staffService: string[];
  staffServiceOther: string;
  amenities: string[];
  amenitiesOther: string;
  wifiService: string[];
  wifiServiceOther: string;
  valueForMoney: string[];
  valueForMoneyOther: string;
  otherObservations: string;
  hasSeriousIssues: boolean;
  seriousIssuesNotes: string;
  images: string[];
}

export interface Assessment extends AssessmentInput {
  id: string;
  geminiReport: string;
  createdAt: string;
}