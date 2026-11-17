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
SELECT setval(pg_get_serial_sequence('public.roles', 'id'), (SELECT MAX(id) FROM public.roles));

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

-- 5. Padrón de Usuarios Genéricos para Pruebas (Hash Bcrypt Cost 12 verificado)
-- Contraseñas temporales NIST de prueba:
-- superadmin:      SuperAdmin.2026#CANTV!
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
('superadmin', '$2b$12$PVE1XsfmXQA9SF5RoV0RbOFPtEbme9X8FRd2uehg/FeokrImpQZQW', 8, 'Anthony Domínguez (SuperAdmin - FIIIDT)', '10000001', 'anthony.dominguez@fii.gob.ve', true),
('anthony.dominguez', '$2b$12$PVE1XsfmXQA9SF5RoV0RbOFPtEbme9X8FRd2uehg/FeokrImpQZQW', 8, 'Anthony Domínguez (SuperAdmin - FIIIDT)', '10000001', 'anthony.dominguez@fii.gob.ve', true),
('test_promotor', '$2b$12$C3ozBkIF6qvr3KUwvw44yeT5s3YBfwqLIDQ6FPzboHXq52BivXDEC', 1, 'Promotor Comunal de Campo', '10000002', 'promotor.campo@cantv.com.ve', true),
('test_coordinador', '$2b$12$onWXte0STub3Iil5KNzYrugpXTjz87VyYAGvhCpoC14oI5Gkj7ZB6', 2, 'Coordinador Territorial GGFPP', '10000003', 'coordinador.ggfpp@cantv.com.ve', true),
('test_regional', '$2b$12$PgtF.4x9OeUgvlf1MTQCUOUl94/CVnFQsWiFIj9DdPgYzWlDp.Xv.', 3, 'Gerente Regional Estadal', '10000004', 'gerente.regional@cantv.com.ve', true),
('test_gdc', '$2b$12$zqYy/4r2s3pIAjjP/vnEoOi1YJzFCLRDg4I1N4QofwXjGa4xC7sfu', 4, 'Consultor GDC Nacional', '10000005', 'consultor.gdc@cantv.com.ve', true),
('test_gpacyg', '$2b$12$Vw7rlUer0HpEePEwx3eH5.qH7OfeEfcsOF.GGtWfAUqCzeaHFCubW', 5, 'Auditor Nacional GPACyG', '10000006', 'auditor.gpacyg@cantv.com.ve', true),
('test_linea', '$2b$12$95MXEdqhcE83N2r/UR3iee95./0jf3nWLoPknkB1JiBI7AqY0PPO.', 6, 'Gerente de Línea Operativa', '10000007', 'gerente.linea@cantv.com.ve', true),
('test_general', '$2b$12$wfDTva9YtsCXCELjGHbs0O9wrVbyDdO9nKG5KB2l2FXwbLPI8oDE2', 6, 'Gerente General GGFPP', '10000008', 'gerente.general@cantv.com.ve', true),
('test_consulta', '$2b$12$E896aPWh3GuNJV61ZNSAKeqYaPO.B2Zeb1h7kMIA8LukzBALzVsaq', 7, 'Usuario de Consulta Pública', '10000009', 'consulta.publica@cantv.com.ve', true),
('admin_gdc', '$2b$12$U3NefPYKkGP2FAMr5EgAwu7/G9vcuRuMwhWn.qfpwIiBc7G5vGFGG', 4, 'ADMINISTRADOR GENERAL GDC', '10000000', 'admin.gdc@cantv.com.ve', true)
ON CONFLICT (usuario) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    rol_id = EXCLUDED.rol_id,
    correo_institucional = EXCLUDED.correo_institucional,
    activo = EXCLUDED.activo;

-- 6. Saneamiento de integridad territorial en mtt_principal (erradicar filas de leyenda Excel y corregir espacio en código)
DELETE FROM public.mtt_principal
WHERE id IN (2559, 2560, 2561, 2562)
  AND (codigo_mtt IS NULL OR codigo_mtt = '')
  AND nombre IN ('N/D', 'ENTIDAD FEDERAL');

UPDATE public.mtt_principal
SET codigo_mtt = '171001.01', parroquia_id = 733
WHERE id = 2553 AND codigo_mtt = '171001. 01';

-- 7. Sincronizar secuencia de usuarios
SELECT setval(pg_get_serial_sequence('public.usuarios', 'id'), COALESCE((SELECT MAX(id) FROM public.usuarios), 1));

COMMIT;
