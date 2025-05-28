// src/app/admin/vacancies/page.tsx
import Link from 'next/link';
// Ajuste o caminho conforme a localização do seu server.ts
import { createSupabaseServerClient } from '../../../lib/supabase/server'; 
// A importação de 'cookies' de 'next/headers' não é mais necessária diretamente aqui,
// pois createSupabaseServerClient já lida com isso.

interface Vacancy {
  id: number;
  title: string;
  company_name: string | null;
  status: string | null;
  owner_id: string | null;
  created_at: string;
  type: 'REAL' | 'TEMPLATE' | string | null;
}

async function getVacancies(): Promise<Vacancy[]> {
  const supabase = await createSupabaseServerClient(); // ✅ USA await

  const { data, error } = await supabase
    .from('vacancies')
    .select('id, title, company_name, status, owner_id, created_at, type')
    .eq('type', 'REAL')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar vagas REAIS:', error.message);
    return [];
  }
  return data || [];
}

// Importe o componente de menu de ações que criamos anteriormente
import VacancyActionsMenu from './VacancyActionsMenu'; 

export default async function VacanciesListPage() {
  const supabase = await createSupabaseServerClient(); // ✅ USA await
  
  const vacancies = await getVacancies(); // ✅ getVacancies agora é implicitamente async se createSupabaseServerClient for

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) {
    console.error('[ Server ] Erro ao buscar usuário na página de vagas:', userError.message);
  }
  const currentUserId = user?.id;
  console.log('[ Server ] ID do Usuário Logado (VacanciesListPage):', currentUserId);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Gerenciamento de Vagas
        </h1>
        {/* O aviso 'legacyBehavior' ainda está aqui. Rode o codemod depois de confirmar que a página funciona. */}
        <Link href="/admin/vacancies/create" legacyBehavior> 
          <a className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 w-full md:w-auto text-center">
            + Criar Nova Vaga
          </a>
        </Link>
      </div>

      {vacancies.length === 0 ? (
        <p className="text-gray-600 bg-white p-6 rounded-lg shadow text-center">Nenhuma vaga REAL cadastrada ainda. Comece criando uma nova!</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ID</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Título da Vaga</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Empresa</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Data de Criação</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {vacancies.map((vacancy: Vacancy) => ( // Adicionado tipo explícito para 'vacancy'
                <tr key={vacancy.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{vacancy.id}</p>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                    <Link href={`/admin/vacancies/${vacancy.id}/details`} legacyBehavior>
                      <a className="text-gray-900 hover:text-indigo-600 whitespace-no-wrap font-medium">
                        {vacancy.title}
                      </a>
                    </Link>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{vacancy.company_name || 'N/A'}</p>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${vacancy.status === 'open' ? 'bg-green-100 text-green-800' : 
                        vacancy.status === 'closed' ? 'bg-red-100 text-red-800' : 
                        vacancy.status === 'filled' ? 'bg-blue-100 text-blue-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {vacancy.status ? vacancy.status.charAt(0).toUpperCase() + vacancy.status.slice(1) : 'N/A'}
                    </span>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {new Date(vacancy.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit', month: '2-digit', year: 'numeric'
                      })}
                    </p>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-right">
                    <VacancyActionsMenu 
                      vacancy={vacancy} 
                      currentUserId={currentUserId} 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}