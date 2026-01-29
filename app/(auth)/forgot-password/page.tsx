import AuthLayout from '@/components/auth/AuthLayout';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export const metadata = {
  title: 'Recuperar Contrasena - MockMaster',
  description: 'Recupera tu contrasena de MockMaster',
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Recuperar Contrasena"
      subtitle="No te preocupes, te ayudamos a recuperar el acceso a tu cuenta."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
