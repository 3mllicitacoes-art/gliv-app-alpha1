'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Tipos de dados do quiz
interface QuizData {
  diabetesType: '1' | '2' | 'pre' | null;
  medications: {
    ozempic: boolean;
    ozempicDose?: string;
    mounjaro: boolean;
    mounjaroDose?: string;
    insulin: boolean;
    insulinType?: 'nph' | 'regular' | 'both';
    metformin: boolean;
  };
  fullName: string;
  preferredName: string;
  ageRange: string;
  weight: string;
  height: string;
  workRoutine: string;
  physicalActivity: string;
  goals: string[];
  vision3Months: string;
  weightGoal: {
    type: 'lose' | 'maintain' | 'improve';
    amount?: string;
  };
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const totalSteps = 10;

  const [quizData, setQuizData] = useState<QuizData>({
    diabetesType: null,
    medications: {
      ozempic: false,
      mounjaro: false,
      insulin: false,
      metformin: false,
    },
    fullName: '',
    preferredName: '',
    ageRange: '',
    weight: '',
    height: '',
    workRoutine: '',
    physicalActivity: '',
    goals: [],
    vision3Months: '',
    weightGoal: {
      type: 'maintain',
    },
  });

  // Verificar autenticação ao carregar a página
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao verificar sessão:', error);
          router.push('/auth/login');
          return;
        }

        if (!session) {
          console.log('Nenhuma sessão encontrada, redirecionando para login');
          router.push('/auth/login');
          return;
        }

        setUserId(session.user.id);
        console.log('Usuário autenticado:', session.user.id);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router]);

  const updateQuizData = (field: string, value: any) => {
    setQuizData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!userId) {
      alert('Erro: Usuário não autenticado. Por favor, faça login novamente.');
      router.push('/auth/login');
      return;
    }

    setLoading(true);
    try {
      // Salvar perfil do usuário
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          diabetes_type: quizData.diabetesType,
          full_name: quizData.fullName,
          preferred_name: quizData.preferredName,
          age_range: quizData.ageRange,
          weight: parseFloat(quizData.weight),
          height: parseFloat(quizData.height),
          work_routine: quizData.workRoutine,
          physical_activity: quizData.physicalActivity,
          goals: quizData.goals,
          vision_3_months: quizData.vision3Months,
          weight_goal_type: quizData.weightGoal.type,
          weight_goal_amount: quizData.weightGoal.amount ? parseFloat(quizData.weightGoal.amount) : null,
          medications: quizData.medications,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('Erro ao salvar perfil:', profileError);
        throw profileError;
      }

      console.log('Perfil salvo com sucesso!');
      
      // Redirecionar para o dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      alert('Erro ao salvar seus dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const progress = (step / totalSteps) * 100;

  // Mostrar loading enquanto verifica autenticação
  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-violet-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header com progresso */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Vamos criar seu plano personalizado
            </h1>
            <span className="text-sm text-gray-600">
              Passo {step} de {totalSteps}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Card com conteúdo do step */}
        <Card className="p-8 shadow-2xl bg-white/80 backdrop-blur-sm">
          {/* Step 1: Tipo de Diabetes */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Qual seu tipo de diabetes?
                </h2>
                <p className="text-gray-600">
                  Esta informação é fundamental para criar seu plano personalizado
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {[
                  { value: '1', label: 'Diabetes Tipo 1', desc: 'Necessita de insulina diariamente' },
                  { value: '2', label: 'Diabetes Tipo 2', desc: 'Pode ser controlada com medicação e dieta' },
                  { value: 'pre', label: 'Pré-diabético(a)', desc: 'Níveis elevados de glicose, mas ainda não é diabetes' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateQuizData('diabetesType', option.value)}
                    className={`p-6 rounded-2xl border-2 transition-all text-left ${
                      quizData.diabetesType === option.value
                        ? 'border-violet-500 bg-violet-50 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/50'
                    }`}
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{option.label}</h3>
                    <p className="text-gray-600 text-sm">{option.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Medicações */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Você toma alguma medicação?
                </h2>
                <p className="text-gray-600">
                  Selecione todas que se aplicam
                </p>
              </div>

              <div className="space-y-4">
                {/* Ozempic */}
                <div className="p-6 rounded-2xl border-2 border-gray-200">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quizData.medications.ozempic}
                      onChange={(e) =>
                        updateQuizData('medications', {
                          ...quizData.medications,
                          ozempic: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-violet-600 rounded"
                    />
                    <span className="text-lg font-semibold text-gray-900">Ozempic</span>
                  </label>
                  {quizData.medications.ozempic && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dosagem (mg):
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 0.5mg, 1mg"
                        value={quizData.medications.ozempicDose || ''}
                        onChange={(e) =>
                          updateQuizData('medications', {
                            ...quizData.medications,
                            ozempicDose: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>

                {/* Mounjaro */}
                <div className="p-6 rounded-2xl border-2 border-gray-200">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quizData.medications.mounjaro}
                      onChange={(e) =>
                        updateQuizData('medications', {
                          ...quizData.medications,
                          mounjaro: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-violet-600 rounded"
                    />
                    <span className="text-lg font-semibold text-gray-900">Mounjaro</span>
                  </label>
                  {quizData.medications.mounjaro && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dosagem (mg):
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 2.5mg, 5mg"
                        value={quizData.medications.mounjaroDose || ''}
                        onChange={(e) =>
                          updateQuizData('medications', {
                            ...quizData.medications,
                            mounjaroDose: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>

                {/* Insulina */}
                <div className="p-6 rounded-2xl border-2 border-gray-200">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quizData.medications.insulin}
                      onChange={(e) =>
                        updateQuizData('medications', {
                          ...quizData.medications,
                          insulin: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-violet-600 rounded"
                    />
                    <span className="text-lg font-semibold text-gray-900">Insulina</span>
                  </label>
                  {quizData.medications.insulin && (
                    <div className="mt-4 space-y-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de insulina:
                      </label>
                      <div className="space-y-2">
                        {['nph', 'regular', 'both'].map((type) => (
                          <label key={type} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="insulinType"
                              value={type}
                              checked={quizData.medications.insulinType === type}
                              onChange={(e) =>
                                updateQuizData('medications', {
                                  ...quizData.medications,
                                  insulinType: e.target.value as 'nph' | 'regular' | 'both',
                                })
                              }
                              className="w-4 h-4 text-violet-600"
                            />
                            <span className="text-gray-700">
                              {type === 'nph' ? 'NPH' : type === 'regular' ? 'Regular' : 'Ambas'}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Metformina */}
                <div className="p-6 rounded-2xl border-2 border-gray-200">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quizData.medications.metformin}
                      onChange={(e) =>
                        updateQuizData('medications', {
                          ...quizData.medications,
                          metformin: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-violet-600 rounded"
                    />
                    <span className="text-lg font-semibold text-gray-900">
                      Metformina (Glifage e similares)
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Nome Completo */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Qual é o seu nome completo?
                </h2>
                <p className="text-gray-600">
                  Queremos conhecer você melhor
                </p>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Digite seu nome completo"
                  value={quizData.fullName}
                  onChange={(e) => updateQuizData('fullName', e.target.value)}
                  className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Step 4: Nome Preferido */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Como gostaria de ser chamado(a)?
                </h2>
                <p className="text-gray-600">
                  Pode ser um apelido ou como prefere
                </p>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Digite como prefere ser chamado"
                  value={quizData.preferredName}
                  onChange={(e) => updateQuizData('preferredName', e.target.value)}
                  className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Step 5: Faixa de Idade */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Qual sua faixa de idade?
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {['18-25', '26-35', '36-45', '46-55', '56-65', '65+'].map((range) => (
                  <button
                    key={range}
                    onClick={() => updateQuizData('ageRange', range)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      quizData.ageRange === range
                        ? 'border-violet-500 bg-violet-50 shadow-lg'
                        : 'border-gray-200 hover:border-violet-300'
                    }`}
                  >
                    <span className="text-lg font-semibold text-gray-900">{range} anos</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: Peso e Altura */}
          {step === 6 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Qual seu peso e altura?
                </h2>
                <p className="text-gray-600">
                  Essas informações nos ajudam a personalizar seu plano
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    placeholder="Ex: 70"
                    value={quizData.weight}
                    onChange={(e) => updateQuizData('weight', e.target.value)}
                    className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    placeholder="Ex: 170"
                    value={quizData.height}
                    onChange={(e) => updateQuizData('height', e.target.value)}
                    className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Rotina de Trabalho */}
          {step === 7 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Como é sua rotina de trabalho?
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {[
                  { value: 'sentado', label: 'Sentado', desc: 'Trabalho de escritório, home office' },
                  { value: 'em-pe', label: 'Em pé', desc: 'Vendedor, professor, atendente' },
                  { value: 'ativo', label: 'Ativo', desc: 'Movimento constante durante o dia' },
                  { value: 'sedentario', label: 'Sedentário', desc: 'Pouca movimentação' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateQuizData('workRoutine', option.value)}
                    className={`p-6 rounded-2xl border-2 transition-all text-left ${
                      quizData.workRoutine === option.value
                        ? 'border-violet-500 bg-violet-50 shadow-lg'
                        : 'border-gray-200 hover:border-violet-300'
                    }`}
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{option.label}</h3>
                    <p className="text-gray-600 text-sm">{option.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 8: Atividade Física */}
          {step === 8 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Qual seu nível de atividade física?
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {[
                  { value: 'sedentario', label: 'Sedentário', desc: 'Pouco ou nenhum exercício' },
                  { value: 'ativo', label: 'Ativo', desc: '3-4 vezes por semana' },
                  { value: 'super-ativo', label: 'Super Ativo', desc: '5+ vezes por semana' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateQuizData('physicalActivity', option.value)}
                    className={`p-6 rounded-2xl border-2 transition-all text-left ${
                      quizData.physicalActivity === option.value
                        ? 'border-violet-500 bg-violet-50 shadow-lg'
                        : 'border-gray-200 hover:border-violet-300'
                    }`}
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{option.label}</h3>
                    <p className="text-gray-600 text-sm">{option.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 9: Objetivos */}
          {step === 9 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Quais são seus principais objetivos?
                </h2>
                <p className="text-gray-600">
                  Selecione todos que se aplicam
                </p>
              </div>

              <div className="space-y-3">
                {[
                  'Controlar minha glicemia',
                  'Perder peso de forma saudável',
                  'Melhorar minha alimentação',
                  'Ter mais energia no dia a dia',
                  'Reduzir medicação (com orientação médica)',
                  'Prevenir complicações da diabetes',
                  'Aprender a fazer escolhas alimentares melhores',
                  'Manter peso ideal',
                ].map((goal) => (
                  <label
                    key={goal}
                    className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-violet-300 cursor-pointer transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={quizData.goals.includes(goal)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateQuizData('goals', [...quizData.goals, goal]);
                        } else {
                          updateQuizData(
                            'goals',
                            quizData.goals.filter((g) => g !== goal)
                          );
                        }
                      }}
                      className="w-5 h-5 text-violet-600 rounded"
                    />
                    <span className="text-gray-900">{goal}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 10: Visão 3 Meses e Meta de Peso */}
          {step === 10 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Como você se vê daqui a 3 meses?
                </h2>
              </div>

              <div>
                <textarea
                  placeholder="Descreva como você gostaria de estar daqui a 3 meses..."
                  value={quizData.vision3Months}
                  onChange={(e) => updateQuizData('vision3Months', e.target.value)}
                  rows={4}
                  className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Qual sua meta em relação ao peso?
                </h3>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-violet-300 cursor-pointer transition-all">
                    <input
                      type="radio"
                      name="weightGoalType"
                      value="lose"
                      checked={quizData.weightGoal.type === 'lose'}
                      onChange={(e) =>
                        updateQuizData('weightGoal', {
                          ...quizData.weightGoal,
                          type: e.target.value as 'lose',
                        })
                      }
                      className="w-5 h-5 text-violet-600"
                    />
                    <span className="text-gray-900 font-medium">Perder peso</span>
                  </label>

                  {quizData.weightGoal.type === 'lose' && (
                    <div className="ml-8">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantos quilos você gostaria de perder?
                      </label>
                      <input
                        type="number"
                        placeholder="Ex: 5"
                        value={quizData.weightGoal.amount || ''}
                        onChange={(e) =>
                          updateQuizData('weightGoal', {
                            ...quizData.weightGoal,
                            amount: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-violet-300 cursor-pointer transition-all">
                    <input
                      type="radio"
                      name="weightGoalType"
                      value="maintain"
                      checked={quizData.weightGoal.type === 'maintain'}
                      onChange={(e) =>
                        updateQuizData('weightGoal', {
                          type: e.target.value as 'maintain',
                        })
                      }
                      className="w-5 h-5 text-violet-600"
                    />
                    <span className="text-gray-900 font-medium">
                      Manter o peso e melhorar a qualidade de vida
                    </span>
                  </label>

                  <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-violet-300 cursor-pointer transition-all">
                    <input
                      type="radio"
                      name="weightGoalType"
                      value="improve"
                      checked={quizData.weightGoal.type === 'improve'}
                      onChange={(e) =>
                        updateQuizData('weightGoal', {
                          type: e.target.value as 'improve',
                        })
                      }
                      className="w-5 h-5 text-violet-600"
                    />
                    <span className="text-gray-900 font-medium">
                      Melhorar a alimentação (foco na saúde)
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Botões de navegação */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            {step > 1 && (
              <Button
                onClick={prevStep}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
            )}

            {step < totalSteps ? (
              <Button
                onClick={nextStep}
                className="ml-auto bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white flex items-center gap-2"
                disabled={
                  (step === 1 && !quizData.diabetesType) ||
                  (step === 3 && !quizData.fullName) ||
                  (step === 4 && !quizData.preferredName) ||
                  (step === 5 && !quizData.ageRange) ||
                  (step === 6 && (!quizData.weight || !quizData.height)) ||
                  (step === 7 && !quizData.workRoutine) ||
                  (step === 8 && !quizData.physicalActivity) ||
                  (step === 9 && quizData.goals.length === 0)
                }
              >
                Próximo
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || !quizData.vision3Months}
                className="ml-auto bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Criando seu plano...
                  </>
                ) : (
                  <>
                    Finalizar
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
