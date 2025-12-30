'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Area, AreaChart } from 'recharts';
import { Flame, Apple, TrendingUp, Activity, Scale, Plus, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { DailyStats } from '@/lib/types';

interface NutritionChartProps {
  data: DailyStats[];
}

type TimePeriod = 'today' | 'yesterday' | 'week' | 'month' | 'lastMonth';
type ChartTab = 'nutrients' | 'weight';

// Cores dos nutrientes com estilo cartoon vibrante
const COLORS = {
  Calorias: '#8B5CF6',
  Proteínas: '#10b981',
  Carboidratos: '#f97316',
  Gorduras: '#f59e0b',
};

// Dados mock de peso para demonstração
const MOCK_WEIGHT_DATA = [
  { date: '2024-01-01', weight: 85.5 },
  { date: '2024-01-03', weight: 84.8 },
  { date: '2024-01-05', weight: 84.2 },
  { date: '2024-01-07', weight: 83.9 },
  { date: '2024-01-09', weight: 83.5 },
  { date: '2024-01-11', weight: 83.0 },
  { date: '2024-01-13', weight: 82.7 },
  { date: '2024-01-15', weight: 82.3 },
];

// Tooltip customizado tema escuro com estilo cartoon
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-gradient-to-br from-[#1f1b2e] to-[#2a2440] backdrop-blur-xl border-2 border-white/20 rounded-2xl p-4 shadow-2xl transform hover:scale-105 transition-transform duration-200">
        <p className="font-black text-white mb-2 text-sm tracking-wide">{data.name}</p>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ 
              backgroundColor: data.payload.fill
            }}
          />
          <span className="text-xs font-bold text-gray-300">Valor:</span>
          <span className="text-sm font-black text-white">{data.value}g</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs font-bold text-gray-300">Percentual:</span>
          <span className="text-sm font-black text-white">{data.payload.percent}%</span>
        </div>
      </div>
    );
  }
  return null;
};

// Tooltip para gráfico de peso com estilo cartoon
const WeightTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-gradient-to-br from-[#1f1b2e] to-[#2a2440] backdrop-blur-xl border-2 border-white/20 rounded-2xl p-4 shadow-2xl transform hover:scale-105 transition-transform duration-200">
        <p className="font-black text-white mb-2 text-sm">
          {new Date(data.payload.date).toLocaleDateString('pt-BR')}
        </p>
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-violet-400 animate-bounce" />
          <span className="text-xs font-bold text-gray-300">Peso:</span>
          <span className="text-sm font-black text-white">{data.value} kg</span>
        </div>
      </div>
    );
  }
  return null;
};

