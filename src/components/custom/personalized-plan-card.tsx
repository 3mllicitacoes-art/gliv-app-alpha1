'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Target, Clock, Utensils, TrendingUp, Droplet, Wheat, Drumstick, Beef, Croissant } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface PersonalizedPlan {
  id: string;
  user_id: string;
  plan_data: {
    greeting?: string;
    diabetes_analysis?: string;
    goals: string[];
    meal_schedule: Array<{ time: string; meal: string; recommendations: string[] }>;
    glycemic_targets: { min: number; max: number };
    weekly_goals: string[];
    daily_macros?: {
      water: number; // ml
      fiber: number; // g
      protein: number; // g
      fat: number; // g
      carbs: number; // g
    };
    nutrition_guidelines?: string[];
    exercise_plan?: string[];
    medication_reminders?: string[];
    motivational_message?: string;
  };
  created_at: string;
}

// Plano genérico com dados mock
const MOCK_PLAN: PersonalizedPlan = {
  id: 'mock-plan',
  user_id: 'demo',
  plan_data: {
    greeting: 'Olá! Este é seu plano personalizado de controle glicêmico.',
    diabetes_analysis: 'Plano genérico criado para demonstração. Complete o quiz para personalizar baseado no seu perfil.',
    goals: [
      'Manter glicemia entre 80-130 mg/dL em jejum',
      'Consumir refeições balanceadas a cada 3-4 horas',
      'Aumentar consumo de fibras e proteínas',
      'Reduzir carboidratos simples'
    ],
    meal_schedule: [
      {
        time: '07:00',
        meal: 'Café da Manhã',
        recommendations: ['Ovos mexidos com aveia e frutas vermelhas']
      },
      {
        time: '10:00',
        meal: 'Lanche da Manhã',
        recommendations: ['Castanhas e iogurte natural']
      },
      {
        time: '13:00',
        meal: 'Almoço',
        recommendations: ['Proteína magra, vegetais e carboidrato complexo']
      },
      {
        time: '16:00',
        meal: 'Lanche da Tarde',
        recommendations: ['Queijo branco com tomate cereja']
      },
      {
        time: '19:00',
        meal: 'Jantar',
        recommendations: ['Peixe grelhado com salada e legumes']
      }
    ],
    glycemic_targets: {
      min: 80,
      max: 130
    },
    weekly_goals: [
      'Registrar glicemia 3x ao dia',
      'Caminhar 30 minutos, 5x na semana',
      'Beber 2L de água diariamente',
      'Evitar alimentos ultraprocessados',
      'Dormir 7-8 horas por noite'
    ],
    daily_macros: {
      water: 2000,
      fiber: 30,
      protein: 80,
      fat: 60,
      carbs: 150
    },
    motivational_message: '🌟 Cada pequeno passo conta! Você está no caminho certo para uma vida mais saudável.'
  },
  created_at: new Date().toISOString()
};

