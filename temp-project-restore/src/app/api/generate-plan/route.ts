import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { profile } = await request.json();

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil não fornecido' },
        { status: 400 }
      );
    }

    console.log('📋 Gerando plano para perfil:', profile);

    // Construir prompt detalhado para IA
    const prompt = `Você é um especialista em diabetes e nutrição. Crie um plano personalizado EXTREMAMENTE DETALHADO para o seguinte perfil:

DADOS DO PACIENTE:
- Nome: ${profile.nome_preferido}
- Tipo de Diabetes: ${profile.diabetes_type === 'tipo_1' ? 'Tipo 1' : profile.diabetes_type === 'tipo_2' ? 'Tipo 2' : 'Pré-diabético'}
- Idade: ${profile.faixa_idade} anos
- Peso: ${profile.peso_kg}kg
- Altura: ${profile.altura_cm}cm
- IMC: ${(profile.peso_kg / Math.pow(profile.altura_cm / 100, 2)).toFixed(1)}

MEDICAÇÕES:
${profile.usa_ozempic_mounjaro ? `- Ozempic/Mounjaro: ${profile.dosagem_ozempic_mounjaro}` : ''}
${profile.usa_insulina ? `- Insulina: ${profile.tipo_insulina === 'nph' ? 'NPH' : profile.tipo_insulina === 'regular' ? 'Regular' : 'NPH e Regular'}` : ''}
${profile.usa_glifagem ? '- Metformina (Glifage)' : ''}

ROTINA:
- Trabalho: ${profile.tipo_trabalho}
- Atividade Física: ${profile.nivel_atividade_fisica}

OBJETIVOS:
${profile.objetivos.join(', ')}

META DE PESO: ${profile.meta_perder_peso ? `Perder ${profile.meta_quilos_perder}kg` : profile.meta_manter_peso ? 'Manter peso' : 'Ganhar peso'}

VISÃO 3 MESES: ${profile.visao_3_meses}

INSTRUÇÕES CRÍTICAS:
1. Considere EXTREMAMENTE o tipo de diabetes e medicações para definir limites glicêmicos seguros
2. Crie horários de refeição que se adequem à rotina de trabalho
3. Ajuste recomendações nutricionais baseado nas medicações (ex: Ozempic reduz apetite)
4. Seja específico com valores de glicemia alvo (mg/dL)
5. Inclua lembretes de medicação nos horários corretos
6. Considere interações entre exercícios e medicações
7. **CALCULE METAS DIÁRIAS DE MACRONUTRIENTES** baseado no peso, altura, tipo de diabetes e objetivos:
   - Água (ml): considere peso corporal (30-35ml/kg)
   - Fibras (g): mínimo 25-30g para controle glicêmico
   - Proteínas (g): baseado em peso e objetivos (1.2-2.0g/kg)
   - Gorduras (g): 20-35% das calorias totais
   - Carboidratos (g): ajustado para controle glicêmico e tipo de diabetes

Retorne APENAS um JSON válido no seguinte formato (sem markdown, sem explicações):
{
  "greeting": "Saudação personalizada calorosa",
  "diabetes_analysis": "Análise detalhada do tipo de diabetes e impacto das medicações (2-3 frases)",
  "glycemic_targets": {
    "min": 70,
    "max": 140
  },
  "daily_macros": {
    "water": 2500,
    "fiber": 30,
    "protein": 120,
    "fat": 60,
    "carbs": 180
  },
  "meal_schedule": [
    {
      "time": "07:00",
      "meal": "Café da Manhã",
      "recommendations": ["Recomendação específica 1", "Recomendação específica 2"]
    },
    {
      "time": "10:00",
      "meal": "Lanche da Manhã",
      "recommendations": ["Recomendação específica"]
    },
    {
      "time": "12:30",
      "meal": "Almoço",
      "recommendations": ["Recomendação específica 1", "Recomendação específica 2"]
    },
    {
      "time": "15:30",
      "meal": "Lanche da Tarde",
      "recommendations": ["Recomendação específica"]
    },
    {
      "time": "19:00",
      "meal": "Jantar",
      "recommendations": ["Recomendação específica 1", "Recomendação específica 2"]
    }
  ],
  "goals": [
    "Objetivo principal 1",
    "Objetivo principal 2",
    "Objetivo principal 3"
  ],
  "nutrition_guidelines": [
    "Diretriz nutricional específica 1",
    "Diretriz nutricional específica 2",
    "Diretriz nutricional específica 3",
    "Diretriz nutricional específica 4",
    "Diretriz nutricional específica 5"
  ],
  "exercise_plan": [
    "Exercício específico 1 com duração e frequência",
    "Exercício específico 2 com duração e frequência",
    "Exercício específico 3 com duração e frequência",
    "Exercício específico 4 com duração e frequência"
  ],
  "medication_reminders": [
    "Lembrete de medicação 1 com horário",
    "Lembrete de medicação 2 com horário"
  ],
  "weekly_goals": [
    "Meta semanal específica 1",
    "Meta semanal específica 2",
    "Meta semanal específica 3",
    "Meta semanal específica 4"
  ],
  "motivational_message": "Mensagem motivacional personalizada e inspiradora"
}`;

    // Calcular valores personalizados para dados mock
    const imc = profile.peso_kg / Math.pow(profile.altura_cm / 100, 2);
    const waterIntake = Math.round(profile.peso_kg * 35); // 35ml por kg
    const proteinIntake = Math.round(profile.peso_kg * (profile.meta_perder_peso ? 1.8 : 1.6)); // Mais proteína se quer perder peso
    const carbIntake = profile.diabetes_type === 'tipo_1' ? 200 : profile.meta_perder_peso ? 130 : 180;
    const fatIntake = profile.meta_perder_peso ? 50 : 65;

    // Criar plano mock SEMPRE (para fase de teste)
    const mockPlan = {
      greeting: `Olá, ${profile.nome_preferido}! 👋 Seja bem-vindo(a) ao seu plano personalizado!`,
      diabetes_analysis: `Com base no seu perfil de ${profile.diabetes_type === 'tipo_1' ? 'Diabetes Tipo 1' : profile.diabetes_type === 'tipo_2' ? 'Diabetes Tipo 2' : 'Pré-diabetes'}, peso de ${profile.peso_kg}kg e IMC de ${imc.toFixed(1)}, criamos um plano personalizado para você alcançar seus objetivos de forma segura e eficaz. ${profile.usa_ozempic_mounjaro ? 'Consideramos o uso de Ozempic/Mounjaro no seu plano.' : ''} ${profile.usa_insulina ? 'Incluímos orientações específicas para uso de insulina.' : ''}`,
      glycemic_targets: {
        min: profile.diabetes_type === 'tipo_1' ? 70 : 80,
        max: profile.diabetes_type === 'tipo_1' ? 180 : 140
      },
      daily_macros: {
        water: waterIntake,
        fiber: 30,
        protein: proteinIntake,
        fat: fatIntake,
        carbs: carbIntake
      },
      meal_schedule: [
        {
          time: "07:00",
          meal: "Café da Manhã",
          recommendations: [
            "Priorize proteínas e fibras para controle glicêmico",
            "Evite açúcares simples e carboidratos refinados"
          ]
        },
        {
          time: "10:00",
          meal: "Lanche da Manhã",
          recommendations: [
            "Frutas com baixo índice glicêmico (maçã, pera) ou oleaginosas (castanhas, amêndoas)"
          ]
        },
        {
          time: "12:30",
          meal: "Almoço",
          recommendations: [
            "Prato balanceado: 50% vegetais, 25% proteína magra, 25% carboidrato integral",
            "Prefira arroz integral, quinoa ou batata-doce"
          ]
        },
        {
          time: "15:30",
          meal: "Lanche da Tarde",
          recommendations: [
            "Iogurte natural sem açúcar com sementes ou um punhado de castanhas"
          ]
        },
        {
          time: "19:00",
          meal: "Jantar",
          recommendations: [
            "Refeição leve, evite carboidratos em excesso à noite",
            "Priorize proteínas e vegetais"
          ]
        }
      ],
      goals: profile.objetivos && profile.objetivos.length > 0 
        ? profile.objetivos.slice(0, 3) 
        : ["Controlar glicemia", "Melhorar alimentação", "Aumentar energia"],
      nutrition_guidelines: [
        "Priorize alimentos integrais e naturais em todas as refeições",
        "Evite alimentos ultraprocessados, açúcares refinados e gorduras trans",
        "Inclua proteínas de qualidade em todas as refeições para saciedade",
        "Consuma pelo menos 5 porções de vegetais variados diariamente",
        "Mantenha-se bem hidratado ao longo do dia, especialmente antes das refeições"
      ],
      exercise_plan: profile.nivel_atividade_fisica === 'sedentary' 
        ? [
            "Caminhada leve 20-30 minutos, 3-4x por semana (comece devagar)",
            "Alongamentos diários pela manhã (10 minutos)",
            "Exercícios de mobilidade 2x por semana",
            "Aumente gradualmente a intensidade conforme se sentir confortável"
          ]
        : profile.nivel_atividade_fisica === 'active'
        ? [
            "Caminhada ou corrida leve 30-40 minutos, 4-5x por semana",
            "Exercícios de resistência (musculação) 2-3x por semana",
            "Alongamentos e mobilidade diariamente",
            "Atividades aeróbicas variadas para manter motivação"
          ]
        : [
            "Treino cardiovascular intenso 40-50 minutos, 5x por semana",
            "Musculação ou treino funcional 3-4x por semana",
            "Yoga ou pilates 1-2x por semana para recuperação",
            "Mantenha consistência e varie os estímulos"
          ],
      medication_reminders: profile.usa_insulina 
        ? [
            "Insulina: aplicar conforme orientação médica (geralmente antes das refeições principais)",
            "Monitorar glicemia antes e 2h após as refeições",
            profile.usa_glifagem ? "Metformina: tomar conforme prescrição (geralmente com as refeições)" : ""
          ].filter(Boolean)
        : profile.usa_glifagem
        ? [
            "Metformina: tomar conforme prescrição médica (geralmente com as refeições)",
            "Monitorar glicemia regularmente conforme orientação"
          ]
        : [
            "Manter acompanhamento médico regular",
            "Monitorar glicemia conforme orientação do seu médico"
          ],
      weekly_goals: [
        "Registrar todas as refeições e glicemias no app diariamente",
        `Manter glicemia entre ${profile.diabetes_type === 'tipo_1' ? '70-180' : '80-140'} mg/dL na maioria das medições`,
        `Praticar atividade física ${profile.nivel_atividade_fisica === 'sedentary' ? '3-4x' : profile.nivel_atividade_fisica === 'active' ? '4-5x' : '5-6x'} na semana`,
        `Beber pelo menos ${(waterIntake / 1000).toFixed(1)}L de água por dia`
      ],
      motivational_message: profile.meta_perder_peso 
        ? `${profile.nome_preferido}, você está no caminho certo para alcançar sua meta de perder ${profile.meta_quilos_perder}kg! Cada pequena escolha saudável te aproxima dos seus objetivos. Lembre-se: progresso, não perfeição. Vamos juntos nessa jornada! 💪✨`
        : `${profile.nome_preferido}, você está fazendo um trabalho incrível cuidando da sua saúde! Manter o controle glicêmico e uma alimentação equilibrada são passos fundamentais para uma vida plena. Continue assim, você é capaz! 🌟💚`
    };

    console.log('✅ Plano mock gerado:', mockPlan);

    // Verificar se a API key está configurada
    if (!process.env.OPENAI_API_KEY) {
      console.log('⚠️ OPENAI_API_KEY não configurada - usando dados mock');
      return NextResponse.json({ plan: mockPlan });
    }

    try {
      // Tentar chamar API da OpenAI
      console.log('🤖 Tentando gerar plano com OpenAI...');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'Você é um especialista em diabetes, endocrinologia e nutrição. Crie planos personalizados detalhados e seguros. Sempre retorne JSON válido.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' }
        }),
      });

      if (!response.ok) {
        console.error('❌ Erro na API OpenAI:', response.status, response.statusText);
        throw new Error('Erro ao chamar API da OpenAI');
      }

      const data = await response.json();
      const planText = data.choices[0].message.content;
      
      // Parse do JSON retornado
      const plan = JSON.parse(planText);
      console.log('✅ Plano gerado pela OpenAI:', plan);

      return NextResponse.json({ plan });
    } catch (openaiError) {
      console.error('❌ Erro ao chamar OpenAI, usando mock:', openaiError);
      // Se falhar com OpenAI, retornar mock
      return NextResponse.json({ plan: mockPlan });
    }
  } catch (error) {
    console.error('❌ Erro ao gerar plano:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar plano personalizado' },
      { status: 500 }
    );
  }
}
