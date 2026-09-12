# PaseaFeliz - Contexto para agentes de IA

## 1. Proposito del documento

Este archivo describe la arquitectura actual de PaseaFeliz para que agentes externos puedan analizar, mejorar o ampliar el proyecto sin romper sus limites de dominio, autenticacion o estructura.

Antes de modificar codigo, el agente debe:

1. Leer este documento.
2. Revisar el archivo que controla directamente el comportamiento solicitado.
3. Comprobar si existen cambios locales antes de editar.
4. Mantener las APIs y los nombres de acciones existentes salvo que el cambio requiera una migracion coordinada.
5. Ejecutar validaciones despues de editar.

## 2. Producto

PaseaFeliz es una aplicacion para conectar clientes con paseadores de mascotas.

Roles principales:

- `cliente`: consulta paseadores y crea sus propias reservas.
- `paseador`: configura perfil, servicios, zonas, tipos de mascota y disponibilidad.
- `admin`: supervisa usuarios, paseadores, catalogo y reservas.

## 3. Stack actual

### Frontend

- React 18
- Vite
- React Router DOM 6
- `useReducer` + Context para estado global
- Persistencia de sesion en `localStorage`
- Proxy de desarrollo `/api` hacia `http://localhost:3001`

### Backend

- Flask
- Flask-SQLAlchemy
- Flask-Migrate/Alembic
- Flask-JWT-Extended
- Flask-CORS
- Flask-Admin con nombre `PaseaFeliz Admin`
- PostgreSQL en desarrollo recomendado; SQLite como fallback
- Gunicorn para despliegue

## 4. Estructura relevante

```text
carlos-app-paseo/
├── src/
│   ├── app.py                 # Arranque Flask, JWT, admin, CLI y rutas publicas
│   ├── wsgi.py                # Entrada WSGI
│   ├── api/
│   │   ├── models.py          # Modelos SQLAlchemy y tablas de asociacion
│   │   ├── routes.py          # Endpoints, autenticacion y reglas de negocio
│   │   ├── admin.py           # Panel PaseaFeliz Admin
│   │   ├── commands.py        # Comandos Flask
│   │   └── utils.py           # Errores y utilidades
│   └── front/
│       ├── main.jsx           # Punto de entrada React
│       ├── routes.jsx         # Rutas de la aplicacion
│       ├── store.js           # Estado inicial y reducer global
│       ├── hooks/
│       │   └── useGlobalReducer.jsx
│       ├── components/
│       │   ├── ProtectedRoute.jsx
│       │   ├── Navbar.jsx
│       │   └── Footer.jsx
│       └── pages/paseafeliz/
│           ├── PaseaFeliz.jsx # Pagina principal
│           ├── Login.jsx
│           ├── Registro.jsx
│           ├── PanelUsuario.jsx
│           ├── Reserva.jsx
│           └── PerfilPaseador.jsx
├── migrations/                # Versiones Alembic
├── public/                    # Archivos publicos y bundle heredado
├── docs/                      # Documentacion del proyecto
├── .env                       # Configuracion local, no subir secretos
├── .env.example               # Plantilla de configuracion
├── package.json               # Scripts frontend
├── requirements.txt           # Dependencias Python
├── Pipfile                    # Dependencias y scripts Pipenv
└── vite.config.js             # Vite y proxy API
```

## 5. Estado global frontend

El estado se define en `src/front/store.js` y se expone mediante `useGlobalReducer`.

Forma actual:

```js
{
  auth: {
    user: null,
    token: null,
    isAuthenticated: false,
    role: null
  },
  walkers: [],
  reservations: [],
  services: [],
  zones: [],
  petTypes: [],
  ui: {
    loading: false,
    error: null
  }
}
```

Acciones existentes importantes:

- `login_success`
- `logout`
- `set_loading`
- `set_error`
- `clear_error`
- `set_walkers`
- `set_reservations`
- `set_services`
- `set_zones`
- `set_pet_types`

No volver a introducir estados de tutorial como `todos`, `tasks` o colores demo.

La sesion se guarda en:

- `paseafeliz_user`
- `paseafeliz_token`

Guardar un usuario en `localStorage` no sustituye la validacion del token. Las vistas protegidas deben validar la sesion contra `/api/me`.

## 6. Rutas frontend actuales

- `/`: pagina principal PaseaFeliz
- `/paseafeliz`: pagina principal alternativa
- `/registro`: registro publico de cliente o paseador
- `/login`: inicio de sesion
- `/panel`: panel protegido para cliente, paseador y admin
- `/reservar`: protegido para `cliente`
- `/perfil-paseador`: protegido para `paseador`

La proteccion de acceso esta en `src/front/components/ProtectedRoute.jsx`.

No reintroducir rutas del template como `/template`, `/demo` o `/single` salvo que se solicite expresamente.

## 7. Autenticacion y autorizacion

El backend genera JWT en `POST /api/login`.

El frontend envia el token asi:

```http
Authorization: Bearer <token>
```

Endpoints autenticados principales:

- `GET /api/me`
- `GET /api/users` solo admin
- `POST /api/users` cliente/paseador; crear admin requiere admin autenticado
- `POST /api/walkers` solo paseador
- `POST /api/walkers/<id>/availability` solo propietario paseador
- `POST /api/walkers/<id>/settings` solo propietario paseador
- `GET /api/reservations` autenticado con filtrado por rol
- `POST /api/reservations` cliente o admin; un cliente solo puede reservar para si mismo

