import TablaDisponibilidad from '@/components/TablaDisponibilidad';

export default function Page() {
  return (
    <main className="p-4 bg-white">
      <h1 className="text-xl  text-[#2C3639]  font-bold mb-4">Disponibilidad mensual</h1>
      <TablaDisponibilidad />
    </main>
  );
}
