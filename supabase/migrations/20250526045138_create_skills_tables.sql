-- Tabela para Categorias de Habilidades
CREATE TABLE public.skill_categories (
    id SERIAL PRIMARY KEY, -- Identificador único autoincrementável
    name TEXT NOT NULL UNIQUE, -- Nome da categoria (ex: "Linguagens de Programação"), não pode repetir
    created_at TIMESTAMPTZ DEFAULT NOW() -- Data e hora de criação
);

COMMENT ON TABLE public.skill_categories IS 'Categorias para agrupar habilidades (ex: Linguagens, Ferramentas, Soft Skills).';

-- Tabela para Habilidades
CREATE TABLE public.skills (
    id SERIAL PRIMARY KEY, -- Identificador único autoincrementável
    name TEXT NOT NULL UNIQUE, -- Nome da habilidade (ex: "JavaScript"), não pode repetir
    description TEXT, -- Descrição opcional da habilidade
    category_id INTEGER REFERENCES public.skill_categories(id) ON DELETE SET NULL, -- Chave estrangeira para skill_categories. Se a categoria for deletada, este campo fica nulo.
    aliases TEXT[], -- Array de textos para sinônimos ou abreviações (ex: {"JS", "ECMAScript"} para JavaScript)
    created_at TIMESTAMPTZ DEFAULT NOW() -- Data e hora de criação
);

COMMENT ON TABLE public.skills IS 'Habilidades técnicas e comportamentais.';
COMMENT ON COLUMN public.skills.aliases IS 'Sinônimos ou formas alternativas de referenciar a skill.';

-- Tabela de Junção para Habilidades dos Perfis (Usuários/Candidatos da tabela "profiles")
CREATE TABLE public.profile_skills (
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- Chave estrangeira para a tabela profiles. Se o perfil for deletado, esta entrada também é.
    skill_id INTEGER NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE, -- Chave estrangeira para a tabela skills. Se a skill for deletada, esta entrada também é.
    proficiency_level INTEGER CHECK (proficiency_level >= 1 AND proficiency_level <= 5), -- Nível de proficiência, ex: 1 (Básico) a 5 (Especialista)
    experience_years INTEGER CHECK (experience_years >= 0), -- Anos de experiência (opcional)
    source_of_assessment TEXT, -- Como esta skill/proficiência foi determinada (ex: 'auto_declarado', 'parse_cv_ai', 'avaliacao_ativa')
    created_at TIMESTAMPTZ DEFAULT NOW(), -- Data e hora de criação do relacionamento
    updated_at TIMESTAMPTZ DEFAULT NOW(), -- Data e hora da última atualização
    PRIMARY KEY (profile_id, skill_id) -- Define que a combinação de perfil e skill deve ser única
);

COMMENT ON TABLE public.profile_skills IS 'Relaciona perfis com habilidades e armazena o nível de proficiência.';
COMMENT ON COLUMN public.profile_skills.proficiency_level IS 'Nível de proficiência, por exemplo, em uma escala de 1 (Iniciante) a 5 (Especialista).';
COMMENT ON COLUMN public.profile_skills.experience_years IS 'Número de anos de experiência com a habilidade.';
COMMENT ON COLUMN public.profile_skills.source_of_assessment IS 'Origem da avaliação da skill (ex: auto-declarado, IA do currículo, avaliação).';

-- Função para atualizar automaticamente a coluna 'updated_at' na tabela profile_skills
CREATE OR REPLACE FUNCTION public.update_profile_skill_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Gatilho (Trigger) que chama a função acima antes de qualquer atualização na tabela profile_skills
CREATE TRIGGER handle_profile_skill_updated_at
    BEFORE UPDATE ON public.profile_skills
    FOR EACH ROW
    EXECUTE FUNCTION public.update_profile_skill_updated_at_column();