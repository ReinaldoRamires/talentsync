// src/app/admin/vacancies/page.tsx

import Link from 'next/link';
// ⬇️ CONFIRA ESTE CAMINHO! Deve ser 4 '../' para sair de vacancies, admin, app até src, depois /lib
import { createClient } from '../../../lib/supabaseClient';

interface Vacancy {
  id: number;
  title: string;
  company_name: string | null;
  status: string | null;
  // Adicionaremos mais campos conforme necessário, ex: created_at
}

async function getVacancies(): Promise<Vacancy[]> {
  // Esta função roda no servidor
  const supabase = createClient(); // Usando o cliente Supabase configurado
  const { data, error } = await supabase
    .from('vacancies')
    .select('id, title, company_name, status')
    .order('id', { ascending: false }); // Ordena pelas mais recentes primeiro

  if (error) {
    console.error('Erro ao buscar vagas:', error);
    // Em um app de produção, você trataria esse erro de forma mais elegante
    return [];
  }
  return data || [];
}

export default async function VacanciesListPage() {
  const vacancies = await getVacancies();

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Gerenciamento de Vagas
        </h1>
        <Link href="/admin/vacancies/create" legacyBehavior>
          <a className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
            + Criar Nova Vaga
          </a>
        </Link>
      </div>

      {vacancies.length === 0 ? (
        <p className="text-gray-600 bg-white p-6 rounded-lg shadow">Nenhuma vaga cadastrada ainda. Comece criando uma nova!</p>
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
                    <p className="text-gray-900 whitespace-no-wrap">{vacancy.title}</p>
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
                    <Link href={`/admin/vacancies/${vacancy.id}/manage-skills`} legacyBehavior>
                      <a className="text-indigo-600 hover:text-indigo-800 font-medium">
                        Gerenciar Skills
                      </a>
                    </Link>
                    {/* Futuramente:
                    <Link href={`/admin/vacancies/${vacancy.id}/edit`} legacyBehavior>
                      <a className="text-gray-500 hover:text-gray-700 ml-4">Editar</a>
                    </Link>
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