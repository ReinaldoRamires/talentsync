-- Tabela para Vagas (Oportunidades)
CREATE TABLE public.vacancies (
    id SERIAL PRIMARY KEY, -- Identificador único autoincrementável para a vaga
    title TEXT NOT NULL, -- Título da vaga (ex: "Desenvolvedor Web3 Sênior")
    description TEXT, -- Descrição detalhada da vaga
    company_name TEXT, -- Nome da empresa (simplificado por enquanto, poderia ser uma FK para uma futura tabela 'companies')
    department TEXT, -- Departamento (ex: "Engenharia", "Produto")
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'on_hold', 'filled')), -- Status da vaga
    created_at TIMESTAMPTZ DEFAULT NOW(), -- Data e hora de criação da vaga
    updated_at TIMESTAMPTZ DEFAULT NOW()  -- Data e hora da última atualização da vaga
);

COMMENT ON TABLE public.vacancies IS 'Armazena informações sobre as vagas ou oportunidades de trabalho.';
COMMENT ON COLUMN public.vacancies.title IS 'Título principal da vaga.';
COMMENT ON COLUMN public.vacancies.company_name IS 'Nome da empresa que está oferecendo a vaga.';
COMMENT ON COLUMN public.vacancies.status IS 'Status atual da vaga (ex: open, closed, on_hold, filled).';

-- Função para atualizar automaticamente a coluna 'updated_at' na tabela vacancies
-- (Similar à que fizemos para profile_skills, mas para a tabela vacancies)
CREATE OR REPLACE FUNCTION public.handle_vacancy_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Gatilho (Trigger) que chama a função acima antes de qualquer atualização na tabela vacancies
CREATE TRIGGER on_vacancy_updated
    BEFORE UPDATE ON public.vacancies
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_vacancy_updated_at();

-- Tabela de Junção para Habilidades Requeridas pelas Vagas
CREATE TABLE public.vacancy_skills (
    vacancy_id INTEGER NOT NULL REFERENCES public.vacancies(id) ON DELETE CASCADE, -- Chave estrangeira para a tabela vacancies. Se a vaga for deletada, esta entrada também é.
    skill_id INTEGER NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE, -- Chave estrangeira para a tabela skills. Se a skill for deletada, esta entrada também é.
    required_proficiency_level INTEGER CHECK (required_proficiency_level >= 1 AND required_proficiency_level <= 5), -- Nível de proficiência esperado para a skill na vaga
    is_mandatory BOOLEAN DEFAULT TRUE, -- Indica se a skill é obrigatória (TRUE) ou apenas desejável (FALSE)
    created_at TIMESTAMPTZ DEFAULT NOW(), -- Data de criação do requisito da skill para a vaga
    PRIMARY KEY (vacancy_id, skill_id) -- Define que a combinação de vaga e skill deve ser única
);

COMMENT ON TABLE public.vacancy_skills IS 'Relaciona vagas com as habilidades requeridas e o nível de proficiência esperado.';
COMMENT ON COLUMN public.vacancy_skills.required_proficiency_level IS 'Nível de proficiência esperado para a skill na vaga (ex: 1-5).';
COMMENT ON COLUMN public.vacancy_skills.is_mandatory IS 'Indica se a skill é obrigatória (TRUE) ou apenas desejável (FALSE) para a vaga.';