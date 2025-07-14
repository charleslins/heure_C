import { createClient } from "@supabase/supabase-js";

// ATENÇÃO: Substitua pelas suas credenciais reais do Supabase!
// 1. Vá para o painel do seu projeto no Supabase (supabase.com).
// 2. Navegue até "Project Settings" (ícone de engrenagem) -> "API".
// 3. Copie a "Project URL" e cole no lugar de 'COLOQUE_A_SUA_URL_DO_SUPABASE_AQUI' abaixo.
// 4. Copie a chave "anon" "public" (em Project API Keys) e cole no lugar de 'COLOQUE_A_SUA_CHAVE_ANON_PUBLICA_AQUI' abaixo.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug detalhado
console.log("=== DIAGNÓSTICO SUPABASE ===");
console.log("URL:", supabaseUrl);
console.log("URL válida:", supabaseUrl?.startsWith("https://"));
console.log("Key existe:", !!supabaseAnonKey);
console.log("Key válida:", supabaseAnonKey?.startsWith("eyJ"));
console.log("===========================");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Credenciais do Supabase não encontradas!");
  console.error("Verifique se o arquivo .env existe e contém:");
  console.error("VITE_SUPABASE_URL=sua_url_aqui");
  console.error("VITE_SUPABASE_ANON_KEY=sua_chave_aqui");
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file.",
  );
}

// Validar formato da URL
if (
  !supabaseUrl.startsWith("https://") ||
  !supabaseUrl.includes(".supabase.co")
) {
  console.error("❌ URL do Supabase inválida:", supabaseUrl);
  throw new Error(
    "Invalid Supabase URL format. Should be: https://[project-id].supabase.co",
  );
}

// Validar formato da chave
if (!supabaseAnonKey.startsWith("eyJ")) {
  console.error("❌ Chave do Supabase inválida (deve começar com eyJ)");
  throw new Error("Invalid Supabase key format");
}

// A seção de alerta/erro foi removida pois as credenciais foram configuradas.

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Teste de conectividade mais detalhado
console.log("🔄 Testando conectividade com Supabase...");

// Teste 1: Verificar se o cliente foi criado
console.log("✅ Cliente Supabase criado");

// Teste 2: Tentar obter sessão
supabase.auth
  .getSession()
  .then(({ data, error }) => {
    if (error) {
      console.error("❌ Erro ao obter sessão:", error);
      console.error("Detalhes do erro:", {
        message: error.message,
        status: error.status,
        name: error.name,
      });
    } else {
      console.log("✅ Conexão com Supabase estabelecida com sucesso!");
      console.log("Sessão atual:", data.session ? "Ativa" : "Nenhuma");
    }
  })
  .catch((error) => {
    console.error("❌ Erro crítico ao conectar com Supabase:", error);
  });

// Teste 3: Verificar se o projeto está acessível
fetch(`${supabaseUrl}/rest/v1/`, {
  method: "GET",
  headers: {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${supabaseAnonKey}`,
  },
})
  .then((response) => {
    console.log("🌐 Teste de API REST:", response.status, response.statusText);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.text();
  })
  .then((data) => {
    console.log("✅ API REST acessível");
  })
  .catch((error) => {
    console.error("❌ Erro ao acessar API REST:", error);
    console.error("Possíveis causas:");
    console.error("- Projeto Supabase pausado");
    console.error("- Credenciais incorretas");
    console.error("- Problemas de rede/CORS");
    console.error("- URL incorreta");
  });
