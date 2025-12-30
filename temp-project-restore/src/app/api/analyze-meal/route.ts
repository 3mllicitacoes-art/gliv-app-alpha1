import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    // Verificar se a API key está configurada
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY não configurada - retornando análise mock');
      
      // Retornar dados mock para desenvolvimento/preview
      return NextResponse.json({
        foods: [
          { name: 'Arroz Branco', quantity: '1 xícara', calories: 206, carbs: 45, protein: 4, fat: 0.4 },
          { name: 'Feijão Preto', quantity: '1/2 xícara', calories: 114, carbs: 20, protein: 8, fat: 0.5 },
          { name: 'Frango Grelhado', quantity: '150g', calories: 165, carbs: 0, protein: 31, fat: 3.6 },
        ],
        total_calories: 485,
        total_carbs: 65,
        total_protein: 43,
        total_fat: 4.5,
        glycemic_score: 62,
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

    const { image, mealType } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'Imagem não fornecida' },
        { status: 400 }
      );
    }

    // Extrair apenas a parte base64 da imagem
    const base64Image = image.includes('base64,') 
      ? image.split('base64,')[1] 
      : image;

    // Criar prompt para a IA analisar a imagem
    const prompt = `Você é um nutricionista especializado. Analise esta imagem de uma refeição (${mealType}) e forneça uma análise nutricional detalhada.

Forneça a resposta EXATAMENTE no seguinte formato JSON (sem texto adicional):
{
  "foods": [
    {
      "name": "nome do alimento",
      "quantity": "quantidade estimada",
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
- Identifique todos os alimentos visíveis na imagem
- Estime as quantidades baseadas no tamanho visual
- Calcule os valores nutricionais baseados nas quantidades estimadas
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
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 1500,
    });

    const analysisText = completion.choices[0].message.content;
    if (!analysisText) {
      throw new Error('Resposta vazia da IA');
    }

    const analysis = JSON.parse(analysisText);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Erro ao analisar refeição:', error);
    return NextResponse.json(
      { error: 'Erro ao processar análise da refeição' },
      { status: 500 }
    );
  }
}
