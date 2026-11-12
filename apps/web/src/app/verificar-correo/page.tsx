import { AuthScreen } from "@/components/auth-form";
export const metadata = { title: "Verifica tu correo" };
export default function Page() {
  return <AuthScreen mode="verificar" />;
}
