export type UserRole = "user" | "worker" | "admin";
export type WasteType = "recyclable" | "non_recyclable" | "organic";

export interface Profile {
  id: string;
  email: string;
  password_hash: string;
  full_name: string | null;
  role: UserRole;
  eco_points: number;
  created_at: Date;
  updated_at: Date;
}

export interface WasteStation {
  id: string;
  name: string;
  location: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
  waste_bins?: WasteBin[];
}

export interface WasteBin {
  id: string;
  station_id: string;
  station?: WasteStation;
  waste_type: WasteType;
  capacity_percentage: number;
  needs_attention: boolean;
  qr_code: string;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  points_cost: number;
  image_url: string | null;
  stock: number;
  category: string;
  is_available: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Transaction {
  id: string;
  user_id: string;
  user?: Profile;
  bin_id: string;
  bin?: WasteBin;
  points_earned: number;
  waste_type: WasteType;
  created_at: Date;
}

export interface Redemption {
  id: string;
  user_id: string;
  user?: Profile;
  product_id: string;
  product?: Product;
  points_spent: number;
  quantity: number;
  status: string;
  created_at: Date;
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  author_id: string | null;
  author?: Profile;
  published: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Quiz {
  id: string;
  title: string;
  description: string | null;
  points_reward: number;
  is_active: boolean;
  created_at: Date;
  quiz_questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  quiz?: Quiz;
  question: string;
  correct_answer: string;
  wrong_answer_1: string;
  wrong_answer_2: string;
  wrong_answer_3: string;
  order_index: number;
  created_at: Date;
}

export interface QuizCompletion {
  id: string;
  user_id: string;
  user?: Profile;
  quiz_id: string;
  quiz?: Quiz;
  score: number;
  points_earned: number;
  completed_at: Date;
}
