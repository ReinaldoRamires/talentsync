// src/app/admin/assign-skill/page.tsx
"use client";

import { useState, useEffect, startTransition } from 'react';
import { assignSkillToServer } from './actions'; // Importa a Server Action do novo arquivo
import { createClient } from '../../../lib/supabaseClient'; // Para buscar dados no useEffect

// Tipos para os dados do formulário e do estado
interface Profile {
  id: string;
  full_name: string | null;
}
interface Skill {
  id: number;
  name: string;
}

export default function AssignSkillPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [selectedSkillId, setSelectedSkillId] = useState<string>('');
  const [proficiencyLevel, setProficiencyLevel] = useState<number>(3);
  
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const supabase = createClient(); // Cliente Supabase para buscar dados no lado do cliente

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setMessage('');

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .order('full_name', { ascending: true });

      if (profilesError) {
        console.error('Erro ao buscar perfis:', profilesError);
        setMessage('Erro ao buscar perfis: ' + profilesError.message);
      } else {
        setProfiles(profilesData || []);
      }

      const { data: skillsData, error: skillsError } = await supabase
        .from('skills')
        .select('id, name')
        .order('name', { ascending: true });

      if (skillsError) {
        console.error('Erro ao buscar skills:', skillsError);
        setMessage(prevMsg => prevMsg + (prevMsg ? '\n' : '') + 'Erro ao buscar skills: ' + skillsError.message);
      } else {
        setSkills(skillsData || []);
      }
      setIsLoading(false);
    };

    fetchData();
  }, []); // Array de dependências vazio para rodar apenas na montagem do componente

  const handleFormSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setMessage('');

    // startTransition é recomendado para atualizações de UI baseadas em Server Actions
    startTransition(async () => {
      const result = await assignSkillToServer(formData); // Chama a Server Action importada
      setMessage(result.message);
      if (result.success) {
        // Opcional: Limpar o formulário após sucesso
        // setSelectedProfileId('');
        // setSelectedSkillId('');
        // setProficiencyLevel(3);
        // Você pode querer recarregar os dados ou fazer outra ação aqui
      }
    });
    
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 text-center">
        <p className="text-lg text-gray-700">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Associar Skill a um Perfil
      </h1>
      
      <form action={handleFormSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md max-w-xl">
        <div>
          <label htmlFor="profile" className="block text-sm font-semibold text-gray-700 mb-1">
            Selecione o Perfil
          </label>
          <select
            id="profile"
            name="profileId" // 'name' é crucial para FormData
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
            Selecione a Skill
          </label>
          <select
            id="skill"
            name="skillId" // 'name' é crucial para FormData
            value={selectedSkillId}
            onChange={(e) => setSelectedSkillId(e.target.value)}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
            disabled={isSubmitting}
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
          <label htmlFor="proficiency" className="block text-sm font-semibold text-gray-700 mb-1">
            Nível de Proficiência (1-5)
          </label>
          <input
            type="number"
            id="proficiency"
            name="proficiencyLevel" // 'name' é crucial para FormData
            value={proficiencyLevel}
            onChange={(e) => setProficiencyLevel(parseInt(e.target.value, 10))}
            min="1"
            max="5"
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Associando...' : 'Associar Skill'}
        </button>

        {message && (
          <p className={`mt-4 text-sm ${message.includes('Erro') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}