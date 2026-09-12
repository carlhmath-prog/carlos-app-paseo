import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Home = () => {
	const { store } = useGlobalReducer();

	const userName = store.auth?.user?.email || "invitado";
	const isAuthenticated = Boolean(store.auth?.isAuthenticated);

	return (
		<div className="container py-5">
			<div className="card shadow-sm border-0">
				<div className="card-body p-4 p-md-5">
					<span className="badge bg-success-subtle text-success-emphasis mb-3">
						PaseaFeliz
					</span>
					<h1 className="display-5 fw-bold mb-3">Tu mejor experiencia de paseo, organizada.</h1>
					<p className="lead text-secondary mb-4">
						Gestiona reservas, revisa paseadores disponibles y controla tu perfil desde un solo lugar.
					</p>

					<div className="d-flex flex-wrap gap-2 mb-4">
						<Link to="/login" className="btn btn-primary">
							{isAuthenticated ? "Ir al panel" : "Iniciar sesión"}
						</Link>
						<Link to="/registro" className="btn btn-outline-primary">
							Crear cuenta
						</Link>
						<Link to="/reservar" className="btn btn-outline-secondary">
							Reservar paseo
						</Link>
					</div>

					<div className="border rounded p-3 bg-light-subtle">
						<p className="mb-1"><strong>Estado actual:</strong></p>
						<p className="mb-1">
							{isAuthenticated
								? `Sesión activa para ${userName}`
								: "Sin sesión activa en este momento"}
						</p>
						<p className="mb-0 text-secondary">
							{store.walkers?.length
								? `${store.walkers.length} paseadores disponibles en el catálogo.`
								: "El catálogo aún no se ha cargado desde el backend."}
						</p>
					</div>

					{store.ui?.error && (
						<div className="alert alert-danger mt-4 mb-0">
							{store.ui.error}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};