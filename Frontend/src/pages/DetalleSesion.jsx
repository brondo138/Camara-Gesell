import { useParams } from "react-router-dom"

export default function DetalleSesion() {
  const { id } = useParams()

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">
        Detalle de sesión
      </h1>

      <p className="text-slate-500 mt-2">
        Sesión ID: {id}
      </p>
    </div>
  )
}