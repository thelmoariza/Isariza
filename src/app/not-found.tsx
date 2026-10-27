import Link from "next/link";
export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-script text-4xl text-oliva">Este frasco no está en la alacena</p>
      <h1 className="h-section mt-2">Página no encontrada</h1>
      <Link href="/tienda" className="btn-primary mt-8 inline-block">Ir a la tienda</Link>
    </div>
  );
}
