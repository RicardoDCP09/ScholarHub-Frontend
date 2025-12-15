import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayoutRegister";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Crear cuenta | ScholarHub UNET"
        description="Regístrate en ScholarHub para gestionar préstamos, tesis y recursos académicos."
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
