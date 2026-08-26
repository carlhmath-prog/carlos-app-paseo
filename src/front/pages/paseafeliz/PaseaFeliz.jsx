import { useEffect } from "react";
import "./index1.css";

const image = (id, width = 800) =>
    `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=${width}`;

const services = [
    {
        title: "Paseo Grupal",
        image: image("photo-1516734212186-a967f81ad0d7"),
        description: "Socialización activa y juegos en parques seguros con un grupo reducido de máximo 4 amigos perrunos.",
        features: ["Máximo 4 perros", "Socialización supervisada", "Reporte de ruta GPS", "Refuerzo positivo"],
        price: "12€",
        unit: "/hora",
    },
    {
        title: "Paseo Individual",
        image: image("photo-1534361960057-19889db9621e"),
        description: "Atención 100% exclusiva y ritmo personalizado, perfecto para cachorros, perritos senior o tímidos.",
        features: ["Atención exclusiva 1-a-1", "Ritmo personalizado", "Ideal para perritos nerviosos", "Fotos y videos en vivo"],
        price: "18€",
        unit: "/hora",
    },
    {
        title: "Cuidado a Domicilio",
        image: image("photo-1514888286974-6c03e2ca1dba"),
        description: "Nos trasladamos a tu casa para darle mimos, alimento, juegos y compañía para que no extrañe su rutina.",
        features: ["Alimentación y agua fresca", "Sesión de juego y mimos", "Limpieza de espacio", "Visita de 60 minutos"],
        price: "25€",
        unit: "/visita",
    },
];

const plans = [
    { title: "Plan Básico", description: "Para perritos que solo necesitan un respiro a mitad del día.", price: "89€", features: ["2 paseos grupales por semana", "Paseadores certificados", "Reporte de ruta GPS", "Soporte al cliente estándar"] },
    { title: "Paseador Estrella", description: "El favorito de los dueños ocupados. Rutina constante y saludable.", price: "159€", popular: true, features: ["5 paseos grupales por semana", "Mismo paseador asignado siempre", "Reporte GPS + Fotos premium", "Soporte prioritario 24/7", "1 lavado de cortesía al mes"] },
    { title: "Cuidado VIP", description: "Atención exclusiva para quienes exigen lo mejor de lo mejor.", price: "249€", features: ["3 paseos individuales por semana", "Entrenamiento de obediencia básica", "Atención 100% personalizada", "Soporte prioritario 24/7", "Flexibilidad de cancelación"] },
];

const testimonials = [
    ["PaseaFeliz cambió la vida de mi perrita Luna. Ella solía ponerse muy ansiosa cuando me iba a trabajar, pero ahora espera con ansias la hora de su paseo grupal.", "Laura Beltrán", "Dueña de Luna (Border Collie)", "photo-1494790108377-be9c29b29330"],
    ["El reporte por GPS con fotos en tiempo real me da una tranquilidad inmensa. Drago siempre vuelve feliz y relajado de sus paseos con Carlos.", "Javier Martínez", "Dueño de Drago (Pastor Alemán)", "photo-1507003211169-0a1dd7228f2d"],
    ["Excelente servicio de cuidado a domicilio. Viajé el fin de semana y me mantuvieron informado en todo momento con videos y mimos. Totalmente recomendados.", "Ana Sofía Ruiz", "Dueña de Simba (Pug)", "photo-1438761681033-6461ffad8d80"],
];

const Anchor = ({ href, children, className = "" }) => <a className={className} href={href === "#contacto" ? "/reservar" : href}>{children}</a>;
const SectionLabel = ({ icon, children }) => <span className="pf-label"><i className={`fas ${icon}`} /> {children}</span>;

