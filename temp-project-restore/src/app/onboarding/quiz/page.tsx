'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowRight, 
  ArrowLeft, 
  Loader2, 
  Heart, 
  Activity, 
  User, 
  Target,
  Droplet,
  Pill,
  Utensils,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

interface QuizData {
  // Pergunta primordial
  diabetes_type: '1' | '2' | 'pre-diabetic' | '';
  
  // Medicações
  uses_ozempic_mounjaro: boolean;
  ozempic_mounjaro_dosage: string;
  uses_insulin: boolean;
  insulin_type: 'nph' | 'regular' | 'both' | '';
  uses_metformin: boolean;
  
  // Dados pessoais
  full_name: string;
  preferred_name: string;
  age_range: '18-25' | '26-35' | '36-45' | '46-55' | '56-65' | '65+' | '';
  weight: string;
  height: string;
  
  // Rotina
  work_routine: 'sedentary' | 'sitting' | 'standing' | 'active' | '';
  physical_activity: 'sedentary' | 'active' | 'very-active' | '';
  
  // Objetivos
  main_goals: string[];
  vision_3_months: string;
  weight_goal: 'lose' | 'maintain' | 'gain' | '';
  weight_loss_target: string;
  improve_nutrition: boolean;
}

const INITIAL_DATA: QuizData = {
  diabetes_type: '',
  uses_ozempic_mounjaro: false,
  ozempic_mounjaro_dosage: '',
  uses_insulin: false,
  insulin_type: '',
  uses_metformin: false,
  full_name: '',
  preferred_name: '',
  age_range: '',
  weight: '',
  height: '',
  work_routine: '',
  physical_activity: '',
  main_goals: [],
  vision_3_months: '',
  weight_goal: '',
  weight_loss_target: '',
  improve_nutrition: false,
};

const MAIN_GOALS_OPTIONS = [
  'Controlar glicemia',
  'Perder peso',
  'Ganhar massa muscular',
  'Melhorar alimentação',
  'Aumentar energia',
  'Reduzir medicação',
  'Prevenir complicações',
  'Melhorar qualidade de vida'
];

