import AuthLayout from '@/components/auth/AuthLayout';
import SignupForm from '@/components/auth/SignupForm';

export const metadata = {
  title: 'Crear Cuenta - MockMaster',
  description: 'Crea tu cuenta en MockMaster y comienza a adaptar tu CV',
};

export default function SignupPage() {
  return (
    <AuthLayout
      title="Crear Cuenta"
      subtitle="Registrate para guardar tus CVs y acceder desde cualquier dispositivo."
    >
      <SignupForm />
    </AuthLayout>
  );
}