// Legenda customizada com estilo cartoon
const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex justify-center gap-4 flex-wrap mb-4">
      {payload.map((entry: any, index: number) => (
        <div key={`legend-${index}`} className="flex items-center gap-2 transform hover:scale-110 transition-transform duration-200">
          <div
            className="w-4 h-4 rounded-full"
            style={{ 
              backgroundColor: entry.color
            }}
          />
          <span className="text-sm font-black text-gray-200">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

// Label customizado para o gráfico de pizza com estilo cartoon
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="font-black text-lg drop-shadow-lg"
      style={{
        textShadow: '0 0 8px rgba(0,0,0,0.8), 0 0 16px rgba(0,0,0,0.6)'
      }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function NutritionChart({ data }: NutritionChartProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('today');
  const [activeTab, setActiveTab] = useState<ChartTab>('nutrients');
  const [weightData, setWeightData] = useState(MOCK_WEIGHT_DATA);
  const [newWeight, setNewWeight] = useState('');
  const [showAddWeight, setShowAddWeight] = useState(false);

  const timePeriods: { value: TimePeriod; label: string }[] = [
    { value: 'today', label: 'Hoje' },
    { value: 'yesterday', label: 'Ontem' },
    { value: 'week', label: 'Essa Semana' },
    { value: 'month', label: 'Esse Mês' },
    { value: 'lastMonth', label: 'Mês Passado' },
  ];

  // Função para calcular totais baseado no período
  const calculateTotals = () => {
    const now = new Date();
    let filteredData: DailyStats[] = [];

    switch (timePeriod) {
      case 'today':
        filteredData = data.filter(d => {
          const date = new Date(d.date);
          return date.toDateString() === now.toDateString();
        });
        break;
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        filteredData = data.filter(d => {
          const date = new Date(d.date);
          return date.toDateString() === yesterday.toDateString();
        });
        break;
      case 'week':
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filteredData = data.filter(d => new Date(d.date) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filteredData = data.filter(d => new Date(d.date) >= monthAgo);
        break;
      case 'lastMonth':
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        filteredData = data.filter(d => {
          const date = new Date(d.date);
          return date >= lastMonthStart && date <= lastMonthEnd;
        });
        break;
    }

    const totals = filteredData.reduce(
      (acc, day) => ({
        protein: acc.protein + day.total_protein,
        carbs: acc.carbs + day.total_carbs,
        fat: acc.fat + day.total_fat,
      }),
      { protein: 0, carbs: 0, fat: 0 }
    );

    return totals;
  };

  // Função para adicionar novo peso
  const handleAddWeight = () => {
    if (!newWeight || isNaN(parseFloat(newWeight))) return;
    
    const today = new Date().toISOString().split('T')[0];
    const newEntry = {
      date: today,
      weight: parseFloat(newWeight),
    };
    
    setWeightData([...weightData, newEntry].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    ));
    setNewWeight('');
    setShowAddWeight(false);
  };

  // Calcular estatísticas de peso
  const calculateWeightStats = () => {
    if (weightData.length === 0) return { current: 0, change: 0, trend: 'neutral' };
    
    const sortedData = [...weightData].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const current = sortedData[0].weight;
    const previous = sortedData.length > 1 ? sortedData[1].weight : current;
    const change = current - previous;
    const trend = change < 0 ? 'down' : change > 0 ? 'up' : 'neutral';
    
    return { current, change: Math.abs(change), trend };
  };

  const totals = calculateTotals();
  const totalSum = totals.protein + totals.carbs + totals.fat;
  const weightStats = calculateWeightStats();

  const pieData = [
    { 
      name: 'Proteínas', 
      value: totals.protein,
      percent: totalSum > 0 ? ((totals.protein / totalSum) * 100).toFixed(1) : '0'
    },
    { 
      name: 'Carboidratos', 
      value: totals.carbs,
      percent: totalSum > 0 ? ((totals.carbs / totalSum) * 100).toFixed(1) : '0'
    },
    { 
      name: 'Gorduras', 
      value: totals.fat,
      percent: totalSum > 0 ? ((totals.fat / totalSum) * 100).toFixed(1) : '0'
    },
  ];

  return (
    <div className="space-y-4">
      {/* Abas de Navegação com estilo cartoon */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setActiveTab('nutrients')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 ${
            activeTab === 'nutrients'
              ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/50'
              : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-300'
          }`}
        >
          <Apple className="w-4 h-4" />
          Nutrientes
        </button>
        <button
          onClick={() => setActiveTab('weight')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 ${
            activeTab === 'weight'
              ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/50'
              : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-300'
          }`}
        >
          <Scale className="w-4 h-4" />
          Peso
        </button>
      </div>

      {/* Conteúdo da Aba de Nutrientes */}
      {activeTab === 'nutrients' && (
        <div className="space-y-4 animate-in fade-in-0 slide-in-from-right-4 duration-500">
          {/* Título */}
          <div className="text-center">
            <h3 className="text-xl font-black text-white tracking-wide">Distribuição de Nutrientes</h3>
          </div>

          {/* Filtros de Tempo com estilo cartoon */}
          <div className="flex justify-center gap-2 flex-wrap">
            {timePeriods.map((period) => (
              <button
                key={period.value}
                onClick={() => setTimePeriod(period.value)}
                className={`px-4 py-2 rounded-full text-xs font-black transition-all duration-200 transform hover:scale-110 active:scale-95 ${
                  timePeriod === period.value
                    ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/50'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-300'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>

          {/* Gráfico de Pizza com estilo cartoon */}
          <div className="bg-gradient-to-br from-[#1f1b2e]/60 to-[#2a2440]/40 rounded-2xl p-6 backdrop-blur-sm border-2 border-white/10 shadow-2xl">
            {totalSum > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomLabel}
                      outerRadius={100}
                      innerRadius={40}
                      fill="#8884d8"
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={1500}
                      animationEasing="ease-out"
                      strokeWidth={4}
                      stroke="#1f1b2e"
                    >
                      {pieData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[entry.name as keyof typeof COLORS]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend content={<CustomLegend />} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Resumo dos valores com estilo cartoon */}
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {pieData.map((item) => (
                    <div 
                      key={item.name}
                      className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-4 text-center border-2 border-white/20 transform hover:scale-105 transition-all duration-200 hover:shadow-xl"
                    >
                      <div 
                        className="w-3 h-3 rounded-full mx-auto mb-2"
                        style={{ 
                          backgroundColor: COLORS[item.name as keyof typeof COLORS]
                        }}
                      />
                      <p className="text-xs text-gray-300 mb-1 font-bold">{item.name}</p>
                      <p className="text-lg font-black text-white">{item.value}g</p>
                      <p className="text-xs text-gray-400 font-semibold">{item.percent}%</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-400 text-sm font-semibold">Nenhum dado disponível para o período selecionado</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conteúdo da Aba de Peso */}
      {activeTab === 'weight' && (
        <div className="space-y-4 animate-in fade-in-0 slide-in-from-left-4 duration-500">
          {/* Título e Estatísticas */}
          <div className="text-center space-y-3">
            <h3 className="text-xl font-black text-white tracking-wide">Progressão de Peso</h3>
            
            {/* Card de Estatísticas com estilo cartoon */}
            <div className="bg-gradient-to-br from-violet-500/20 to-purple-600/20 rounded-2xl p-5 border-2 border-violet-500/30 shadow-xl">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center transform hover:scale-110 transition-transform duration-200">
                  <p className="text-xs text-gray-300 mb-1 font-bold">Peso Atual</p>
                  <p className="text-3xl font-black text-white drop-shadow-lg">{weightStats.current.toFixed(1)}</p>
                  <p className="text-xs text-gray-400 font-semibold">kg</p>
                </div>
                <div className="text-center transform hover:scale-110 transition-transform duration-200">
                  <p className="text-xs text-gray-300 mb-1 font-bold">Variação</p>
                  <div className="flex items-center justify-center gap-1">
                    {weightStats.trend === 'down' && (
                      <TrendingDown className="w-5 h-5 text-green-400 animate-bounce" />
                    )}
                    {weightStats.trend === 'up' && (
                      <TrendingUp className="w-5 h-5 text-rose-400 animate-bounce" />
                    )}
                    <p className={`text-3xl font-black drop-shadow-lg ${
                      weightStats.trend === 'down' ? 'text-green-400' : 
                      weightStats.trend === 'up' ? 'text-rose-400' : 
                      'text-gray-400'
                    }`}>
                      {weightStats.change.toFixed(1)}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 font-semibold">kg</p>
                </div>
                <div className="text-center transform hover:scale-110 transition-transform duration-200">
                  <p className="text-xs text-gray-300 mb-1 font-bold">Registros</p>
                  <p className="text-3xl font-black text-white drop-shadow-lg">{weightData.length}</p>
                  <p className="text-xs text-gray-400 font-semibold">medições</p>
                </div>
              </div>
            </div>
          </div>

          {/* Botão Adicionar Peso com estilo cartoon */}
          {!showAddWeight && (
            <div className="flex justify-center">
              <Button
                onClick={() => setShowAddWeight(true)}
                className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-xl rounded-2xl flex items-center gap-2 font-black transform hover:scale-110 active:scale-95 transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                Adicionar Peso
              </Button>
            </div>
          )}

          {/* Formulário de Adicionar Peso */}
          {showAddWeight && (
            <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-4 border-2 border-white/20 space-y-3 animate-in slide-in-from-top-4 duration-300 shadow-xl">
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 75.5"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="bg-[#1f1b2e] border-2 border-white/20 text-white placeholder:text-gray-500 rounded-xl font-bold"
                />
                <span className="text-gray-300 text-sm font-black">kg</span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAddWeight}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-xl font-black transform hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  Salvar
                </Button>
                <Button
                  onClick={() => {
                    setShowAddWeight(false);
                    setNewWeight('');
                  }}
                  variant="outline"
                  className="flex-1 border-2 border-white/20 text-gray-300 hover:bg-white/10 rounded-xl font-black transform hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Gráfico de Área em Forma de Escada/Montanha-Russa com estilo cartoon */}
          <div className="bg-gradient-to-br from-[#1f1b2e]/60 to-[#2a2440]/40 rounded-2xl p-6 backdrop-blur-sm border-2 border-white/10 shadow-2xl">
            {weightData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart 
                  data={weightData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="weightGradientCartoon" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.9}/>
                      <stop offset="50%" stopColor="#A78BFA" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="5 5" 
                    stroke="rgba(255,255,255,0.1)" 
                    vertical={false}
                    strokeWidth={2}
                  />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    tick={{ fill: '#D1D5DB', fontSize: 12, fontWeight: 'bold' }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                    strokeWidth={2}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    tick={{ fill: '#D1D5DB', fontSize: 12, fontWeight: 'bold' }}
                    domain={['dataMin - 2', 'dataMax + 2']}
                    strokeWidth={2}
                  />
                  <Tooltip content={<WeightTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    stroke="#8B5CF6"
                    strokeWidth={5}
                    fill="url(#weightGradientCartoon)"
                    animationDuration={2000}
                    animationEasing="ease-in-out"
                  />
                  <Line 
                    type="monotone"
                    dataKey="weight" 
                    stroke="#C4B5FD"
                    strokeWidth={4}
                    dot={{ 
                      fill: '#8B5CF6', 
                      strokeWidth: 4, 
                      r: 7,
                      stroke: '#fff'
                    }}
                    activeDot={{ 
                      r: 10, 
                      fill: '#8B5CF6',
                      stroke: '#fff',
                      strokeWidth: 4
                    }}
                    animationDuration={2000}
                    animationEasing="ease-in-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-400 text-sm font-semibold">Nenhum registro de peso ainda. Adicione sua primeira medição!</p>
              </div>
            )}
          </div>

          {/* Lista de Registros com estilo cartoon */}
          {weightData.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-black text-gray-200 px-2 tracking-wide">Histórico de Medições</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {[...weightData].reverse().map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 border-2 border-white/10 hover:bg-white/15 hover:border-white/20 transition-all duration-200 transform hover:scale-105"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-violet-500/30 border-2 border-violet-400/50">
                        <Scale className="w-4 h-4 text-violet-300" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-white">{entry.weight} kg</p>
                        <p className="text-xs text-gray-400 font-semibold">
                          {new Date(entry.date).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    {index < weightData.length - 1 && (
                      <div className="flex items-center gap-1">
                        {entry.weight < weightData[weightData.length - index - 2].weight ? (
                          <>
                            <TrendingDown className="w-5 h-5 text-green-400 animate-bounce" />
                            <span className="text-xs font-black text-green-400">
                              -{(weightData[weightData.length - index - 2].weight - entry.weight).toFixed(1)} kg
                            </span>
                          </>
                        ) : entry.weight > weightData[weightData.length - index - 2].weight ? (
                          <>
                            <TrendingUp className="w-5 h-5 text-rose-400 animate-bounce" />
                            <span className="text-xs font-black text-rose-400">
                              +{(entry.weight - weightData[weightData.length - index - 2].weight).toFixed(1)} kg
                            </span>
                          </>
                        ) : (
                          <span className="text-xs font-black text-gray-400">
                            Sem variação
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
