import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayoutLogin";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Iniciar sesión | ScholarHub UNET"
        description="Accede a ScholarHub para administrar tus recursos, préstamos e investigaciones."
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
