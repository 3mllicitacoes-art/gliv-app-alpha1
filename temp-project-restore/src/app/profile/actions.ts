'use server';

import { createClient } from '@/lib/supabase';

interface RecalculateGoalsParams {
  userId: string;
  newWeight: number;
  usesOzempic: boolean;
  goal: 'lose' | 'maintain' | 'gain';
}

export async function recalculateGoals({
  userId,
  newWeight,
  usesOzempic,
  goal
}: RecalculateGoalsParams) {
  try {
    const supabase = createClient();

    // Calcular nova meta de água
    let waterGoal = newWeight * 35; // ml
    if (usesOzempic) {
      waterGoal += 500; // +500ml se usa Ozempic
    }

    // Calcular nova meta de calorias
    let calorieGoal: number;
    if (goal === 'lose') {
      calorieGoal = newWeight * 22;
    } else {
      // 'maintain' ou 'gain'
      calorieGoal = newWeight * 30;
    }

    // Calcular nova meta de proteína
    const proteinGoal = newWeight * 1.6; // gramas

    // Atualizar metas no banco de dados
    const { error } = await supabase
      .from('daily_goals')
      .upsert({
        user_id: userId,
        water_ml: Math.round(waterGoal),
        calories: Math.round(calorieGoal),
        protein_g: Math.round(proteinGoal),
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('Erro ao atualizar metas:', error);
      throw error;
    }

    return {
      success: true,
      goals: {
        water: Math.round(waterGoal),
        calories: Math.round(calorieGoal),
        protein: Math.round(proteinGoal)
      }
    };
  } catch (error) {
    console.error('Erro ao recalcular metas:', error);
    return {
      success: false,
      error: 'Erro ao recalcular metas'
    };
  }
}
