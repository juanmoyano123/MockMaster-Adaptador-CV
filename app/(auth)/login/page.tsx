import { Suspense } from 'react';
import AuthLayout from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Iniciar Sesion - MockMaster',
  description: 'Inicia sesion en tu cuenta de MockMaster',
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Inicia Sesion"
      subtitle="Bienvenido de vuelta. Ingresa tus credenciales para continuar."
    >
      <Suspense fallback={<div className="text-center py-8 text-slate-600">Cargando...</div>}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
