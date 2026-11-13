# PLAYBOOK: DESPLIEGUE CON DOCKER COMPOSE BASADO EN DEBIAN BOOKWORM
## Arquitectura Same-Origin · Frontend Nginx + Backend FastAPI + PostgreSQL 16

---

## 1. Justificación Técnica: Debian Bookworm vs Alpine Linux
En entornos de producción institucionales y redes corporativas de telecomunicaciones (CANTV / GGFPP):
1. **Compatibilidad Nativa de C/C++ y Node.js (glibc vs musl libc):** Debian utiliza la biblioteca estándar GNU C (`glibc`), eliminando inconsistencias en extensiones binarias, algoritmos criptográficos y librerías del compilador de Vite/Tailwind que suelen fallar en `musl` (Alpine).
2. **Resolución DNS y Redes Corporativas:** Los resolutores DNS en Alpine a menudo presentan fallos con servidores proxy internos (pfSense, CrowdSec) o sufren timeouts en peticiones paralelas. Debian Bookworm garantiza resolución DNS estándar de nivel enterprise.
3. **Mantenibilidad:** Soporte oficial a largo plazo (LTS) de Debian para parches de seguridad, imágenes estables de Node 20 y Nginx.

---

## 2. Configuración de Contenedores y Red Same-Origin

```
                  ┌─────────────────────────────────────────────────────────┐
                  │                 HOST VM (171.0.40.7)                    │
                  │                                                         │
                  │   ┌─────────────────────────────────────────────────┐   │
   Petición HTTP  │   │ Contenedor FRONTEND: mtt-frontend               │   │
  ───────────────┼──▶│ Imagen: nginx:bookworm (sirviendo React 19 SPA) │   │
   Puerto :80     │   │ Puerto Expuesto: "80:80"                        │   │
                  │   │ Proxy Interno: /api/ ──▶ http://backend:8000/api│   │
                  │   └────────────────────────┬────────────────────────┘   │
                  │                            │                            │
                  │             Red Bridge Interna: mtt-net                 │
                  │             (Sin puertos expuestos al Host)             │
                  │                            │                            │
                  │             ┌──────────────┴──────────────┐             │
                  │             ▼                             ▼             │
                  │   ┌───────────────────┐         ┌───────────────────┐   │
                  │   │ Contenedor        │         │ Contenedor        │   │
                  │   │ BACKEND           │         │ BASE DE DATOS     │   │
                  │   │ FastAPI:8000      │◀───────▶│ PostgreSQL 16:5432│   │
                  │   └───────────────────┘         └───────────────────┘   │
                  └─────────────────────────────────────────────────────────┘
```

### Reglas Clave:
1. **Cero CORS:** El navegador solo habla con el puerto 80 del frontend (`http://host/`). Como `/api/` es una ruta relativa en el mismo dominio, el navegador no dispara peticiones preflight (`OPTIONS`) ni requiere configuración de CORS en FastAPI.
2. **Axios Base URL:** En React se configura:
   ```typescript
   export const apiClient = axios.create({
     baseURL: '/api',
     headers: { 'Content-Type': 'application/json' }
   });
   ```
3. **Encabezados de Seguridad OWASP en Nginx:**
   - `X-Frame-Options: DENY`
   - `X-Content-Type-Options: nosniff`
   - `X-XSS-Protection: "1; mode=block"`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.tile.openstreetmap.org; connect-src 'self';`

