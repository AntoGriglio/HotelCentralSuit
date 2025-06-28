import TablaDisponibilidad from '@/components/TablaDisponibilidad';

export default function Page() {
  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-4">Disponibilidad mensual</h1>
      <TablaDisponibilidad />
    </main>
  );
}
