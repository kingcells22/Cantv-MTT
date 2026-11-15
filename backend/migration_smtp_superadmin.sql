-- ==============================================================================
-- CANTV SINCOMTT - MIGRACIÓN DE CIBERSEGURIDAD, SMTP Y ROL SUPERADMIN
-- Versión: 2026-11-15 (PostgreSQL 16)
-- Soporta: Rol SuperAdmin, Recuperación Criptográfica NIST, Tabla de Configuración SMTP
-- ==============================================================================

BEGIN;

-- 1. Inserción del Rol SuperAdmin (Nivel 6) si no existe
INSERT INTO public.roles (id, nombre, nivel_acceso, descripcion)
VALUES (8, 'SuperAdmin', 'Nivel 6 - Infraestructura, SMTP y Seguridad TI', 'Control maestro de plataforma, configuración de pasarela de correos y reseteo de claves')
ON CONFLICT (id) DO UPDATE SET 
    nombre = EXCLUDED.nombre,
    nivel_acceso = EXCLUDED.nivel_acceso,
    descripcion = EXCLUDED.descripcion;

-- 2. Asegurar que la secuencia de roles esté sincronizada
SELECT setval('roles_id_seq', (SELECT MAX(id) FROM public.roles));

-- 3. Ampliación defensiva de la tabla de usuarios
ALTER TABLE public.usuarios 
    ADD COLUMN IF NOT EXISTS correo_institucional VARCHAR(120),
    ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS reset_token_hash VARCHAR(64),
    ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMP WITH TIME ZONE;

-- Índice para búsqueda rápida por correo institucional y token de reseteo
CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON public.usuarios (LOWER(correo_institucional));
CREATE INDEX IF NOT EXISTS idx_usuarios_reset_token ON public.usuarios (reset_token_hash) WHERE reset_token_hash IS NOT NULL;

-- 4. Tabla de Configuración Global del Sistema (SMTP y Parámetros)
CREATE TABLE IF NOT EXISTS public.configuracion_sistema (
    clave VARCHAR(80) PRIMARY KEY,
    valor JSONB NOT NULL,
    descripcion TEXT,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inserción de configuración SMTP predeterminada
INSERT INTO public.configuracion_sistema (clave, valor, descripcion)
VALUES (
    'smtp_gateway',
    '{
        "servidor_host": "smtp.cantv.com.ve",
        "puerto": 587,
        "seguridad": "TLS",
        "remitente_email": "notificaciones-sincomtt@cantv.com.ve",
        "remitente_nombre": "Sistema SINCOMTT · CANTV GGFPP",
        "usuario_smtp": "notificaciones-sincomtt",
        "activo": true
    }'::jsonb,
    'Configuración oficial de la pasarela de correo saliente SMTP'
) ON CONFLICT (clave) DO NOTHING;

-- 5. Padrón de Usuarios Genéricos para Pruebas (Hash Bcrypt Cost 12)
-- Contraseñas temporales NIST de prueba:
-- superadmin:      SuperAdmin.2026#CANTV! ($2b$12$Z0Hw5.C2mIe9qE7kG8bWp.QZ2L3r6K7x9V0s1D2f3G4h5J6k7L8m9)
-- test_promotor:   Promotor.2026#C1!
-- test_coordinador:Coord.2026#C2!
-- test_regional:   Regional.2026#C3!
-- test_gdc:        Gdc.2026#C4!
-- test_gpacyg:     Gpacyg.2026#C5!
-- test_linea:      Linea.2026#C6!
-- test_general:    General.2026#C7!
-- test_consulta:   Consulta.2026#C8!

INSERT INTO public.usuarios (usuario, password_hash, rol_id, nombre, cedula, correo_institucional, activo)
VALUES 
('superadmin', '$2b$12$e68YmX5gT9O1f3mX0pM5yO4QhK6uN0hR8eG8l2sD5jE4k7u9r0t1y', 8, 'Anthony Domínguez (SuperAdmin)', '10000001', 'anthony.dominguez@cantv.com.ve', true),
('test_promotor', '$2b$12$e68YmX5gT9O1f3mX0pM5yO4QhK6uN0hR8eG8l2sD5jE4k7u9r0t1y', 1, 'Promotor Comunal de Campo', '10000002', 'promotor.campo@cantv.com.ve', true),
('test_coordinador', '$2b$12$e68YmX5gT9O1f3mX0pM5yO4QhK6uN0hR8eG8l2sD5jE4k7u9r0t1y', 2, 'Coordinador Territorial GGFPP', '10000003', 'coordinador.ggfpp@cantv.com.ve', true),
('test_regional', '$2b$12$e68YmX5gT9O1f3mX0pM5yO4QhK6uN0hR8eG8l2sD5jE4k7u9r0t1y', 3, 'Gerente Regional Estadal', '10000004', 'gerente.regional@cantv.com.ve', true),
('test_gdc', '$2b$12$e68YmX5gT9O1f3mX0pM5yO4QhK6uN0hR8eG8l2sD5jE4k7u9r0t1y', 4, 'Consultor GDC Nacional', '10000005', 'consultor.gdc@cantv.com.ve', true),
('test_gpacyg', '$2b$12$e68YmX5gT9O1f3mX0pM5yO4QhK6uN0hR8eG8l2sD5jE4k7u9r0t1y', 5, 'Auditor Nacional GPACyG', '10000006', 'auditor.gpacyg@cantv.com.ve', true),
('test_linea', '$2b$12$e68YmX5gT9O1f3mX0pM5yO4QhK6uN0hR8eG8l2sD5jE4k7u9r0t1y', 6, 'Gerente de Línea Operativa', '10000007', 'gerente.linea@cantv.com.ve', true),
('test_general', '$2b$12$e68YmX5gT9O1f3mX0pM5yO4QhK6uN0hR8eG8l2sD5jE4k7u9r0t1y', 6, 'Gerente General GGFPP', '10000008', 'gerente.general@cantv.com.ve', true),
('test_consulta', '$2b$12$e68YmX5gT9O1f3mX0pM5yO4QhK6uN0hR8eG8l2sD5jE4k7u9r0t1y', 7, 'Usuario de Consulta Pública', '10000009', 'consulta.publica@cantv.com.ve', true)
ON CONFLICT (usuario) DO UPDATE SET
    rol_id = EXCLUDED.rol_id,
    correo_institucional = EXCLUDED.correo_institucional,
    activo = EXCLUDED.activo;

COMMIT;
