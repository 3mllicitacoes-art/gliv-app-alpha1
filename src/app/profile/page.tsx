'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, signOut } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, User, Scale, Ruler, LogOut, Save, ArrowLeft, Target, Pill } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { recalculateGoals } from './actions';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserProfile {
  full_name: string;
  age?: number;
  gender?: string;
  fitness_level?: string;
  uses_ozempic?: boolean;
  goal?: 'lose' | 'maintain' | 'gain';
}

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile>({
    full_name: '',
    age: 0,
    gender: '',
    fitness_level: '',
    uses_ozempic: false,
    goal: 'maintain'
  });
  const [weight, setWeight] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [originalWeight, setOriginalWeight] = useState<number>(0);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      if (!supabase) {
        // Modo demo sem Supabase configurado
        setIsOfflineMode(true);
        setUser({ user_metadata: { name: 'Demo User' } });
        const mockProfile = {
          full_name: 'Demo User',
          age: 30,
          gender: 'Masculino',
          fitness_level: 'Intermediário',
          uses_ozempic: false,
          goal: 'maintain' as const
        };
        setProfile(mockProfile);
        setWeight(75);
        setHeight(175);
        setOriginalWeight(75);
        setLoading(false);
        return;
      }

      try {
        // Tentar obter usuário com timeout
        const userPromise = supabase.auth.getUser();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        );

        const { data: { user }, error: userError } = await Promise.race([
          userPromise,
          timeoutPromise
        ]) as any;
        
        if (userError || !user) {
          console.error('Erro ao obter usuário:', userError);
          // Ativar modo offline em vez de redirecionar
          setIsOfflineMode(true);
          loadOfflineData();
          setLoading(false);
          return;
        }

        setUser(user);

        // Buscar perfil do usuário com timeout e tratamento de erro
        try {
          const profilePromise = supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          const { data: profileData, error: profileError } = await Promise.race([
            profilePromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
          ]) as any;

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Erro ao carregar perfil:', profileError);
            throw profileError;
          }
          
          if (!profileData) {
            // Perfil não existe ainda - usar dados do user_metadata
            const fallbackProfile = {
              full_name: user.user_metadata?.name || '',
              age: user.user_metadata?.age || 0,
              gender: user.user_metadata?.gender || '',
              fitness_level: user.user_metadata?.fitness_level || '',
              uses_ozempic: user.user_metadata?.uses_ozempic || false,
              goal: user.user_metadata?.goal || 'maintain'
            };
            setProfile(fallbackProfile);
            setWeight(user.user_metadata?.weight || 0);
            setHeight(user.user_metadata?.height || 0);
            setOriginalWeight(user.user_metadata?.weight || 0);
          } else {
            const loadedProfile = {
              full_name: profileData.full_name || user.user_metadata?.name || '',
              age: profileData.age || 0,
              gender: profileData.gender || '',
              fitness_level: profileData.fitness_level || '',
              uses_ozempic: profileData.uses_ozempic || false,
              goal: profileData.goal || 'maintain'
            };
            setProfile(loadedProfile);
            
            // Buscar peso mais recente do histórico com timeout
            try {
              const weightPromise = supabase
                .from('weight_history')
                .select('weight_kg')
                .eq('user_id', user.id)
                .order('recorded_at', { ascending: false })
                .limit(1)
                .maybeSingle();

              const { data: weightData } = await Promise.race([
                weightPromise,
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
              ]) as any;
              
              const currentWeight = weightData?.weight_kg || user.user_metadata?.weight || 0;
              setWeight(currentWeight);
              setOriginalWeight(currentWeight);
            } catch (weightError) {
              console.error('Erro ao carregar peso:', weightError);
              // Usar fallback
              const currentWeight = user.user_metadata?.weight || 0;
              setWeight(currentWeight);
              setOriginalWeight(currentWeight);
            }
            
            setHeight(user.user_metadata?.height || 0);
          }
        } catch (profileError) {
          console.error('Erro de conexão ao carregar perfil:', profileError);
          // Usar dados do user_metadata como fallback
          const fallbackProfile = {
            full_name: user.user_metadata?.name || '',
            age: user.user_metadata?.age || 0,
            gender: user.user_metadata?.gender || '',
            fitness_level: user.user_metadata?.fitness_level || '',
            uses_ozempic: user.user_metadata?.uses_ozempic || false,
            goal: user.user_metadata?.goal || 'maintain'
          };
          setProfile(fallbackProfile);
          setWeight(user.user_metadata?.weight || 0);
          setHeight(user.user_metadata?.height || 0);
          setOriginalWeight(user.user_metadata?.weight || 0);
        }

        setLoading(false);
      } catch (connectionError) {
        console.error('Erro de conexão:', connectionError);
        // Ativar modo offline
        setIsOfflineMode(true);
        loadOfflineData();
        setLoading(false);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      setIsOfflineMode(true);
      loadOfflineData();
      setLoading(false);
    }
  };

  const loadOfflineData = () => {
    // Carregar dados do localStorage se disponível
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfile(parsed.profile || {
        full_name: 'Usuário',
        age: 0,
        gender: '',
        fitness_level: '',
        uses_ozempic: false,
        goal: 'maintain'
      });
      setWeight(parsed.weight || 0);
      setHeight(parsed.height || 0);
      setOriginalWeight(parsed.weight || 0);
    } else {
      // Dados padrão
      setProfile({
        full_name: 'Usuário',
        age: 0,
        gender: '',
        fitness_level: '',
        uses_ozempic: false,
        goal: 'maintain'
      });
      setWeight(0);
      setHeight(0);
      setOriginalWeight(0);
    }
  };

  const handleSave = async () => {
    if (!supabase || !user || isOfflineMode) {
      // Salvar localmente em modo offline
      const dataToSave = {
        profile,
        weight,
        height
      };
      localStorage.setItem('userProfile', JSON.stringify(dataToSave));
      
      toast({
        title: "✅ Dados salvos localmente!",
        description: "Seus dados foram salvos no dispositivo. Conecte-se ao Supabase para sincronizar.",
        className: "bg-yellow-500/10 border-yellow-500/50 text-white",
      });
      return;
    }

    setSaving(true);
    try {
      // 1. Atualizar perfil na tabela user_profiles usando upsert com timeout
      const upsertPromise = supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          full_name: profile.full_name,
          age: profile.age,
          gender: profile.gender,
          fitness_level: profile.fitness_level,
          uses_ozempic: profile.uses_ozempic,
          goal: profile.goal,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      const { error: updateError } = await Promise.race([
        upsertPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
      ]) as any;

      if (updateError) throw updateError;

      // 2. Se o peso foi alterado, criar registro no weight_history E recalcular metas
      const weightChanged = weight !== originalWeight && weight > 0;
      
      if (weightChanged) {
        try {
          // Salvar histórico de peso
          const insertPromise = supabase
            .from('weight_history')
            .insert({
              user_id: user.id,
              weight_kg: weight,
              recorded_at: new Date().toISOString()
            });

          await Promise.race([
            insertPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
          ]);

          // Recalcular metas automaticamente
          const result = await recalculateGoals({
            userId: user.id,
            newWeight: weight,
            usesOzempic: profile.uses_ozempic || false,
            goal: profile.goal || 'maintain'
          });

          if (result.success) {
            // Mostrar toast especial informando o recálculo
            toast({
              title: "🎯 Plano recalculado para seu novo peso!",
              description: `Novas metas: Água ${result.goals?.water}ml | Calorias ${result.goals?.calories}kcal | Proteína ${result.goals?.protein}g`,
              className: "bg-violet-500/10 border-violet-500/50 text-white",
              duration: 5000,
            });
          }
        } catch (historyError) {
          console.error('Erro ao salvar histórico de peso:', historyError);
          // Não bloqueia o fluxo se falhar o histórico
        }
      }

      // 3. Atualizar o peso original para próxima comparação
      setOriginalWeight(weight);

      // 4. Salvar também localmente como backup
      const dataToSave = {
        profile,
        weight,
        height
      };
      localStorage.setItem('userProfile', JSON.stringify(dataToSave));

      // 5. Mostrar mensagem de sucesso (se não houve recálculo de metas)
      if (!weightChanged) {
        toast({
          title: "✅ Dados atualizados com sucesso!",
          description: "Suas informações foram salvas.",
          className: "bg-green-500/10 border-green-500/50 text-white",
        });
      }

      // Aguardar 2 segundos antes de redirecionar (para ver o toast)
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      
      // Salvar localmente como fallback
      const dataToSave = {
        profile,
        weight,
        height
      };
      localStorage.setItem('userProfile', JSON.stringify(dataToSave));
      
      toast({
        title: "⚠️ Salvo localmente",
        description: "Não foi possível conectar ao servidor. Dados salvos no dispositivo.",
        className: "bg-yellow-500/10 border-yellow-500/50 text-white",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (supabase && !isOfflineMode) {
      try {
        await signOut();
      } catch (error) {
        console.error('Erro ao fazer logout:', error);
      }
    }
    localStorage.removeItem('userProfile');
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="bg-gray-900/95 border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl shadow-2xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="gap-2 hover:bg-white/5 text-gray-300 hover:text-white transition-all duration-200 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-violet-400 to-purple-600 bg-clip-text text-transparent">
              Meu Perfil
            </h1>
            <div className="w-20" /> {/* Spacer para centralizar o título */}
          </div>
        </div>
      </header>

      {/* Banner de modo offline */}
      {isOfflineMode && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/50 py-3">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-yellow-400">
              ⚠️ Modo offline ativo. Dados serão salvos localmente.
            </p>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Card de Identificação */}
          <Card className="border-0 bg-gradient-to-br from-violet-500/10 to-purple-600/10 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <CardHeader className="relative z-10 pb-4">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-white">
                    Olá, {profile.full_name || 'Usuário'}
                  </CardTitle>
                  <p className="text-sm text-gray-400 mt-1">
                    Gerencie suas informações pessoais
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Formulário de Edição */}
          <Card className="border-0 bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-3xl">
            <CardContent className="p-6 space-y-6">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nome
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-violet-500 focus:ring-violet-500 rounded-xl h-12"
                  placeholder="Seu nome completo"
                />
              </div>

              {/* Peso Atual */}
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <Scale className="w-4 h-4" />
                  Peso Atual (kg)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  value={weight || ''}
                  onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-violet-500 focus:ring-violet-500 rounded-xl h-12"
                  placeholder="Ex: 75"
                  step="0.1"
                />
                <p className="text-xs text-gray-500">
                  ⚡ Suas metas serão recalculadas automaticamente ao alterar o peso
                </p>
              </div>

              {/* Altura */}
              <div className="space-y-2">
                <Label htmlFor="height" className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <Ruler className="w-4 h-4" />
                  Altura (cm)
                </Label>
                <Input
                  id="height"
                  type="number"
                  value={height || ''}
                  onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-violet-500 focus:ring-violet-500 rounded-xl h-12"
                  placeholder="Ex: 175"
                  step="1"
                />
              </div>

              {/* Objetivo */}
              <div className="space-y-2">
                <Label htmlFor="goal" className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Objetivo
                </Label>
                <Select
                  value={profile.goal}
                  onValueChange={(value: 'lose' | 'maintain' | 'gain') => 
                    setProfile({ ...profile, goal: value })
                  }
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-violet-500 focus:ring-violet-500 rounded-xl h-12">
                    <SelectValue placeholder="Selecione seu objetivo" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-white/10">
                    <SelectItem value="lose" className="text-white hover:bg-white/5">
                      Perder Peso
                    </SelectItem>
                    <SelectItem value="maintain" className="text-white hover:bg-white/5">
                      Manter Peso
                    </SelectItem>
                    <SelectItem value="gain" className="text-white hover:bg-white/5">
                      Ganhar Peso
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Uso de Ozempic */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <Pill className="w-5 h-5 text-violet-400" />
                  <div>
                    <Label htmlFor="ozempic" className="text-sm font-semibold text-gray-300 cursor-pointer">
                      Uso Ozempic
                    </Label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      +500ml na meta de água
                    </p>
                  </div>
                </div>
                <Switch
                  id="ozempic"
                  checked={profile.uses_ozempic}
                  onCheckedChange={(checked) => 
                    setProfile({ ...profile, uses_ozempic: checked })
                  }
                  className="data-[state=checked]:bg-violet-500"
                />
              </div>

              {/* Botão Salvar */}
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-bold py-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02]"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    {isOfflineMode ? 'Salvar Localmente' : 'Atualizar Dados'}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Botão Sair da Conta */}
          <Card className="border-0 bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-3xl">
            <CardContent className="p-6">
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full text-red-500 hover:text-red-400 hover:bg-red-500/10 font-bold py-6 rounded-xl transition-all duration-300"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Sair da Conta
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
