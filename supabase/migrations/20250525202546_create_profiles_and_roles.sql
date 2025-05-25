-- 1. Cria a tabela para guardar os perfis dos usuários
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY, -- Chave primária, corresponde ao id do usuário em auth.users
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'collaborator' -- Define 'collaborator' como o papel padrão
);

-- 2. Define as regras de segurança para a tabela de perfis
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 3. Função para criar um perfil automaticamente quando um novo usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Gatilho (Trigger) que chama a função acima sempre que um novo usuário é criado na tabela auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();