import { AuthPage } from "@/components/auth-page";
export const metadata = {
  title: "Reset Password",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <AuthPage mode="reset-password" />;
}
