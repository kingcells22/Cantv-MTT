# MATRIZ OFICIAL DE LAS 51 VARIABLES - SINCOMTT
## Hoja «Registro_MTT» · Diccionario de Datos v6.0 / v7.0 Validado

| N° | Col | Encabezado Oficial en Excel | Bloque Funcional | Tipo de Dato | Regla de Oro (Faltantes) | Mecanismo de Validación |
| :---: | :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | **A** | `CODIGO MTT` | 1. Ubicación e Identificación | Alfanumérico | `null` (Estrictamente Vacío) | Solo asignable por Consultor GDC |
| **2** | **B** | `REGIONES` | 1. Ubicación e Identificación | Lista Desplegable | `null` (Estrictamente Vacío) | Catálogo: Capital, Central, Llanos, Guayana, Los Andes, Occidente, Oriente |
| **3** | **C** | `ENTIDAD FEDERAL` | 1. Ubicación e Identificación | Lista Desplegable | `null` (Estrictamente Vacío) | 24 Entidades Federales oficiales INE |
| **4** | **D** | `MUNICIPIO` | 1. Ubicación e Identificación | Lista Desplegable | `null` (Estrictamente Vacío) | Dependiente de Entidad Federal |
| **5** | **E** | `PARROQUIA` | 1. Ubicación e Identificación | Lista Desplegable | `null` (Estrictamente Vacío) | Dependiente de Municipio (1.137 parroquias) |
| **6** | **F** | `CODIGO CIRCUITO COMUNAL/COMUNA` | 1. Ubicación e Identificación | Alfanumérico | `null` (Estrictamente Vacío) | Código oficial C-URB/COM |
| **7** | **G** | `NOMBRE CIRCUITO COMUNAL/COMUNA` | 1. Ubicación e Identificación | Texto Libre | `«N/D»` | Obligatorio «N/D» si no se suministra |
| **8** | **H** | `NOMBRE DE LA MESA TÉCNICA DE TELECOMUNICACIONES (MTT)` | 1. Ubicación e Identificación | Texto Libre | Requerido | Denominación legal según acta |
| **9** | **I** | `TIPO DE MTT` | 1. Ubicación e Identificación | Lista Desplegable | `null` (Estrictamente Vacío) | Catálogo: URBANA, RURAL, MIXTA, INDÍGENA |
| **10** | **J** | `FECHA DE CREACIÓN` | 1. Ubicación e Identificación | Fecha (AAAA-MM-DD) | `null` (Estrictamente Vacío) | Fecha del acta de conformación |
| **11** | **K** | `AÑO DE CREACIÓN` | 1. Ubicación e Identificación | Entero (Fórmula) | `null` (Estrictamente Vacío) | Calculado automáticamente del año de creación |
| **12** | **L** | `ESTATUS DE LA MTT` | 1. Ubicación e Identificación | Lista Desplegable | `null` (Estrictamente Vacío) | Catálogo: ACTIVA, INACTIVA, CERRADA |
| **13** | **M** | `FECHA DEL CAMBIO DE ESTATUS DE LA MTT` | 1. Ubicación e Identificación | Fecha (AAAA-MM-DD) | `null` (Estrictamente Vacío) | Fecha de la asamblea de reactivación/cierre |
| **14** | **N** | `GEORREFERENCIACIÓN (SI/NO)` | 1. Ubicación e Identificación | Lista Desplegable | Requerido | SI / NO |
| **15** | **O** | `GEORREFERENCIACIÓN/COORDENADAS (DECIMALES)` | 1. Ubicación e Identificación | Coordenadas | `null` (Estrictamente Vacío) | Formato `latitud, longitud` |
| **16** | **P** | `CORREO E. DE LA MTT` | 1. Ubicación e Identificación | Texto / Email | `«N/D»` | Correo de contacto o «N/D» |
| **17** | **Q** | `USO DE REDES SOCIALES` | 1. Ubicación e Identificación | Lista Desplegable | Requerido | SI / NO |
| **18** | **R** | `RED SOCIAL MÁS UTILIZADA` | 1. Ubicación e Identificación | Lista Desplegable | `null` (Estrictamente Vacío) | Catálogo: FACEBOOK, INSTAGRAM, WHATSAPP, etc. |
| **19** | **S** | `CODIGO SITUR DEL CONSEJO COMUNAL` | 2. Organización Comunal | Alfanumérico | `null` (Estrictamente Vacío) | Padrón SITUR |
| **20** | **T** | `NOMBRE DEL CONSEJO COMUNAL REFERENCIA` | 2. Organización Comunal | Texto Libre | `«N/D»` | Denominación o «N/D» |
| **21** | **U** | `SAC VINCULADA` | 2. Organización Comunal | Lista Desplegable | Requerido | SI / NO |
| **22** | **V** | `SAC CONECTADA` | 2. Organización Comunal | Lista Desplegable | `null` (Estrictamente Vacío) | Catálogo: CANTV, OTRA OPERADORA, SIN CONEXIÓN |
| **23** | **W** | `CEC/COMUNA` | 2. Organización Comunal | Lista Desplegable | `null` (Estrictamente Vacío) | Catálogo: COMUNA, CIRCUITO |
| **24** | **X** | `N° CC` | 2. Organización Comunal | Entero Positivo | `null` (Estrictamente Vacío) | Número de Consejos Comunales vinculados |
| **25** | **Y** | `N° COMITÉS DE MTT` | 2. Organización Comunal | Entero Positivo | `null` (Estrictamente Vacío) | Cantidad de comités conformados |
| **26** | **Z** | `N° DE FAMILIAS` | 2. Organización Comunal | Entero Positivo | `null` (Estrictamente Vacío) | Censo poblacional (Familias) |
| **27** | **AA** | `N° DE HABITANTES` | 2. Organización Comunal | Entero Positivo | `null` (Estrictamente Vacío) | Censo poblacional (Habitantes) |
| **28** | **AB** | `ZONA SERVIDA (SI/NO)` | 3. Información Técnica | Lista Desplegable | Requerido | SI / NO |
| **29** | **AC** | `MEDIO DE TRANSMISIÓN` | 3. Información Técnica | Lista Desplegable | `null` (Estrictamente Vacío) | Catálogo: CABLE DE COBRE, FIBRA ÓPTICA, etc. |
| **30** | **AD** | `OTRAS OPERADORAS` | 3. Información Técnica | Lista Desplegable | `null` (Estrictamente Vacío) | MOVILNET, OPERADORA PRIVADA, etc. |
| **31** | **AE** | `ELEMENTO DE LA RED` | 3. Información Técnica | Lista Desplegable | `null` (Estrictamente Vacío) | CENTRAL, URL, ODN, NODO NGN, ADS, etc. |
| **32** | **AF** | `MTT EN HUELLA GPON (SI/NO)` | 3. Información Técnica | Lista Desplegable | Requerido | SI / NO |
| **33** | **AG** | `ESTATUS DE LAS VOCERÍAS` | 4. Voceros y Voceras | Lista Desplegable | `null` (Estrictamente Vacío) | VIGENTE / VENCIDA |
| **34** | **AH** | `CANTIDAD DE VOCEROS DE MTT (MUJERES)` | 4. Voceros y Voceras | Entero Positivo | `null` (Estrictamente Vacío) | Prohibido poner cero salvo verificación |
| **35** | **AI** | `CANTIDAD DE VOCEROS DE MTT (HOMBRES)` | 4. Voceros y Voceras | Entero Positivo | `null` (Estrictamente Vacío) | Prohibido poner cero salvo verificación |
| **36** | **AJ** | `TOTAL DE VOCERAS Y VOCEROS DE MTT` | 4. Voceros y Voceras | Entero (Fórmula) | `null` (Estrictamente Vacío) | Suma matemática: Mujeres + Hombres |
| **37** | **AK** | `NOMBRE Y APELLIDO - VOCERO 1` | 4. Voceros y Voceras | Texto Libre | `«N/D»` | Nombre completo o «N/D» |
| **38** | **AL** | `N° DE CÉDULA DE IDENTIDAD - V1` | 4. Voceros y Voceras | Entero | `null` (Estrictamente Vacío) | Cédula numérica |
| **39** | **AM** | `FECHA DE NACIMIENTO - V1` | 4. Voceros y Voceras | Fecha (AAAA-MM-DD) | `null` (Estrictamente Vacío) | Fecha de nacimiento |
| **40** | **AN** | `SEXO - V1` | 4. Voceros y Voceras | Lista Desplegable | `null` (Estrictamente Vacío) | MUJER / HOMBRE |
| **41** | **AO** | `N° DE TELÉFONO CONTACTO - V1` | 4. Voceros y Voceras | Texto / Teléfono | `«N/D»` | Teléfono o «N/D» |
| **42** | **AP** | `NOMBRE Y APELLIDO - VOCERO 2` | 4. Voceros y Voceras | Texto Libre | `«N/D»` | Nombre completo o «N/D» |
| **43** | **AQ** | `N° DE CÉDULA DE IDENTIDAD - V2` | 4. Voceros y Voceras | Entero | `null` (Estrictamente Vacío) | Cédula numérica |
| **44** | **AR** | `FECHA DE NACIMIENTO - V2` | 4. Voceros y Voceras | Fecha (AAAA-MM-DD) | `null` (Estrictamente Vacío) | Fecha de nacimiento |
| **45** | **AS** | `SEXO - V2` | 4. Voceros y Voceras | Lista Desplegable | `null` (Estrictamente Vacío) | MUJER / HOMBRE |
| **46** | **AT** | `N° DE TELÉFONO CONTACTO - V2` | 4. Voceros y Voceras | Texto / Teléfono | `«N/D»` | Teléfono o «N/D» |
| **47** | **AU** | `ACTIVADOR O ACTIVADORA DE LA MTT` | 5. Control y Seguimiento | Texto Libre | `«N/D»` | Nombre del promotor/activador o «N/D» |
| **48** | **AV** | `FECHA DE LA ULTIMA VISITA` | 5. Control y Seguimiento | Fecha (AAAA-MM-DD) | `null` (Estrictamente Vacío) | Fecha de visita en territorio |
| **49** | **AW** | `OBSERVACIÓN` | 5. Control y Seguimiento | Texto Libre | `«SIN OBSERVACIÓN»` | Por defecto «SIN OBSERVACIÓN» |
| **50** | **AX** | `VERIFICADO` | 5. Control y Seguimiento | Lista Desplegable | Requerido | SI / NO (Por defecto NO) |
| **51** | **AY** | `FECHA DE VERIFICACIÓN` | 5. Control y Seguimiento | Fecha (AAAA-MM-DD) | `null` (Estrictamente Vacío) | Fecha en que el Gerente Regional valida |

