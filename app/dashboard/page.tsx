import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1>No tienes acceso a esta página</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Bienvenido, {session.user?.name}!</h1>
      <p>Tu email es: {session.user?.email}</p>
      <p>Este es tu dashboard principal. 🎉</p>
    </div>
  );
}
