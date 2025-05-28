// Dentro de src/app/admin/assign-skill/actions.ts
"use server";

import { createClient } from '../../../lib/supabaseClient'; // Ajuste este caminho se necessário (4 ../ para src/lib)
import { revalidatePath } from 'next/cache';

interface ActionResult {
  success: boolean;
  message: string;
}

export async function assignSkillToProfileAction(formData: FormData): Promise<ActionResult> {
  const supabase = createClient();

  const profileId = formData.get('profileId') as string; // Usando os nomes com 'Form'
  const skillId = formData.get('skillId') as string;
  const proficiencyLevel = formData.get('proficiencyLevel') as string;

  if (!profileId || !skillId || !proficiencyLevel) {
    return { success: false, message: "Erro: Perfil, Skill e Nível de Proficiência são obrigatórios." };
  }

  const dataToInsert = {
    profile_id: profileId,
    skill_id: parseInt(skillId, 10),
    proficiency_level: parseInt(proficiencyLevel, 10),
    source_of_assessment: 'admin_assign_skill_form' // Exemplo
  };

  const { error } = await supabase
    .from('profile_skills')
    .insert(dataToInsert);

  if (error) {
    console.error("Erro ao associar skill ao perfil (Server Action):", error);
    if (error.code === '23505') { // Violação de chave única
        return { success: false, message: "Erro: Esta skill já está associada a este perfil." };
    }
    return { success: false, message: "Erro ao associar skill ao perfil: " + error.message };
  }

  // Revalida o path da página de assign-skill OU de uma página que liste os perfis com skills
  revalidatePath('/admin/assign-skill'); // Ou o path mais específico se necessário

  return { success: true, message: "Skill associada ao perfil com sucesso!" };
}