export function PersonalizedPlanCard({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<PersonalizedPlan | null>(null);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Verificar se Supabase está configurado
      if (!supabase) {
        setPlan(MOCK_PLAN);
        setHasProfile(false);
        setLoading(false);
        return;
      }

      // Verificar se usuário tem perfil com peso salvo
      const { data: profileData, error: profileError } = await supabase
        .from('diabetes_user_profile')
        .select('peso_kg')
        .eq('user_id', userId)
        .maybeSingle();

      // Se tem peso salvo, esconde o banner
      if (profileData && profileData.peso_kg && !profileError) {
        setHasProfile(true);
        setLoading(false);
        return;
      }

      // Tentar carregar plano do banco
      const { data: planData, error: planError } = await supabase
        .from('personalized_plans_v2')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      // Se encontrou plano no banco, usa ele. Senão, usa mock
      if (planData && !planError) {
        setPlan(planData);
      } else {
        setPlan(MOCK_PLAN);
      }

      setHasProfile(false);
      setLoading(false);
    } catch (err) {
      // Em caso de erro, usa plano mock silenciosamente
      setPlan(MOCK_PLAN);
      setHasProfile(false);
      setLoading(false);
    }
  };

  // Estado de carregamento inicial
  if (loading) {
    return (
      <Card className="border-0 bg-gradient-to-br from-violet-500/10 to-purple-600/10 backdrop-blur-sm shadow-xl rounded-3xl">
        <CardContent className="py-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          <p className="text-sm text-gray-400">Carregando seu plano personalizado...</p>
        </CardContent>
      </Card>
    );
  }

  // Se usuário já tem perfil com peso, não exibe o banner
  if (hasProfile) {
    return null;
  }

  // Sempre exibe o plano (mock ou real)
  if (!plan) {
    setPlan(MOCK_PLAN);
  }

  // Exibir plano personalizado
  return (
    <Card className="border-0 bg-gradient-to-br from-violet-500/10 to-purple-600/10 backdrop-blur-sm shadow-xl rounded-3xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <CardHeader className="relative z-10">
        <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-white">Seu Plano Personalizado</div>
            <div className="text-xs sm:text-sm font-normal text-violet-400 mt-1">
              Metas diárias criadas especialmente para você
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 space-y-6">
        {/* Saudação e Análise */}
        {plan!.plan_data.greeting && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/30">
            <p className="text-white font-semibold mb-2">{plan!.plan_data.greeting}</p>
            {plan!.plan_data.diabetes_analysis && (
              <p className="text-sm text-gray-300">{plan!.plan_data.diabetes_analysis}</p>
            )}
          </div>
        )}

        {/* METAS DIÁRIAS DE MACRONUTRIENTES - DESTAQUE PRINCIPAL PREMIUM */}
        {plan!.plan_data.daily_macros && (
          <div className="relative p-6 rounded-3xl bg-gradient-to-br from-emerald-500/5 via-teal-600/5 to-emerald-500/5 border border-emerald-400/20 shadow-2xl overflow-hidden backdrop-blur-xl hover:shadow-emerald-500/20 hover:border-emerald-400/40 transition-all duration-500 group">
            {/* Efeito de brilho premium */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-400/10 rounded-full blur-3xl" />
            
            {/* Conteúdo */}
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Utensils className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-white text-lg tracking-tight">Metas Diárias de Consumo</h3>
                  <p className="text-xs text-emerald-300/80 font-medium">Nutrição otimizada para você</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {/* Água */}
                <div className="group/card relative p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-600/5 to-transparent backdrop-blur-md border border-blue-400/20 hover:border-blue-400/40 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500 hover:scale-[1.02] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/30 group-hover/card:scale-110 transition-transform duration-300">
                        <Droplet className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">Água</span>
                    </div>
                    <p className="text-3xl font-black text-white mb-1 bg-gradient-to-br from-white to-blue-100 bg-clip-text text-transparent">
                      {plan!.plan_data.daily_macros.water}
                    </p>
                    <span className="text-sm font-semibold text-blue-400/70">ml</span>
                  </div>
                </div>

                {/* Fibras */}
                <div className="group/card relative p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-transparent backdrop-blur-md border border-amber-400/20 hover:border-amber-400/40 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-500 hover:scale-[1.02] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30 group-hover/card:scale-110 transition-transform duration-300">
                        <Wheat className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Fibras</span>
                    </div>
                    <p className="text-3xl font-black text-white mb-1 bg-gradient-to-br from-white to-amber-100 bg-clip-text text-transparent">
                      {plan!.plan_data.daily_macros.fiber}
                    </p>
                    <span className="text-sm font-semibold text-amber-400/70">g</span>
                  </div>
                </div>

                {/* Proteínas */}
                <div className="group/card relative p-5 rounded-2xl bg-gradient-to-br from-red-500/10 via-red-600/5 to-transparent backdrop-blur-md border border-red-400/20 hover:border-red-400/40 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-500 hover:scale-[1.02] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-400/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-500/30 group-hover/card:scale-110 transition-transform duration-300">
                        <Drumstick className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-bold text-red-300 uppercase tracking-wider">Proteínas</span>
                    </div>
                    <p className="text-3xl font-black text-white mb-1 bg-gradient-to-br from-white to-red-100 bg-clip-text text-transparent">
                      {plan!.plan_data.daily_macros.protein}
                    </p>
                    <span className="text-sm font-semibold text-red-400/70">g</span>
                  </div>
                </div>

                {/* Gorduras */}
                <div className="group/card relative p-5 rounded-2xl bg-gradient-to-br from-yellow-500/10 via-yellow-600/5 to-transparent backdrop-blur-md border border-yellow-400/20 hover:border-yellow-400/40 hover:shadow-xl hover:shadow-yellow-500/10 transition-all duration-500 hover:scale-[1.02] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg shadow-yellow-500/30 group-hover/card:scale-110 transition-transform duration-300">
                        <Beef className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-bold text-yellow-300 uppercase tracking-wider">Gorduras</span>
                    </div>
                    <p className="text-3xl font-black text-white mb-1 bg-gradient-to-br from-white to-yellow-100 bg-clip-text text-transparent">
                      {plan!.plan_data.daily_macros.fat}
                    </p>
                    <span className="text-sm font-semibold text-yellow-400/70">g</span>
                  </div>
                </div>

                {/* Carboidratos */}
                <div className="group/card relative p-5 rounded-2xl bg-gradient-to-br from-orange-500/10 via-orange-600/5 to-transparent backdrop-blur-md border border-orange-400/20 hover:border-orange-400/40 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-500 hover:scale-[1.02] overflow-hidden sm:col-span-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/30 group-hover/card:scale-110 transition-transform duration-300">
                        <Croissant className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-bold text-orange-300 uppercase tracking-wider">Carboidratos</span>
                    </div>
                    <p className="text-3xl font-black text-white mb-1 bg-gradient-to-br from-white to-orange-100 bg-clip-text text-transparent">
                      {plan!.plan_data.daily_macros.carbs}
                    </p>
                    <span className="text-sm font-semibold text-orange-400/70">g</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-blue-300 leading-relaxed">
                <strong className="font-semibold">💡 Dica:</strong> Estas metas foram calculadas considerando um perfil padrão. 
                Complete o quiz para personalizar baseado no seu tipo de diabetes, peso, altura e objetivos!
              </p>
            </div>
          </div>
        )}

        {/* Metas Glicêmicas */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-violet-400" />
            <h3 className="font-semibold text-white">Metas Glicêmicas</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-xs text-gray-400">Mínimo</p>
              <p className="text-2xl font-bold text-violet-400">
                {plan!.plan_data.glycemic_targets.min} mg/dL
              </p>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400">Máximo</p>
              <p className="text-2xl font-bold text-violet-400">
                {plan!.plan_data.glycemic_targets.max} mg/dL
              </p>
            </div>
          </div>
        </div>

        {/* Horários de Refeição */}
        {plan!.plan_data.meal_schedule && plan!.plan_data.meal_schedule.length > 0 && (
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-violet-400" />
              <h3 className="font-semibold text-white">Horários Recomendados</h3>
            </div>
            <div className="space-y-3">
              {plan!.plan_data.meal_schedule.map((schedule, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="px-3 py-1 rounded-lg bg-violet-500/20 text-violet-300 font-semibold text-sm">
                    {schedule.time}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{schedule.meal}</p>
                    {schedule.recommendations && schedule.recommendations.length > 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        {schedule.recommendations[0]}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Objetivos Semanais */}
        {plan!.plan_data.weekly_goals && plan!.plan_data.weekly_goals.length > 0 && (
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-violet-400" />
              <h3 className="font-semibold text-white">Objetivos da Semana</h3>
            </div>
            <ul className="space-y-2">
              {plan!.plan_data.weekly_goals.map((goal, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-violet-400 mt-0.5">•</span>
                  {goal}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Mensagem Motivacional */}
        {plan!.plan_data.motivational_message && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-600/10 border border-emerald-500/20">
            <p className="text-sm text-gray-300 italic">
              {plan!.plan_data.motivational_message}
            </p>
          </div>
        )}

        {/* Botão para completar quiz */}
        <Button
          onClick={() => window.location.href = '/onboarding/quiz'}
          className="w-full bg-gradient-to-br from-violet-500 to-purple-600 hover:opacity-90 text-white shadow-lg rounded-xl"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Personalizar Meu Plano
        </Button>
      </CardContent>
    </Card>
  );
}
