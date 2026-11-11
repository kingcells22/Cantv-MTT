-- ============================================================================
-- OPTIMIZACIÓN DE ÍNDICES PARA ALTA CONCURRENCIA (SINCOMTT - CANTV GGFPP)
-- Acelera consultas de cruces, catálogos en cascada y previene bloqueos de tabla
-- ============================================================================

-- 1. Claves Foráneas de Tablas Hijas vinculadas a mtt_principal
CREATE INDEX IF NOT EXISTS idx_vocerias_mtt_id ON public.vocerias USING btree (mtt_id);
CREATE INDEX IF NOT EXISTS idx_organizacion_comunal_mtt_id ON public.organizacion_comunal USING btree (mtt_id);
CREATE INDEX IF NOT EXISTS idx_seguimiento_mtt_id ON public.seguimiento USING btree (mtt_id);

-- 2. Clave Foránea de Ubigeo en mtt_principal
CREATE INDEX IF NOT EXISTS idx_mtt_principal_parroquia_id ON public.mtt_principal USING btree (parroquia_id);

-- 3. Claves Foráneas de Catálogos Geográficos (Combos en cascada instantáneos)
CREATE INDEX IF NOT EXISTS idx_parroquias_municipio_id ON public.parroquias USING btree (municipio_id);
CREATE INDEX IF NOT EXISTS idx_municipios_estado_id ON public.municipios USING btree (estado_id);
CREATE INDEX IF NOT EXISTS idx_estados_region_id ON public.estados USING btree (region_id);

-- 4. Clave Foránea de Usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_rol_id ON public.usuarios USING btree (rol_id);

-- 5. Índices de Búsqueda y Filtros Frecuentes en la Matriz de 51 Variables
CREATE INDEX IF NOT EXISTS idx_mtt_principal_estatus ON public.mtt_principal USING btree (estatus);
CREATE INDEX IF NOT EXISTS idx_mtt_principal_tipo ON public.mtt_principal USING btree (tipo);
CREATE INDEX IF NOT EXISTS idx_mtt_principal_fecha_creacion ON public.mtt_principal USING btree (fecha_creacion DESC);
CREATE INDEX IF NOT EXISTS idx_mtt_principal_nombre ON public.mtt_principal USING btree (nombre);
