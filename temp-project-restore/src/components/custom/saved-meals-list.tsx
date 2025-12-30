'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Trash2, Loader2, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { MealAnalysis } from '@/lib/types';

interface SavedMeal {
  id: string;
  name: string;
  foods: Array<{
    name: string;
    quantity: string;
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
  }>;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  glycemic_score: number;
  created_at: string;
}

interface SavedMealsListProps {
  userId: string;
  onRepeatMeal: (analysis: MealAnalysis, imageUrl: string, mealType: string) => void;
}

export function SavedMealsList({ userId, onRepeatMeal }: SavedMealsListProps) {
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [repeating, setRepeating] = useState<string | null>(null);

  useEffect(() => {
    loadSavedMeals();
  }, [userId]);

  const loadSavedMeals = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('saved_meals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSavedMeals(data || []);
    } catch (error) {
      console.error('Erro ao carregar pratos salvos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRepeatMeal = async (meal: SavedMeal) => {
    setRepeating(meal.id);

    try {
      const analysis: MealAnalysis = {
        foods: meal.foods,
        total_calories: meal.total_calories,
        total_carbs: meal.total_carbs,
        total_protein: meal.total_protein,
        total_fat: meal.total_fat,
        glycemic_score: meal.glycemic_score,
        recommendations: generateRecommendations(meal.glycemic_score),
      };

      onRepeatMeal(analysis, '', 'manual');
    } catch (error) {
      console.error('Erro ao repetir prato:', error);
      alert('Erro ao repetir prato. Tente novamente.');
    } finally {
      setRepeating(null);
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (!confirm('Deseja realmente excluir este prato favorito?')) return;

    try {
      if (!supabase) return;

      const { error } = await supabase
        .from('saved_meals')
        .delete()
        .eq('id', mealId);

      if (error) throw error;

      setSavedMeals(savedMeals.filter(m => m.id !== mealId));
    } catch (error) {
      console.error('Erro ao excluir prato:', error);
      alert('Erro ao excluir prato. Tente novamente.');
    }
  };

  const generateRecommendations = (glycemicScore: number): string[] => {
    if (glycemicScore < 55) {
      return [
        'Excelente! Refeição com baixo impacto glicêmico.',
        'Continue priorizando alimentos integrais e proteínas.',
      ];
    } else if (glycemicScore < 70) {
      return [
        'Refeição com médio impacto glicêmico.',
        'Considere adicionar mais fibras e proteínas.',
      ];
    } else {
      return [
        'Alto impacto glicêmico! Consuma com moderação.',
        'Prefira carboidratos complexos e integrais.',
      ];
    }
  };

  if (loading) {
    return (
      <Card className="border-0 bg-[#1f1b2e]/80 backdrop-blur-sm shadow-xl rounded-3xl">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        </CardContent>
      </Card>
    );
  }

  if (savedMeals.length === 0) {
    return (
      <Card className="border-0 bg-[#1f1b2e]/80 backdrop-blur-sm shadow-xl rounded-3xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white">Pratos Favoritos</div>
              <div className="text-xs sm:text-sm font-normal text-gray-400 mt-1">
                Você ainda não tem pratos favoritos salvos
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">
            Ao adicionar alimentos manualmente, marque a opção "Salvar como prato favorito" para
            poder repetir rapidamente depois.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-[#1f1b2e]/80 backdrop-blur-sm shadow-xl rounded-3xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white">Pratos Favoritos</div>
            <div className="text-xs sm:text-sm font-normal text-gray-400 mt-1">
              Repita rapidamente suas refeições de rotina
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {savedMeals.map((meal) => (
          <div
            key={meal.id}
            className="p-4 rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-purple-600/10 hover:border-white/20 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-white">{meal.name}</h4>
                <p className="text-xs text-gray-400 mt-1">
                  {meal.foods.length} {meal.foods.length === 1 ? 'alimento' : 'alimentos'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteMeal(meal.id)}
                  className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-3">
              <div className="text-center p-2 rounded-xl bg-white/5">
                <p className="text-xs text-gray-400">Calorias</p>
                <p className="text-sm font-semibold text-white">
                  {meal.total_calories}
                </p>
              </div>
              <div className="text-center p-2 rounded-xl bg-white/5">
                <p className="text-xs text-gray-400">Carbs</p>
                <p className="text-sm font-semibold text-white">
                  {meal.total_carbs}g
                </p>
              </div>
              <div className="text-center p-2 rounded-xl bg-white/5">
                <p className="text-xs text-gray-400">Prot.</p>
                <p className="text-sm font-semibold text-white">
                  {meal.total_protein}g
                </p>
              </div>
              <div className="text-center p-2 rounded-xl bg-white/5">
                <p className="text-xs text-gray-400">Gord.</p>
                <p className="text-sm font-semibold text-white">
                  {meal.total_fat}g
                </p>
              </div>
            </div>

            <Button
              onClick={() => handleRepeatMeal(meal)}
              disabled={repeating === meal.id}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl font-semibold"
            >
              {repeating === meal.id ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Repetindo...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Repetir Prato
                </>
              )}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
