import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./index1.css";

export const Registro = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "", role: "cliente" });
    const [status, setStatus] = useState({ loading: false, error: "", success: "" });

    const handleChange = ({ target }) => {
        setForm((current) => ({ ...current, [target.name]: target.value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setStatus({ loading: true, error: "", success: "" });

        try {
            const response = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "No se pudo crear la cuenta");
            if (form.role === "paseador") {
                localStorage.setItem("paseafeliz_user", JSON.stringify(data));
                navigate("/perfil-paseador");
                return;
            }
            setStatus({ loading: false, error: "", success: "Cuenta creada correctamente. Ya puedes iniciar sesión." });
            setForm({ email: "", password: "", role: "cliente" });
        } catch (error) {
            const message = error instanceof TypeError
                ? "No se puede conectar con el backend. Comprueba que Flask esté iniciado."
                : error.message;
            setStatus({ loading: false, error: message, success: "" });
        }
    };

    return (
        <main className="pf-auth-page">
            <section className="pf-auth-card" aria-labelledby="registro-title">
                <Link className="pf-logo" to="/"><i className="fas fa-paw" /> PaseaFeliz</Link>
                <span className="pf-auth-kicker">ÚNETE A NUESTRA COMUNIDAD</span>
                <h1 id="registro-title">Crea tu cuenta</h1>
                <p className="pf-auth-intro">Empieza a cuidar mejor a tu mascota o únete como paseador.</p>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="role">Quiero registrarme como</label>
                    <select id="role" name="role" value={form.role} onChange={handleChange}>
                        <option value="cliente">Cliente</option>
                        <option value="paseador">Paseador</option>
                    </select>
                    <label htmlFor="email">Correo electrónico</label>
                    <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="tu@email.com" required />
                    <label htmlFor="password">Contraseña</label>
                    <input id="password" name="password" type="password" value={form.password} onChange={handleChange} minLength="6" placeholder="Mínimo 6 caracteres" required />
                    {status.error && <p className="pf-form-message pf-form-error" role="alert">{status.error}</p>}
                    {status.success && <p className="pf-form-message pf-form-success" role="status">{status.success} <Link to="/login">Iniciar sesión</Link></p>}
                    <button className="pf-button pf-button-orange pf-submit" type="submit" disabled={status.loading}>
                        {status.loading ? "Creando cuenta..." : "Crear cuenta"}
                    </button>
                </form>
                <button className="pf-auth-back" type="button" onClick={() => navigate(-1)}>Volver</button>
            </section>
        </main>
    );
};