export const PaseaFeliz = () => {
    useEffect(() => {
        document.title = "PaseaFeliz - Paseadores de confianza";
    }, []);

    return (
        <div className="paseafeliz">
            <header className="pf-header">
                <div className="pf-container pf-header-inner">
                    <a className="pf-logo" href="#inicio"><i className="fas fa-paw" /> PaseaFeliz</a>
                    <nav className="pf-nav" aria-label="Navegación principal">
                        <Anchor href="#servicios">Servicios</Anchor><Anchor href="#nosotros">Sobre Nosotros</Anchor><Anchor href="#planes">Planes</Anchor><Anchor href="#testimonios">Testimonios</Anchor>
                    </nav>
                    <div className="pf-header-actions">
                        <Anchor href="tel:900123456" className="pf-phone"><i className="fas fa-phone" /> 900 123 456</Anchor>
                        <Anchor href="#contacto" className="pf-button pf-button-green">Reservar Paseador</Anchor>
                    </div>
                </div>
            </header>

            <main id="inicio">
                <section className="pf-container pf-hero">
                    <div className="pf-hero-copy">
                        <SectionLabel icon="fa-map-marker-alt">PASEADORES DE CONFIANZA EN TU ZONA</SectionLabel>
                        <h1>Paseos llenos de <span>felicidad</span> y colas contentas</h1>
                        <p>Conectamos a tu mejor amigo con paseadores profesionales y certificados. Paseos individuales, grupales y cuidado a domicilio con seguimiento GPS en tiempo real.</p>
                        <div className="pf-actions"><Anchor href="#contacto" className="pf-button pf-button-orange">Agenda tu Primer Paseo Gratis</Anchor><Anchor href="#servicios" className="pf-button pf-button-outline">Ver Disponibilidad</Anchor></div>
                        <div className="pf-stats"><div><strong>15k+</strong><small>Paseos Completados</small></div><div><strong>4.9/5</strong><small>Valoración Clientes</small></div><div><strong>100%</strong><small>Paseadores Certificados</small></div></div>
                    </div>
                    <img className="pf-hero-image" src={image("photo-1548199973-03cce0bbc87b")} alt="Perro corriendo feliz" />
                </section>

                <section id="servicios" className="pf-band pf-band-beige"><div className="pf-container"><div className="pf-heading"><SectionLabel icon="fa-paw">NUESTROS SERVICIOS</SectionLabel><h2>El cuidado perfecto para cada perrito</h2><p>Diseñamos paseos y cuidados a la medida de la energía, edad y personalidad de tu compañero de cuatro patas.</p></div><div className="pf-grid pf-grid-three">{services.map((service) => <article className="pf-card pf-service" key={service.title}><img src={service.image} alt={service.title} /><div className="pf-card-body"><h3>{service.title}</h3><p>{service.description}</p><ul>{service.features.map((feature) => <li key={feature}><i className="fas fa-check" /> {feature}</li>)}</ul></div><div className="pf-card-footer"><span>Desde<strong>{service.price}<small>{service.unit}</small></strong></span><Anchor href="#contacto" className="pf-link-button">Reservar</Anchor></div></article>)}</div></div></section>

                <section id="nosotros" className="pf-container pf-about"><img src={image("photo-1551730459-92db2a308d6a")} alt="Chica abrazando a su perro" /><div><SectionLabel icon="fa-heart">SOBRE PASEAFELIZ</SectionLabel><h2>Amor, seguridad y colas felices en cada paso</h2><p>PaseaFeliz nació de nuestra propia necesidad de encontrar cuidadores confiables que amaran a los animales tanto como nosotros. Todos nuestros paseadores pasan por un riguroso proceso de selección, verificación de antecedentes y capacitación en primeros auxilios caninos.</p><ul className="pf-benefits"><li><i className="fas fa-shield-alt" /> Seguro de Responsabilidad Civil Incluido</li><li><i className="fas fa-clock" /> Puntualidad y Flexibilidad de Horarios</li><li><i className="fas fa-mobile-alt" /> Reportes por App con Fotos y GPS</li></ul><Anchor href="#contacto" className="pf-button pf-button-dark">Conoce a Nuestro Equipo <i className="fas fa-arrow-right" /></Anchor></div></section>

                <section id="planes" className="pf-band pf-band-light"><div className="pf-container"><div className="pf-heading"><SectionLabel icon="fa-tags">PRECIOS Y PLANES</SectionLabel><h2>Planes adaptados a tu ritmo de vida</h2><p>Ahorra contratando nuestros paquetes mensuales para mantener la rutina saludable de tu perrito.</p></div><div className="pf-grid pf-grid-three">{plans.map((plan) => <article className={`pf-plan ${plan.popular ? "pf-plan-popular" : ""}`} key={plan.title}>{plan.popular && <b className="pf-popular">Popular</b>}<h3>{plan.title}</h3><p>{plan.description}</p><strong className="pf-price">{plan.price}<small>/mes</small></strong><ul>{plan.features.map((feature) => <li key={feature}><i className="fas fa-check-circle" /> {feature}</li>)}</ul><Anchor href="#contacto" className={`pf-plan-button ${plan.popular ? "pf-button-orange" : "pf-button-green"}`}>Empezar Plan</Anchor></article>)}</div></div></section>

                <section id="testimonios" className="pf-container pf-testimonials"><div className="pf-heading"><SectionLabel icon="fa-comments">TESTIMONIOS</SectionLabel><h2>Lo que dicen las familias de PaseaFeliz</h2></div><div className="pf-grid pf-grid-three">{testimonials.map(([quote, name, role, photo]) => <article className="pf-testimonial" key={name}><div className="pf-stars">★★★★★</div><p>“{quote}”</p><div className="pf-person"><img src={image(photo, 150)} alt={name} /><span><strong>{name}</strong><small>{role}</small></span></div></article>)}</div></section>

                <section id="contacto" className="pf-container pf-cta"><h2>¿Listo para ver a tu perrito saltar de alegría?</h2><p>Regístrate hoy y recibe un paseo de 45 minutos totalmente gratis para que pruebes nuestro servicio de primera mano.</p><div className="pf-actions"><Anchor href="mailto:hola@paseafeliz.com" className="pf-button pf-button-orange">Registrarme Gratis</Anchor><Anchor href="tel:900123456" className="pf-button pf-button-white">Hacer Pregunta</Anchor></div></section>
            </main>

            <footer className="pf-footer"><div className="pf-container pf-footer-grid"><div><a className="pf-logo" href="#inicio"><i className="fas fa-paw" /> PaseaFeliz</a><p>Hacemos que el cuidado de tu mascota sea fácil, seguro y feliz.</p></div><div><h3>Explorar</h3><Anchor href="#servicios">Servicios</Anchor><Anchor href="#nosotros">Sobre Nosotros</Anchor><Anchor href="#planes">Planes mensuales</Anchor><Anchor href="#testimonios">Testimonios</Anchor></div><div><h3>Contacto</h3><span>Calle del Parque 24, Madrid</span><Anchor href="tel:900123456">900 123 456</Anchor><Anchor href="mailto:hola@paseafeliz.com">hola@paseafeliz.com</Anchor></div></div><div className="pf-container pf-footer-bottom">© 2026 PaseaFeliz. Todos los derechos reservados.</div></footer>
        </div>
    );
};
