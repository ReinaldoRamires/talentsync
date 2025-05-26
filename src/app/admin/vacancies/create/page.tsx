// src/app/admin/vacancies/create/page.tsx
"use client";

import { useState, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createVacancyAction } from './actions'; // Importa a Server Action do arquivo actions.ts

// A interface ActionResult não é mais necessária aqui, pois a Server Action a retorna
// e seu tipo é inferido ou pode ser importado de actions.ts se necessário em outro lugar.

export default function CreateVacancyPage() {
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter(); // Se você for usar o router para redirecionar

  const handleFormSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setMessage('');

    startTransition(async () => {
      const result = await createVacancyAction(formData);
      setMessage(result.message);
      if (result.success && result.vacancyId) {
        alert(`Vaga criada com ID: ${result.vacancyId}. Próximo passo seria adicionar skills a esta vaga.`);
        // Futuramente, você pode redirecionar para uma página de edição ou detalhes da vaga:
        // router.push(`/admin/vacancies/${result.vacancyId}/edit-skills`); 
        
        // Limpar o formulário após sucesso (requer que os inputs sejam controlados por estado ou reset manual do form)
        // Para simplificar, vamos deixar os campos preenchidos por enquanto.
        // (event.target as HTMLFormElement).reset(); // Seria necessário passar 'event' para handleFormSubmit
      }
      // Se result.success for false, a mensagem de erro já estará em result.message
    });
    setIsSubmitting(false);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Cadastrar Nova Vaga
      </h1>
      
      <form action={handleFormSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md max-w-xl">
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1">
            Título da Vaga
          </label>
          <input
            type="text"
            id="title"
            name="title" // 'name' é crucial para FormData
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="companyName" className="block text-sm font-semibold text-gray-700 mb-1">
            Nome da Empresa
          </label>
          <input
            type="text"
            id="companyName"
            name="companyName" // 'name' é crucial para FormData
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">
            Descrição (Opcional)
          </label>
          <textarea
            id="description"
            name="description" // 'name' é crucial para FormData
            rows={4}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            name="status" // 'name' é crucial para FormData
            defaultValue="open"
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
            disabled={isSubmitting}
          >
            <option value="open">Aberta</option>
            <option value="on_hold">Em Espera</option>
            <option value="closed">Fechada</option>
            <option value="filled">Preenchida</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Salvando Vaga...' : 'Salvar Vaga'}
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