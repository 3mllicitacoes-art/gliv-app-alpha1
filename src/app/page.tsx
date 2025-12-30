'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Quote, Users, TrendingUp, Award, CheckCircle, Scan, Apple, Pizza, Cake } from 'lucide-react';
import { useState, useEffect } from 'react';

// Logo GLIV - V minimalista e icônico (estilo Nike/Apple)
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

// Ilustração de Scan de Alimentos
const FoodScanIllustration = () => (
  <div className="relative w-full max-w-md mx-auto">
    <div className="relative bg-gradient-to-br from-violet-100 to-purple-100 rounded-3xl p-8 shadow-2xl">
      {/* Smartphone mockup */}
      <div className="bg-gray-900 rounded-3xl p-3 shadow-xl">
        <div className="bg-white rounded-2xl overflow-hidden">
          {/* Tela do app */}
          <div className="relative aspect-[9/16] bg-gradient-to-br from-violet-50 to-purple-50">
            {/* Imagem de comida sendo escaneada */}
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="relative w-full h-full rounded-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=600&fit=crop"
                  alt="Comida sendo escaneada"
                  className="w-full h-full object-cover"
                />
                {/* Grid de scan */}
                <div className="absolute inset-0 bg-gradient-to-b from-violet-500/20 to-purple-500/20">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(139, 92, 246, .3) 25%, rgba(139, 92, 246, .3) 26%, transparent 27%, transparent 74%, rgba(139, 92, 246, .3) 75%, rgba(139, 92, 246, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(139, 92, 246, .3) 25%, rgba(139, 92, 246, .3) 26%, transparent 27%, transparent 74%, rgba(139, 92, 246, .3) 75%, rgba(139, 92, 246, .3) 76%, transparent 77%, transparent)',
                    backgroundSize: '50px 50px'
                  }} />
                </div>
                {/* Linha de scan animada */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent animate-scan" />
              </div>
            </div>
            {/* Ícone de scan */}
            <div className="absolute top-4 right-4 bg-violet-600 text-white p-3 rounded-full shadow-lg animate-pulse">
              <Scan className="w-6 h-6" />
            </div>
            {/* Resultado do scan */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-bold text-gray-900">Análise Completa</span>
              </div>
              <div className="space-y-1 text-xs text-gray-700">
                <div className="flex justify-between">
                  <span>Calorias:</span>
                  <span className="font-bold text-violet-600">450 kcal</span>
                </div>
                <div className="flex justify-between">
                  <span>Carboidratos:</span>
                  <span className="font-bold text-violet-600">55g</span>
                </div>
                <div className="flex justify-between">
                  <span>Impacto Glicêmico:</span>
                  <span className="font-bold text-green-600">Moderado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Elementos decorativos */}
      <div className="absolute -top-4 -right-4 w-20 h-20 bg-violet-500 rounded-full opacity-20 blur-xl" />
      <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-purple-500 rounded-full opacity-20 blur-xl" />
    </div>
  </div>
);

