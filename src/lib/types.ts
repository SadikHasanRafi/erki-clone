export type MemeStatus = "draft" | "published";

export interface Meme {
  id: string;
  slug: string;
  title: string;
  description: string;
  author?: string;
  body?: string;
  category: string;
  tags: string[];
  imageUrl: string;
  status: MemeStatus;
  featured: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}
