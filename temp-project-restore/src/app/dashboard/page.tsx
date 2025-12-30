'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, signOut } from '@/lib/supabase';
import { MealAnalyzer } from '@/components/custom/meal-analyzer';
import { MealCard } from '@/components/custom/meal-card';
import { NutritionChart } from '@/components/custom/nutrition-chart';
import { ManualMealInput } from '@/components/custom/manual-meal-input';
import { SavedMealsList } from '@/components/custom/saved-meals-list';
import { PersonalizedPlanCard } from '@/components/custom/personalized-plan-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, TrendingUp, Flame, Apple, LogOut, Loader2, Droplet, AlertTriangle, Heart, Utensils, Clock, X, TrendingDown, Calendar, Image, FileText, Star, UserCircle } from 'lucide-react';
import type { Meal, MealAnalysis, DailyStats } from '@/lib/types';

// Função helper para normalizar dados de refeições
const normalizeMeal = (meal: any): Meal => {
  // Se analysis_result existe, usa ele; senão, usa analysis
  const analysis = meal.analysis_result || meal.analysis;
  
  return {
    ...meal,
    analysis: analysis,
    analysis_result: analysis
  };
};

// Logo GLIV definitiva - Efeito líquido moderno
const GlivLogo = () => (
  <div className="relative">
    <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-12 sm:h-12">
      {/* Gota principal com gradiente */}
      <defs>
        <linearGradient id="dropGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Gota principal */}
      <path
        d="M24 8 C18 16, 14 22, 14 28 C14 34.627, 18.373 40, 24 40 C29.627 40, 34 34.627, 34 28 C34 22, 30 16, 24 8 Z"
        fill="url(#dropGradient)"
        filter="url(#glow)"
        className="animate-pulse"
      />
      
      {/* Brilho interno */}
      <ellipse
        cx="21"
        cy="22"
        rx="4"
        ry="6"
        fill="white"
        opacity="0.3"
      />
      
      {/* Gotas pequenas caindo */}
      <circle cx="24" cy="6" r="2" fill="#8B5CF6" opacity="0.6" className="animate-bounce" style={{ animationDelay: '0s', animationDuration: '2s' }} />
      <circle cx="20" cy="4" r="1.5" fill="#7C3AED" opacity="0.4" className="animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '2.2s' }} />
      <circle cx="28" cy="5" r="1.5" fill="#7C3AED" opacity="0.4" className="animate-bounce" style={{ animationDelay: '0.6s', animationDuration: '1.8s' }} />
    </svg>
  </div>
);

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [todayStats, setTodayStats] = useState({
    calories: 0,
    carbs: 0,
    protein: 0,
    fat: 0,
    avgGlycemicScore: 0,
    mealsCount: 0,
  });
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [activeTab, setActiveTab] = useState('progress');

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      if (!supabase) {
        router.push('/auth/login');
        return;
      }

      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        router.push('/auth/login');
        return;
      }

      setUser(user);
      await loadMeals(user.id);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
      router.push('/auth/login');
    }
  };

  const loadMeals = async (userId: string) => {
    try {
      if (!supabase) {
        setMeals([]);
        calculateStats([]);
        return;
      }

      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Erro ao carregar refeições:', error);
        setMeals([]);
        calculateStats([]);
        return;
      }

      const normalizedMeals = data ? data.map(normalizeMeal) : [];
      setMeals(normalizedMeals);
      calculateStats(normalizedMeals);
    } catch (error) {
      console.error('Erro ao carregar refeições:', error);
      setMeals([]);
      calculateStats([]);
    }
  };

  const calculateStats = (mealsData: Meal[]) => {
    const today = new Date().toDateString();
    const todayMeals = mealsData.filter(
      meal => new Date(meal.created_at).toDateString() === today
    );

    const todayTotals = todayMeals.reduce(
      (acc, meal) => {
        const analysis = meal.analysis || meal.analysis_result;
        if (!analysis) return acc;
        
        return {
          calories: acc.calories + (analysis.total_calories || 0),
          carbs: acc.carbs + (analysis.total_carbs || 0),
          protein: acc.protein + (analysis.total_protein || 0),
          fat: acc.fat + (analysis.total_fat || 0),
          avgGlycemicScore: acc.avgGlycemicScore + (analysis.glycemic_score || 0),
          mealsCount: acc.mealsCount + 1,
        };
      },
      { calories: 0, carbs: 0, protein: 0, fat: 0, avgGlycemicScore: 0, mealsCount: 0 }
    );

    // Calcular média do impacto glicêmico
    if (todayMeals.length > 0) {
      todayTotals.avgGlycemicScore = Math.round(todayTotals.avgGlycemicScore / todayMeals.length);
    }

    setTodayStats(todayTotals);

    // Calcular estatísticas dos últimos 7 dias
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const weeklyStats = last7Days.map(date => {
      const dayMeals = mealsData.filter(
        meal => meal.created_at.split('T')[0] === date
      );

      return {
        date,
        total_calories: dayMeals.reduce((sum, m) => {
          const analysis = m.analysis || m.analysis_result;
          return sum + (analysis?.total_calories || 0);
        }, 0),
        total_carbs: dayMeals.reduce((sum, m) => {
          const analysis = m.analysis || m.analysis_result;
          return sum + (analysis?.total_carbs || 0);
        }, 0),
        total_protein: dayMeals.reduce((sum, m) => {
          const analysis = m.analysis || m.analysis_result;
          return sum + (analysis?.total_protein || 0);
        }, 0),
        total_fat: dayMeals.reduce((sum, m) => {
          const analysis = m.analysis || m.analysis_result;
          return sum + (analysis?.total_fat || 0);
        }, 0),
        meals_count: dayMeals.length,
        avg_glycemic_impact: dayMeals.length > 0
          ? dayMeals.reduce((sum, m) => {
              const analysis = m.analysis || m.analysis_result;
              return sum + (analysis?.glycemic_score || 0);
            }, 0) / dayMeals.length
          : 0,
      };
    });

    setDailyStats(weeklyStats);
  };

  const handleAnalysisComplete = async (
    analysis: MealAnalysis,
    imageUrl: string,
    mealType: string
  ) => {
    if (!user || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('meals')
        .insert([
          {
            user_id: user.id,
            image_url: imageUrl,
            analysis_result: analysis,
            total_calories: analysis.total_calories,
            total_protein: analysis.total_protein,
            total_carbs: analysis.total_carbs,
            total_fat: analysis.total_fat,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      const normalizedMeal = normalizeMeal(data);
      setMeals([normalizedMeal, ...meals]);
      calculateStats([normalizedMeal, ...meals]);
    } catch (error) {
      console.error('Erro ao salvar refeição:', error);
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await signOut();
    }
    router.push('/auth/login');
  };

  // Função para rolar para o topo quando clicar em "Progresso"
  const handleProgressClick = () => {
    setActiveTab('progress');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Função para determinar a cor e status do impacto glicêmico
  const getGlycemicStatus = (score: number) => {
    if (score <= 55) {
      return {
        label: 'EXCELENTE',
        color: 'from-violet-500 to-purple-600',
        bgColor: 'from-violet-500/10 to-purple-600/10',
        textColor: 'text-violet-400',
        icon: '✓',
        message: 'Impacto glicêmico baixo - Continue assim!'
      };
    } else if (score <= 69) {
      return {
        label: 'MODERADO',
        color: 'from-amber-500 to-orange-500',
        bgColor: 'from-amber-500/10 to-orange-500/10',
        textColor: 'text-amber-400',
        icon: '!',
        message: 'Impacto glicêmico médio - Atenção!'
      };
    } else {
      return {
        label: 'ALTO',
        color: 'from-rose-500 to-red-600',
        bgColor: 'from-rose-500/10 to-red-600/10',
        textColor: 'text-rose-400',
        icon: '⚠',
        message: 'Impacto glicêmico alto - Cuidado!'
      };
    }
  };

  // Função para obter recomendações médicas baseadas no índice glicêmico
  const getGlycemicRecommendations = (score: number) => {
    if (score <= 55) {
      return {
        title: 'Controle Glicêmico Excelente',
        recommendations: [
          {
            icon: <Heart className="w-5 h-5" />,
            text: 'Mantenha este padrão alimentar. Sua glicemia está dentro da faixa ideal para prevenção de complicações metabólicas.'
          },
          {
            icon: <Utensils className="w-5 h-5" />,
            text: 'Continue priorizando alimentos de baixo índice glicêmico: vegetais não amiláceos, proteínas magras, gorduras saudáveis e grãos integrais.'
          },
          {
            icon: <Clock className="w-5 h-5" />,
            text: 'Mantenha regularidade nos horários das refeições para estabilizar ainda mais os níveis glicêmicos ao longo do dia.'
          }
        ]
      };
    } else if (score <= 69) {
      return {
        title: 'Atenção: Controle Glicêmico Moderado',
        recommendations: [
          {
            icon: <AlertTriangle className="w-5 h-5" />,
            text: 'Reduza o consumo de carboidratos refinados (pão branco, arroz branco, massas). Substitua por versões integrais com maior teor de fibras.'
          },
          {
            icon: <Utensils className="w-5 h-5" />,
            text: 'Aumente a ingestão de fibras solúveis (aveia, leguminosas, vegetais) que retardam a absorção de glicose e melhoram o controle glicêmico.'
          },
          {
            icon: <Activity className="w-5 h-5" />,
            text: 'Pratique atividade física leve após as refeições (caminhada de 15-20 minutos) para auxiliar na metabolização da glicose.'
          },
          {
            icon: <Clock className="w-5 h-5" />,
            text: 'Evite longos períodos de jejum. Faça pequenos lanches saudáveis entre as refeições principais para evitar picos glicêmicos compensatórios.'
          }
        ]
      };
    } else {
      return {
        title: 'Alerta: Controle Glicêmico Inadequado',
        recommendations: [
          {
            icon: <AlertTriangle className="w-5 h-5" />,
            text: 'URGENTE: Elimine imediatamente açúcares simples, refrigerantes, doces e alimentos ultraprocessados. Estes causam picos glicêmicos severos.'
          },
          {
            icon: <Utensils className="w-5 h-5" />,
            text: 'Priorize proteínas magras (frango, peixe, ovos), vegetais não amiláceos e gorduras saudáveis (azeite, abacate, oleaginosas) em todas as refeições.'
          },
          {
            icon: <Activity className="w-5 h-5" />,
            text: 'Implemente atividade física regular: mínimo 150 minutos/semana de exercício aeróbico moderado. Consulte seu médico antes de iniciar.'
          },
          {
            icon: <Heart className="w-5 h-5" />,
            text: 'Monitore sua glicemia capilar conforme orientação médica. Valores persistentemente elevados requerem ajuste medicamentoso.'
          },
          {
            icon: <Clock className="w-5 h-5" />,
            text: 'Agende consulta com endocrinologista e nutricionista para plano terapêutico individualizado. Controle inadequado aumenta risco cardiovascular.'
          }
        ]
      };
    }
  };

  // Função para calcular melhores horários de medição
  const getBestMeasurementTimes = () => {
    const today = new Date().toDateString();
    const todayMeals = meals.filter(
      meal => new Date(meal.created_at).toDateString() === today
    );

    if (todayMeals.length === 0) {
      return ['07:00 - 08:00', '12:00 - 13:00', '19:00 - 20:00'];
    }

    // Agrupar medições por hora
    const hourCounts: { [key: string]: number } = {};
    todayMeals.forEach(meal => {
      const hour = new Date(meal.created_at).getHours();
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
      hourCounts[timeSlot] = (hourCounts[timeSlot] || 0) + 1;
    });

    // Retornar os 3 horários mais frequentes
    return Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([time]) => time);
  };

  // Função para calcular impacto após cada medição
  const getMeasurementImpacts = () => {
    const today = new Date().toDateString();
    const todayMeals = meals.filter(
      meal => new Date(meal.created_at).toDateString() === today
    ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    return todayMeals.map((meal, index) => {
      const time = new Date(meal.created_at).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      const analysis = meal.analysis || meal.analysis_result;
      const impact = analysis?.glycemic_score || 0;
      const previousAnalysis = index > 0 ? (todayMeals[index - 1].analysis || todayMeals[index - 1].analysis_result) : null;
      const previousImpact = previousAnalysis?.glycemic_score || impact;
      const change = impact - previousImpact;

      return {
        time,
        impact,
        change: index === 0 ? 0 : change,
        mealType: meal.meal_type
      };
    });
  };

  const glycemicStatus = getGlycemicStatus(todayStats.avgGlycemicScore);
  const glycemicRecommendations = getGlycemicRecommendations(todayStats.avgGlycemicScore);
  const bestTimes = getBestMeasurementTimes();
  const measurementImpacts = getMeasurementImpacts();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black transition-colors duration-300 pb-20">
      {/* Header Moderno - Compacto em Mobile */}
      <header className="bg-gray-900/95 border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl shadow-2xl">
        <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4 group">
              <div className="transition-transform duration-300 group-hover:scale-110">
                <GlivLogo />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-violet-400 to-purple-600 bg-clip-text text-transparent">
                  GLIV
                </h1>
                <p className="text-[10px] sm:text-xs text-gray-400 hidden sm:block">
                  Olá, {user?.user_metadata?.name || 'Usuário'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/profile')}
                className="gap-1 sm:gap-2 hover:bg-white/5 text-gray-300 hover:text-white transition-all duration-200 rounded-xl text-xs sm:text-sm px-2 sm:px-3"
              >
                <UserCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Perfil</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-1 sm:gap-2 hover:bg-white/5 text-gray-300 hover:text-white transition-all duration-200 rounded-xl text-xs sm:text-sm px-2 sm:px-3"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Main Content - Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          {/* TabsList - Oculto, navegação via barra inferior */}
          <TabsList className="hidden">
            <TabsTrigger value="analyzer">Foto</TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
            <TabsTrigger value="saved">Favoritos</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="progress">Progresso</TabsTrigger>
          </TabsList>

          {/* ABA PROGRESSO - CONTEÚDO PRINCIPAL */}
          <TabsContent value="progress" className="space-y-4 sm:space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 mt-0">
            {/* PLANO PERSONALIZADO */}
            <PersonalizedPlanCard userId={user?.id || 'demo'} />

            {/* CARD PRINCIPAL DE GLICOSE - Compacto em Mobile */}
            <Card className={`border-0 bg-gradient-to-br ${glycemicStatus.bgColor} backdrop-blur-sm shadow-2xl overflow-hidden relative rounded-2xl sm:rounded-3xl`}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              <CardHeader className="pb-3 sm:pb-4 relative z-10 px-4 sm:px-6 pt-4 sm:pt-6">
                <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-2 sm:gap-0">
                  <CardTitle className="text-base sm:text-xl font-bold flex items-center gap-2 sm:gap-3">
                    <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br ${glycemicStatus.color} shadow-lg`}>
                      <Droplet className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-white text-sm sm:text-base">Impacto Glicêmico Hoje</div>
                      <div className={`text-[10px] sm:text-sm font-normal ${glycemicStatus.textColor} mt-0.5 sm:mt-1`}>
                        {glycemicStatus.message}
                      </div>
                    </div>
                  </CardTitle>
                  <div className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-gradient-to-br ${glycemicStatus.color} text-white font-bold text-xs sm:text-sm shadow-lg`}>
                    {glycemicStatus.label}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10 px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="flex items-end gap-3 sm:gap-4">
                  <div>
                    <p className={`text-5xl sm:text-7xl md:text-8xl font-black bg-gradient-to-br ${glycemicStatus.color} bg-clip-text text-transparent drop-shadow-lg`}>
                      {todayStats.avgGlycemicScore}
                    </p>
                    <p className="text-xs sm:text-base text-gray-400 mt-1 sm:mt-2 font-medium">
                      Índice Glicêmico Médio
                    </p>
                  </div>
                  <div className="flex-1 space-y-2 sm:space-y-3 mb-2 sm:mb-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex-1 h-2.5 sm:h-3 bg-white/10 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className={`h-full bg-gradient-to-r ${glycemicStatus.color} transition-all duration-1000 ease-out rounded-full shadow-lg`}
                          style={{ width: `${Math.min(todayStats.avgGlycemicScore, 100)}%` }}
                        />
                      </div>
                      <span className={`text-xl sm:text-2xl font-bold ${glycemicStatus.textColor}`}>
                        {glycemicStatus.icon}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center text-[10px] sm:text-xs">
                      <div className="space-y-0.5 sm:space-y-1">
                        <div className="font-semibold text-violet-400">0-55</div>
                        <div className="text-gray-500">Baixo</div>
                      </div>
                      <div className="space-y-0.5 sm:space-y-1">
                        <div className="font-semibold text-amber-400">56-69</div>
                        <div className="text-gray-500">Médio</div>
                      </div>
                      <div className="space-y-0.5 sm:space-y-1">
                        <div className="font-semibold text-rose-400">70+</div>
                        <div className="text-gray-500">Alto</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CARD DE RECOMENDAÇÕES MÉDICAS - Compacto */}
            <Card className="border-0 bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-2xl sm:rounded-3xl">
              <CardContent className="py-3 sm:py-4 px-4 sm:px-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-br ${glycemicStatus.color} shadow-lg flex-shrink-0`}>
                      <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-lg font-bold text-white truncate">
                        {glycemicRecommendations.title}
                      </h3>
                      <p className="text-[10px] sm:text-sm text-gray-400 truncate">
                        Orientações clínicas personalizadas
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowRecommendations(true)}
                    className={`bg-gradient-to-br ${glycemicStatus.color} hover:opacity-90 text-white shadow-lg rounded-lg sm:rounded-xl text-xs sm:text-sm px-3 sm:px-4 py-2 flex-shrink-0`}
                  >
                    Ver
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards - Grid Responsivo */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              <Card className="border-0 bg-gradient-to-br from-orange-500/10 to-orange-600/10 hover:from-orange-500/20 hover:to-orange-600/20 hover:scale-[1.02] transition-all duration-300 backdrop-blur-sm rounded-2xl sm:rounded-3xl">
                <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-[10px] sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 text-gray-400">
                    <div className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-orange-500/20">
                      <Apple className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" />
                    </div>
                    Carboidratos
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                  <p className="text-xl sm:text-3xl font-bold text-white">{todayStats.carbs.toFixed(1)}g</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">hoje</p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-violet-500/10 to-purple-600/10 hover:from-violet-500/20 hover:to-purple-600/20 hover:scale-[1.02] transition-all duration-300 backdrop-blur-sm rounded-2xl sm:rounded-3xl">
                <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-[10px] sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 text-gray-400">
                    <div className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-violet-500/20">
                      <Flame className="w-3 h-3 sm:w-4 sm:h-4 text-violet-400" />
                    </div>
                    Calorias
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                  <p className="text-xl sm:text-3xl font-bold text-white">{todayStats.calories}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">kcal hoje</p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 hover:from-blue-500/20 hover:to-indigo-600/20 hover:scale-[1.02] transition-all duration-300 backdrop-blur-sm rounded-2xl sm:rounded-3xl">
                <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-[10px] sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 text-gray-400">
                    <div className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-blue-500/20">
                      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                    </div>
                    Proteínas
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                  <p className="text-xl sm:text-3xl font-bold text-white">{todayStats.protein.toFixed(1)}g</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">hoje</p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-amber-500/10 to-yellow-600/10 hover:from-amber-500/20 hover:to-yellow-600/20 hover:scale-[1.02] transition-all duration-300 backdrop-blur-sm rounded-2xl sm:rounded-3xl">
                <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-[10px] sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 text-gray-400">
                    <div className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-amber-500/20">
                      <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" />
                    </div>
                    Gorduras
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                  <p className="text-xl sm:text-3xl font-bold text-white">{todayStats.fat.toFixed(1)}g</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">hoje</p>
                </CardContent>
              </Card>
            </div>

            {/* CARD PROGRESSO SEMANAL */}
            <Card className="border-0 bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden">
              <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-xl font-bold flex items-center gap-2 sm:gap-3">
                    <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white text-sm sm:text-base">Progresso Semanal</div>
                      <div className="text-[10px] sm:text-sm font-normal text-gray-400 mt-0.5 sm:mt-1">
                        Visualização da sua ingestão
                      </div>
                    </div>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <NutritionChart data={dailyStats} />
              </CardContent>
            </Card>

            {/* CARD DE REGISTRO DE MEDIÇÕES DIÁRIAS */}
            <Card className="border-0 bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-2xl sm:rounded-3xl">
              <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
                <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-2 sm:gap-0">
                  <CardTitle className="text-base sm:text-xl font-bold flex items-center gap-2 sm:gap-3">
                    <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white text-sm sm:text-base">Registro de Medições</div>
                      <div className="text-[10px] sm:text-sm font-normal text-gray-400 mt-0.5 sm:mt-1">
                        Acompanhe sua evolução
                      </div>
                    </div>
                  </CardTitle>
                  <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xl sm:text-2xl shadow-lg">
                    {todayStats.mealsCount}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">
                {/* Contador de Medições */}
                <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-600/10 border border-blue-500/20">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-400">Medições realizadas hoje</p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-400 mt-0.5 sm:mt-1">
                      {todayStats.mealsCount} {todayStats.mealsCount === 1 ? 'medição' : 'medições'}
                    </p>
                  </div>
                  <Activity className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500/30" />
                </div>

                {/* Melhores Horários */}
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-300 mb-2 sm:mb-3 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Melhores horários para medir
                  </h4>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {bestTimes.map((time, index) => (
                      <div
                        key={index}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white font-semibold text-xs sm:text-sm shadow-lg"
                      >
                        {time}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Impacto após cada medição */}
                {measurementImpacts.length > 0 && (
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-300 mb-2 sm:mb-3 flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Impacto glicêmico ao longo do dia
                    </h4>
                    <div className="space-y-2 sm:space-y-3">
                      {measurementImpacts.map((measurement, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white/5 border border-white/5"
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="text-xs sm:text-sm font-semibold text-gray-400">
                              {measurement.time}
                            </div>
                            <div className="text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg bg-blue-500/20 text-blue-300">
                              {measurement.mealType === 'breakfast' ? 'Café' : measurement.mealType === 'lunch' ? 'Almoço' : 'Jantar'}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="text-xl sm:text-2xl font-bold text-white">
                              {measurement.impact}
                            </div>
                            {measurement.change !== 0 && (
                              <div className={`flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm font-semibold ${
                                measurement.change > 0 
                                  ? 'text-rose-400' 
                                  : 'text-violet-400'
                              }`}>
                                {measurement.change > 0 ? (
                                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                                ) : (
                                  <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
                                )}
                                {Math.abs(measurement.change)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Gráfico de linha simplificado */}
                    <div className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex items-end justify-between h-24 sm:h-32 gap-1.5 sm:gap-2">
                        {measurementImpacts.map((measurement, index) => {
                          const maxImpact = Math.max(...measurementImpacts.map(m => m.impact));
                          const height = (measurement.impact / maxImpact) * 100;
                          const color = measurement.impact <= 55 
                            ? 'from-violet-500 to-purple-600' 
                            : measurement.impact <= 69 
                            ? 'from-amber-500 to-orange-500' 
                            : 'from-rose-500 to-red-600';
                          
                          return (
                            <div key={index} className="flex-1 flex flex-col items-center gap-1.5 sm:gap-2">
                              <div className="w-full flex items-end justify-center" style={{ height: '100%' }}>
                                <div 
                                  className={`w-full bg-gradient-to-t ${color} rounded-t-lg sm:rounded-t-xl transition-all duration-500 shadow-lg`}
                                  style={{ height: `${height}%` }}
                                />
                              </div>
                              <div className="text-[10px] sm:text-xs font-semibold text-gray-400">
                                {measurement.time.split(':')[0]}h
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {measurementImpacts.length === 0 && (
                  <div className="text-center py-6 sm:py-8 text-gray-500">
                    <p className="text-xs sm:text-sm">Nenhuma medição registrada hoje</p>
                    <p className="text-[10px] sm:text-xs mt-1">Comece registrando sua primeira refeição</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analyzer" className="space-y-4 sm:space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 mt-0">
            <MealAnalyzer onAnalysisComplete={handleAnalysisComplete} />
          </TabsContent>

          <TabsContent value="manual" className="space-y-4 sm:space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 mt-0">
            <ManualMealInput onMealAdded={handleAnalysisComplete} userId={user?.id || 'demo'} />
          </TabsContent>

          <TabsContent value="saved" className="space-y-4 sm:space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 mt-0">
            <SavedMealsList userId={user?.id || 'demo'} onRepeatMeal={handleAnalysisComplete} />
          </TabsContent>

          <TabsContent value="history" className="space-y-4 sm:space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 mt-0">
            {meals.length === 0 ? (
              <Card className="border-0 bg-gray-800/50 backdrop-blur-sm shadow-lg rounded-2xl sm:rounded-3xl">
                <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
                  <CardTitle className="text-white text-base sm:text-lg">Nenhuma refeição registrada</CardTitle>
                  <CardDescription className="text-gray-400 text-xs sm:text-sm">
                    Comece analisando sua primeira refeição na aba "Foto"
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {meals.map((meal) => (
                  <MealCard key={meal.id} meal={meal} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* POP-UP DE RECOMENDAÇÕES */}
      {showRecommendations && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in-0 duration-300"
          onClick={() => setShowRecommendations(false)}
        >
          <div 
            className="bg-gray-900 rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gray-900 border-b border-white/10 p-4 sm:p-6 flex items-center justify-between rounded-t-2xl sm:rounded-t-3xl">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-br ${glycemicStatus.color} shadow-lg`}>
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h3 className="text-base sm:text-xl font-bold text-white">
                  {glycemicRecommendations.title}
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowRecommendations(false)}
                className="hover:bg-white/5 text-gray-400 hover:text-white rounded-xl flex-shrink-0"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
            
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <p className="text-xs sm:text-sm text-gray-400">
                Orientações clínicas para otimização do controle glicêmico
              </p>
              
              {glycemicRecommendations.recommendations.map((rec, index) => (
                <div 
                  key={index}
                  className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300"
                >
                  <div className={`flex-shrink-0 p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br ${glycemicStatus.color} text-white shadow-sm`}>
                    {rec.icon}
                  </div>
                  <p className="text-xs sm:text-base text-gray-300 leading-relaxed">
                    {rec.text}
                  </p>
                </div>
              ))}
              
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-[10px] sm:text-sm text-blue-300 leading-relaxed">
                  <strong className="font-semibold">Nota Importante:</strong> Estas recomendações são orientações gerais baseadas em diretrizes clínicas. 
                  Consulte sempre seu médico endocrinologista para avaliação individualizada e ajuste terapêutico personalizado.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BARRA DE NAVEGAÇÃO FIXA NO RODAPÉ - Otimizada para Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-xl border-t border-white/10 shadow-2xl">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="grid grid-cols-5 h-16 sm:h-14">
            <button
              onClick={() => setActiveTab('analyzer')}
              className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-all duration-300 ${
                activeTab === 'analyzer'
                  ? 'text-violet-400'
                  : 'text-gray-500 hover:text-violet-400'
              }`}
            >
              <div className={`p-1.5 sm:p-1.5 rounded-xl transition-all duration-300 ${
                activeTab === 'analyzer'
                  ? 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg scale-110'
                  : 'bg-white/5'
              }`}>
                <Image className={`w-4 h-4 sm:w-4 sm:h-4 ${activeTab === 'analyzer' ? 'text-white' : ''}`} />
              </div>
              <span className="text-[9px] sm:text-[9px] font-semibold">Foto</span>
            </button>

            <button
              onClick={() => setActiveTab('manual')}
              className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-all duration-300 ${
                activeTab === 'manual'
                  ? 'text-violet-400'
                  : 'text-gray-500 hover:text-violet-400'
              }`}
            >
              <div className={`p-1.5 sm:p-1.5 rounded-xl transition-all duration-300 ${
                activeTab === 'manual'
                  ? 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg scale-110'
                  : 'bg-white/5'
              }`}>
                <FileText className={`w-4 h-4 sm:w-4 sm:h-4 ${activeTab === 'manual' ? 'text-white' : ''}`} />
              </div>
              <span className="text-[9px] sm:text-[9px] font-semibold">Manual</span>
            </button>

            <button
              onClick={() => setActiveTab('saved')}
              className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-all duration-300 ${
                activeTab === 'saved'
                  ? 'text-violet-400'
                  : 'text-gray-500 hover:text-violet-400'
              }`}
            >
              <div className={`p-1.5 sm:p-1.5 rounded-xl transition-all duration-300 ${
                activeTab === 'saved'
                  ? 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg scale-110'
                  : 'bg-white/5'
              }`}>
                <Star className={`w-4 h-4 sm:w-4 sm:h-4 ${activeTab === 'saved' ? 'text-white' : ''}`} />
              </div>
              <span className="text-[9px] sm:text-[9px] font-semibold">Favoritos</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-all duration-300 ${
                activeTab === 'history'
                  ? 'text-violet-400'
                  : 'text-gray-500 hover:text-violet-400'
              }`}
            >
              <div className={`p-1.5 sm:p-1.5 rounded-xl transition-all duration-300 ${
                activeTab === 'history'
                  ? 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg scale-110'
                  : 'bg-white/5'
              }`}>
                <Clock className={`w-4 h-4 sm:w-4 sm:h-4 ${activeTab === 'history' ? 'text-white' : ''}`} />
              </div>
              <span className="text-[9px] sm:text-[9px] font-semibold">Histórico</span>
            </button>

            <button
              onClick={handleProgressClick}
              className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-all duration-300 ${
                activeTab === 'progress'
                  ? 'text-violet-400'
                  : 'text-gray-500 hover:text-violet-400'
              }`}
            >
              <div className={`p-1.5 sm:p-1.5 rounded-xl transition-all duration-300 ${
                activeTab === 'progress'
                  ? 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg scale-110'
                  : 'bg-white/5'
              }`}>
                <TrendingUp className={`w-4 h-4 sm:w-4 sm:h-4 ${activeTab === 'progress' ? 'text-white' : ''}`} />
              </div>
              <span className="text-[9px] sm:text-[9px] font-semibold">Progresso</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
