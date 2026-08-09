# LandingRP — Landing con quiz de calificación + agenda de citas

Landing de alta conversión con un **quiz previo obligatorio** (perfilamiento
de leads antes de mostrar la oferta), **agenda de citas automatizada** con
disponibilidad configurable, **doble opt-in por correo**, y un **panel de
administración** completo para editar todo sin tocar código.

## ✨ Funcionalidades

- **Quiz de calificación antes de la landing.** El visitante que llega desde
  un anuncio responde primero unas preguntas configurables (opción única,
  múltiple o texto libre). Cada opción puede tener un puntaje, que se suma al
  "expediente" del lead para priorizar a los mejores candidatos.
- **Captura de datos completa:** nombre completo, correo (con verificación de
  doble opt-in — se envía un enlace que el usuario debe confirmar), ciudad,
  país, y teléfono con selector de código de país (DDI) con banderas.
- **Landing 100% configurable** desde el panel admin: textos, video (YouTube,
  Vimeo o MP4), beneficios, testimonios, preguntas frecuentes, colores de
  marca.
- **Cronómetro regresivo** de oferta/evento con fecha de expiración
  configurable.
- **Agenda de citas automatizada:** el lead elige día y hora en un calendario
  que respeta la disponibilidad configurada en el admin (horarios recurrentes
  por día de la semana + fechas bloqueadas), evita choques de horario, y
  genera un archivo `.ics` para agregar el evento al calendario del usuario.
- **Panel de administración** (`/admin`) con:
  - Resumen con métricas (leads, % verificados, citas).
  - Listado de leads con sus respuestas del quiz, filtro de búsqueda y
    exportación a CSV.
  - Gestión de reservas (ver/cancelar).
  - CRUD de preguntas del quiz (tipo, opciones, puntaje, orden, activo/no).
  - Configuración de disponibilidad (horarios recurrentes + días bloqueados).
  - Editor de contenido de la landing (textos, video, oferta/cronómetro,
    beneficios, testimonios, FAQ, colores).
- Todas las respuestas y datos se guardan en base de datos (PostgreSQL vía
  Prisma).

## 🧱 Stack técnico

- **Next.js 16** (App Router, Server Components + Server Actions) + TypeScript
- **Tailwind CSS v4**
- **Prisma ORM** + **PostgreSQL**
- **jose** para sesiones firmadas (admin y visitante) en cookies httpOnly
- **Resend** para el envío de correos transaccionales (con fallback a consola
  en desarrollo, sin necesidad de configurar nada para probar localmente)
- **bcryptjs** para el hash de la contraseña del admin

## 🚀 Puesta en marcha local

```bash
npm install

# Copia el archivo de ejemplo y completa tus variables
cp .env.example .env.local

# Crea las tablas en tu base de datos
npm run db:migrate

# Crea el usuario admin, la configuración y las preguntas por defecto
npm run db:seed

npm run dev
```

Abre `http://localhost:3000` para ver el quiz, y
`http://localhost:3000/admin/login` para el panel (usa el `ADMIN_EMAIL` /
`ADMIN_PASSWORD` que configuraste en `.env.local` antes de correr el seed).

> Sin `RESEND_API_KEY` configurado, los correos (verificación de email,
> confirmación de cita) se imprimen en la consola del servidor — perfecto
> para probar el flujo completo sin salir de local.

## 🗺️ Recorrido del funnel

1. **`/`** — Quiz de calificación. Captura automáticamente los parámetros
   `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`,
   `utm_id` de la URL del anuncio.
2. Al enviar el formulario de contacto se crea el lead, se dispara el correo
   de doble opt-in, y el visitante avanza a...
3. **`/oferta`** — La landing completa (hero, video, oferta con cronómetro,
   beneficios, testimonios, FAQ). Solo accesible tras completar el quiz.
4. **`/reservar`** — Calendario para agendar la entrevista/llamada, según la
   disponibilidad configurada en el admin.
5. **`/verificar?token=...`** — Enlace del correo de doble opt-in.

## 🔐 Panel admin

Rutas bajo `/admin` (protegidas por sesión, redirigen a `/admin/login` si no
hay sesión activa):

| Ruta                    | Qué hace                                   |
| ------------------------ | ------------------------------------------- |
| `/admin`                | Resumen y métricas                          |
| `/admin/leads`          | Tabla de leads + respuestas + export CSV    |
| `/admin/reservas`       | Citas agendadas, cancelar                   |
| `/admin/preguntas`      | CRUD de preguntas del quiz                  |
| `/admin/disponibilidad` | Horarios recurrentes y fechas bloqueadas    |
| `/admin/contenido`      | Todos los textos/video/oferta de la landing |

## 📦 Despliegue (Vercel recomendado)

1. Crea una base de datos Postgres (Vercel Postgres, Neon o Supabase).
2. En el proyecto de Vercel, configura las variables de entorno de
   `.env.example` (como mínimo `DATABASE_URL` y `AUTH_SECRET`).
3. En **Build Command** deja el de Next.js por defecto — `postinstall`
   corre `prisma generate` automáticamente.
4. Antes del primer despliegue (o en cada migración de esquema) corre:
   ```bash
   npm run db:deploy   # aplica las migraciones sin prompts (prisma migrate deploy)
   npm run db:seed     # solo la primera vez, para crear el admin y datos iniciales
   ```
5. Configura `RESEND_API_KEY` y `EMAIL_FROM` para que los correos de doble
   opt-in y confirmación de citas se envíen de verdad (si no, funcionan en
   modo consola).

## 🗂️ Estructura relevante

```
prisma/schema.prisma        Modelo de datos (leads, quiz, disponibilidad, citas, config)
prisma/seed.ts               Datos iniciales (admin, preguntas, horarios, config)
src/lib/actions/             Server Actions (mutaciones: leads, citas, admin)
src/lib/config.ts            Lectura/escritura de la configuración de la landing
src/lib/availability.ts      Cálculo de horarios disponibles
src/lib/countries.ts         Listado de países + código de marcación (DDI)
src/app/page.tsx             Quiz de calificación (gate previo)
src/app/oferta/page.tsx      Landing completa
src/app/reservar/page.tsx    Agenda de citas
src/app/verificar/page.tsx   Confirmación de doble opt-in
src/app/admin/               Panel de administración
```
