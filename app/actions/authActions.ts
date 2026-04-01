"use server";

import { createSession, clearSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .maybeSingle();

  if (error) {
    return { error: `Database error: ${error.message}` };
  }

  if (!data) {
    return { error: "Username atau password salah." };
  }

  // Basic RBAC: If there's no role column, default to superadmin for 'superadmin', else 'admin'
  const role = data.role || (data.username === 'superadmin' ? 'superadmin' : 'admin');
  
  await createSession({
    id: data.id,
    username: data.username,
    role: role
  });

  redirect("/admin/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/admin/login");
}
