export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
  category: GalleryCategory;
  type: 'image' | 'video';
  videoUrl?: string;
  date: Date;
  featured: boolean;
  width?: number;
  height?: number;
}

export type GalleryCategory =
  | 'corporate-events'
  | 'weddings'
  | 'conferences'
  | 'concerts'
  | 'awards-nights'
  | 'church-programs'
  | 'all';
