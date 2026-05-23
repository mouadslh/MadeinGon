import { api } from "@/lib/api";
import { postFormData } from "@/lib/upload";

/** Upload produit → FastAPI → Cloudinary (dossier madeingoun/products). */
export async function uploadProductImageToCloudinary(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const data = await postFormData<{ url: string }>("/products/upload-image", form);
  if (!data?.url?.startsWith("http")) {
    throw new Error("Cloudinary upload failed: no URL returned");
  }
  return data.url;
}

/** Upload CIN → FastAPI → Cloudinary (dossier madeingoun/cin). */
export async function uploadCinToCloudinary(
  file: File,
  sellerProfileId?: string | null
): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const path = sellerProfileId
    ? `/sellers/${sellerProfileId}/upload-cin`
    : "/sellers/me/upload-cin";
  const data = await postFormData<{ cin_url: string }>(path, form);
  if (!data?.cin_url?.startsWith("http")) {
    throw new Error("Cloudinary CIN upload failed");
  }
  return data.cin_url;
}
