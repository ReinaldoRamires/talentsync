// src/app/admin/vacancies/page.tsx

import Link from 'next/link';
// ⬇️ VERIFIQUE SE ESTE CAMINHO OU UM ALIAS '@/' FUNCIONA CORRETAMENTE PARA VOCÊ
import { createSupabaseServerClient } from '../../../lib/supabase/server'; 
import { cookies } from 'next/headers'; // Importe 'cookies' para o server client do Supabase

interface Vacancy {
  id: number;
  title: string;
  company_name: string | null;
  status: string | null;
  owner_id: string | null; // ID do usuário que criou a vaga (UUID de Supabase Auth)
  created_at: string;    // Data de criação (Supabase retorna como string ISO)
  type: 'REAL' | 'TEMPLATE' | string | null; // Tipo da vaga
}

// Função para buscar as vagas REAIS do Supabase
async function getVacancies(): Promise<Vacancy[]> {
  // Para Server Components, é recomendado criar o cliente Supabase 
  // com acesso aos cookies para operações no servidor.
  // Se 'createClient()' do seu 'lib' não faz isso, substitua pela forma correta.
  const cookieStore = cookies();
  // Exemplo usando createServerComponentClient do @supabase/ssr (adapte se necessário)
  // const supabase = createServerComponentClient({ cookies: () => cookieStore }); 
  const supabase = await createSupabaseServerClient(); // MANTENHA O SEU SE JÁ FOR ADEQUADO PARA SERVER COMPONENTS

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

export default async function VacanciesListPage() {
  const vacancies = await getVacancies();

  // Para obter o usuário logado em Server Components, use um cliente Supabase server-side
  const cookieStore = cookies();
  // Exemplo usando createServerComponentClient do @supabase/ssr (adapte se necessário)
  // const supabaseForUser = createServerComponentClient({ cookies: () => cookieStore });
  const supabaseForUser = await createSupabaseServerClient(); // MANTENHA O SEU SE JÁ FOR ADEQUADO E FUNCIONAR PARA AUTH

  const { data: { user }, error: userError } = await supabaseForUser.auth.getUser();

  if (userError) {
    console.error('Erro ao buscar usuário na página de vagas:', userError.message);
    // Lidar com o erro, talvez redirecionar para o login se não houver usuário
  }
  const currentUserId = user?.id;
  // console.log('ID do Usuário Logado (VacanciesListPage):', currentUserId); // Para depuração

  return (
    <div className="container mx-auto p-4 md:p-8"> {/* Ajustado padding para mobile */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Gerenciamento de Vagas
        </h1>
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
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Título da Vaga
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Data de Criação
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {vacancies.map((vacancy) => (
                <tr key={vacancy.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{vacancy.id}</p>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">
                    <Link href={`/admin/vacancies/${vacancy.id}/details`} legacyBehavior>
                      <a className="text-gray-900 hover:text-indigo-600 whitespace-no-wrap font-medium">
                        {vacancy.title}
                      </a>
                    </Link>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{vacancy.company_name || 'N/A'}</p>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${vacancy.status === 'open' ? 'bg-green-100 text-green-800' : 
                        vacancy.status === 'closed' ? 'bg-red-100 text-red-800' : 
                        vacancy.status === 'filled' ? 'bg-blue-100 text-blue-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {vacancy.status ? vacancy.status.charAt(0).toUpperCase() + vacancy.status.slice(1) : 'N/A'}
                    </span>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {new Date(vacancy.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit', month: '2-digit', year: 'numeric'
                      })}
                    </p>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">
                    <Link href={`/admin/vacancies/${vacancy.id}/manage-skills`} legacyBehavior>
                      <a className="text-indigo-600 hover:text-indigo-800 font-medium mr-3"> {/* Adicionado mr-3 para espaçamento */}
                        Gerenciar Skills
                      </a>
                    </Link>
                    {/* Placeholder para o Menu de Ações Condicionais (próximo passo)
                      Aqui virá o componente do menu de 3 pontinhos com as opções 
                      "Editar", "Ver Candidatos", "Arquivar", etc.,
                      visíveis/habilitadas com base na comparação de currentUserId e vacancy.owner_id.
                    */}
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