export default function QuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<QuizData>(INITIAL_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = 10; // Removido step de email/senha
  const progress = ((step + 1) / totalSteps) * 100;

  const updateData = (field: keyof QuizData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const toggleGoal = (goal: string) => {
    setData(prev => ({
      ...prev,
      main_goals: prev.main_goals.includes(goal)
        ? prev.main_goals.filter(g => g !== goal)
        : [...prev.main_goals, goal]
    }));
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!supabase) {
        throw new Error('Supabase não configurado');
      }

      console.log('🔍 Iniciando salvamento do quiz...');

      // PASSO 1: Obter usuário atual (já logado)
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('❌ Erro ao obter usuário:', userError);
        throw userError;
      }
      
      if (!user) {
        console.error('❌ Usuário não está logado');
        throw new Error('Usuário não está logado');
      }

      console.log('✅ Usuário obtido:', user.id);

      // PASSO 2: Calcular metas baseadas no peso
      const weight = parseFloat(data.weight);
      const waterGoal = data.uses_ozempic_mounjaro 
        ? Math.round((weight * 35) + 500)
        : Math.round(weight * 35);
      
      const calorieGoal = data.weight_goal === 'lose' 
        ? Math.round(weight * 22)
        : Math.round(weight * 30);
      
      const proteinGoal = Math.round(weight * 1.6);

      console.log('📊 Metas calculadas:', { waterGoal, calorieGoal, proteinGoal });

      // PASSO 3: Preparar dados para atualização (SEM as colunas de metas por enquanto)
      const updatePayload = {
        diabetes_type: data.diabetes_type === '1' ? 'tipo_1' : data.diabetes_type === '2' ? 'tipo_2' : 'pre_diabetico',
        usa_ozempic_mounjaro: data.uses_ozempic_mounjaro,
        dosagem_ozempic_mounjaro: data.ozempic_mounjaro_dosage || null,
        usa_insulina: data.uses_insulin,
        tipo_insulina: data.insulin_type || null,
        usa_glifagem: data.uses_metformin,
        nome_completo: data.full_name,
        nome_preferido: data.preferred_name,
        faixa_idade: data.age_range,
        peso_kg: weight,
        altura_cm: parseFloat(data.height),
        tipo_trabalho: data.work_routine,
        nivel_atividade_fisica: data.physical_activity,
        objetivos: data.main_goals,
        visao_3_meses: data.vision_3_months,
        meta_perder_peso: data.weight_goal === 'lose',
        meta_quilos_perder: data.weight_loss_target ? parseFloat(data.weight_loss_target) : null,
        meta_manter_peso: data.weight_goal === 'maintain',
        meta_melhorar_alimentacao: data.improve_nutrition,
      };

      console.log('📦 Payload preparado:', updatePayload);
      console.log('🎯 Atualizando perfil para user_id:', user.id);

      // PASSO 4: Atualizar perfil do usuário atual
      const { data: updateResult, error: updateError } = await supabase
        .from('diabetes_user_profile')
        .update(updatePayload)
        .eq('user_id', user.id)
        .select();

      if (updateError) {
        console.error('❌ Erro ao atualizar perfil:', updateError);
        console.error('Detalhes do erro:', JSON.stringify(updateError, null, 2));
        throw new Error(`Erro ao salvar: ${updateError.message}`);
      }

      console.log('✅ Perfil atualizado com sucesso:', updateResult);

      // PASSO 5: Tentar salvar as metas calculadas (se as colunas existirem)
      try {
        const { error: metasError } = await supabase
          .from('diabetes_user_profile')
          .update({
            meta_agua_ml: waterGoal,
            meta_calorias: calorieGoal,
            meta_proteina: proteinGoal,
          })
          .eq('user_id', user.id);

        if (metasError) {
          console.warn('⚠️ Não foi possível salvar as metas calculadas (colunas podem não existir ainda):', metasError.message);
          console.log('💡 As metas serão calculadas quando as colunas forem criadas no banco.');
        } else {
          console.log('✅ Metas calculadas salvas com sucesso!');
        }
      } catch (metasErr) {
        console.warn('⚠️ Erro ao tentar salvar metas:', metasErr);
      }

      // PASSO 6: Redirecionar para Dashboard
      console.log('🚀 Redirecionando para dashboard...');
      router.push('/dashboard');
    } catch (err) {
      console.error('💥 Erro ao salvar quiz:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar dados';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0: return data.diabetes_type !== '';
      case 1: return true; // Medicações são opcionais
      case 2: return data.full_name.trim() !== '';
      case 3: return data.preferred_name.trim() !== '';
      case 4: return data.age_range !== '';
      case 5: return data.weight !== '' && data.height !== '';
      case 6: return data.work_routine !== '' && data.physical_activity !== '';
      case 7: return data.main_goals.length > 0;
      case 8: return data.vision_3_months.trim() !== '';
      case 9: return data.weight_goal !== '';
      default: return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-3">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl flex items-center justify-center shadow-xl">
                <Droplet className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Qual seu tipo de diabetes?</h2>
              <p className="text-gray-400">Esta informação é fundamental para personalizar seu plano</p>
            </div>

            <RadioGroup value={data.diabetes_type} onValueChange={(v) => updateData('diabetes_type', v)}>
              <div className="space-y-3">
                {[
                  { value: '1', label: 'Diabetes Tipo 1', desc: 'Dependente de insulina' },
                  { value: '2', label: 'Diabetes Tipo 2', desc: 'Mais comum, relacionado ao estilo de vida' },
                  { value: 'pre-diabetic', label: 'Pré-diabético(a)', desc: 'Glicemia elevada, mas não diabético ainda' }
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                      data.diabetes_type === option.value
                        ? 'border-violet-500 bg-violet-500/10'
                        : 'border-white/10 bg-white/5 hover:border-violet-500/50'
                    }`}
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <div className="flex-1">
                      <div className="font-semibold text-white">{option.label}</div>
                      <div className="text-sm text-gray-400">{option.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </RadioGroup>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-3">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-xl">
                <Pill className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Medicações</h2>
              <p className="text-gray-400">Nos conte sobre suas medicações atuais</p>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl border-2 border-white/10 bg-white/5 space-y-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="ozempic"
                    checked={data.uses_ozempic_mounjaro}
                    onCheckedChange={(checked) => updateData('uses_ozempic_mounjaro', checked)}
                  />
                  <Label htmlFor="ozempic" className="text-white font-semibold cursor-pointer">
                    Uso Ozempic ou Mounjaro
                  </Label>
                </div>
                {data.uses_ozempic_mounjaro && (
                  <Input
                    placeholder="Dosagem (ex: 0.5mg, 1mg)"
                    value={data.ozempic_mounjaro_dosage}
                    onChange={(e) => updateData('ozempic_mounjaro_dosage', e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                )}
              </div>

              <div className="p-5 rounded-2xl border-2 border-white/10 bg-white/5 space-y-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="insulin"
                    checked={data.uses_insulin}
                    onCheckedChange={(checked) => updateData('uses_insulin', checked)}
                  />
                  <Label htmlFor="insulin" className="text-white font-semibold cursor-pointer">
                    Uso Insulina
                  </Label>
                </div>
                {data.uses_insulin && (
                  <RadioGroup value={data.insulin_type} onValueChange={(v) => updateData('insulin_type', v)}>
                    <div className="space-y-2 ml-6">
                      {[
                        { value: 'nph', label: 'NPH (Intermediária)' },
                        { value: 'regular', label: 'Regular (Rápida)' },
                        { value: 'both', label: 'Ambas' }
                      ].map((option) => (
                        <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                          <RadioGroupItem value={option.value} id={option.value} />
                          <span className="text-gray-300">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </RadioGroup>
                )}
              </div>

              <div className="p-5 rounded-2xl border-2 border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="metformin"
                    checked={data.uses_metformin}
                    onCheckedChange={(checked) => updateData('uses_metformin', checked)}
                  />
                  <Label htmlFor="metformin" className="text-white font-semibold cursor-pointer">
                    Uso Metformina (Glifage e similares)
                  </Label>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-3">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl">
                <User className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Qual seu nome completo?</h2>
              <p className="text-gray-400">Vamos nos conhecer melhor</p>
            </div>

            <Input
              placeholder="Digite seu nome completo"
              value={data.full_name}
              onChange={(e) => updateData('full_name', e.target.value)}
              className="bg-white/5 border-white/10 text-white text-lg p-6 rounded-2xl"
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-3">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-xl">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Como gostaria de ser chamado(a)?</h2>
              <p className="text-gray-400">Pode ser um apelido ou nome preferido</p>
            </div>

            <Input
              placeholder="Digite como prefere ser chamado"
              value={data.preferred_name}
              onChange={(e) => updateData('preferred_name', e.target.value)}
              className="bg-white/5 border-white/10 text-white text-lg p-6 rounded-2xl"
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-3">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-xl">
                <User className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Qual sua faixa de idade?</h2>
              <p className="text-gray-400">Isso nos ajuda a personalizar suas metas</p>
            </div>

            <RadioGroup value={data.age_range} onValueChange={(v) => updateData('age_range', v)}>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: '18-25', label: '18-25 anos' },
                  { value: '26-35', label: '26-35 anos' },
                  { value: '36-45', label: '36-45 anos' },
                  { value: '46-55', label: '46-55 anos' },
                  { value: '56-65', label: '56-65 anos' },
                  { value: '65+', label: '65+ anos' }
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                      data.age_range === option.value
                        ? 'border-violet-500 bg-violet-500/10'
                        : 'border-white/10 bg-white/5 hover:border-violet-500/50'
                    }`}
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <span className="font-semibold text-white">{option.label}</span>
                  </label>
                ))}
              </div>
            </RadioGroup>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-3">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-xl">
                <Activity className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Peso e Altura</h2>
              <p className="text-gray-400">Dados importantes para calcular suas necessidades</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Peso (kg)</Label>
                <Input
                  type="number"
                  placeholder="Ex: 75"
                  value={data.weight}
                  onChange={(e) => updateData('weight', e.target.value)}
                  className="bg-white/5 border-white/10 text-white text-lg p-6 rounded-2xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Altura (cm)</Label>
                <Input
                  type="number"
                  placeholder="Ex: 170"
                  value={data.height}
                  onChange={(e) => updateData('height', e.target.value)}
                  className="bg-white/5 border-white/10 text-white text-lg p-6 rounded-2xl"
                />
              </div>
            </div>

            {data.weight && data.height && (
              <div className="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20">
                <p className="text-sm text-gray-300">
                  IMC: <span className="font-bold text-violet-400">
                    {(parseFloat(data.weight) / Math.pow(parseFloat(data.height) / 100, 2)).toFixed(1)}
                  </span>
                </p>
              </div>
            )}
          </div>
        );

      case 6:
        return (
          <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-3">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl flex items-center justify-center shadow-xl">
                <Activity className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Sua Rotina</h2>
              <p className="text-gray-400">Como é seu dia a dia?</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="text-white font-semibold">Trabalho</Label>
                <RadioGroup value={data.work_routine} onValueChange={(v) => updateData('work_routine', v)}>
                  <div className="space-y-2">
                    {[
                      { value: 'sedentary', label: 'Sedentário (pouco movimento)' },
                      { value: 'sitting', label: 'Sentado (escritório)' },
                      { value: 'standing', label: 'Em pé (atendimento, vendas)' },
                      { value: 'active', label: 'Ativo (trabalho físico)' }
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                          data.work_routine === option.value
                            ? 'border-violet-500 bg-violet-500/10'
                            : 'border-white/10 bg-white/5 hover:border-violet-500/50'
                        }`}
                      >
                        <RadioGroupItem value={option.value} id={option.value} />
                        <span className="text-white">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-white font-semibold">Atividades Físicas</Label>
                <RadioGroup value={data.physical_activity} onValueChange={(v) => updateData('physical_activity', v)}>
                  <div className="space-y-2">
                    {[
                      { value: 'sedentary', label: 'Sedentário (não pratico)' },
                      { value: 'active', label: 'Ativo (2-3x por semana)' },
                      { value: 'very-active', label: 'Muito ativo (4+ vezes por semana)' }
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                          data.physical_activity === option.value
                            ? 'border-violet-500 bg-violet-500/10'
                            : 'border-white/10 bg-white/5 hover:border-violet-500/50'
                        }`}
                      >
                        <RadioGroupItem value={option.value} id={option.value} />
                        <span className="text-white">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-3">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Seus Objetivos</h2>
              <p className="text-gray-400">Selecione todos que se aplicam</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MAIN_GOALS_OPTIONS.map((goal) => (
                <label
                  key={goal}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                    data.main_goals.includes(goal)
                      ? 'border-violet-500 bg-violet-500/10'
                      : 'border-white/10 bg-white/5 hover:border-violet-500/50'
                  }`}
                >
                  <Checkbox
                    checked={data.main_goals.includes(goal)}
                    onCheckedChange={() => toggleGoal(goal)}
                  />
                  <span className="text-white font-medium">{goal}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-3">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-xl">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Sua Visão de Futuro</h2>
              <p className="text-gray-400">Como você gostaria de se ver daqui 3 meses?</p>
            </div>

            <textarea
              placeholder="Descreva como você se imagina daqui 3 meses..."
              value={data.vision_3_months}
              onChange={(e) => updateData('vision_3_months', e.target.value)}
              rows={6}
              className="w-full bg-white/5 border-2 border-white/10 text-white p-4 rounded-2xl resize-none focus:border-violet-500 focus:outline-none transition-colors"
            />
          </div>
        );

      case 9:
        return (
          <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-3">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center shadow-xl">
                <Utensils className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Metas ao usar o app</h2>
              <p className="text-gray-400">O que você quer alcançar?</p>
            </div>

            <RadioGroup value={data.weight_goal} onValueChange={(v) => updateData('weight_goal', v)}>
              <div className="space-y-3">
                {[
                  { value: 'lose', label: 'Perder peso', icon: '📉' },
                  { value: 'maintain', label: 'Manter peso e melhorar qualidade de vida', icon: '⚖️' },
                  { value: 'gain', label: 'Ganhar peso saudável', icon: '📈' }
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                      data.weight_goal === option.value
                        ? 'border-violet-500 bg-violet-500/10'
                        : 'border-white/10 bg-white/5 hover:border-violet-500/50'
                    }`}
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <span className="text-3xl">{option.icon}</span>
                    <span className="text-white font-semibold flex-1">{option.label}</span>
                  </label>
                ))}
              </div>
            </RadioGroup>

            {data.weight_goal === 'lose' && (
              <div className="space-y-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                <Label className="text-gray-300">Quantos quilos deseja perder?</Label>
                <Input
                  type="number"
                  placeholder="Ex: 10"
                  value={data.weight_loss_target}
                  onChange={(e) => updateData('weight_loss_target', e.target.value)}
                  className="bg-white/5 border-white/10 text-white text-lg p-6 rounded-2xl"
                />
              </div>
            )}

            <div className="p-5 rounded-2xl border-2 border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="nutrition"
                  checked={data.improve_nutrition}
                  onCheckedChange={(checked) => updateData('improve_nutrition', checked)}
                />
                <Label htmlFor="nutrition" className="text-white font-semibold cursor-pointer">
                  Melhorar a alimentação
                </Label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1625] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-400">
              Passo {step + 1} de {totalSteps}
            </span>
            <span className="text-sm font-semibold text-violet-400">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Content Card */}
        <Card className="border-0 bg-[#1f1b2e]/80 backdrop-blur-sm shadow-2xl rounded-3xl">
          <CardContent className="p-8">
            {renderStep()}

            {error && (
              <div className="mt-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <p className="text-rose-400 text-sm font-semibold">{error}</p>
                <p className="text-rose-300 text-xs mt-1">
                  Por favor, verifique sua conexão com o Supabase.
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-8">
              {step > 0 && (
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-xl"
                  disabled={loading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              )}
              
              {step < totalSteps - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl disabled:opacity-50"
                >
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed() || loading}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando seus dados...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Finalizar
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
