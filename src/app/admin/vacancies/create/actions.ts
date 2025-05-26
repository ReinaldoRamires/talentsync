// src/app/admin/vacancies/create/actions.ts
"use server"; // Diretiva OBRIGATÓRIA no topo do arquivo para Server Actions

import { createClient } from '../../../../lib/supabaseClient'; // Ajuste o caminho para sair de create, vacancies, admin, app até src/lib

interface ActionResult {
  success: boolean;
  message: string;
  vacancyId?: number; 
}

export async function createVacancyAction(formData: FormData): Promise<ActionResult> {
  const supabase = createClient();

  const title = formData.get('title') as string;
  const companyName = formData.get('companyName') as string;
  const description = formData.get('description') as string;
  const status = formData.get('status') as string;

  if (!title || !companyName || !status) {
    return { success: false, message: "Erro: Título, Nome da Empresa e Status são obrigatórios." };
  }

  const { data, error } = await supabase
    .from('vacancies')
    .insert([{
      title: title,
      company_name: companyName,
      description: description,
      status: status
    }])
    .select('id')
    .single();

  if (error) {
    console.error("Erro ao criar vaga no Supabase (Server Action):", error);
    return { success: false, message: "Erro ao criar vaga no Supabase: " + error.message };
  }

  if (!data || !data.id) {
    console.error("Erro: Vaga criada mas ID não retornado pelo Supabase (Server Action).");
    return { success: false, message: "Erro: Vaga criada mas ID não retornado." };
  }

  console.log("Vaga criada com sucesso no Supabase (Server Action):", data);
  // import { revalidatePath } from 'next/cache';
  // revalidatePath('/admin/vacancies'); // Exemplo se tivéssemos uma página listando vagas
  return { success: true, message: "Vaga criada com sucesso!", vacancyId: data.id };
}
