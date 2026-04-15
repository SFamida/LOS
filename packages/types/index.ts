export type FlowType = 'customer-led' | 'contractor-led';

export type ApplicationStatus = 'draft' | 'pending' | 'in-progress' | 'approved' | 'rejected';

export interface BasicDetails {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  ssn: string;
  dateOfBirth: string;
  requestedAmount: string;
}

export interface PersonalInformation {
  firstName: string;
  lastName: string;
  email: string;
  confirmEmail: string;
  phoneNumber: string;
  ssn: string;
  dateOfBirth: string;
  requestedAmount: string;
}

export interface AddressDetails {
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface FinancialDetails {
  annualIncome: string;
  monthlyIncome?: string;
}

export interface Application {
  id: string;
  applicationToken?: string;
  flowType: FlowType;
  status: ApplicationStatus;
  
  // Merchant provided basic details
  basicDetails?: BasicDetails;
  
  // Customer provided details
  personalInformation?: PersonalInformation;
  propertyAddress?: AddressDetails;
  applicantAddress?: AddressDetails;
  sameAsPropertyAddress?: boolean;
  financialDetails?: FinancialDetails;
  
  // Verification details
  otpVerified?: boolean;
  ssnVerified?: boolean;
  phoneVerified?: boolean;
  verifiedPhoneNumber?: string;
  verifiedSSN?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateApplicationRequest {
  basicDetails: BasicDetails;
  flowType: FlowType;
}

export interface CreateOTPRequest {
  applicationToken: string;
  phoneNumber: string;
}

export interface VerifyOTPRequest {
  applicationToken: string;
  phoneNumber: string;
  otp: string;
}

export interface VerifySSNRequest {
  applicationToken: string;
  ssn: string;
}

export interface SubmitApplicationRequest {
  applicationToken: string;
  personalInformation: PersonalInformation;
  propertyAddress: AddressDetails;
  applicantAddress: AddressDetails;
  sameAsPropertyAddress: boolean;
  financialDetails: FinancialDetails;
}

export interface AuthPayload {
  id: string;
  email: string;
  role: 'merchant' | 'lender';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
