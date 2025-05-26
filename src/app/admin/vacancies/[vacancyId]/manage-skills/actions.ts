// src/app/admin/vacancies/[vacancyId]/manage-skills/actions.ts
"use server";

// ⬇️ CONFIRA ESTE CAMINHO! Deve ser 6 '../' para sair de manage-skills, [vacancyId], vacancies, admin, app, src até a raiz do projeto e então /lib
// Ou, se o alias @/ estiver configurado corretamente no tsconfig.json para apontar para src/, use:
// import { createClient } from '@/lib/supabaseClient'; 
import { createClient } from '../../../../../lib/supabaseClient'; 
import { revalidatePath } from "next/cache";

interface ActionResult {
  success: boolean;
  message: string;
}

export async function addSkillToVacancyAction(formData: FormData): Promise<ActionResult> {
  const supabase = createClient();

  const vacancyId = formData.get('vacancyId') as string;
  const skillId = formData.get('skillId') as string;
  const requiredProficiencyLevel = formData.get('requiredProficiencyLevel') as string;
  const isMandatory = formData.get('isMandatory') === 'true'; 

  if (!vacancyId || !skillId || !requiredProficiencyLevel) {
    return { success: false, message: "Erro: ID da Vaga, ID da Skill e Nível de Proficiência são obrigatórios." };
  }

  const numVacancyId = parseInt(vacancyId, 10);
  const numSkillId = parseInt(skillId, 10);
  const numProficiencyLevel = parseInt(requiredProficiencyLevel, 10);

  if (isNaN(numVacancyId) || isNaN(numSkillId) || isNaN(numProficiencyLevel)) {
    return { success: false, message: "Erro: IDs ou nível de proficiência inválidos."};
  }

  const dataToInsert = {
    vacancy_id: numVacancyId,
    skill_id: numSkillId,
    required_proficiency_level: numProficiencyLevel,
    is_mandatory: isMandatory,
  };

  const { error } = await supabase
    .from('vacancy_skills')
    .insert(dataToInsert);

  if (error) {
    console.error("Erro ao adicionar skill à vaga (Server Action):", error);
    if (error.code === '23505') { 
        return { success: false, message: "Erro: Esta skill já está associada a esta vaga." };
    }
    return { success: false, message: "Erro ao adicionar skill à vaga: " + error.message };
  }

  revalidatePath(`/admin/vacancies/${vacancyId}/manage-skills`);
  return { success: true, message: "Skill adicionada à vaga com sucesso!" };
}

// SERVER ACTION PARA REMOVER SKILL DA VAGA
export async function removeSkillFromVacancyAction(currentVacancyId: number, skillToRemoveId: number): Promise<ActionResult> {
  const supabase = createClient();

  if (!currentVacancyId || !skillToRemoveId) {
    return { success: false, message: "Erro: ID da Vaga e ID da Skill são obrigatórios para remoção." };
  }

  const { error } = await supabase
    .from('vacancy_skills')
    .delete()
    .eq('vacancy_id', currentVacancyId)
    .eq('skill_id', skillToRemoveId);

  if (error) {
    console.error("Erro ao remover skill da vaga (Server Action):", error);
    return { success: false, message: "Erro ao remover skill da vaga: " + error.message };
  }

  // Revalida o path para que a página que lista as skills da vaga seja atualizada
  revalidatePath(`/admin/vacancies/${currentVacancyId}/manage-skills`);

  return { success: true, message: "Skill removida da vaga com sucesso!" };
}