Catalogo publico:

- `GET /api/services`
- `GET /api/zones`
- `GET /api/pet-types`
- `GET /api/walkers`

Nunca confiar solamente en el rol enviado por el frontend. El backend debe obtener el usuario con `get_jwt_identity()` y validar propiedad/rol.

## 8. Modelos de dominio

Los modelos principales estan en `src/api/models.py`:

- `User`
- `Service`
- `Zone`
- `PetType`
- `WalkerProfile`
- `WalkerAvailability`
- `Reservation`

Tablas de asociacion:

- `walker_services`, incluye precio por paseador
- `walker_zones`
- `walker_pet_types`

No modificar columnas existentes sin crear una migracion Alembic correspondiente.

## 9. Reservas

Una reserva relaciona:

- `client_id` -> `User`
- `walker_id` -> `WalkerProfile`
- `service_id` -> `Service`
- fecha
- hora
- estado

`GET /api/reservations` devuelve tambien datos enriquecidos:

```json
{
  "id": 1,
  "client_id": 2,
  "walker_id": 3,
  "service_id": 1,
  "reservation_date": "2026-09-20",
  "reservation_time": "10:00:00",
  "status": "pendiente",
  "client": {},
  "walker": {},
  "service": {}
}
```

El panel muestra reservas segun el rol:

- cliente: sus reservas
- paseador: reservas asignadas a su perfil
- admin: todas las reservas

Antes de crear una reserva se valida fecha, hora, servicio activo, cliente valido y conflicto de horario.

## 10. Panel administrativo

El panel se encuentra en `/admin` y se llama `PaseaFeliz Admin`.

Esta protegido por autenticacion Basic usando un usuario de la tabla `User` con:

- `role = admin`
- `is_active = true`

Crear o promover el primer administrador:

```bash
pipenv run flask --app src/app.py create-admin
```

No abrir el rol `admin` en el registro publico sin una razon clara y una proteccion adicional.

## 11. Variables de entorno

Variables backend:

```env
DATABASE_URL=postgres://usuario:password@localhost:5432/base
FLASK_APP=src/app.py
FLASK_DEBUG=1
DEBUG=TRUE
JWT_SECRET_KEY=una-clave-larga-y-secreta
FLASK_APP_KEY=otra-clave-secreta
```

Variables frontend:

```env
VITE_BASENAME=/
VITE_BACKEND_URL=http://localhost:3001
```

No copiar secretos reales en documentacion, commits o mensajes de agentes. `.env` es local y `.env.example` debe contener solo valores de ejemplo.

## 12. Comandos de desarrollo

Instalar dependencias:

```bash
npm install
pipenv install
```

Backend:

```bash
pipenv run start
```

Frontend, en otra terminal:

```bash
npm run dev
```

URLs locales:

- frontend: `http://localhost:3000`
- backend: `http://localhost:3001`
- admin: `http://localhost:3001/admin`

Validaciones frontend:

```bash
npm run build
npm run lint
```

Validacion Python:

```bash
python -m py_compile src/app.py src/api/admin.py src/api/commands.py src/api/routes.py src/api/models.py
```

Migraciones:

```bash
pipenv run migrate
pipenv run upgrade
pipenv run downgrade
```

## 13. Reglas para futuros agentes

- Inspeccionar primero el archivo que controla la funcionalidad solicitada.
- No reemplazar el reducer global por estado local duplicado si el dato pertenece al dominio global.
- No guardar contrasenas en texto plano.
- No devolver contrasenas en serializadores.
- No permitir que un usuario edite perfiles o reservas de otro usuario.
- No crear modelos duplicados para conceptos que ya existen.
- No eliminar migraciones existentes.
- No cambiar nombres de roles sin actualizar backend, frontend y datos.
- Mantener mensajes de error JSON en la API.
- Añadir o actualizar validaciones cuando se agreguen endpoints.
- Ejecutar al menos una validacion enfocada despues de cada cambio.
- No borrar cambios locales de otros colaboradores.
- Mantener cambios pequenos y relacionados con la tarea.

## 14. Mejoras pendientes conocidas

Estas areas pueden mejorarse sin cambiar la arquitectura base:

- agregar tests automatizados para login, roles y reservas
- validar que una reserva este dentro de la disponibilidad del paseador
- agregar estados y transiciones de reserva controladas
- evitar consultas repetidas en `_reservation_payload` mediante joins o relaciones SQLAlchemy
- crear una capa de servicios para separar reglas complejas de las rutas
- sustituir credenciales Basic del panel por un login administrativo con Flask-Login o JWT
- eliminar dependencias y archivos heredados del template cuando se confirme que no se usan
- mejorar manejo centralizado de expiracion JWT en el frontend

## 15. Criterio de terminado

Una mejora se considera terminada cuando:

1. Respeta roles y propiedad de los datos.
2. No rompe las rutas existentes.
3. Incluye migracion si cambia el esquema.
4. Compila frontend y backend.
5. Actualiza este documento si cambia la arquitectura, una ruta, un comando o una regla de seguridad.
