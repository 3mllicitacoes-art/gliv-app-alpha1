'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Loader2, Sparkles, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { MealAnalysis } from '@/lib/types';

interface FoodItem {
  name: string;
  quantity: string;
}

interface ManualMealInputProps {
  onMealAdded: (analysis: MealAnalysis, imageUrl: string, mealType: string) => void;
  userId: string;
}

export function ManualMealInput({ onMealAdded, userId }: ManualMealInputProps) {
  const [foods, setFoods] = useState<FoodItem[]>([
    { name: '', quantity: '' }
  ]);
  const [mealName, setMealName] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);

  const addFood = () => {
    setFoods([...foods, { name: '', quantity: '' }]);
  };

  const removeFood = (index: number) => {
    setFoods(foods.filter((_, i) => i !== index));
  };

  const updateFood = (index: number, field: keyof FoodItem, value: string) => {
    const newFoods = [...foods];
    newFoods[index] = { ...newFoods[index], [field]: value };
    setFoods(newFoods);
  };

  const calculateNutritionWithAI = async (foods: FoodItem[]) => {
    try {
      // Chamar API da OpenAI para calcular macronutrientes
      const response = await fetch('/api/analyze-nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foods }),
      });

      if (!response.ok) {
        throw new Error('Erro ao analisar nutrição');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao calcular nutrição:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    // Validar se há pelo menos um alimento preenchido
    const validFoods = foods.filter(f => f.name && f.quantity);
    if (validFoods.length === 0) {
      alert('Adicione pelo menos um alimento');
      return;
    }

    setLoading(true);

    try {
      // Calcular nutrição com IA
      const nutritionData = await calculateNutritionWithAI(validFoods);

      const analysis: MealAnalysis = {
        foods: nutritionData.foods,
        total_calories: nutritionData.total_calories,
        total_carbs: nutritionData.total_carbs,
        total_protein: nutritionData.total_protein,
        total_fat: nutritionData.total_fat,
        glycemic_score: nutritionData.glycemic_score,
        recommendations: nutritionData.recommendations,
      };

      // Se marcou para salvar como template
      if (saveAsTemplate && mealName && supabase) {
        await supabase.from('saved_meals').insert({
          user_id: userId,
          name: mealName,
          foods: nutritionData.foods,
          total_calories: nutritionData.total_calories,
          total_protein: nutritionData.total_protein,
          total_carbs: nutritionData.total_carbs,
          total_fat: nutritionData.total_fat,
          glycemic_score: nutritionData.glycemic_score,
        });
      }

      // Adicionar refeição
      onMealAdded(analysis, '', 'manual');

      // Resetar formulário
      setFoods([{ name: '', quantity: '' }]);
      setMealName('');
      setSaveAsTemplate(false);
    } catch (error) {
      console.error('Erro ao adicionar refeição:', error);
      alert('Erro ao adicionar refeição. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 bg-[#1f1b2e]/80 backdrop-blur-sm shadow-xl rounded-3xl overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white">Adicionar Alimentos Manualmente</div>
            <div className="text-xs sm:text-sm font-normal text-gray-400 mt-1">
              Informe o que você comeu e a quantidade
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Nome da refeição (opcional) */}
        <div className="space-y-2">
          <Label htmlFor="meal-name" className="text-sm font-medium text-gray-300">
            Nome da Refeição (opcional)
          </Label>
          <Input
            id="meal-name"
            placeholder="Ex: Café da manhã favorito"
            value={mealName}
            onChange={(e) => setMealName(e.target.value)}
            className="bg-white/5 border-0 hover:bg-white/10 transition-colors text-white placeholder:text-gray-500 rounded-xl"
          />
        </div>

        {/* Lista de alimentos */}
        <div className="space-y-4">
          {foods.map((food, index) => (
            <div
              key={index}
              className="p-4 rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-purple-600/10 space-y-3 hover:border-white/20 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold shadow-md">
                    {index + 1}
                  </span>
                  Alimento
                </span>
                {foods.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFood(index)}
                    className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-400 font-medium">
                    O que você comeu?
                  </Label>
                  <Input
                    placeholder="Ex: Arroz integral, Frango grelhado"
                    value={food.name}
                    onChange={(e) => updateFood(index, 'name', e.target.value)}
                    className="bg-white/5 border-0 hover:bg-white/10 focus:bg-white/10 transition-colors text-white placeholder:text-gray-600 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-gray-400 font-medium">
                    Quanto você comeu?
                  </Label>
                  <Input
                    placeholder="Ex: 1 xícara, 200g, 2 unidades"
                    value={food.quantity}
                    onChange={(e) => updateFood(index, 'quantity', e.target.value)}
                    className="bg-white/5 border-0 hover:bg-white/10 focus:bg-white/10 transition-colors text-white placeholder:text-gray-600 rounded-xl"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Botão adicionar mais alimentos */}
        <Button
          variant="outline"
          onClick={addFood}
          className="w-full border-dashed border-2 border-white/20 hover:bg-violet-500/10 hover:border-violet-500/50 transition-all duration-200 text-gray-300 hover:text-white rounded-xl bg-transparent"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Outro Alimento
        </Button>

        {/* Info sobre IA */}
        <div className="flex items-start gap-3 p-3 rounded-2xl bg-gradient-to-r from-violet-500/10 to-purple-600/10 border border-violet-500/20">
          <Sparkles className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-300">
            Nossa IA analisará os alimentos e calculará automaticamente as calorias, carboidratos, proteínas, gorduras e o impacto glicêmico da sua refeição!
          </p>
        </div>

        {/* Checkbox para salvar como template */}
        <div className="flex items-center space-x-2 p-3 rounded-2xl bg-violet-500/10 border border-violet-500/20">
          <input
            type="checkbox"
            id="save-template"
            checked={saveAsTemplate}
            onChange={(e) => setSaveAsTemplate(e.target.checked)}
            className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500 bg-white/10 border-white/20"
          />
          <Label
            htmlFor="save-template"
            className="text-sm text-gray-300 cursor-pointer"
          >
            Salvar como prato favorito (para repetir depois)
          </Label>
        </div>

        {/* Botão de submissão */}
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl font-semibold"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analisando com IA...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Analisar e Adicionar Refeição
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
