'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@/lib/supabase';

interface FoodItem {
  name: string;
  quantity: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

interface MealAnalysis {
  foods: FoodItem[];
  total_calories: number;
  total_carbs: number;
  total_protein: number;
  total_fat: number;
  glycemic_score: number;
  recommendations: string[];
}

export default function ReviewMealPage() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const [mealType, setMealType] = useState<string>('lunch');
  const [editedFoods, setEditedFoods] = useState<FoodItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Recuperar dados do sessionStorage
    const storedImage = sessionStorage.getItem('mealReviewImage');
    const storedAnalysis = sessionStorage.getItem('mealReviewAnalysis');
    const storedMealType = sessionStorage.getItem('mealReviewType');

    if (!storedImage || !storedAnalysis) {
      router.push('/dashboard');
      return;
    }

    setImage(storedImage);
    setMealType(storedMealType || 'lunch');
    
    try {
      const parsedAnalysis = JSON.parse(storedAnalysis);
      setAnalysis(parsedAnalysis);
      setEditedFoods(parsedAnalysis.foods || []);
    } catch (err) {
      console.error('Erro ao parsear análise:', err);
      setError('Erro ao carregar dados da análise');
    }
  }, [router]);

  const handleFoodChange = (index: number, field: keyof FoodItem, value: string | number) => {
    const updated = [...editedFoods];
    updated[index] = { ...updated[index], [field]: value };
    setEditedFoods(updated);
  };

  const calculateTotals = () => {
    return editedFoods.reduce(
      (acc, food) => ({
        calories: acc.calories + Number(food.calories),
        carbs: acc.carbs + Number(food.carbs),
        protein: acc.protein + Number(food.protein),
        fat: acc.fat + Number(food.fat),
      }),
      { calories: 0, carbs: 0, protein: 0, fat: 0 }
    );
  };

  const handleConfirm = async () => {
    if (!image || !analysis) return;

    setIsSaving(true);
    setError(null);

    try {
      const supabase = createClient();
      
      // Verificar autenticação
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }

      // Calcular totais atualizados
      const totals = calculateTotals();

      // Salvar no banco de dados (incluindo meal_type no analysis_result)
      const { error: insertError } = await supabase
        .from('meals')
        .insert({
          user_id: user.id,
          image_url: image,
          analysis_result: {
            foods: editedFoods,
            recommendations: analysis.recommendations,
            glycemic_score: analysis.glycemic_score,
            meal_type: mealType, // Incluir meal_type dentro do JSON
          },
          total_calories: totals.calories,
          total_protein: totals.protein,
          total_carbs: totals.carbs,
          total_fat: totals.fat,
        });

      if (insertError) {
        console.error('Erro ao salvar refeição:', insertError);
        throw new Error('Erro ao salvar refeição no banco de dados');
      }

      // Limpar sessionStorage
      sessionStorage.removeItem('mealReviewImage');
      sessionStorage.removeItem('mealReviewAnalysis');
      sessionStorage.removeItem('mealReviewType');

      // Redirecionar para o dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Erro ao confirmar refeição:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao salvar refeição';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (!image || !analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0c1d] via-[#1a1530] to-[#0f0c1d] flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c1d] via-[#1a1530] to-[#0f0c1d] p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-white hover:bg-white/10 rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Revisão da Refeição</h1>
            <p className="text-sm text-gray-400 mt-1">Revise e edite os dados antes de salvar</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="border-0 bg-rose-500/10 backdrop-blur-sm rounded-2xl">
            <AlertCircle className="h-4 w-4 text-rose-400" />
            <AlertDescription className="text-rose-300">{error}</AlertDescription>
          </Alert>
        )}

        {/* Imagem da Refeição */}
        <Card className="border-0 bg-[#1f1b2e]/80 backdrop-blur-sm shadow-xl rounded-3xl overflow-hidden">
          <CardContent className="p-0">
            <div className="relative w-full h-64 sm:h-96">
              <img 
                src={image} 
                alt="Refeição" 
                className="w-full h-full object-cover"
              />
            </div>
          </CardContent>
        </Card>

        {/* Alimentos Detectados */}
        <Card className="border-0 bg-[#1f1b2e]/80 backdrop-blur-sm shadow-xl rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl text-white">Alimentos Detectados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {editedFoods.map((food, index) => (
              <div key={index} className="space-y-3 p-4 bg-white/5 rounded-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-300">Nome do Alimento</Label>
                    <Input
                      value={food.name}
                      onChange={(e) => handleFoodChange(index, 'name', e.target.value)}
                      className="border-0 bg-white/5 text-white rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-300">Quantidade</Label>
                    <Input
                      value={food.quantity}
                      onChange={(e) => handleFoodChange(index, 'quantity', e.target.value)}
                      className="border-0 bg-white/5 text-white rounded-xl"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-300">Calorias</Label>
                    <Input
                      type="number"
                      value={food.calories}
                      onChange={(e) => handleFoodChange(index, 'calories', Number(e.target.value))}
                      className="border-0 bg-white/5 text-white rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-300">Carbs (g)</Label>
                    <Input
                      type="number"
                      value={food.carbs}
                      onChange={(e) => handleFoodChange(index, 'carbs', Number(e.target.value))}
                      className="border-0 bg-white/5 text-white rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-300">Proteína (g)</Label>
                    <Input
                      type="number"
                      value={food.protein}
                      onChange={(e) => handleFoodChange(index, 'protein', Number(e.target.value))}
                      className="border-0 bg-white/5 text-white rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-300">Gordura (g)</Label>
                    <Input
                      type="number"
                      value={food.fat}
                      onChange={(e) => handleFoodChange(index, 'fat', Number(e.target.value))}
                      className="border-0 bg-white/5 text-white rounded-xl"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Totais */}
        <Card className="border-0 bg-gradient-to-br from-violet-500/20 to-purple-600/20 backdrop-blur-sm shadow-xl rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl text-white">Totais Nutricionais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white/5 rounded-2xl">
                <div className="text-2xl font-bold text-white">{totals.calories.toFixed(1)}</div>
                <div className="text-sm text-gray-400 mt-1">Calorias</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-2xl">
                <div className="text-2xl font-bold text-white">{totals.carbs.toFixed(1)}g</div>
                <div className="text-sm text-gray-400 mt-1">Carboidratos</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-2xl">
                <div className="text-2xl font-bold text-white">{totals.protein.toFixed(1)}g</div>
                <div className="text-sm text-gray-400 mt-1">Proteínas</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-2xl">
                <div className="text-2xl font-bold text-white">{totals.fat.toFixed(1)}g</div>
                <div className="text-sm text-gray-400 mt-1">Gorduras</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botão Confirmar */}
        <Button
          onClick={handleConfirm}
          disabled={isSaving}
          className="w-full bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg rounded-xl font-semibold py-6 text-lg"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Check className="w-5 h-5 mr-2" />
              Confirmar e Salvar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
