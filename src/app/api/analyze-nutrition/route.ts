import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

interface FoodItem {
  name: string;
  quantity: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verificar se a API key está configurada
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY não configurada - retornando análise mock');
      
      const { foods } = await request.json();
      
      // Retornar dados mock para desenvolvimento/preview
      return NextResponse.json({
        foods: foods.map((food: FoodItem) => ({
          name: food.name,
          quantity: food.quantity,
          calories: 150,
          carbs: 20,
          protein: 10,
          fat: 5
        })),
        total_calories: foods.length * 150,
        total_carbs: foods.length * 20,
        total_protein: foods.length * 10,
        total_fat: foods.length * 5,
        glycemic_score: 55,
        recommendations: [
          'Configure a variável OPENAI_API_KEY para análises reais',
          'Esta é uma análise simulada para desenvolvimento',
          'Adicione suas credenciais OpenAI nas configurações'
        ]
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { foods } = await request.json();

    if (!foods || !Array.isArray(foods) || foods.length === 0) {
      return NextResponse.json(
        { error: 'Lista de alimentos inválida' },
        { status: 400 }
      );
    }

    // Criar prompt para a IA analisar os alimentos
    const foodList = foods
      .map((food: FoodItem) => `- ${food.name}: ${food.quantity}`)
      .join('\n');

    const prompt = `Você é um nutricionista especializado. Analise os seguintes alimentos e suas quantidades, e forneça uma análise nutricional detalhada.

Alimentos consumidos:
${foodList}

Forneça a resposta EXATAMENTE no seguinte formato JSON (sem texto adicional):
{
  "foods": [
    {
      "name": "nome do alimento",
      "quantity": "quantidade",
      "calories": número_de_calorias,
      "carbs": gramas_de_carboidratos,
      "protein": gramas_de_proteínas,
      "fat": gramas_de_gorduras
    }
  ],
  "total_calories": total_de_calorias,
  "total_carbs": total_de_carboidratos,
  "total_protein": total_de_proteínas,
  "total_fat": total_de_gorduras,
  "glycemic_score": pontuação_de_0_a_100,
  "recommendations": [
    "recomendação 1",
    "recomendação 2",
    "recomendação 3"
  ]
}

Importante:
- Calcule os valores nutricionais baseados nas quantidades informadas
- O glycemic_score deve ser de 0-100, onde:
  * 0-55: Baixo impacto glicêmico
  * 56-69: Médio impacto glicêmico
  * 70-100: Alto impacto glicêmico
- Forneça 3 recomendações práticas e personalizadas baseadas na análise
- Seja preciso nos cálculos nutricionais`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Você é um nutricionista especializado em análise nutricional e impacto glicêmico. Sempre responda em JSON válido.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const analysisText = completion.choices[0].message.content;
    if (!analysisText) {
      throw new Error('Resposta vazia da IA');
    }

    const analysis = JSON.parse(analysisText);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Erro ao analisar nutrição:', error);
    return NextResponse.json(
      { error: 'Erro ao processar análise nutricional' },
      { status: 500 }
    );
  }
}
