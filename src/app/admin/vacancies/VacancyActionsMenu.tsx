// src/app/admin/vacancies/VacancyActionsMenu.tsx
'use client'; // ESSENCIAL: Define este como um Client Component

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
// Importe a interface Vacancy (você pode movê-la para um arquivo de tipos compartilhado)
// Supondo que a interface Vacancy esteja acessível ou redefinida aqui
// Se você moveu a interface Vacancy para um arquivo de tipos, importe-a:
// import type { Vacancy } from '@/types'; // Exemplo de caminho

interface Vacancy { // Redefinindo aqui para o exemplo, idealmente importe
  id: number;
  title: string; // Usado para modais de confirmação, por exemplo
  owner_id: string | null;
  // Outros campos da vacancy se necessários para as ações
}

interface VacancyActionsMenuProps {
  vacancy: Vacancy;
  currentUserId: string | undefined;
}

export default function VacancyActionsMenu({ vacancy, currentUserId }: VacancyActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwner = vacancy.owner_id === currentUserId && currentUserId !== undefined;

  // Lógica para fechar o menu se clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleArchive = async () => {
    // Lógica para arquivar/desativar (será uma Server Action)
    console.log(`Arquivar/Desativar vaga ${vacancy.id} - Ação do proprietário: ${isOwner}`);
    // Exemplo: await archiveVacancyAction(vacancy.id);
    setIsOpen(false); // Fecha o menu
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <div>
        <button
          type="button"
          className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-2 py-1 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
          id="options-menu"
          aria-haspopup="true"
          aria-expanded={isOpen}
          onClick={handleToggle}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu"
        >
          <div className="py-1" role="none">
            {/* Ação "Ver Detalhes" - Já é o título da vaga, mas pode repetir aqui se quiser */}
            {/* <Link href={`/admin/vacancies/${vacancy.id}/details`} passHref>
              <a
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                Ver Detalhes
              </a>
            </Link> */}

            <Link href={`/admin/vacancies/${vacancy.id}/manage-skills`} passHref>
              <a
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                Gerenciar Skills
              </a>
            </Link>

            {isOwner && ( // Ações visíveis apenas para o proprietário
              <>
                <Link href={`/admin/vacancies/${vacancy.id}/edit`} passHref>
                  <a
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    role="menuitem"
                    onClick={() => setIsOpen(false)}
                  >
                    Editar Vaga
                  </a>
                </Link>
                <Link href={`/admin/vacancies/${vacancy.id}/candidates`} passHref>
                   <a
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    role="menuitem"
                    onClick={() => setIsOpen(false)}
                  >
                    Ver Candidatos
                  </a>
                </Link>
                <button
                  onClick={handleArchive}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 hover:text-red-800"
                  role="menuitem"
                >
                  Arquivar/Desativar Vaga 
                  {/* Você pode querer mudar o texto baseado no status atual */}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}