import { supabase } from "./supabase";

export async function signUp(email, password) {
  return supabase.auth.signUp({ email, password });
}

export async function signIn(email, password) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getProfile(userId) {
  return supabase.from("profiles").select("*").eq("id", userId).single();
}

export async function updateProfile(userId, updates) {
  return supabase.from("profiles").update(updates).eq("id", userId).select().single();
}
