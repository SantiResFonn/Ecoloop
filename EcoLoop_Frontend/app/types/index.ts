export type UserRole = "user" | "worker" | "admin";
export type WasteType = "recyclable" | "non_recyclable" | "organic";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  eco_points: number;
  created_at: string;
  updated_at: string;
}

export interface WasteStation {
  id: string;
  name: string;
  location: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  waste_bins?: WasteBin[];
}

export interface WasteBin {
  id: string;
  station_id: string;
  station?: WasteStation;
  waste_type: WasteType;
  capacity_percentage: number;
  current_weight?: number;
  needs_attention: boolean;
  qr_code: string;
  created_at: string;
  updated_at: string;
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
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  user?: Partial<Profile>;
  bin_id: string;
  bin?: Partial<WasteBin>;
  points_earned: number;
  waste_type: WasteType;
  created_at: string;
}

export interface Redemption {
  id: string;
  user_id: string;
  user?: Partial<Profile>;
  product_id: string;
  product?: Partial<Product>;
  points_spent: number;
  quantity: number;
  status: string;
  created_at: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  author_id: string | null;
  author?: Partial<Profile>;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string | null;
  points_reward: number;
  is_active: boolean;
  created_at: string;
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
  created_at: string;
}

export interface QuizCompletion {
  id: string;
  user_id: string;
  user?: Profile;
  quiz_id: string;
  quiz?: Quiz;
  score: number;
  points_earned: number;
  completed_at: string;
}
