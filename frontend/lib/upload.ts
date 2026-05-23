import { api } from "./api";

/** POST multipart — ne pas fixer Content-Type (boundary axios). */
export async function postFormData<T>(path: string, form: FormData): Promise<T> {
  const { data } = await api.post<T>(path, form);
  return data;
}
