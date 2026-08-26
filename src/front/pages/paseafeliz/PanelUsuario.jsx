import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    const [user, setUser] = useState(null);
    const [adminUsers, setAdminUsers] = useState([]);
    const [walkers, setWalkers] = useState([]);

    useEffect(() => {
        const savedUser = localStorage.getItem("paseafeliz_user");
        if (!savedUser) {
            navigate("/login", { replace: true });
            return;
        }
        const currentUser = JSON.parse(savedUser);
        setUser(currentUser);
        if (currentUser.role === "admin") fetch("/api/users").then((response) => response.json()).then(setAdminUsers).catch(() => setAdminUsers([]));
        if (currentUser.role === "paseador") fetch("/api/walkers").then((response) => response.json()).then(setWalkers).catch(() => setWalkers([]));
    }, [navigate]);

    const logout = () => {
        localStorage.removeItem("paseafeliz_user");
        navigate("/login", { replace: true });
    };

    if (!user) return null;
    const content = roleContent[user.role] || roleContent.cliente;

    return (
        <main className="pf-dashboard">
            <header className="pf-dashboard-header"><Link className="pf-logo" to="/"><i className="fas fa-paw" /> PaseaFeliz</Link><div><span className="pf-dashboard-user">{user.email} · {labels[user.role]}</span><button className="pf-auth-back" type="button" onClick={logout}>Cerrar sesión</button></div></header>
            <section className="pf-dashboard-content"><span className="pf-auth-kicker">PANEL DE {labels[user.role].toUpperCase()}</span><h1>{content.title}</h1><p className="pf-auth-intro">{content.intro}</p><div className="pf-dashboard-grid">{content.cards.map(([title, description, action], index) => <article className="pf-dashboard-card" key={title}><i className="fas fa-paw" /><h2>{title}</h2><p>{description}</p>{user.role === "paseador" && index === 0 ? <Link to="/perfil-paseador" className="pf-button pf-button-green">Configurar o modificar perfil</Link> : <span className="pf-dashboard-status">{user.role === "paseador" ? "Disponible desde el perfil" : action}</span>}</article>)}</div>{user.role === "admin" && <p className="pf-dashboard-data">Usuarios registrados: <strong>{adminUsers.length}</strong></p>}{user.role === "paseador" && <p className="pf-dashboard-data">Perfiles de paseador publicados: <strong>{walkers.length}</strong></p>}</section>
        </main>
    );
};
