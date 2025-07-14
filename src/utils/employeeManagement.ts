import { supabase } from "./supabaseClient";

// Tipos para as novas entidades
export interface Canton {
  id: number;
  name: string;
  code: string;
  created_at?: string;
}

export interface Municipality {
  id: number;
  name: string;
  canton_id: number;
  postal_code?: string;
  created_at?: string;
}

export interface RegionalHoliday {
  id: number;
  name: string;
  date: string;
  holiday_type: "national" | "cantonal" | "municipal";
  canton_id?: number;
  municipality_id?: number;
  is_recurring: boolean;
  created_at?: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  canton_id?: number;
  municipality_id?: number;
  employee_id?: string;
  hire_date?: string;
  position?: string;
  work_schedule?: any;
  photo_url?: string;
}

export interface CreateEmployeeData {
  name: string;
  email: string;
  password: string;
  role?: "user" | "admin";
  canton_id: number;
  municipality_id?: number;
  employee_id?: string;
  hire_date?: string;
  position?: string;
  work_schedule?: any;
}

export interface UpdateEmployeeData {
  name?: string;
  role?: "user" | "admin";
  canton_id?: number;
  municipality_id?: number;
  employee_id?: string;
  hire_date?: string;
  position?: string;
  work_schedule?: any;
}

// === CANTÕES ===
export const loadCantons = async (): Promise<Canton[]> => {
  const { data, error } = await supabase
    .from("cantons")
    .select("*")
    .order("name");

  if (error) {
    console.error("Erro ao carregar cantões:", error);
    return [];
  }

  return data || [];
};

// === MUNICÍPIOS ===
export const loadMunicipalities = async (
  cantonId?: number,
): Promise<Municipality[]> => {
  let query = supabase.from("municipalities").select("*").order("name");

  if (cantonId) {
    query = query.eq("canton_id", cantonId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao carregar municípios:", error);
    return [];
  }

  return data || [];
};

// === FERIADOS REGIONAIS ===
export const loadRegionalHolidays = async (
  cantonId?: number,
  municipalityId?: number,
  year?: number,
): Promise<RegionalHoliday[]> => {
  let query = supabase.from("regional_holidays").select("*").order("date");

  // Filtrar por ano se especificado
  if (year) {
    query = query.gte("date", `${year}-01-01`).lte("date", `${year}-12-31`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao carregar feriados regionais:", error);
    return [];
  }

  // Filtrar feriados relevantes para a região
  const filteredHolidays = (data || []).filter((holiday) => {
    if (holiday.holiday_type === "national") return true;
    if (holiday.holiday_type === "cantonal" && holiday.canton_id === cantonId)
      return true;
    if (
      holiday.holiday_type === "municipal" &&
      holiday.canton_id === cantonId &&
      holiday.municipality_id === municipalityId
    )
      return true;
    return false;
  });

  return filteredHolidays;
};

// === FUNCIONÁRIOS ===
export const createEmployee = async (
  employeeData: CreateEmployeeData,
): Promise<{
  success: boolean;
  error?: any;
  message?: string;
  userId?: string;
}> => {
  try {
    // Verificar se employee_id já existe (se fornecido)
    if (employeeData.employee_id && employeeData.employee_id.trim() !== "") {
      const { data: existingEmployee, error: checkError } = await supabase
        .from("profiles")
        .select("id, employee_id")
        .eq("employee_id", employeeData.employee_id.trim())
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Erro ao verificar employee_id:", checkError);
        return {
          success: false,
          error: checkError,
          message: "Erro ao verificar ID do funcionário",
        };
      }

      if (existingEmployee) {
        return {
          success: false,
          message: `O ID "${employeeData.employee_id}" já está em uso. Escolha um ID diferente ou deixe em branco.`,
        };
      }
    }

    // Limpar employee_id se estiver vazio
    const cleanEmployeeId =
      employeeData.employee_id && employeeData.employee_id.trim() !== ""
        ? employeeData.employee_id.trim()
        : undefined;

    // 1. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: employeeData.email,
      password: employeeData.password,
      options: {
        data: {
          name: employeeData.name,
          role: employeeData.role || "user",
          canton_id: employeeData.canton_id,
          municipality_id: employeeData.municipality_id,
          employee_id: cleanEmployeeId,
          hire_date: employeeData.hire_date,
          position: employeeData.position,
          work_schedule: employeeData.work_schedule,
        },
      },
    });

    if (authError) {
      console.error("Erro ao criar usuário:", authError);

      // Tratar erro específico de email já existente
      if (authError.message.includes("already registered")) {
        return {
          success: false,
          message: "Este email já está registrado no sistema.",
        };
      }

      return {
        success: false,
        error: authError,
        message: authError.message,
      };
    }

    // O perfil será criado automaticamente pelo trigger
    return {
      success: true,
      message: "Funcionário criado com sucesso!",
      userId: authData.user?.id,
    };
  } catch (error) {
    console.error("Erro ao criar funcionário:", error);
    return {
      success: false,
      error,
      message: "Erro inesperado ao criar funcionário",
    };
  }
};

