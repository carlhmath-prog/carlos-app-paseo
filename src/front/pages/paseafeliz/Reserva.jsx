import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./index1.css";

const walkerImages = [
    "photo-1500648767791-00dcc994a43e",
    "photo-1544005313-94ddf0286df2",
    "photo-1506794778202-cad84cf45f1d",
];

export const Reserva = () => {
    const navigate = useNavigate();
    const [walkers, setWalkers] = useState([]);
    const [services, setServices] = useState([]);
    const [selected, setSelected] = useState(0);
    const [form, setForm] = useState({ service_id: "", reservation_date: "", reservation_time: "" });
    const [status, setStatus] = useState({ loading: true, error: "", success: "" });

    useEffect(() => {
        const loadOptions = async () => {
            try {
                const [walkersResponse, servicesResponse] = await Promise.all([fetch("/api/walkers"), fetch("/api/services")]);
                if (!walkersResponse.ok || !servicesResponse.ok) throw new Error("No se pudieron cargar las opciones");
                const [walkersData, servicesData] = await Promise.all([walkersResponse.json(), servicesResponse.json()]);
                setWalkers(walkersData);
                setServices(servicesData);
                if (servicesData.length) setForm((current) => ({ ...current, service_id: String(servicesData[0].id) }));
                setStatus({ loading: false, error: "", success: "" });
            } catch (error) {
                setStatus({ loading: false, error: error.message, success: "" });
            }
        };
        loadOptions();
    }, []);

    useEffect(() => {
        const availableServices = walkers[selected]?.services || services;
        if (availableServices.length && !availableServices.some((service) => String(service.id) === form.service_id)) {
            setForm((current) => ({ ...current, service_id: String(availableServices[0].id) }));
        }
    }, [selected, walkers, services, form.service_id]);

    const moveWalker = (step) => {
        setSelected((current) => (current + step + walkers.length) % walkers.length);
    };

    const selectedWalker = walkers[selected];
    const walkerServices = selectedWalker?.services || services;

    const handleSubmit = async (event) => {
        event.preventDefault();
        const user = JSON.parse(localStorage.getItem("paseafeliz_user") || "null");
        if (!user || user.role !== "cliente") {
            navigate("/login");
            return;
        }
        setStatus({ loading: true, error: "", success: "" });
        try {
            const response = await fetch("/api/reservations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, client_id: user.id, walker_id: walkers[selected].id }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "No se pudo crear la reserva");
            setStatus({ loading: false, error: "", success: "Reserva creada correctamente" });
        } catch (error) {
            setStatus({ loading: false, error: error.message, success: "" });
        }
    };

    return (
        <main className="pf-booking-page">
            <header className="pf-dashboard-header"><Link className="pf-logo" to="/"><i className="fas fa-paw" /> PaseaFeliz</Link><Link className="pf-button pf-button-green" to="/panel">Mi panel</Link></header>
            <section className="pf-booking-content">
                <div className="pf-heading"><span className="pf-auth-kicker">RESERVA TU PASEO</span><h1>Elige a tu paseador</h1><p>Selecciona la persona ideal y el horario que mejor se adapte a tu mascota.</p></div>
                {status.loading && !walkers.length ? <p className="pf-booking-empty">Cargando paseadores...</p> : walkers.length === 0 ? <div className="pf-booking-empty"><h2>Aún no hay paseadores disponibles</h2><p>Cuando se publiquen perfiles podrás reservar tu paseo desde aquí.</p></div> : <>
                    <div className="pf-walker-carousel"><button className="pf-carousel-control" type="button" onClick={() => moveWalker(-1)} aria-label="Paseador anterior"><i className="fas fa-chevron-left" /></button><article className="pf-walker-card"><img src={`https://images.unsplash.com/${walkerImages[selected % walkerImages.length]}?auto=format&fit=crop&q=80&w=500`} alt={selectedWalker.full_name} /><div><span className="pf-label"><i className="fas fa-check-circle" /> PASEADOR VERIFICADO</span><h2>{selectedWalker.full_name}</h2><p>{selectedWalker.bio || "Paseador comprometido con el bienestar y la felicidad de tu mascota."}</p><span className="pf-walker-experience"><i className="fas fa-star" /> {selectedWalker.experience_years || 0} años de experiencia</span><div className="pf-walker-details"><strong>Servicios</strong><span>{selectedWalker.services?.map((service) => `${service.name} · ${service.price}€`).join(" | ") || "Consultar servicios"}</span><strong>Zonas</strong><span>{selectedWalker.zones?.map((zone) => zone.name).join(", ") || "Zona por confirmar"}</span><strong>Mascotas</strong><span>{selectedWalker.pet_types?.map((petType) => petType.name).join(", ") || "Consultar"}</span><strong>Horario</strong><span>{selectedWalker.availability?.map((item) => `${["D", "L", "M", "X", "J", "V", "S"][item.day_of_week]} ${item.start_time}-${item.end_time}`).join(" · ") || "Consultar disponibilidad"}</span></div></div></article><button className="pf-carousel-control" type="button" onClick={() => moveWalker(1)} aria-label="Paseador siguiente"><i className="fas fa-chevron-right" /></button></div><div className="pf-carousel-dots">{walkers.map((walker, index) => <button key={walker.id} className={index === selected ? "active" : ""} type="button" onClick={() => setSelected(index)} aria-label={`Elegir a ${walker.full_name}`} />)}</div>
                    <form className="pf-booking-form" onSubmit={handleSubmit}><h2>Completa tu reserva</h2><label htmlFor="service">Servicio</label><select id="service" value={form.service_id} onChange={({ target }) => setForm({ ...form, service_id: target.value })} required><option value="" disabled>Selecciona un servicio</option>{walkerServices.map((service) => <option key={service.id} value={service.id}>{service.name}{service.price ? ` · ${service.price}€` : ""}</option>)}</select><div className="pf-booking-fields"><div><label htmlFor="reservation-date">Fecha</label><input id="reservation-date" type="date" min={new Date().toISOString().split("T")[0]} value={form.reservation_date} onChange={({ target }) => setForm({ ...form, reservation_date: target.value })} required /></div><div><label htmlFor="reservation-time">Hora</label><input id="reservation-time" type="time" value={form.reservation_time} onChange={({ target }) => setForm({ ...form, reservation_time: target.value })} required /></div></div>{status.error && <p className="pf-form-message pf-form-error" role="alert">{status.error}</p>}{status.success && <p className="pf-form-message pf-form-success" role="status">{status.success}</p>}<button className="pf-button pf-button-orange pf-submit" type="submit" disabled={status.loading}>{status.loading ? "Guardando..." : "Confirmar reserva"}</button></form>
                </>}
            </section>
        </main>
    );
};
