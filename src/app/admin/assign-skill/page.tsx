// src/app/admin/assign-skill/page.tsx
"use client";

import { useState, useEffect, startTransition, useCallback } from 'react'; // Adicionado useCallback
import { useRouter } from 'next/navigation'; 
import { createClient } from '../../../lib/supabaseClient'; // Ajuste o caminho se necessário
import { assignSkillToProfileAction } from './actions'; 

// --- TIPOS ---
interface Profile {
  id: string; 
  full_name: string | null;
}
interface Skill {
  id: number; 
  name: string;
}
interface AssignedProfileSkill {
  skill_id: number;
  proficiency_level: number | null;
  skills: { 
    name: string;
  } | null; 
}

// --- COMPONENTE DA PÁGINA ---
export default function AssignSkillPage() {
  const router = useRouter(); 

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [selectedSkillId, setSelectedSkillId] = useState<string>('');
  const [proficiencyLevel, setProficiencyLevel] = useState<number>(3);
  const [currentProfileDetails, setCurrentProfileDetails] = useState<Profile | null>(null);
  const [currentProfileAssignedSkills, setCurrentProfileAssignedSkills] = useState<AssignedProfileSkill[]>([]);
  const [isLoadingProfileDetails, setIsLoadingProfileDetails] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [isLoadingInitialData, setIsLoadingInitialData] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const supabase = createClient();

  // Função para buscar dados específicos do perfil, AGORA NO ESCOPO DO COMPONENTE
  // Envolvemos com useCallback para otimizar, pois ela é usada como dependência de um useEffect
  const fetchProfileSpecificData = useCallback(async () => {
    if (!selectedProfileId) {
      setCurrentProfileDetails(null);
      setCurrentProfileAssignedSkills([]);
      setIsLoadingProfileDetails(false);
      return; 
    }

    setIsLoadingProfileDetails(true);
    setMessage(''); 

    try {
      const profileDetail = profiles.find(p => p.id === selectedProfileId);
      setCurrentProfileDetails(profileDetail || null);

      const { data: assignedSkillsData, error: assignedSkillsError } = await supabase
        .from('profile_skills')
        .select(`
          skill_id,
          proficiency_level,
          skills ( name ) 
        `)
        .eq('profile_id', selectedProfileId);

      if (assignedSkillsError) throw assignedSkillsError;
      setCurrentProfileAssignedSkills(assignedSkillsData as AssignedProfileSkill[] || []);

    } catch (error: any) {
      console.error('Erro ao buscar dados do perfil selecionado:', error);
      setMessage('Erro ao buscar dados do perfil: ' + error.message);
      setCurrentProfileAssignedSkills([]); 
    } finally {
      setIsLoadingProfileDetails(false);
    }
  }, [selectedProfileId, profiles, supabase]); // Dependências da função


  // useEffect para buscar os dados iniciais (lista de todos perfis e todas skills)
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoadingInitialData(true);
      setMessage(''); 
      
      try {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .order('full_name', { ascending: true });

        if (profilesError) throw profilesError;
        setProfiles(profilesData || []);

        const { data: skillsData, error: skillsError } = await supabase
          .from('skills')
          .select('id, name')
          .order('name', { ascending: true });

        if (skillsError) throw skillsError;
        setSkills(skillsData || []);

      } catch (error: any) {
        console.error('Erro ao buscar dados iniciais:', error);
        setMessage('Erro ao carregar dados iniciais: ' + error.message);
      } finally {
        setIsLoadingInitialData(false);
      }
    };
    fetchInitialData();
  }, []); // supabase pode ser adicionado como dependência se a instância puder mudar, mas geralmente não é necessário.

  // useEffect para buscar detalhes e skills do perfil QUANDO UM PERFIL É SELECIONADO
  useEffect(() => {
    if (profiles.length > 0 && selectedProfileId) { // Garante que 'profiles' já foi carregado
        fetchProfileSpecificData();
    } else if (!selectedProfileId) {
        setCurrentProfileDetails(null);
        setCurrentProfileAssignedSkills([]);
    }
  }, [selectedProfileId, profiles, fetchProfileSpecificData]); // Adiciona fetchProfileSpecificData como dependência


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setIsSubmitting(true);

  console.log('--- Iniciando handleSubmit ---');
    console.log('Valor de selectedProfileId no início:', selectedProfileId, "Tipo:", typeof selectedProfileId);
    console.log('Valor de selectedSkillId no início:', selectedSkillId, "Tipo:", typeof selectedSkillId);
    console.log('Valor de proficiencyLevel no início:', proficiencyLevel, "Tipo:", typeof proficiencyLevel);
    console.log('--- Fim dos logs iniciais ---');

    let validationFailed = false;
    let validationMessage = 'Por favor, preencha todos os campos obrigatórios e válidos.';

    if (selectedProfileId === '' || selectedProfileId === null || selectedProfileId === undefined) {
      console.log('FALHA NA VALIDAÇÃO: selectedProfileId está vazio.');
      validationFailed = true;
    }
    if (selectedSkillId === '' || selectedSkillId === null || selectedSkillId === undefined) {
      console.log('FALHA NA VALIDAÇÃO: selectedSkillId está vazio.');
      validationFailed = true;
    }
    if (typeof proficiencyLevel !== 'number' || proficiencyLevel < 1 || proficiencyLevel > 5) {
      console.log('FALHA NA VALIDAÇÃO: proficiencyLevel inválido. Valor:', proficiencyLevel, "Tipo:", typeof proficiencyLevel);
      validationFailed = true;
      validationMessage = 'Nível de proficiência deve ser um número entre 1 e 5.';
    }

    if (validationFailed) {
      setMessage(validationMessage);
      console.log('Validação falhou. Mensagem:', validationMessage);
      setIsSubmitting(false);
      return;
    }
    
    console.log('Validação passou! Prosseguindo para Server Action.'); // LOG DE SUCESSO DA VALIDAÇÃO

    const formData = new FormData(event.currentTarget);
    formData.set('profileId', selectedProfileId); 
    formData.set('skillId', selectedSkillId); 
    formData.set('proficiencyLevel', proficiencyLevel.toString());

    startTransition(async () => {
      const result = await assignSkillToProfileAction(formData);
      setMessage(result.message);
      if (result.success) {
        setSelectedSkillId(''); 
        setProficiencyLevel(3); 
        router.refresh(); 
        if (selectedProfileId) {
          fetchProfileSpecificData(); 
        }
      }
    });
    setIsSubmitting(false);
  };

  // --- RENDERIZAÇÃO DO COMPONENTE (permanece igual à sua última versão correta) ---
  if (isLoadingInitialData) {
    return <div className="container mx-auto p-8 text-center"><p>Carregando dados iniciais...</p></div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Associar Skill a um Perfil
      </h1>
      
      <div className="flex flex-col md:flex-row md:gap-8">
        {/* Coluna Esquerda: Formulário de Associação */}
        <div className="w-full md:w-1/2 lg:w-1/3 mb-8 md:mb-0">
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
            <div>
              <label htmlFor="profile" className="block text-sm font-semibold text-gray-700 mb-1">
                Selecione o Perfil
              </label>
              <select
                id="profile"
                name="profileId" 
                value={selectedProfileId}
                onChange={(e) => setSelectedProfileId(e.target.value)}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
                disabled={isSubmitting}
              >
                <option value="">-- Selecione um Perfil --</option>
                {profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.full_name || `ID: ${profile.id.substring(0,8)}...`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="skill" className="block text-sm font-semibold text-gray-700 mb-1">
                Selecione a Skill para Associar
              </label>
              <select
                id="skill"
                name="skillId" 
                value={selectedSkillId}
                onChange={(e) => setSelectedSkillId(e.target.value)}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
                disabled={isSubmitting || !selectedProfileId} 
              >
                <option value="">-- Selecione uma Skill --</option>
                {skills.map((skill) => (
                  <option key={skill.id} value={skill.id.toString()}>
                    {skill.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="proficiencyLevel" className="block text-sm font-semibold text-gray-700 mb-1">
                Nível de Proficiência (1-5)
              </label>
              <input
                type="number"
                id="proficiencyLevel"
                name="proficiencyLevel" 
                value={proficiencyLevel}
                onChange={(e) => setProficiencyLevel(parseInt(e.target.value, 10))}
                min="1"
                max="5"
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
                disabled={isSubmitting || !selectedProfileId}
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={isSubmitting || !selectedProfileId || !selectedSkillId}
            >
              {isSubmitting ? 'Associando...' : 'Associar Skill'}
            </button>
            {message && <p className={`mt-4 text-sm ${message.includes('Erro') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
          </form>
        </div>

        {/* Coluna Direita: Resumo do Perfil e Skills Cadastradas */}
        <div className="w-full md:w-1/2 lg:w-2/3">
          {selectedProfileId ? (
            isLoadingProfileDetails ? (
              <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
                <p>Carregando skills do perfil...</p>
              </div>
            ) : currentProfileDetails ? (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-1">
                  {currentProfileDetails.full_name || "Perfil Selecionado"}
                </h3>
                <p className="text-sm text-gray-500 mb-4">ID: {currentProfileDetails.id}</p>
                
                <h4 className="text-lg font-medium text-gray-700 mt-4 mb-2">Skills Já Cadastradas:</h4>
                {currentProfileAssignedSkills.length > 0 ? (
                  <ul className="space-y-2">
                    {currentProfileAssignedSkills.map(ps => (
                      <li key={ps.skill_id} className="text-sm text-gray-700 p-2 bg-gray-50 rounded">
                        <span className="font-semibold">{ps.skills?.name || 'Skill Desconhecida'}</span> - Nível: {ps.proficiency_level || 'N/A'}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">Nenhuma skill cadastrada para este perfil.</p>
                )}
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
                <p>Não foi possível carregar os detalhes deste perfil.</p>
              </div>
            )
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500 h-full flex items-center justify-center">
              <p>Selecione um perfil à esquerda para ver os detalhes e skills associadas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}