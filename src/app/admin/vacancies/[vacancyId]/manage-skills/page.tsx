// src/app/admin/vacancies/[vacancyId]/manage-skills/page.tsx
"use client";

import { useState, useEffect, startTransition } from 'react';
import { useRouter } from 'next/navigation';
// ⬇️ CONFIRA ESTE CAMINHO! Deve ser 5 '../' para sair até src/ e então /lib
import { createClient } from '../../../../../lib/supabaseClient'; 
import { addSkillToVacancyAction, removeSkillFromVacancyAction } from './actions'; 

// --- TIPOS ---
interface Vacancy {
  id: number;
  title: string;
  description?: string | null;
  company_name?: string | null;
}

interface Skill {
  id: number;
  name: string;
}

// Interface CORRIGIDA E FINAL para skills já associadas à vaga
interface AssignedVacancySkill {
  skill_id: number;
  required_proficiency_level: number | null;
  is_mandatory: boolean;
  skills: { // skills é um OBJETO único (ou nulo)
    name: string;
  } | null; 
}

interface ManageVacancySkillsPageProps {
  params: {
    vacancyId: string;
  };
}

// --- COMPONENTE DA PÁGINA ---
export default function ManageVacancySkillsPage({ params }: ManageVacancySkillsPageProps) {
  const vacancyId = parseInt(params.vacancyId, 10);
  const router = useRouter();

  // Estados do componente
  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [assignedSkills, setAssignedSkills] = useState<AssignedVacancySkill[]>([]);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState<string>('');
  const [proficiencyLevel, setProficiencyLevel] = useState<number>(3);
  const [isMandatory, setIsMandatory] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null); // Armazena o skill_id da skill sendo deletada
  const handleRemoveSkill = async (skillToRemoveId: number) => {
  if (!vacancyId || !skillToRemoveId) {
    setMessage("Erro: Informações incompletas para remover a skill.");
    return;
  }
  // Pergunta de confirmação para o usuário
  if (!confirm(`Tem certeza que deseja remover esta skill (ID: ${skillToRemoveId}) da vaga?`)) {
    return;
  }

  setIsDeleting(skillToRemoveId); // Indica qual skill está sendo processada para remoção
  setMessage(''); // Limpa mensagens anteriores

  startTransition(async () => {
    const result = await removeSkillFromVacancyAction(vacancyId, skillToRemoveId);
    setMessage(result.message);
    if (result.success) {
      // O router.refresh() deve ser suficiente devido ao revalidatePath na Server Action
      router.refresh();
      fetchData(); 
    }
  });
  setIsDeleting(null); // Reseta o estado de deleção após a tentativa
};

  const supabase = createClient();

  // Função para buscar os dados da página
  const fetchData = async () => {
    if (isNaN(vacancyId)) {
      setMessage("ID da vaga inválido.");
      setIsLoading(false);
      return;
    }
    
    // 1. Buscar detalhes da vaga
    const { data: vacancyData, error: vacancyError } = await supabase
      .from('vacancies')
      .select('id, title, description, company_name')
      .eq('id', vacancyId)
      .single();

    if (vacancyError || !vacancyData) {
      console.error('Erro ao buscar vaga:', vacancyError);
      setMessage(`Erro ao buscar vaga: ${vacancyError?.message || 'Vaga não encontrada.'}`);
      setVacancy(null);
    } else {
      setVacancy(vacancyData);
    }

    // 2. Buscar skills já associadas a esta vaga
    const { data: assignedSkillsData, error: assignedSkillsError } = await supabase
      .from('vacancy_skills')
      .select('skill_id, required_proficiency_level, is_mandatory, skills(name)') // Acesso ao nome da skill através do relacionamento
      .eq('vacancy_id', vacancyId);
      
    if (assignedSkillsError) {
      console.error('Erro ao buscar skills da vaga:', assignedSkillsError);
      setMessage(prev => `${prev}\nErro ao buscar skills da vaga: ${assignedSkillsError.message}`.trim());
      setAssignedSkills([]); // Define como array vazio em caso de erro
    } else {
      // Mapeamento explícito para garantir a estrutura correta
      const mappedSkills = (assignedSkillsData || []).map(item => ({
        skill_id: item.skill_id,
        required_proficiency_level: item.required_proficiency_level,
        is_mandatory: item.is_mandatory,
        skills: item.skills ? { name: (item.skills as any).name } : null // Trata 'skills' como objeto
      }));
      setAssignedSkills(mappedSkills as AssignedVacancySkill[]);
    }

    // 3. Buscar todas as skills disponíveis
    const { data: allSkillsData, error: allSkillsError } = await supabase
      .from('skills')
      .select('id, name')
      .order('name', { ascending: true });

    if (allSkillsError) {
      console.error('Erro ao buscar todas as skills:', allSkillsError);
      setMessage(prev => `${prev}\nErro ao buscar todas as skills: ${allSkillsError.message}`.trim());
    } else {
      setAvailableSkills(allSkillsData || []);
    }
  };

  // useEffect para buscar os dados iniciais
  useEffect(() => {
    setIsLoading(true); 
    fetchData().finally(() => {
        setIsLoading(false); 
    });
  }, [vacancyId]); 

  // Função para lidar com o envio do formulário de adicionar skill
  const handleAddSkillSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');
  
    const formData = new FormData(event.currentTarget); 
    if (!formData.has('vacancyId')) {
        formData.append('vacancyId', vacancyId.toString());
    }
  
    startTransition(async () => {
      const result = await addSkillToVacancyAction(formData); 
      setMessage(result.message);
      if (result.success) {
        setSelectedSkillId('');
        setProficiencyLevel(3);
        setIsMandatory(true);
        router.refresh();
        fetchData();
      }
    });
    
    setIsSubmitting(false);
  };
  
  // --- RENDERIZAÇÃO DO COMPONENTE ---
  if (isLoading) {
    return <div className="container mx-auto p-8 text-center"><p className="text-lg text-gray-700">Carregando dados da vaga...</p></div>;
  }

  if (!vacancy) {
    return <div className="container mx-auto p-8 text-center"><p className="text-lg text-red-600">{message || "Vaga não encontrada ou ID inválido."}</p></div>;
  }

  const skillsForDropdown = availableSkills.filter(
    as => !assignedSkills.some(s => s.skill_id === as.id)
  );

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">Gerenciar Skills para a Vaga</h1>
<h2 className="text-xl font-semibold text-indigo-700 mb-1">{vacancy.title} (ID: {vacancy.id})</h2>
{vacancy.company_name && (
  <p className="text-lg text-gray-600 mb-6">Empresa: {vacancy.company_name}</p>
)}

      {/* Formulário para Adicionar Nova Skill */}
      <form onSubmit={handleAddSkillSubmit} className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Adicionar Nova Skill Requerida</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label htmlFor="skill" className="block text-sm font-medium text-gray-700">Skill</label>
            <select
              id="skill"
              name="skillId"
              value={selectedSkillId}
              onChange={(e) => setSelectedSkillId(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              required
              disabled={isSubmitting}
            >
              <option value="">-- Selecione --</option>
              {skillsForDropdown.map(skill => (
                <option key={skill.id} value={skill.id.toString()}>{skill.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="proficiency" className="block text-sm font-medium text-gray-700">Nível Esperado (1-5)</label>
            <input
              type="number"
              id="proficiency"
              name="requiredProficiencyLevel"
              value={proficiencyLevel}
              onChange={(e) => setProficiencyLevel(parseInt(e.target.value))}
              min="1" max="5"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="flex items-center pt-5">
            <input
              id="isMandatory"
              name="isMandatory"
              type="checkbox"
              checked={isMandatory}
              onChange={(e) => setIsMandatory(e.target.checked)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              disabled={isSubmitting}
            />
            <label htmlFor="isMandatory" className="ml-2 block text-sm text-gray-900">Obrigatória?</label>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            disabled={isSubmitting || !selectedSkillId}
          >
            {isSubmitting ? "Adicionando..." : "Adicionar Skill"}
          </button>
        </div>
        {message && <p className={`mt-3 text-sm ${message.includes("Erro") ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}
      </form>

      {/* Lista de Skills Já Associadas */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Skills Já Associadas a Esta Vaga</h3>
        {assignedSkills.length > 0 ? (
          <ul className="space-y-3">
            {assignedSkills.map(as => (
              <li key={as.skill_id} className="p-4 bg-gray-50 rounded-md shadow-sm flex justify-between items-center">
                <div>
                  {/* Acesso CORRIGIDO à propriedade name, tratando skills como objeto */}
                  <span className="font-medium text-gray-900">{as.skills?.name || 'Skill Desconhecida'}</span>
                  <span className="text-sm text-gray-600"> - Nível: {as.required_proficiency_level || 'N/A'} {as.is_mandatory ? "(Obrigatória)" : "(Desejável)"}</span>
                </div>
                {/* TODO: Implementar Server Action para remover skill */}
                <button 
                  onClick={() => handleRemoveSkill(as.skill_id)}
                  className="text-red-500 hover:text-red-700 text-sm disabled:opacity-50"
                  disabled={isSubmitting || isDeleting === as.skill_id} 
                >
                  {isDeleting === as.skill_id ? "Removendo..." : "Remover"}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">Nenhuma skill associada a esta vaga ainda.</p>
        )}
      </div>
    </div>
  );
}