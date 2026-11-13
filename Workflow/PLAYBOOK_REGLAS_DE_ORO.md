# PLAYBOOK: LAS CUATRO REGLAS DE ORO INSTITUCIONALES PARA DATOS FALTANTES
## Diccionario de Datos v6.0 / v7.0 - SINCOMTT (CANTV · GGFPP)

Este documento define la norma obligatoria para el tratamiento de campos ausentes, nulos o no suministrados en el levantamiento de información de las Mesas Técnicas de Telecomunicaciones.

---

### Regla 1: Listas Desplegables y Ubigeo INE
> **Norma:** Si no se dispone del dato en el levantamiento territorial, el campo debe quedar **ESTRICTAMENTE VACÍO (`null`)**.
* **Prohibición Expresa:** Queda estrictamente prohibido seleccionar o inventar valores como `"N/D"`, `"No Aplica"`, `"Ninguno"` (a menos que la opción exista formalmente en el catálogo oficial) o cadenas vacías `""`.
* **Aplica a:** Regiones, Entidad Federal, Municipio, Parroquia, Tipo de MTT, Estatus de la MTT, Elemento de Red, Medio de Transmisión, Operadoras, Sexo de los voceros.

---

### Regla 2: Numéricos, Cédulas, Coordenadas, Fechas y Códigos Oficiales
> **Norma:** Deben quedar **ESTRICTAMENTE VACÍOS (`null`)**.
* **Prohibición Expresa:** En variables de conteo cuantitativo está **TERMINANTEMENTE PROHIBIDO COLOCAR CERO (`0`)** a menos que se haya verificado en campo la ausencia física absoluta.
* **Justificación Metodológica:** Un valor `0` altera las medias estadísticas y desvirtúa los censos demográficos. La falta de dato es una omisión censal (`null`), no un conteo verificado de cero personas o familias.
* **Aplica a:** `v1_cedula`, `v2_cedula`, `num_cc`, `num_comites_mtt`, `num_familias`, `num_habitantes`, `voceros_mujeres`, `voceros_hombres`, `codigo_mtt`, fechas y coordenadas.

---

### Regla 3: Campos de Texto Libre y Teléfonos de Contacto
> **Norma:** Colocar obligatoriamente el literal **«N/D»** (No Disponible).
* **Prohibición Expresa:** Se prohíbe dejar cadenas vacías `""`, espacios en blanco `" "` o leyendas coloquiales no estandarizadas (`"no tiene"`, `"sin info"`, `"desconocido"`).
* **Aplica a:** Nombres de Circuitos Comunales, Nombres de Consejos Comunales, Nombres de Voceros no identificados, Teléfonos de Voceros, Correo de la MTT, Activador/a de la MTT.

---

### Regla 4: Fórmulas Automáticas y Campo de Observación
> **Norma:**
1. **`ano_creacion`:** Se calcula y extrae de forma automática a partir del año de `fecha_creacion`. Si no hay fecha, queda en `null`.
2. **`total_voceros`:** Es el resultado de la suma matemática estricta:
   $$\text{Total Voceros} = \text{Voceros Mujeres} + \text{Voceros Hombres}$$
   Si ambos campos están vacíos, queda en `null`.
3. **`observacion`:** Si no se reportan incidencias ni novedades de campo, debe consignarse de manera obligatoria y automática el texto exacto **«SIN OBSERVACIÓN»**.

---

### Regla 5 (Gobernanza y Desarrollo): Actualización Mandatoria de Archivos `.md` y Bitácoras
> **Norma:** En toda sesión, intervención, cambio de código o hito alcanzado, es **ESTRICTAMENTE OBLIGATORIO** actualizar la bitácora activa `SESSION_CONTEXT.md` y los archivos `.md` de seguimiento (`Agents/SESSION_HILO.md`, `Agents/BDR_REGISTRO_DEFECTOS.md`, guías técnicas y documentación).
* **Política de Aislamiento Git:** Todos los archivos de gobernanza interna, bitácoras y playbooks locales (`.agents/`, `Agents/`, `Workflow/`, `Datos_del_Proyecto/`, `AGENTS.md`, `SESSION_CONTEXT.md`, `SESSION_HILO.md`) deben mantenerse **exclusivamente locales** y protegidos en `.gitignore` para no ser subidos a ramas remotas.
* **Persistencia Física:** En sistemas Linux con particiones compartidas, ejecutar siempre `sync` en terminal tras realizar cambios documentales o de código.

---

### Resumen de Transformaciones en Frontend (Capa Defensiva)

```typescript
// Sanitizador Zod aplicado en el frontend previo al envío
export const sanitizarPayloadMTT = (data: any) => {
  return {
    ...data,
    // Regla 3: Texto libre
    nombre_circuito_comunal: data.nombre_circuito_comunal?.trim() || "N/D",
    correo_mtt: data.correo_mtt?.trim() || "N/D",
    v1_telefono: data.v1_telefono?.trim() || "N/D",
    v2_telefono: data.v2_telefono?.trim() || "N/D",
    // Regla 4: Observación
    observacion: data.observacion?.trim() || "SIN OBSERVACIÓN",
    // Regla 2: Numéricos y conteos
    num_familias: data.num_familias !== "" && data.num_familias !== null ? Number(data.num_familias) : null,
    total_voceros: (data.voceros_mujeres ?? 0) + (data.voceros_hombres ?? 0) || null
  };
};
```

