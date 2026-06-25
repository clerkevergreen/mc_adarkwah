export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  category: string;
  author: string;
  date: Date;
  tags: string[];
  featured: boolean;
}
