export interface User {
  id: string;
  email: string;
  name: string;
  credits: number;
  subscription: 'free' | 'basic' | 'pro' | 'enterprise';
  createdAt: string;
}

export interface GenerationRequest {
  id: string;
  modelImage: string;
  garmentImage: string;
  category: 'tops' | 'bottoms' | 'full-body';
  seed?: number;
  samples: number;
  quality: 'performance' | 'balanced' | 'quality';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results?: string[];
  createdAt: string;
  userId: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  credits: number;
  features: string[];
  popular?: boolean;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
  userId: string;
}