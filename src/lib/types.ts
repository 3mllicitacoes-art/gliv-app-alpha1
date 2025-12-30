// Tipos do aplicativo GLIV

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface Meal {
  id: string;
  user_id: string;
  image_url: string;
  meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'manual';
  analysis_result?: MealAnalysis; // Nome correto da coluna no Supabase
  analysis?: MealAnalysis; // Alias para compatibilidade
  total_calories?: number;
  total_protein?: number;
  total_carbs?: number;
  total_fat?: number;
  created_at: string;
}

export interface MealAnalysis {
  foods: FoodItem[];
  total_calories: number;
  total_carbs: number;
  total_protein: number;
  total_fat: number;
  glycemic_impact?: 'low' | 'medium' | 'high';
  glycemic_score: number;
  recommendations?: string[];
}

export interface FoodItem {
  name: string;
  quantity?: string;
  estimated_weight?: number;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  glycemic_index?: number;
}

export interface DailyStats {
  date: string;
  total_calories: number;
  total_carbs: number;
  total_protein: number;
  total_fat: number;
  meals_count: number;
  avg_glycemic_impact: number;
}
