import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./index1.css";

export const PerfilPaseador = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("paseafeliz_user") || "null");
    const [form, setForm] = useState({ full_name: "", phone: "", bio: "", experience_years: "" });
    const [catalogs, setCatalogs] = useState({ services: [], zones: [], petTypes: [] });
    const [settings, setSettings] = useState({ services: [], zone_ids: [], pet_type_ids: [], availability: [{ day_of_week: "1", start_time: "09:00", end_time: "17:00" }] });
    const [status, setStatus] = useState({ loading: true, error: "" });

    useEffect(() => {
        Promise.all([fetch("/api/services"), fetch("/api/zones"), fetch("/api/pet-types")])
            .then(async ([servicesResponse, zonesResponse, petTypesResponse]) => {
                if (![servicesResponse, zonesResponse, petTypesResponse].every((response) => response.ok)) throw new Error("No se pudieron cargar los catálogos");
                const [services, zones, petTypes] = await Promise.all([servicesResponse.json(), zonesResponse.json(), petTypesResponse.json()]);
                setCatalogs({ services, zones, petTypes });
                setStatus({ loading: false, error: "" });
            })
            .catch((error) => setStatus({ loading: false, error: error.message }));
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!user || user.role !== "paseador") {
            navigate("/login");
            return;
        }
        setStatus({ loading: true, error: "" });
        try {
            const response = await fetch("/api/walkers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, user_id: user.id, experience_years: Number(form.experience_years || 0) }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "No se pudo guardar el perfil");
            const settingsResponse = await fetch(`/api/walkers/${data.id}/settings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });
            const settingsData = await settingsResponse.json();
            if (!settingsResponse.ok) throw new Error(settingsData.message || "No se pudo guardar la configuración");
            navigate("/panel");
        } catch (error) {
            setStatus({ loading: false, error: error.message });
        }
    };

    if (!user) return null;

    const toggleId = (key, id) => setSettings((current) => ({
        ...current,
        [key]: current[key].includes(id) ? current[key].filter((item) => item !== id) : [...current[key], id],
    }));

    const updateAvailability = (index, field, value) => setSettings((current) => ({
        ...current,
        availability: current.availability.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item),
    }));

    const addAvailability = () => setSettings((current) => ({ ...current, availability: [...current.availability, { day_of_week: "1", start_time: "09:00", end_time: "17:00" }] }));

    return (
        <main className="pf-auth-page">
            <section className="pf-auth-card pf-profile-card" aria-labelledby="profile-title">
                <Link className="pf-logo" to="/"><i className="fas fa-paw" /> PaseaFeliz</Link>
                <span className="pf-auth-kicker">PERFIL DE PASEADOR</span>
                <h1 id="profile-title">Preséntate a las familias</h1>
                <p className="pf-auth-intro">Estos datos aparecerán en las tarjetas cuando un cliente elija paseador.</p>
                {status.loading && <p className="pf-form-message pf-form-success">Cargando servicios y zonas...</p>}
                <form onSubmit={handleSubmit}>
                    <div id="perfil" className="pf-form-anchor"><label htmlFor="full-name">Nombre completo</label>
                        <input id="full-name" name="full_name" value={form.full_name} onChange={({ target }) => setForm({ ...form, full_name: target.value })} placeholder="Ej. Carlos Martínez" required />
                        <label htmlFor="phone">Teléfono</label>
                        <input id="phone" name="phone" type="tel" value={form.phone} onChange={({ target }) => setForm({ ...form, phone: target.value })} placeholder="600 000 000" />
                        <label htmlFor="experience-years">Años de experiencia</label>
                        <input id="experience-years" name="experience_years" type="number" min="0" max="60" value={form.experience_years} onChange={({ target }) => setForm({ ...form, experience_years: target.value })} placeholder="Ej. 3" required />
                        <label htmlFor="bio">Descripción para tu tarjeta</label>
                        <textarea id="bio" name="bio" rows="5" maxLength="500" value={form.bio} onChange={({ target }) => setForm({ ...form, bio: target.value })} placeholder="Cuéntales tu experiencia y cómo cuidas a las mascotas." required /></div>
                    <fieldset id="servicios" className="pf-profile-fieldset"><legend>Servicios y precio por hora</legend>{catalogs.services.map((service) => <div className="pf-choice-row" key={service.id}><label><input type="checkbox" checked={settings.services.some((item) => item.service_id === service.id)} onChange={() => setSettings((current) => ({ ...current, services: current.services.some((item) => item.service_id === service.id) ? current.services.filter((item) => item.service_id !== service.id) : [...current.services, { service_id: service.id, price: "" }] }))} /> {service.name}</label>{settings.services.some((item) => item.service_id === service.id) && <input aria-label={`Precio de ${service.name}`} type="number" min="1" value={settings.services.find((item) => item.service_id === service.id).price} onChange={({ target }) => setSettings((current) => ({ ...current, services: current.services.map((item) => item.service_id === service.id ? { ...item, price: target.value } : item) }))} placeholder="€" required />}</div>)}</fieldset>
                    <fieldset className="pf-profile-fieldset"><legend>Zonas donde trabajas</legend><div className="pf-choice-grid">{catalogs.zones.map((zone) => <label key={zone.id}><input type="checkbox" checked={settings.zone_ids.includes(zone.id)} onChange={() => toggleId("zone_ids", zone.id)} /> {zone.name}, {zone.city}</label>)}</div></fieldset>
                    <fieldset className="pf-profile-fieldset"><legend>Tipos de mascota</legend><div className="pf-choice-grid">{catalogs.petTypes.map((petType) => <label key={petType.id}><input type="checkbox" checked={settings.pet_type_ids.includes(petType.id)} onChange={() => toggleId("pet_type_ids", petType.id)} /> {petType.name}</label>)}</div></fieldset>
                    <fieldset id="horarios" className="pf-profile-fieldset"><legend>Disponibilidad semanal</legend>{settings.availability.map((item, index) => <div className="pf-availability-row" key={`${index}-${item.day_of_week}`}><select aria-label="Día de la semana" value={item.day_of_week} onChange={({ target }) => updateAvailability(index, "day_of_week", target.value)}>{["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"].map((day, dayIndex) => <option key={day} value={dayIndex}>{day}</option>)}</select><input aria-label="Hora de inicio" type="time" value={item.start_time} onChange={({ target }) => updateAvailability(index, "start_time", target.value)} required /><input aria-label="Hora de fin" type="time" value={item.end_time} onChange={({ target }) => updateAvailability(index, "end_time", target.value)} required /></div>)}<button className="pf-add-slot" type="button" onClick={addAvailability}>+ Añadir otro horario</button></fieldset>
                    {status.error && <p className="pf-form-message pf-form-error" role="alert">{status.error}</p>}
                    <button className="pf-button pf-button-orange pf-submit" type="submit" disabled={status.loading}>{status.loading ? "Guardando perfil..." : "Publicar mi perfil"}</button>
                </form>
            </section>
        </main>
    );
};