export const loadEmployees = async (): Promise<Employee[]> => {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      name,
      email,
      role,
      canton_id,
      municipality_id,
      employee_id,
      hire_date,
      position,
      work_schedule,
      photo_url
    `,
    )
    .order("name");

  if (error) {
    console.error("Erro ao carregar funcionários:", error);
    return [];
  }

  return data || [];
};

export const updateEmployee = async (
  userId: string,
  updates: Partial<Employee>,
): Promise<{ success: boolean; error?: any; message?: string }> => {
  try {
    // Se estamos atualizando employee_id, verificar se já existe outro funcionário com esse ID
    if (updates.employee_id) {
      const { data: existingEmployee, error: checkError } = await supabase
        .from("profiles")
        .select("id, employee_id")
        .eq("employee_id", updates.employee_id)
        .neq("id", userId) // Excluir o próprio funcionário da verificação
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Erro ao verificar employee_id:", checkError);
        return {
          success: false,
          error: checkError,
          message: "Erro ao verificar ID do funcionário",
        };
      }

      if (existingEmployee) {
        return {
          success: false,
          message: `O ID "${updates.employee_id}" já está em uso por outro funcionário. Escolha um ID diferente.`,
        };
      }
    }

    // Se employee_id estiver vazio, definir como undefined para evitar conflitos
    const cleanUpdates = { ...updates };
    if (cleanUpdates.employee_id === "") {
      cleanUpdates.employee_id = undefined;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        ...cleanUpdates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("Erro ao atualizar funcionário:", error);

      // Tratar erro específico de chave duplicada
      if (error.code === "23505" && error.message.includes("employee_id_key")) {
        return {
          success: false,
          message:
            "Este ID de funcionário já está em uso. Escolha um ID diferente ou deixe em branco.",
        };
      }

      return { success: false, error, message: error.message };
    }

    return { success: true, message: "Funcionário atualizado com sucesso!" };
  } catch (error) {
    console.error("Erro inesperado ao atualizar funcionário:", error);
    return {
      success: false,
      error,
      message: "Erro inesperado ao atualizar funcionário",
    };
  }
};

export const deleteEmployee = async (
  userId: string,
): Promise<{
  success: boolean;
  error?: any;
  message?: string;
}> => {
  try {
    // 1. Deletar do perfil
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      console.error("Erro ao deletar perfil:", profileError);
      return {
        success: false,
        error: profileError,
        message: profileError.message,
      };
    }

    // 2. Deletar do auth (requer privilégios de admin)
    // Nota: Isso pode requerer uma função de servidor ou RPC
    // Por enquanto, apenas deletamos o perfil

    return { success: true, message: "Funcionário removido com sucesso!" };
  } catch (error) {
    console.error("Erro ao deletar funcionário:", error);
    return {
      success: false,
      error,
      message: "Erro inesperado ao deletar funcionário",
    };
  }
};

// === FERIADOS ===
export const createRegionalHoliday = async (
  holiday: Omit<RegionalHoliday, "id" | "created_at">,
): Promise<{ success: boolean; error?: any; message?: string }> => {
  const { error } = await supabase.from("regional_holidays").insert([holiday]);

  if (error) {
    console.error("Erro ao criar feriado:", error);
    return { success: false, error, message: error.message };
  }

  return { success: true, message: "Feriado criado com sucesso!" };
};

export const updateRegionalHoliday = async (
  holidayId: number,
  updates: Partial<RegionalHoliday>,
): Promise<{ success: boolean; error?: any; message?: string }> => {
  const { error } = await supabase
    .from("regional_holidays")
    .update(updates)
    .eq("id", holidayId);

  if (error) {
    console.error("Erro ao atualizar feriado:", error);
    return { success: false, error, message: error.message };
  }

  return { success: true, message: "Feriado atualizado com sucesso!" };
};

export const deleteRegionalHoliday = async (
  holidayId: number,
): Promise<{
  success: boolean;
  error?: any;
  message?: string;
}> => {
  const { error } = await supabase
    .from("regional_holidays")
    .delete()
    .eq("id", holidayId);

  if (error) {
    console.error("Erro ao deletar feriado:", error);
    return { success: false, error, message: error.message };
  }

  return { success: true, message: "Feriado removido com sucesso!" };
};

// === UTILITÁRIOS ===
export const getEmployeeHolidays = async (
  employeeId: string,
  year?: number,
): Promise<RegionalHoliday[]> => {
  // Primeiro, obter os dados regionais do funcionário
  const { data: employee, error: employeeError } = await supabase
    .from("profiles")
    .select("canton_id, municipality_id")
    .eq("id", employeeId)
    .single();

  if (employeeError || !employee) {
    console.error("Erro ao obter dados do funcionário:", employeeError);
    return [];
  }

  // Carregar feriados relevantes para a região do funcionário
  return await loadRegionalHolidays(
    employee.canton_id,
    employee.municipality_id,
    year,
  );
};

export const importHolidaysFromAPI = async (
  year: number,
): Promise<{
  success: boolean;
  imported: number;
  error?: any;
  message?: string;
}> => {
  try {
    // Exemplo de importação de feriados suíços
    // Você pode usar APIs como feiertage-api.de ou outras
    const response = await fetch(
      `https://feiertage-api.de/api/?jahr=${year}&nur_land=CH`,
    );
    const holidays = await response.json();

    let imported = 0;
    for (const [name, date] of Object.entries(holidays)) {
      const result = await createRegionalHoliday({
        name,
        date: date as string,
        holiday_type: "national",
        is_recurring: false,
      });

      if (result.success) imported++;
    }

    return {
      success: true,
      imported,
      message: `${imported} feriados importados com sucesso!`,
    };
  } catch (error) {
    console.error("Erro ao importar feriados:", error);
    return {
      success: false,
      imported: 0,
      error,
      message: "Erro ao importar feriados da API",
    };
  }
};
