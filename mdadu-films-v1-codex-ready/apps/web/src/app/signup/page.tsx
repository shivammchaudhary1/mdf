import { AuthPage } from "@/components/auth-page";
export const metadata = {
  title: "Create Account",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <AuthPage mode="signup" />;
}
