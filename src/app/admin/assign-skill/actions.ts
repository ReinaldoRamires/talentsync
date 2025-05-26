// src/app/admin/assign-skill/actions.ts
"use server"; // Diretiva OBRIGATÓRIA no topo do arquivo para Server Actions

import { createClient } from '../../../lib/supabaseClient'; // Ajuste o caminho se necessário

// Interface para o resultado da Server Action
interface ActionResult {
  success: boolean;
  message: string;
}

export async function assignSkillToServer(formData: FormData): Promise<ActionResult> {
  const supabase = createClient();

  const profileId = formData.get('profileId') as string;
  const skillId = formData.get('skillId') as string;
  const proficiencyLevel = formData.get('proficiencyLevel') as string;

  if (!profileId || !skillId || !proficiencyLevel) {
    return { success: false, message: "Erro: Todos os campos são obrigatórios." };
  }

  const dataToInsert = {
    profile_id: profileId,
    skill_id: parseInt(skillId, 10),
    proficiency_level: parseInt(proficiencyLevel, 10),
    source_of_assessment: 'admin_manual_entry' // Exemplo de como podemos adicionar esta informação
  };

  const { error } = await supabase
    .from('profile_skills')
    .insert(dataToInsert);

  if (error) {
    console.error('Erro ao associar skill na Server Action:', error);
    return { success: false, message: 'Erro ao associar skill: ' + error.message };
  }

  // Aqui você pode adicionar revalidatePath se precisar atualizar dados na tela após a ação
  // import { revalidatePath } from 'next/cache';
  // revalidatePath('/admin/assign-skill'); // Exemplo

  return { success: true, message: `Skill associada com sucesso ao perfil!` };
}