export default function WelcomePage() {
  const router = useRouter();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      text: 'Depois de anos lutando contra a diabetes, finalmente encontrei uma ferramenta que realmente funciona. O GLIV me deu controle total sobre minha glicose.',
      author: 'Patricia Mendes',
      role: 'Usuária há 6 meses',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
    },
    {
      text: 'A análise por foto é simplesmente incrível. Em segundos sei exatamente o que estou comendo e como isso afeta minha glicose.',
      author: 'Roberto Lima',
      role: 'Usuário há 1 ano',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop'
    },
    {
      text: 'Perdi peso de forma saudável e aprendi a me alimentar melhor. O GLIV é muito mais que um app, é um estilo de vida.',
      author: 'Juliana Ferreira',
      role: 'Usuária há 8 meses',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
    },
    {
      text: 'Minha glicemia está controlada e consigo comer o que gosto sem culpa. O app me ensinou a fazer escolhas inteligentes.',
      author: 'Carlos Oliveira',
      role: 'Usuário há 4 meses',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
    },
    {
      text: 'Nunca imaginei que controlar minha diabetes seria tão fácil. O GLIV transformou minha relação com a comida.',
      author: 'Ana Costa',
      role: 'Usuária há 10 meses',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
    },
    {
      text: 'Recomendo para todos que querem cuidar da saúde de forma inteligente. Resultados visíveis em poucas semanas!',
      author: 'Fernando Santos',
      role: 'Usuário há 5 meses',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop'
    }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-violet-50 to-purple-50 py-20 px-4">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          {/* Logo e Nome com Efeito Líquido */}
          <div className="flex flex-col items-center gap-6">
            <div className="transition-transform duration-300 hover:scale-110">
              <GlivLogo size={120} />
            </div>
            
            <div className="relative py-4">
              <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight relative">
                <span className="relative inline-block">
                  {/* Texto base */}
                  <span className="relative z-10 text-gray-900">GLIV</span>
                  
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
              </h1>
              
              {/* Gotas líquidas caindo */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-60 h-12 overflow-hidden">
                <div 
                  className="absolute w-3 h-3 bg-violet-400 rounded-full opacity-60"
                  style={{
                    left: '20%',
                    animation: 'dropFall 3s ease-in infinite'
                  }}
                />
                <div 
                  className="absolute w-3 h-3 bg-purple-400 rounded-full opacity-60"
                  style={{
                    left: '50%',
                    animation: 'dropFall 3s ease-in infinite 1s'
                  }}
                />
                <div 
                  className="absolute w-3 h-3 bg-violet-300 rounded-full opacity-60"
                  style={{
                    left: '80%',
                    animation: 'dropFall 3s ease-in infinite 2s'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Tagline com ênfase em controle glicêmico */}
          <p className="text-xl sm:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600 font-bold text-2xl">
              Controle metabólico da glicose
            </span>
            {' '}e nutrição inteligente com IA
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button
              onClick={() => router.push('/auth/login')}
              size="lg"
              className="group bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-bold text-lg px-10 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Entrar
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button
              onClick={() => router.push('/auth/register')}
              size="lg"
              className="bg-white hover:bg-gray-50 text-violet-600 font-bold text-lg px-10 py-6 rounded-full border-2 border-violet-500 hover:border-violet-600 transition-all duration-300 hover:scale-105"
            >
              Criar Conta Grátis
            </Button>
          </div>
        </div>
      </section>

      {/* Oferta Free Trial */}
      <section className="py-16 px-4 bg-gradient-to-r from-violet-600 to-purple-600">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 border-2 border-white/20 shadow-2xl">
            <div className="text-center space-y-6">
              <div className="inline-block bg-yellow-400 text-gray-900 font-black text-sm px-6 py-2 rounded-full mb-4">
                🎉 OFERTA ESPECIAL
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
                3 Dias de Teste Gratuito
              </h2>
              <p className="text-xl text-white/90 mb-6">
                + 7 dias de garantia total • Tenha acesso ao melhor do nosso app
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
                <div className="flex items-center gap-3 text-white">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <span className="text-lg">Sem compromisso</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <span className="text-lg">Cancele quando quiser</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <span className="text-lg">Acesso completo</span>
                </div>
              </div>
              <div className="text-white mb-8">
                <p className="text-3xl font-bold mb-2">
                  Valores a partir de <span className="text-yellow-400">R$ 19,90</span>/mês
                </p>
                <p className="text-white/80">Planos flexíveis para seu bolso</p>
              </div>
              <Button
                onClick={() => router.push('/auth/register')}
                size="lg"
                className="bg-white text-violet-600 hover:bg-gray-100 font-bold text-xl px-12 py-8 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
              >
                Começar Teste Grátis Agora
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Provas Sociais */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Milhares confiam no GLIV
            </h2>
            <p className="text-xl text-gray-600">
              Números que comprovam nossa eficácia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center p-8 bg-gradient-to-br from-violet-50 to-purple-50 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300">
              <Users className="w-12 h-12 text-violet-600 mx-auto mb-4" />
              <div className="text-4xl font-black text-violet-600 mb-2">50k+</div>
              <p className="text-gray-700 font-semibold">Usuários Ativos</p>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-violet-50 to-purple-50 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300">
              <TrendingUp className="w-12 h-12 text-violet-600 mx-auto mb-4" />
              <div className="text-4xl font-black text-violet-600 mb-2">95%</div>
              <p className="text-gray-700 font-semibold">Taxa de Sucesso</p>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-violet-50 to-purple-50 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300">
              <Award className="w-12 h-12 text-violet-600 mx-auto mb-4" />
              <div className="text-4xl font-black text-violet-600 mb-2">4.9★</div>
              <p className="text-gray-700 font-semibold">Avaliação Média</p>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-violet-50 to-purple-50 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300">
              <Scan className="w-12 h-12 text-violet-600 mx-auto mb-4" />
              <div className="text-4xl font-black text-violet-600 mb-2">2M+</div>
              <p className="text-gray-700 font-semibold">Refeições Analisadas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Scan de Alimentos */}
      <section className="py-20 px-4 bg-gradient-to-br from-violet-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
                Escaneie e saiba tudo sobre sua refeição
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed">
                Nossa tecnologia de IA analisa qualquer alimento em segundos. Tire uma foto e receba 
                informações completas sobre calorias, carboidratos e impacto glicêmico.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Análise Instantânea</h3>
                    <p className="text-gray-600">Resultados precisos em menos de 3 segundos</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Controle Glicêmico</h3>
                    <p className="text-gray-600">Veja o impacto de cada alimento na sua glicose</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Banco de Dados Completo</h3>
                    <p className="text-gray-600">Milhares de alimentos cadastrados e validados</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <FoodScanIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* Promessa: Coma o que ama */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop"
                  alt="Pessoa feliz comendo pizza"
                  className="w-full h-auto"
                />
              </div>
            </div>

            <div className="space-y-6 order-1 md:order-2">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
                Mantenha sua saúde em dia comendo o que você mais ama
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed">
                Não é sobre restrição, é sobre equilíbrio. Com o GLIV, você aprende a fazer escolhas 
                inteligentes sem abrir mão dos seus alimentos favoritos.
              </p>
              <div className="flex gap-4 items-center">
                <Pizza className="w-12 h-12 text-violet-600" />
                <Cake className="w-12 h-12 text-violet-600" />
                <Apple className="w-12 h-12 text-violet-600" />
              </div>
              <p className="text-lg text-gray-600 italic">
                "Pizza, bolo, sanduíche... tudo pode fazer parte de uma alimentação saudável quando 
                você tem o conhecimento certo!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Resultados Reais */}
      <section className="py-20 px-4 bg-gradient-to-br from-violet-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Resultados Reais
            </h2>
            <p className="text-xl text-gray-600">
              Veja o que nossos usuários conquistaram
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                Controle sua Glicemia
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Monitore e mantenha seus níveis de glicose dentro da faixa ideal com análises precisas 
                e recomendações personalizadas.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                Perca Peso com Saúde
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Alcance seu peso ideal de forma sustentável, sem dietas restritivas ou efeito sanfona. 
                Resultados duradouros.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                Melhore sua Qualidade de Vida
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Mais energia, disposição e bem-estar no dia a dia. Sinta a diferença em poucas semanas 
                de uso.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              O que dizem nossos usuários
            </h2>
            <p className="text-xl text-gray-600">
              Depoimentos reais de pessoas que transformaram suas vidas
            </p>
          </div>

          <div className="relative">
            {/* Carousel */}
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-3xl p-8 md:p-12 shadow-2xl min-h-[400px] flex flex-col justify-between">
              <div className="flex-1 flex flex-col justify-center">
                <Quote className="w-16 h-16 text-violet-500 mb-6 mx-auto" />
                
                <p className="text-xl md:text-2xl text-gray-800 leading-relaxed mb-8 text-center italic">
                  "{testimonials[currentTestimonial].text}"
                </p>

                <div className="flex flex-col items-center gap-4">
                  <img 
                    src={testimonials[currentTestimonial].image}
                    alt={testimonials[currentTestimonial].author}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <div className="text-center">
                    <p className="font-bold text-xl text-gray-900">
                      {testimonials[currentTestimonial].author}
                    </p>
                    <p className="text-gray-600">
                      {testimonials[currentTestimonial].role}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation Arrows */}
              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={prevTestimonial}
                  className="w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110"
                >
                  <ArrowRight className="w-6 h-6 text-violet-600 rotate-180" />
                </button>
                <button
                  onClick={nextTestimonial}
                  className="w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110"
                >
                  <ArrowRight className="w-6 h-6 text-violet-600" />
                </button>
              </div>

              {/* Dots Indicator */}
              <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentTestimonial 
                        ? 'bg-violet-600 w-8' 
                        : 'bg-violet-300 hover:bg-violet-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quem Somos Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-violet-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* Imagem */}
            <div className="md:w-1/2">
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
                  alt="Equipe GLIV"
                  className="w-full h-auto"
                />
              </div>
            </div>

            {/* Texto */}
            <div className="md:w-1/2 space-y-6">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
                Quem somos
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Por trás do app GLIV, você vai encontrar nosso time entusiasmado e cheio de motivação. 
                Somos especialistas em saúde, nutrição e tecnologia, unidos pela missão de tornar o 
                controle glicêmico acessível e inteligente para todos.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Nossa tecnologia de inteligência artificial foi desenvolvida com base em milhares de 
                dados nutricionais e validada por profissionais de saúde, garantindo precisão e 
                confiabilidade em cada análise.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                <span className="font-bold text-violet-600">Nosso foco:</span> Ajudar você a manter 
                o controle metabólico da glicose de forma simples, prática e eficiente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Galeria de Imagens */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Alimentação saudável e saborosa
            </h2>
            <p className="text-xl text-gray-600">
              Descubra que comer bem pode ser delicioso
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <img 
                src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=400&fit=crop"
                alt="Salada saudável"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <img 
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop"
                alt="Tigela de açaí"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <img 
                src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop"
                alt="Comida saudável"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <img 
                src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=400&fit=crop"
                alt="Frutas frescas"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <img 
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop"
                alt="Refeição balanceada"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <img 
                src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop"
                alt="Panquecas"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <img 
                src="https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=400&fit=crop"
                alt="Hambúrguer saudável"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <img 
                src="https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=400&h=400&fit=crop"
                alt="Café da manhã"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-violet-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center space-y-8 text-white">
          <h2 className="text-4xl sm:text-5xl font-bold">
            GLIV - Controle Glicêmico e Contador de Calorias
          </h2>
          <p className="text-xl opacity-90">
            Junte-se a milhares de pessoas que já transformaram sua saúde e conquistaram 
            o controle metabólico da glicose
          </p>
          <Button
            onClick={() => router.push('/auth/register')}
            size="lg"
            className="bg-white text-violet-600 hover:bg-gray-100 font-bold text-xl px-12 py-8 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
          >
            Começar Agora - 3 Dias Grátis
          </Button>
          <p className="text-white/80 text-sm">
            Sem cartão de crédito • Cancele quando quiser • Garantia de 7 dias
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-gray-400 text-center">
        <p>© 2024 GLIV. Todos os direitos reservados.</p>
      </footer>

      {/* Animações CSS */}
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
            transform: translateY(40px);
            opacity: 0;
          }
        }

        @keyframes scan {
          0% {
            top: 0;
          }
          100% {
            top: 100%;
          }
        }

        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
