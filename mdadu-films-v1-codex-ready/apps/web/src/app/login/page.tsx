import { AuthPage } from "@/components/auth-page";
export const metadata = {
  title: "Sign In",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <AuthPage mode="login" />;
}
