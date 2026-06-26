export interface Event {
  id: string;
  title: string;
  slug: string;
  category: EventCategory;
  description: string;
  shortDescription: string;
  date: Date;
  endDate?: Date;
  venue: string;
  location: string;
  city: string;
  country: string;
  attendeeCount: number;
  bannerImage: string;
  thumbnailImage: string;
  images: string[];
  videos: Video[];
  highlights: string[];
  sponsors: Sponsor[];
  testimonials: Testimonial[];
  isUpcoming: boolean;
  isFeatured: boolean;
  ticketUrl?: string;
  registrationUrl?: string;
  tags: string[];
}

export interface Video {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  duration: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  website?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  photo: string;
  eventName: string;
  rating: number;
  review: string;
  designation?: string;
}

export type EventCategory =
  | 'corporate'
  | 'wedding'
  | 'conference'
  | 'concert'
  | 'product-launch'
  | 'awards-night'
  | 'church-program'
  | 'private-event'
  | 'special-ceremony';

export interface EventFilter {
  year?: number;
  category?: EventCategory;
  location?: string;
  search?: string;
}
