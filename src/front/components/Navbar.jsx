import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Navbar = () => {
	const { store, dispatch } = useGlobalReducer();
	const isAuthenticated = Boolean(store.auth?.isAuthenticated);
	const role = store.auth?.role;

	const handleLogout = () => {
		localStorage.removeItem("paseafeliz_user");
		localStorage.removeItem("paseafeliz_token");
		dispatch({ type: "logout" });
	};

	return (
		<nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
			<div className="container">
				<Link to="/" className="navbar-brand fw-bold text-primary">
					PaseaFeliz
				</Link>

				<div className="navbar-nav ms-auto d-flex flex-row gap-3 align-items-center">
					<Link to="/" className="nav-link">Inicio</Link>
					<Link to="/reservar" className="nav-link">Reservar</Link>
					<Link to="/paseafeliz" className="nav-link">PaseaFeliz</Link>

					{role === "paseador" && (
						<Link to="/perfil-paseador" className="nav-link">Perfil</Link>
					)}

					{isAuthenticated ? (
						<>
							<Link to="/panel" className="nav-link">Panel</Link>
							<button
								type="button"
								className="btn btn-outline-secondary btn-sm"
								onClick={handleLogout}
							>
								Cerrar sesión
							</button>
						</>
					) : (
						<>
							<Link to="/login" className="btn btn-primary btn-sm">Login</Link>
							<Link to="/registro" className="btn btn-outline-primary btn-sm">Registro</Link>
						</>
					)}
				</div>
			</div>
		</nav>
	);
};