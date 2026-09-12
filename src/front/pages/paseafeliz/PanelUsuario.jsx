import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import "./index1.css";

const labels = { cliente: "Cliente", paseador: "Paseador", admin: "Administrador" };

const roleContent = {
    cliente: {
        title: "Encuentra el cuidado ideal",
        intro: "Gestiona tus mascotas y reserva sus próximos paseos.",
        cards: [["Mis mascotas", "Añade los datos, necesidades y rutinas de tus compañeros.", "Próximamente"], ["Mis reservas", "Consulta tus paseos activos y el historial de servicios.", "Próximamente"], ["Explorar servicios", "Descubre paseadores disponibles en tu zona.", "Ver servicios"]],
    },
    paseador: {
        title: "Organiza tu jornada",
        intro: "Completa tu perfil y configura cuándo puedes recibir paseos.",
        cards: [["Mi perfil", "Presenta tu experiencia, servicios y tipos de mascota.", "Completar perfil"], ["Disponibilidad", "Define tus días y horarios de atención.", "Configurar horarios"], ["Mis servicios", "Gestiona tus zonas y precios por servicio.", "Gestionar servicios"]],
    },
    admin: {
        title: "Control de PaseaFeliz",
        intro: "Supervisa usuarios, paseadores y el catálogo de la plataforma.",
        cards: [["Usuarios", "Revisa las cuentas registradas y sus roles.", "Ver usuarios"], ["Catálogo", "Administra servicios, zonas y tipos de mascota.", "Gestionar catálogo"], ["Paseadores", "Consulta perfiles y disponibilidad publicados.", "Ver paseadores"]],
    },
};

export const PanelUsuario = () => {
    const navigate = useNavigate();
    const { dispatch } = useGlobalReducer();
    const [user, setUser] = useState(null);
    const [adminUsers, setAdminUsers] = useState([]);
    const [walkers, setWalkers] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [reservationsLoading, setReservationsLoading] = useState(false);

    useEffect(() => {
        const savedUser = localStorage.getItem("paseafeliz_user");
        const savedToken = localStorage.getItem("paseafeliz_token");

        if (!savedUser || !savedToken) {
            dispatch({ type: "logout" });
            navigate("/login", { replace: true });
            return;
        }

        const validateSession = async () => {
            try {
                const response = await fetch("/api/me", {
                    headers: {
                        Authorization: `Bearer ${savedToken}`,
                    },
                });

                if (!response.ok) throw new Error("Sesión no válida");

                const data = await response.json();
                const currentUser = data.user;
                localStorage.setItem("paseafeliz_user", JSON.stringify(currentUser));
                dispatch({ type: "login_success", payload: { user: currentUser, token: savedToken } });
                setUser(currentUser);

                if (currentUser.role === "admin") {
                    fetch("/api/users", {
                        headers: { Authorization: `Bearer ${savedToken}` },
                    })
                        .then((response) => response.json())
                        .then(setAdminUsers)
                        .catch(() => setAdminUsers([]));
                }

                if (currentUser.role === "paseador") {
                    fetch("/api/walkers", {
                        headers: { Authorization: `Bearer ${savedToken}` },
                    })
                        .then((response) => response.json())
                        .then(setWalkers)
                        .catch(() => setWalkers([]));
                }

                setReservationsLoading(true);
                fetch("/api/reservations", {
                    headers: { Authorization: `Bearer ${savedToken}` },
                })
                    .then((reservationsResponse) => {
                        if (!reservationsResponse.ok) throw new Error("No se pudieron cargar las reservas");
                        return reservationsResponse.json();
                    })
                    .then(setReservations)
                    .catch(() => setReservations([]))
                    .finally(() => setReservationsLoading(false));
            } catch {
                localStorage.removeItem("paseafeliz_user");
                localStorage.removeItem("paseafeliz_token");
                dispatch({ type: "logout" });
                navigate("/login", { replace: true });
            }
        };

        validateSession();
    }, [dispatch, navigate]);

    const logout = () => {
        localStorage.removeItem("paseafeliz_user");
        localStorage.removeItem("paseafeliz_token");
        dispatch({ type: "logout" });
        navigate("/login", { replace: true });
    };

    if (!user) return null;
    const content = roleContent[user.role] || roleContent.cliente;
    const reservationTitle = user.role === "paseador" ? "Paseos asignados" : user.role === "admin" ? "Todas las reservas" : "Mis reservas";

    return (
        <main className="pf-dashboard">
            <header className="pf-dashboard-header"><Link className="pf-logo" to="/"><i className="fas fa-paw" /> PaseaFeliz</Link><div><span className="pf-dashboard-user">{user.email} · {labels[user.role]}</span><button className="pf-auth-back" type="button" onClick={logout}>Cerrar sesión</button></div></header>
            <section className="pf-dashboard-content"><span className="pf-auth-kicker">PANEL DE {labels[user.role].toUpperCase()}</span><h1>{content.title}</h1><p className="pf-auth-intro">{content.intro}</p><div className="pf-dashboard-grid">{content.cards.map(([title, description, action], index) => <article className="pf-dashboard-card" key={title}><i className="fas fa-paw" /><h2>{title}</h2><p>{description}</p>{user.role === "paseador" && index === 0 ? <Link to="/perfil-paseador" className="pf-button pf-button-green">Configurar o modificar perfil</Link> : <span className="pf-dashboard-status">{user.role === "paseador" ? "Disponible desde el perfil" : action}</span>}</article>)}</div>{user.role === "admin" && <p className="pf-dashboard-data">Usuarios registrados: <strong>{adminUsers.length}</strong></p>}{user.role === "paseador" && <p className="pf-dashboard-data">Perfiles de paseador publicados: <strong>{walkers.length}</strong></p>}<section className="pf-reservations" aria-labelledby="reservations-title"><div className="pf-dashboard-section-heading"><div><span className="pf-auth-kicker">ACTIVIDAD</span><h2 id="reservations-title">{reservationTitle}</h2></div><strong>{reservations.length}</strong></div>{reservationsLoading ? <p className="pf-dashboard-empty">Cargando reservas...</p> : reservations.length === 0 ? <p className="pf-dashboard-empty">Todavía no hay reservas registradas.</p> : <div className="pf-reservation-list">{reservations.map((reservation) => <article className="pf-reservation-item" key={reservation.id}><div><strong>{reservation.service?.name || "Servicio"}</strong><span>{reservation.reservation_date} · {reservation.reservation_time.slice(0, 5)}</span></div><div><span>{user.role === "paseador" ? `Cliente: ${reservation.client?.email || "Sin email"}` : user.role === "admin" ? `Cliente: ${reservation.client?.email || "Sin email"} · Paseador: ${reservation.walker?.full_name || "Sin perfil"}` : `Paseador: ${reservation.walker?.full_name || "Sin perfil"}`}</span><small>{reservation.service?.duration_minutes || 0} min · {reservation.status}</small></div></article>)}</div>}</section></section>
        </main>
    );
};
