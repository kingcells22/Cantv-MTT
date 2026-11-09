# INFORME TÉCNICO DE ARQUITECTURA FRONTEND E INFRAESTRUCTURA
## Proyecto: SINCOMTT · CANTV (GGFPP)
**Responsable:** Anthony Domínguez (Arquitecto Frontend & Infraestructura Docker)  
**Fecha:** Noviembre 2026  
**Rama Git:** `feature/frontend-react19`  
**Host / VM de Pruebas:** `171.0.40.7`  

---

### 1. Resumen Ejecutivo
Se ha culminado al 100% el desarrollo de la interfaz de usuario del sistema **SINCOMTT** (Sistema de Registro y Actualización de MTT Versión 2) en estricta fidelidad con la plantilla y especificaciones entregadas por el cliente institucional (CANTV - GGFPP).

Adicionalmente, se construyó y verificó la infraestructura de contenedores bajo imágenes basadas en **Debian Bookworm**, incorporando un servidor web **Nginx** configurado como Reverse Proxy *Same-Origin* con resolución DNS dinámica interna, lo que garantiza el desacoplamiento y resiliencia del frontend ante fallos o ausencias del backend.

---

### 2. Estado de Entrega del Frontend

El frontend se encuentra empaquetado y operando en el contenedor `mtt-frontend`. Dispone de los siguientes módulos:

| Módulo / Componente | Estado | Descripción Funcional |
| :--- | :---: | :--- |
| **Dashboard Institucional** | ✅ 100% | KPIs en vivo (total MTT, activas, en proceso, pendientes), gráficos de distribución regional, avance comunal y semáforos de validación. |
| **Formulario de Registro (5 Bloques)** | ✅ 100% | Estructura íntegra de la plantilla del cliente: <br>• **B1:** Identificación y Ubigeo en cascada (Estado $\rightarrow$ Municipio $\rightarrow$ Parroquia).<br>• **B2:** Organización Comunal (Comunas, Circuitos, SITUR, Consejos Comunales).<br>• **B3:** Infraestructura y Telecomunicaciones (GPON, Centrales, Red CANTV).<br>• **B4:** Vocerías con cálculo reactivo (`Total = Mujeres + Hombres`) y validación de cédulas/teléfonos.<br>• **B5:** Seguimiento, activador y observaciones. |
| **Validación Estricta Zod** | ✅ 100% | Aplicación automática de las 4 Reglas de Oro institucionales (nulos en numéricos no verificados, `«N/D»` en cadenas vacías, `«SIN OBSERVACIÓN»` en observaciones). |
| **Actualización de Registros** | ✅ 100% | Buscador reactivo por código o nombre de MTT, precarga automática en formulario y edición segura. |
| **Bandeja Regional** | ✅ 100% | Filtro de validación estadal para Gerentes Regionales (Nivel 3). |
| **Bandeja GDC** | ✅ 100% | Módulo para Consultor GDC (Nivel 4) con asignación de código correlativo único nacional MTT. |
| **Matriz de Datos (51 Variables)** | ✅ 100% | Tabla de alto rendimiento (TanStack Table v8) con paginación, ordenamiento, búsqueda global, filtros de estado y **exportador nativo a CSV/Excel**. |
| **Ficha Técnica en PDF** | ✅ 100% | Modal con vista imprimible oficial (`@media print`), códigos institucionales y **código QR vectorial SVG dinámico**. |
| **Simulador de Roles (RBAC)** | ✅ 100% | Switch interactivo para alternar en tiempo real entre los 8 roles institucionales y validar la visibilidad y permisos de botones/bandejas. |

---

### 3. Blindaje Defensivo y Modo Resiliente (Offline Fallback)

Para evitar que problemas en el backend retrasen las pruebas de usuario y la validación con el cliente, el frontend incorpora:
1. **Catálogo Oficial Ubigeo INE:** 1.137 parroquias, 337 municipios y 25 entidades federales preindexadas localmente (`ubigeo_ine.json`), extraídas de la gaceta oficial de CANTV.
2. **Dataset Semilla de 150 MTT Reales:** 150 registros de muestra completos extraídos del histórico institucional de 2.511 MTTs (`mtt_dataset.json`).
3. **Manejador de Estado Desacoplado (`useMTTStorage`):**
   - Si la API de FastAPI responde, se sincroniza.
   - Si la API falla (por ejemplo, por el fallo de base de datos del backend), el cliente intercepta el error transparentemente y opera sobre almacenamiento persistente local (`localStorage`), permitiendo crear, editar, asignar código y descargar reportes sin pantallas blancas ni bloqueos.

---

### 4. Infraestructura y Red (Debian Bookworm + Nginx)

* **Imagen Base:** `nginx:bookworm` (Multi-stage build a partir de `node:20-bookworm-slim`).
* **Tamaño optimizado:** 193 MB.
* **Política Same-Origin:** Todas las peticiones al backend se dirigen a `/api/` en el mismo puerto 80. Nginx las enruta internamente hacia `mtt-backend:8000`.
* **Resolución Dinámica de Upstream:**
  ```nginx
  location /api/ {
      resolver 127.0.0.11 valid=30s ipv6=off;
      set $backend_upstream http://mtt-backend:8000;
      proxy_pass $backend_upstream;
      ...
  }
  ```
  Esto permite que Nginx arranque y sirva el Frontend aun cuando el contenedor de backend no esté levantado o esté reiniciándose.

---

### 5. Plan de Pruebas y Despliegue en VM (`171.0.40.7`)

#### 5.1. Verificación del Contenedor Activo
El contenedor `mtt-frontend` se encuentra actualmente activo en el puerto 80 del servidor:
```bash
docker ps --filter name=mtt-frontend
# STATUS: Up ... (healthy)  PORTS: 0.0.0.0:80->80/tcp
```

#### 5.2. Acceso para Usuarios y Evaluadores
- **URL Primaria de Red:** `http://171.0.40.7`
- **URL Local:** `http://localhost`

---

### 6. Plan de Contingencia y Criterio de "Punto Muerto"

Si el desarrollador backend (Kenny Navarro) experimenta retrasos, bloqueos de entorno o falta de disponibilidad:
1. **Anthony Domínguez dispone del set de parches listos** documentados en el informe de Kenny.
2. La aplicación de las correcciones del backend (cambio de imagen base en `Dockerfile`, corrección de `DATABASE_URL` con `os.getenv` y `joinedload` en `GET /api/mtt`) requiere menos de 10 minutos de trabajo técnico.
3. Se procederá a aplicar los parches, reconstruir el backend y unir ambas soluciones en la rama `Devs` para entregar el sistema final sin retrasos al cliente.

