export interface Service {
  id: string;
  icon: string;
  title: string;
  shortDescription: string;
  description: string;
  features: string[];
  imageUrl: string;
  priceRange?: string;
  order?: number;
  active?: boolean;
}

export interface QuoteForm {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate?: string;
  guestCount?: number;
  message: string;
}

export interface BookingForm {
  fullName: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: Date;
  eventLocation: string;
  guestCount: number;
  budgetRange: string;
  additionalNotes: string;
  agreeToTerms: boolean;
}
