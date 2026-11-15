-- ============================================================================
-- 30 ÍNDICES B-TREE, FUNCIONALES Y COMPUESTOS DE ALTA PERFORMANCE (PostgreSQL 16)
-- ============================================================================

-- 1. CLAVES FORÁNEAS (Erradicación de Deadlocks y Locks en Cascada)
CREATE INDEX IF NOT EXISTS idx_vocerias_mtt_id ON public.vocerias USING btree (mtt_id);
CREATE INDEX IF NOT EXISTS idx_organizacion_comunal_mtt_id ON public.organizacion_comunal USING btree (mtt_id);
CREATE INDEX IF NOT EXISTS idx_seguimiento_mtt_id ON public.seguimiento USING btree (mtt_id);
CREATE INDEX IF NOT EXISTS idx_mtt_principal_parroquia_id ON public.mtt_principal USING btree (parroquia_id);
CREATE INDEX IF NOT EXISTS idx_parroquias_municipio_id ON public.parroquias USING btree (municipio_id);
CREATE INDEX IF NOT EXISTS idx_municipios_estado_id ON public.municipios USING btree (estado_id);
CREATE INDEX IF NOT EXISTS idx_estados_region_id ON public.estados USING btree (region_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol_id ON public.usuarios USING btree (rol_id);
CREATE INDEX IF NOT EXISTS idx_secuencias_parroquia_id ON public.mtt_secuencias_parroquia USING btree (parroquia_id);

-- 2. CÓDIGOS OFICIALES Y CORRELATIVOS (Asignación Atómica O(log N))
CREATE INDEX IF NOT EXISTS idx_mtt_principal_codigo ON public.mtt_principal USING btree (codigo_mtt);
CREATE INDEX IF NOT EXISTS idx_parroquias_ubigeo ON public.parroquias USING btree (codigo_ubigeo);
CREATE INDEX IF NOT EXISTS idx_secuencias_ubigeo ON public.mtt_secuencias_parroquia USING btree (codigo_ubigeo_6d);
CREATE INDEX IF NOT EXISTS idx_organizacion_comuna_codigo ON public.organizacion_comunal USING btree (comuna_codigo);
CREATE INDEX IF NOT EXISTS idx_organizacion_consejo_situr ON public.organizacion_comunal USING btree (consejo_situr);

-- 3. NUEVOS CAMPOS TÉCNICOS, TELECOMUNICACIONES Y CONTACTO
CREATE INDEX IF NOT EXISTS idx_mtt_principal_central_cantv ON public.mtt_principal USING btree (central_cantv_cercana);
CREATE INDEX IF NOT EXISTS idx_mtt_principal_nombre_nodo ON public.mtt_principal USING btree (nombre_nodo);
CREATE INDEX IF NOT EXISTS idx_mtt_principal_huella_gpon ON public.mtt_principal USING btree (huella_gpon);
CREATE INDEX IF NOT EXISTS idx_mtt_principal_correo ON public.mtt_principal USING btree (correo_electronico);
CREATE INDEX IF NOT EXISTS idx_organizacion_cec_comuna ON public.organizacion_comunal USING btree (cec_comuna);

-- 4. IDENTIDAD Y AUDITORÍA
CREATE INDEX IF NOT EXISTS idx_vocerias_v1_cedula ON public.vocerias USING btree (v1_cedula);
CREATE INDEX IF NOT EXISTS idx_vocerias_v2_cedula ON public.vocerias USING btree (v2_cedula);
CREATE INDEX IF NOT EXISTS idx_usuarios_cedula ON public.usuarios USING btree (cedula);
CREATE INDEX IF NOT EXISTS idx_usuarios_usuario ON public.usuarios USING btree (usuario);

-- 5. BÚSQUEDAS RÁPIDAS CASE-INSENSITIVE (LOWER)
CREATE INDEX IF NOT EXISTS idx_mtt_principal_nombre_lower ON public.mtt_principal USING btree (LOWER(nombre));
CREATE INDEX IF NOT EXISTS idx_parroquias_nombre_lower ON public.parroquias USING btree (LOWER(nombre));
CREATE INDEX IF NOT EXISTS idx_municipios_nombre_lower ON public.municipios USING btree (LOWER(nombre));
CREATE INDEX IF NOT EXISTS idx_estados_nombre_lower ON public.estados USING btree (LOWER(nombre));
CREATE INDEX IF NOT EXISTS idx_organizacion_comuna_lower ON public.organizacion_comunal USING btree (LOWER(comuna_nombre));
CREATE INDEX IF NOT EXISTS idx_organizacion_consejo_lower ON public.organizacion_comunal USING btree (LOWER(consejo_nombre));

-- 6. FILTROS DE BANDEJAS OPERATIVAS, TERRITORIALES Y AUDITORÍA
CREATE INDEX IF NOT EXISTS idx_mtt_territorio_estatus ON public.mtt_principal USING btree (parroquia_id, estatus);
CREATE INDEX IF NOT EXISTS idx_mtt_principal_estatus ON public.mtt_principal USING btree (estatus);
CREATE INDEX IF NOT EXISTS idx_mtt_principal_tipo ON public.mtt_principal USING btree (tipo);
CREATE INDEX IF NOT EXISTS idx_mtt_principal_fecha_creacion ON public.mtt_principal USING btree (fecha_creacion DESC);
CREATE INDEX IF NOT EXISTS idx_mtt_principal_fecha_cambio_estatus ON public.mtt_principal USING btree (fecha_cambio_estatus DESC);
CREATE INDEX IF NOT EXISTS idx_seguimiento_verificado ON public.seguimiento USING btree (verificado_gerencia);

-- 7. COORDENADAS GPS / GEOREFERENCIACIÓN
CREATE INDEX IF NOT EXISTS idx_mtt_principal_coords ON public.mtt_principal USING btree (latitud, longitud);

-- RECALCULAR ESTADÍSTICAS DEL OPTIMIZADOR POSTGRESQL 16
ANALYZE public.mtt_principal;
ANALYZE public.organizacion_comunal;
ANALYZE public.vocerias;
ANALYZE public.seguimiento;
ANALYZE public.parroquias;
ANALYZE public.municipios;
ANALYZE public.estados;
ANALYZE public.mtt_secuencias_parroquia;
ANALYZE public.usuarios;
ANALYZE public.roles;
ANALYZE public.regiones;
