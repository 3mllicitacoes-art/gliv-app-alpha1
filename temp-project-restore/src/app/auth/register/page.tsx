'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle, Home } from 'lucide-react';

// Logo GLIV - V minimalista e icônico (DEFINITIVA - usar em todo o app)
const GlivLogo = ({ size = 80 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      {/* Gradiente suave e moderno */}
      <linearGradient id="vGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#6366F1" />
      </linearGradient>
    </defs>
    
    {/* V minimalista e dinâmico com curvas suaves */}
    <path 
      d="M 20 15 Q 35 45, 50 85 Q 65 45, 80 15" 
      fill="none" 
      stroke="url(#vGradient)" 
      strokeWidth="8" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    
    {/* Ponto de energia/vida no centro (simboliza controle e equilíbrio) */}
    <circle cx="50" cy="50" r="4" fill="#10b981" opacity="0.9"/>
  </svg>
);

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!supabase) {
      setError('Supabase não configurado. Configure as variáveis de ambiente.');
      setLoading(false);
      return;
    }

    try {
      // Verificar se o usuário já existe na tabela users
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        throw new Error('Este email já está cadastrado. Faça login ou use outro email.');
      }

      // Criar usuário no Supabase Auth SEM verificação de email
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          // Não enviar email de confirmação
          emailRedirectTo: undefined,
        },
      });

      if (signUpError) throw signUpError;

      // Se o usuário foi criado mas precisa confirmar email, mostrar erro
      if (data.user && !data.session) {
        throw new Error('A confirmação de email está ativada no Supabase. Por favor, desative em: Authentication > Settings > Enable email confirmations');
      }

      // Inserir dados adicionais na tabela users APENAS se não existir
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            email,
            name,
          }, {
            onConflict: 'id',
            ignoreDuplicates: true
          });

        if (profileError && profileError.code !== '23505') {
          console.error('Erro ao criar perfil:', profileError);
          // Não bloqueia o registro se falhar
        }
      }

      setSuccess(true);
      
      // Redirecionar para o quiz de onboarding
      if (data.session) {
        setTimeout(() => {
          router.push('/onboarding/quiz');
        }, 1500);
      }
    } catch (err) {
      console.error('Erro no registro:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 relative">
      {/* Botão Voltar para Início */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors group"
      >
        <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
        <span className="font-medium">Voltar ao Início</span>
      </Link>

      <Card className="w-full max-w-md shadow-2xl border border-gray-700 bg-gray-800/95 backdrop-blur-xl">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="mx-auto transition-transform duration-300 hover:scale-110">
            <GlivLogo size={100} />
          </div>
          
          {/* Nome GLIV com efeito líquido */}
          <div className="relative py-4">
            <CardTitle className="text-5xl font-black tracking-tight relative">
              <span className="relative inline-block">
                {/* Texto base */}
                <span className="relative z-10 text-white">GLIV</span>
                
                {/* Efeito líquido - camada 1 (onda lenta) */}
                <span 
                  className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-400 to-violet-600 bg-clip-text text-transparent"
                  style={{
                    backgroundSize: '200% 100%',
                    animation: 'liquidFlow 4s ease-in-out infinite'
                  }}
                >
                  GLIV
                </span>
                
                {/* Efeito líquido - camada 2 (onda rápida) */}
                <span 
                  className="absolute inset-0 bg-gradient-to-r from-purple-400 via-violet-300 to-purple-400 bg-clip-text text-transparent opacity-70"
                  style={{
                    backgroundSize: '200% 100%',
                    animation: 'liquidFlow 3s ease-in-out infinite reverse'
                  }}
                >
                  GLIV
                </span>
                
                {/* Efeito líquido - camada 3 (brilho) */}
                <span 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent bg-clip-text text-transparent opacity-40 blur-sm"
                  style={{
                    backgroundSize: '200% 100%',
                    animation: 'liquidFlow 2s ease-in-out infinite'
                  }}
                >
                  GLIV
                </span>
              </span>
            </CardTitle>
            
            {/* Gotas líquidas caindo */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-40 h-8 overflow-hidden">
              <div 
                className="absolute w-2 h-2 bg-violet-400 rounded-full opacity-60"
                style={{
                  left: '20%',
                  animation: 'dropFall 3s ease-in infinite'
                }}
              />
              <div 
                className="absolute w-2 h-2 bg-purple-400 rounded-full opacity-60"
                style={{
                  left: '50%',
                  animation: 'dropFall 3s ease-in infinite 1s'
                }}
              />
              <div 
                className="absolute w-2 h-2 bg-violet-300 rounded-full opacity-60"
                style={{
                  left: '80%',
                  animation: 'dropFall 3s ease-in infinite 2s'
                }}
              />
            </div>
          </div>
          
          <CardDescription className="text-base text-gray-400">
            Comece sua jornada de controle glicêmico inteligente
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {!supabase ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Supabase não configurado. Por favor, configure as variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.
              </AlertDescription>
            </Alert>
          ) : success ? (
            <Alert className="bg-green-900/50 border-green-700">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-300">
                Conta criada com sucesso! Redirecionando para o quiz...
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300 font-medium">Nome Completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                  className="border-gray-600 bg-gray-700/50 text-white placeholder:text-gray-500 focus:border-violet-500 focus:ring-violet-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300 font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="border-gray-600 bg-gray-700/50 text-white placeholder:text-gray-500 focus:border-violet-500 focus:ring-violet-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300 font-medium">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                  className="border-gray-600 bg-gray-700/50 text-white placeholder:text-gray-500 focus:border-violet-500 focus:ring-violet-500/20"
                />
                <p className="text-xs text-gray-500">Mínimo de 6 caracteres</p>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold shadow-lg rounded-xl py-6 text-base"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  'Criar Conta Grátis'
                )}
              </Button>

              <div className="text-center text-sm text-gray-400 pt-2">
                Já tem uma conta?{' '}
                <Link
                  href="/auth/login"
                  className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
                >
                  Faça login
                </Link>
              </div>

              <div className="text-center text-xs text-gray-500 pt-2">
                Ao criar uma conta, você concorda com nossos{' '}
                <Link
                  href="/terms"
                  className="text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Termos de Uso
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Animações CSS para efeito líquido */}
      <style jsx>{`
        @keyframes liquidFlow {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes dropFall {
          0% {
            transform: translateY(-10px);
            opacity: 0;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(30px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
