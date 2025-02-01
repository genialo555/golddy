import { ContentType } from './content.types';

export interface InstagramPostLocation {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  address?: string;
  category?: string;
  website?: string;
  phone?: string;
}

export interface InstagramPostInsights {
  reach: number;
  engagement: number;
  impressions?: number;
  saves?: number;
  shares?: number;
}

export interface InstagramPost {
  id: string;
  caption?: string;
  mediaType: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  permalink: string;
  timestamp: string;
  likeCount: number;
  commentsCount: number;
  shares: number;
  saves: number;
  reach?: number;
  insights?: InstagramPostInsights;
  location?: InstagramPostLocation;
  isIGTV?: boolean;
  isReel?: boolean;
  type?: ContentType;
  createdAt: string;
} 