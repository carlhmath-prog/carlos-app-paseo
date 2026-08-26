import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./index1.css";

export const Login = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "No se pudo iniciar sesión");
            localStorage.setItem("paseafeliz_user", JSON.stringify(data.user));
            navigate("/panel");
        } catch (requestError) {
            setError(requestError instanceof TypeError
                ? "No se puede conectar con el backend. Comprueba que Flask esté iniciado."
                : requestError.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="pf-auth-page">
            <section className="pf-auth-card" aria-labelledby="login-title">
                <Link className="pf-logo" to="/"><i className="fas fa-paw" /> PaseaFeliz</Link>
                <span className="pf-auth-kicker">BIENVENIDO DE NUEVO</span>
                <h1 id="login-title">Inicia sesión</h1>
                <p className="pf-auth-intro">Accede a tu espacio de PaseaFeliz.</p>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="login-email">Correo electrónico</label>
                    <input id="login-email" type="email" value={form.email} onChange={({ target }) => setForm({ ...form, email: target.value })} placeholder="tu@email.com" required />
                    <label htmlFor="login-password">Contraseña</label>
                    <input id="login-password" type="password" value={form.password} onChange={({ target }) => setForm({ ...form, password: target.value })} placeholder="Tu contraseña" required />
                    {error && <p className="pf-form-message pf-form-error" role="alert">{error}</p>}
                    <button className="pf-button pf-button-orange pf-submit" type="submit" disabled={loading}>{loading ? "Entrando..." : "Iniciar sesión"}</button>
                </form>
                <p className="pf-auth-switch">¿Aún no tienes cuenta? <Link to="/registro">Regístrate</Link></p>
            </section>
        </main>
    );
};
