import { Link } from "react-router-dom"

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold text-slate-800">
        404
      </h1>

      <p className="text-slate-500 mt-3">
        La página que buscas no existe.
      </p>

      <Link
        to="/dashboard"
        className="mt-6 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      >
        Volver al dashboard
      </Link>
    </div>
  )
}