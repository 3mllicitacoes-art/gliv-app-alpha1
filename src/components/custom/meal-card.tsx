'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { Meal } from '@/lib/types';

interface MealCardProps {
  meal: Meal;
}

const getMealTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    breakfast: 'Café da Manhã',
    lunch: 'Almoço',
    dinner: 'Jantar',
    snack: 'Lanche',
  };
  return labels[type] || type;
};

const getGlycemicImpact = (score: number) => {
  if (score >= 70) return { 
    label: 'Alto', 
    color: 'from-rose-500 to-red-600', 
    bgColor: 'from-rose-500/10 to-red-600/10',
    icon: TrendingUp, 
    textColor: 'text-rose-400' 
  };
  if (score >= 55) return { 
    label: 'Médio', 
    color: 'from-amber-500 to-orange-500', 
    bgColor: 'from-amber-500/10 to-orange-500/10',
    icon: Minus, 
    textColor: 'text-amber-400' 
  };
  return { 
    label: 'Baixo', 
    color: 'from-violet-500 to-purple-600', 
    bgColor: 'from-violet-500/10 to-purple-600/10',
    icon: TrendingDown, 
    textColor: 'text-violet-400' 
  };
};

export function MealCard({ meal }: MealCardProps) {
  // Usar analysis_result ou analysis (compatibilidade)
  const analysis = meal.analysis_result || meal.analysis;
  
  if (!analysis) {
    return null; // Não renderizar se não houver análise
  }

  // Obter meal_type do analysis_result se disponível
  const mealType = analysis.meal_type || meal.meal_type || 'meal';

  const glycemicImpact = getGlycemicImpact(analysis.glycemic_score || 0);
  const GlycemicIcon = glycemicImpact.icon;

  // Usar valores das colunas da tabela meals (total_calories, total_protein, etc.)
  // Se não existirem, usar os valores do analysis_result
  const totalCalories = meal.total_calories ?? analysis.total_calories ?? 0;
  const totalCarbs = meal.total_carbs ?? analysis.total_carbs ?? 0;
  const totalProtein = meal.total_protein ?? analysis.total_protein ?? 0;
  const totalFat = meal.total_fat ?? analysis.total_fat ?? 0;

  return (
    <Card className="overflow-hidden border-0 bg-[#1f1b2e]/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] rounded-3xl">
      {/* Imagem da refeição */}
      {meal.image_url && (
        <div className="relative h-48 w-full overflow-hidden bg-[#1a1625]">
          <img
            src={meal.image_url}
            alt={getMealTypeLabel(mealType)}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute top-3 right-3">
            <Badge className="bg-gradient-to-br from-violet-500 to-purple-600 text-white backdrop-blur-sm border-0 shadow-lg rounded-xl">
              {getMealTypeLabel(mealType)}
            </Badge>
          </div>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-base font-semibold text-white line-clamp-1">
              {analysis.foods && analysis.foods.length > 0 
                ? analysis.foods.map(f => f.name).join(', ')
                : 'Refeição'}
            </CardTitle>
            <CardDescription className="flex items-center gap-1 text-xs mt-1 text-gray-400">
              <Calendar className="w-3 h-3" />
              {new Date(meal.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Gráfico de Impacto Glicêmico */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">
              Impacto na Glicose
            </span>
            <div className="flex items-center gap-1.5">
              <GlycemicIcon className={`w-4 h-4 ${glycemicImpact.textColor}`} />
              <span className={`text-xs font-semibold ${glycemicImpact.textColor}`}>
                {glycemicImpact.label}
              </span>
            </div>
          </div>
          
          {/* Barra de progresso visual */}
          <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${glycemicImpact.color} transition-all duration-500 ease-out rounded-full shadow-lg`}
              style={{ width: `${Math.min(analysis.glycemic_score || 0, 100)}%` }}
            />
          </div>
          
          {/* Escala de referência */}
          <div className="flex justify-between text-[10px] text-gray-500">
            <span>0</span>
            <span className="text-violet-400">Baixo (0-54)</span>
            <span className="text-amber-400">Médio (55-69)</span>
            <span className="text-rose-400">Alto (70+)</span>
            <span>100</span>
          </div>
        </div>

        {/* Informações nutricionais */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
          <div className="space-y-1">
            <p className="text-xs text-gray-400">Calorias</p>
            <p className="text-sm font-semibold text-white">
              {totalCalories.toFixed(1)} kcal
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-400">Carboidratos</p>
            <p className="text-sm font-semibold text-white">
              {totalCarbs.toFixed(1)}g
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-400">Proteínas</p>
            <p className="text-sm font-semibold text-white">
              {totalProtein.toFixed(1)}g
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-400">Gorduras</p>
            <p className="text-sm font-semibold text-white">
              {totalFat.toFixed(1)}g
            </p>
          </div>
        </div>

        {/* Lista de alimentos */}
        {analysis.foods && analysis.foods.length > 0 && (
          <div className="pt-3 border-t border-white/10">
            <p className="text-xs font-medium text-gray-400 mb-2">
              Alimentos:
            </p>
            <ul className="space-y-1.5">
              {analysis.foods.map((food, idx) => (
                <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                  <span className="text-violet-400 mt-0.5">•</span>
                  <div className="flex-1">
                    <span className="font-medium">{food.name}</span>
                    <span className="text-gray-500"> - {food.quantity}</span>
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      {food.calories}kcal | C: {food.carbs}g | P: {food.protein}g | G: {food.fat}g
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recomendações */}
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <div className="pt-3 border-t border-white/10">
            <p className="text-xs font-medium text-gray-400 mb-2">
              Recomendações:
            </p>
            <ul className="space-y-1">
              {analysis.recommendations.slice(0, 2).map((rec, idx) => (
                <li key={idx} className="text-xs text-gray-400 flex items-start gap-1.5">
                  <span className="text-violet-400 mt-0.5">•</span>
                  <span className="flex-1">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
