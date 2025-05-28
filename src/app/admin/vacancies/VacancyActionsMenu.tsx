// src/app/admin/vacancies/VacancyActionsMenu.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
// Importe a Server Action
// Ajuste o caminho abaixo conforme a localização real do arquivo vacancyActions.ts
import { toggleVacancyStatusAction } from './create/actions'; // ✅ Linha correta

interface Vacancy {
  id: number;
  title: string;
  owner_id: string | null;
  status: string | null; // Precisamos do status aqui
}

interface VacancyActionsMenuProps {
  vacancy: Vacancy;
  currentUserId: string | undefined;
}

export default function VacancyActionsMenu({ vacancy, currentUserId }: VacancyActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Para feedback no botão
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwner = vacancy.owner_id === currentUserId && currentUserId !== undefined;

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

  const handleToggleStatus = async () => {
    if (!vacancy.status || (vacancy.status !== 'open' && vacancy.status !== 'archived')) {
      alert(`Ação não aplicável para o status atual: ${vacancy.status || 'desconhecido'}.`);
      setIsOpen(false);
      return;
    }
    
    setIsSubmitting(true);
    const result = await toggleVacancyStatusAction(vacancy.id, vacancy.status);
    setIsSubmitting(false);
    setIsOpen(false); // Fecha o menu

    if (result.success) {
      // Idealmente, você teria um sistema de toast/notificação aqui
      alert(result.message); 
    } else {
      alert(`Erro: ${result.message} ${result.errorDetails || ''}`);
    }
  };

  const actionButtonText = vacancy.status === 'open' ? 'Arquivar Vaga' : 
                           vacancy.status === 'archived' ? 'Reativar Vaga' : 
                           'Mudar Status'; // Texto genérico se o status for outro

  const canToggleStatus = vacancy.status === 'open' || vacancy.status === 'archived';


  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <div>
        <button
          type="button"
          className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-2 py-1 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
          id={`options-menu-${vacancy.id}`} // ID único para acessibilidade
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
          aria-labelledby={`options-menu-${vacancy.id}`}
        >
          <div className="py-1" role="none">
            <Link 
              href={`/admin/vacancies/${vacancy.id}/manage-skills`}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              Gerenciar Skills
            </Link>

            {isOwner && (
              <>
                <Link 
                  href={`/admin/vacancies/${vacancy.id}/edit`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  role="menuitem"
                  onClick={() => setIsOpen(false)}
                >
                  Editar Vaga
                </Link>
                <Link 
                  href={`/admin/vacancies/${vacancy.id}/candidates`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  role="menuitem"
                  onClick={() => setIsOpen(false)}
                >
                  Ver Candidatos
                </Link>
                {canToggleStatus && ( // Só mostra o botão se a ação for aplicável
                  <button
                    onClick={handleToggleStatus}
                    disabled={isSubmitting}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 hover:text-red-800 disabled:opacity-50"
                    role="menuitem"
                  >
                    {isSubmitting ? 'Processando...' : actionButtonText}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}