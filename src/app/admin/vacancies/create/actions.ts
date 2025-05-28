// src/app/admin/vacancies/create/actions.ts
"use server"; 

import { createSupabaseServerClient } from '../../../../lib/supabase/server'; // Ajuste este caminho se sua estrutura lib/supabase/server.ts for diferente
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

interface ActionResult {
  success: boolean;
  message: string;
  vacancyId?: number; 
  errorDetails?: string;
}

// --- Função para CRIAR VAGA ---
export async function createVacancyAction(formData: FormData): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Erro de autenticação ao criar vaga:", authError?.message);
    return { 
      success: false, 
      message: "Erro de autenticação: Você precisa estar logado para criar uma vaga.",
      errorDetails: authError?.message 
    };
  }

  const title = formData.get('title') as string;
  const companyName = formData.get('companyName') as string;
  const description = formData.get('description') as string;
  const status = formData.get('status') as string;

  if (!title || !companyName || !status) {
    return { 
      success: false, 
      message: "Erro: Título, Nome da Empresa e Status são obrigatórios." 
    };
  }

  const newVacancyData = {
    title: title,
    company_name: companyName,
    description: description,
    status: status,
    owner_id: user.id,
    type: 'REAL'
  };

  const { data, error: insertError } = await supabase
    .from('vacancies')
    .insert([newVacancyData])
    .select('id')
    .single();

  if (insertError) {
    console.error("Erro ao criar vaga no Supabase (Server Action):", insertError);
    return { 
      success: false, 
      message: "Erro ao criar vaga no Supabase.",
      errorDetails: insertError.message 
    };
  }

  if (!data || !data.id) {
    console.error("Erro: Vaga criada mas ID não retornado pelo Supabase (Server Action).");
    return { 
      success: false, 
      message: "Erro: Vaga criada mas ID não retornado." 
    };
  }

  console.log("Vaga criada com sucesso no Supabase (Server Action):", data);
  
  revalidatePath('/admin/vacancies'); 
  redirect(`/admin/vacancies/${data.id}/manage-skills`); 
}


// --- Função para ALTERNAR STATUS DA VAGA (Arquivar/Reativar) ---
export async function toggleVacancyStatusAction(
  vacancyId: number,
  currentStatus: string | null
): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();

  // Lógica para determinar o novo status
  let newStatus: string;
  if (currentStatus === 'open') {
    newStatus = 'archived';
  } else if (currentStatus === 'archived') {
    newStatus = 'open';
  } else {
    return { 
      success: false, 
      message: `Ação não permitida para o status atual '${currentStatus}'. Só é possível arquivar vagas 'open' ou reativar vagas 'archived'.` 
    };
  }

  const { error } = await supabase
    .from('vacancies')
    .update({ status: newStatus })
    .eq('id', vacancyId);

  if (error) {
    console.error('Erro ao atualizar status da vaga:', error);
    return { 
      success: false, 
      message: 'Erro ao atualizar status da vaga.', 
      errorDetails: error.message 
    };
  }

  revalidatePath('/admin/vacancies'); 
  return { 
    success: true, 
    message: `Status da vaga alterado para '${newStatus}' com sucesso!` 
  };
}