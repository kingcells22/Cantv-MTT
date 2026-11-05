---

### 2. Guía de Despliegue en la Máquina Virtual (Docker)

Cuando vayas a montar esto en tu entorno de pruebas o laboratorio (seguramente en un nodo de Proxmox con un servidor headless Debian o Ubuntu), la mejor manera de aislar y orquestar todo es con `docker-compose`.

**1. Prepara el archivo `docker-compose.yml` en la raíz del proyecto:**

```yaml
version: "3.8"

services:
  db:
    image: postgres:16-alpine
    container_name: mtt_postgres
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: 123456
      POSTGRES_DB: mtt_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    container_name: Cantv_mtt
    restart: always
    ports:
      - "8000:8000"
    depends_on:
      - db
    # Aquí puedes agregar luego redes bridge aisladas si lo requieres

volumes:
  postgres_data:
```
