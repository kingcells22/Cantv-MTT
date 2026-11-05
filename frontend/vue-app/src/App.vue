<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";

// Estado de autenticación
const isAuthenticated = ref(false);
const vistaActual = ref("dashboardView");
const loading = ref(false);
const errorMensaje = ref("");

// Configuración de Axios para el Backend de Python
const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Datos de login
const loginData = ref({
  usuario: "admin",
  password: "123456",
  perfil: "", // Lo dejamos vacío temporalmente, el backend nos lo devolverá
});

// Roles que coinciden exactamente con la tabla `roles` en PostgreSQL
const rolesDisponibles = [
  {
    id: "Coordinador / Promotor (Registro y Edición)",
    nombre: "Coordinador / Promotor (Registro y Edición)",
  },
  {
    id: "Gerente Regional (Validación / Devolución)",
    nombre: "Gerente Regional (Validación / Devolución)",
  },
  {
    id: "Consultor GDC (Asignación de Códigos)",
    nombre: "Consultor GDC (Asignación de Códigos)",
  },
  {
    id: "Usuario Consulta (Solo Lectura)",
    nombre: "Usuario Consulta (Solo Lectura)",
  },
];

// Datos de la tabla MTT
const listaMTT = ref([]);

// Variables para los combos en cascada
const estadosList = ref([]);
const municipiosList = ref([]);
const parroquiasList = ref([]);

// Formulario reactivo para la inserción
const nuevoRegistro = ref({
  parroquia_id: null,
  nombre: "",
  tipo: "Urbana",
  fecha_creacion: "",
  tiene_georreferenciacion: false,
  latitud: null,
  longitud: null,
  sector: "",
  comuna_nombre: "",
  comuna_codigo: "",
  consejo_nombre: "",
  consejo_situr: "",
  sac_vinculada: false,
  num_cc: 1,
  num_familias: null,
  num_habitantes: null,
  zona_cantv: true,
  elemento_red: "",
  huella_gpon: false,
  total_mujeres: 0,
  total_hombres: 0,
  v1_nombre: "",
  v1_cedula: "",
  v1_telefono: "",
  v2_nombre: "",
  v2_cedula: "",
  v2_telefono: "",
  observacion: "SIN OBSERVACIÓN",
});

// Variables auxiliares para los combos
const estadoSeleccionado = ref(null);
const municipioSeleccionado = ref(null);

// === MÉTODOS ===

const realizarLogin = async () => {
  // Ahora validamos que exista usuario y password
  if (loginData.value.usuario && loginData.value.password) {
    loading.value = true;
    errorMensaje.value = "";
    try {
      // Enviamos usuario y password al backend
      const response = await api.post("/api/login", {
        usuario: loginData.value.usuario,
        password: loginData.value.password,
      });

      if (response.data.status === "success") {
        // Asignamos el rol real que nos devuelve la base de datos
        loginData.value.perfil = response.data.rol;

        isAuthenticated.value = true;
        vistaActual.value = "dashboardView";
        cargarMTTs();
      }
    } catch (error) {
      console.error(error);
      // Mostramos un error específico si las credenciales fallan (HTTP 401)
      if (error.response && error.response.status === 401) {
        errorMensaje.value = "Usuario o contraseña incorrectos.";
      } else {
        errorMensaje.value =
          "Error al conectar con la base de datos o el backend.";
      }
    } finally {
      loading.value = false;
    }
  } else {
    errorMensaje.value = "Por favor ingrese usuario y contraseña.";
  }
};

const cargarMTTs = async () => {
  try {
    const response = await api.get("/api/mtt");
    listaMTT.value = response.data;
  } catch (error) {
    console.error("Error al cargar MTTs desde Postgres:", error);
  }
};

// Cargar Estados al inicio
const cargarEstados = async () => {
  try {
    const res = await api.get("/api/catalogos/estados");
    estadosList.value = res.data;
  } catch (error) {
    console.error(error);
  }
};

// Cargar Municipios cuando cambia el Estado
const cargarMunicipios = async () => {
  if (!estadoSeleccionado.value) return;
  try {
    const res = await api.get(
      `/api/catalogos/municipios/${estadoSeleccionado.value}`,
    );
    municipiosList.value = res.data;
    municipioSeleccionado.value = null; // Reset dependencias
    nuevoRegistro.value.parroquia_id = null;
    parroquiasList.value = [];
  } catch (error) {
    console.error(error);
  }
};

// Cargar Parroquias cuando cambia el Municipio
const cargarParroquias = async () => {
  if (!municipioSeleccionado.value) return;
  try {
    const res = await api.get(
      `/api/catalogos/parroquias/${municipioSeleccionado.value}`,
    );
    parroquiasList.value = res.data;
  } catch (error) {
    console.error(error);
  }
};

// Función para enviar el registro al backend
const enviarMTT = async () => {
  if (!nuevoRegistro.value.parroquia_id) {
    alert("Debe seleccionar una parroquia");
    return;
  }

  try {
    const res = await api.post("/api/mtt", nuevoRegistro.value);
    alert(res.data.mensaje); // "MTT registrada exitosamente"
    vistaActual.value = "dashboardView"; // Devolver al inicio
    cargarMTTs(); // Refrescar la tabla
  } catch (error) {
    console.error(error);
    alert("Hubo un error al guardar. Revisa la consola.");
  }
};

onMounted(() => {
  cargarEstados();
});

const cerrarSesion = () => {
  isAuthenticated.value = false;
  vistaActual.value = "dashboardView";
  listaMTT.value = [];
};

// Computados para mostrar el nombre del rol en el topbar
const nombreRolActual = computed(() => {
  return loginData.value.perfil || "Desconocido";
});

// Computados de Permisos según el rol exacto o si es Administrador
const puedeRegistrar = computed(
  () =>
    loginData.value.perfil === "Coordinador / Promotor (Registro y Edición)" ||
    loginData.value.perfil === "Administrador",
);
const puedeGDC = computed(
  () =>
    loginData.value.perfil === "Gerente Regional (Validación / Devolución)" ||
    loginData.value.perfil === "Consultor GDC (Asignación de Códigos)" ||
    loginData.value.perfil === "Administrador",
);
</script>

<template>
  <div>
    <!-- LOGIN SCREEN -->
    <div v-if="!isAuthenticated" id="loginOverlay">
      <div
        class="card p-4 shadow-lg"
        style="width: 100%; max-width: 420px; border-radius: 12px"
      >
        <div class="text-center mb-4">
          <i class="fa-solid fa-tower-broadcast text-primary fs-1 mb-2"></i>
          <h4 class="fw-bold">Sistema MTT</h4>
          <p class="text-muted small">Ingrese sus credenciales para acceder</p>
        </div>

        <div v-if="errorMensaje" class="alert alert-danger small text-center">
          {{ errorMensaje }}
        </div>

        <div class="mb-3">
          <label class="form-label fw-bold small">Usuario o Cédula</label>
          <input
            type="text"
            class="form-control"
            v-model="loginData.usuario"
            :disabled="loading"
          />
        </div>
        <div class="mb-3">
          <label class="form-label fw-bold small">Contraseña</label>
          <input
            type="password"
            class="form-control"
            v-model="loginData.password"
            :disabled="loading"
            @keyup.enter="realizarLogin"
          />
        </div>
        <button
          class="btn btn-primary w-100 py-2 fw-bold"
          @click="realizarLogin"
          :disabled="loading"
        >
          <span
            v-if="loading"
            class="spinner-border spinner-border-sm me-2"
          ></span>
          <i v-else class="fa-solid fa-right-to-bracket"></i> Ingresar al
          Sistema
        </button>
      </div>
    </div>

    <!-- MAIN SYSTEM -->
    <div v-else class="system-wrapper">
      <!-- SIDEBAR -->
      <nav id="sidebar">
        <div
          class="sidebar-header d-flex justify-content-between align-items-center"
        >
          <span
            ><i class="fa-solid fa-tower-broadcast text-primary"></i> Sistema
            MTT</span
          >
        </div>
        <ul class="list-unstyled components">
          <li :class="{ active: vistaActual === 'dashboardView' }">
            <a href="#" @click.prevent="vistaActual = 'dashboardView'"
              ><i class="fa-solid fa-house"></i> Página Principal</a
            >
          </li>
          <li
            v-if="puedeRegistrar"
            :class="{ active: vistaActual === 'registryView' }"
          >
            <a href="#" @click.prevent="vistaActual = 'registryView'"
              ><i class="fa-solid fa-file-circle-plus"></i> Registrar Nueva
              MTT</a
            >
          </li>
          <li
            v-if="puedeRegistrar"
            :class="{ active: vistaActual === 'updateView' }"
          >
            <a href="#" @click.prevent="vistaActual = 'updateView'"
              ><i class="fa-solid fa-pen-to-square"></i> Actualizar /
              Vocerías</a
            >
          </li>
          <li v-if="puedeGDC" :class="{ active: vistaActual === 'gdcView' }">
            <a href="#" @click.prevent="vistaActual = 'gdcView'"
              ><i class="fa-solid fa-shield-halved text-warning"></i> Bandeja
              GDC (Códigos)</a
            >
          </li>
          <li :class="{ active: vistaActual === 'databaseView' }">
            <a href="#" @click.prevent="vistaActual = 'databaseView'"
              ><i class="fa-solid fa-table"></i> Matriz de Datos (45 Cols)</a
            >
          </li>
        </ul>
      </nav>

      <!-- CONTENT -->
      <div id="content">
        <div
          class="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom topbar-bg"
        >
          <div class="d-flex align-items-center">
            <h2 class="h4 fw-bold text-dark mb-0">
              <span v-if="vistaActual === 'dashboardView'"
                >Página Principal</span
              >
              <span v-if="vistaActual === 'registryView'"
                >Registrar Nueva MTT</span
              >
              <span v-if="vistaActual === 'updateView'"
                >Actualizar / Vocerías</span
              >
              <span v-if="vistaActual === 'gdcView'"
                >Bandeja GDC (Asignación)</span
              >
              <span v-if="vistaActual === 'databaseView'">Matriz de Datos</span>
            </h2>
          </div>
          <div class="dropdown">
            <button
              class="btn btn-outline-dark dropdown-toggle btn-sm bg-white"
              type="button"
              data-bs-toggle="dropdown"
            >
              <i class="fa-solid fa-user-shield"></i>
              <span>{{ nombreRolActual }}</span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <a
                  class="dropdown-item small"
                  href="#"
                  @click.prevent="cerrarSesion"
                  ><i class="fa-solid fa-right-from-bracket text-danger"></i>
                  Cambiar de Rol / Salir</a
                >
              </li>
            </ul>
          </div>
        </div>

        <!-- VISTA 1: DASHBOARD -->
        <div v-if="vistaActual === 'dashboardView'">
          <div class="row g-3 mb-4">
            <div class="col-sm-6 col-xl-3">
              <div class="card card-kpi p-3 bg-white">
                <h6 class="text-muted small">Total MTT Registradas</h6>
                <h3 class="fw-bold mb-0">{{ listaMTT.length }}</h3>
              </div>
            </div>
            <div class="col-sm-6 col-xl-3">
              <div class="card card-kpi p-3 bg-white">
                <h6 class="text-muted small">MTT Activas / Validadas</h6>
                <h3 class="fw-bold text-success mb-0">
                  {{
                    listaMTT.filter((m) => m.estatus.includes("ACTIVA")).length
                  }}
                </h3>
              </div>
            </div>
            <div class="col-sm-6 col-xl-3">
              <div class="card card-kpi p-3 bg-white">
                <h6 class="text-muted small">En Revisión de Acta</h6>
                <h3 class="fw-bold text-warning mb-0">
                  {{
                    listaMTT.filter((m) => m.estatus.includes("Pendiente"))
                      .length
                  }}
                </h3>
              </div>
            </div>
            <div class="col-sm-6 col-xl-3">
              <div class="card card-kpi p-3 bg-white">
                <h6 class="text-muted small">MTT en Huella GPON</h6>
                <h3 class="fw-bold text-info mb-0">0</h3>
              </div>
            </div>
          </div>

          <div class="table-container bg-white">
            <h5 class="mb-3 fs-6">
              <i class="fa-solid fa-list-check"></i> MTT Recientes en el Sistema
            </h5>
            <table class="table table-hover align-middle small">
              <thead class="table-dark">
                <tr>
                  <th>Código MTT</th>
                  <th>Nombre</th>
                  <th>Entidad / Municipio</th>
                  <th>Estatus</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(mtt, index) in listaMTT" :key="index">
                  <td class="fw-bold">{{ mtt.codigo }}</td>
                  <td>{{ mtt.nombre }}</td>
                  <td>- / -</td>
                  <td>
                    <span
                      class="badge"
                      :class="
                        mtt.estatus.includes('ACTIVA')
                          ? 'badge-active'
                          : 'badge-pending'
                      "
                    >
                      {{ mtt.estatus }}
                    </span>
                  </td>
                  <td>
                    <button
                      class="btn btn-sm btn-outline-primary py-0 px-2"
                      v-if="mtt.estatus.includes('ACTIVA')"
                    >
                      <i class="fa-solid fa-file-pdf"></i> PDF
                    </button>
                    <button
                      class="btn btn-sm btn-outline-warning py-0 px-2"
                      v-else
                      @click="vistaActual = 'gdcView'"
                    >
                      <i class="fa-solid fa-gavel"></i> Revisar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- VISTA 2: REGISTRO (CON TODOS LOS CAMPOS) -->
        <div v-if="vistaActual === 'registryView'">
          <div class="card-container bg-white p-3 p-md-4 rounded shadow-sm">
            <h4 class="mb-3 text-primary fs-5">
              <i class="fa-solid fa-file-circle-plus"></i> Formulario de
              Registro - Nueva MTT
            </h4>
            <div class="alert alert-info small">
              <i class="fa-solid fa-info-circle"></i> Complete todos los módulos
              requeridos por la estructura oficial (45 columnas).
            </div>

            <form id="formRegistroMTT" @submit.prevent="enviarMTT">
              <h5 class="form-section-title">
                1. Identificación y Estatus MTT
              </h5>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label small"
                    >Nombre de la Mesa Técnica de Telecomunicaciones
                    (MTT)</label
                  >
                  <input
                    type="text"
                    class="form-control form-control-sm"
                    placeholder="Denominación según acta"
                    v-model="nuevoRegistro.nombre"
                    required
                  />
                </div>
                <div class="col-md-3">
                  <label class="form-label small">Tipo de MTT</label>
                  <select
                    class="form-select form-select-sm"
                    v-model="nuevoRegistro.tipo"
                  >
                    <option>Urbana</option>
                    <option>Rural</option>
                    <option>Indígena</option>
                    <option>Mixta</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label small">Fecha de Creación</label>
                  <input
                    type="date"
                    class="form-control form-control-sm"
                    v-model="nuevoRegistro.fecha_creacion"
                    required
                  />
                </div>
                <div class="col-md-4">
                  <label class="form-label small"
                    >Georreferenciación (SI/NO)</label
                  >
                  <select
                    class="form-select form-select-sm"
                    v-model="nuevoRegistro.tiene_georreferenciacion"
                  >
                    <option :value="true">Sí</option>
                    <option :value="false">No</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label small">Latitud (Decimal)</label>
                  <input
                    type="text"
                    class="form-control form-control-sm"
                    placeholder="Ej. 10.4806"
                    v-model="nuevoRegistro.latitud"
                  />
                </div>
                <div class="col-md-4">
                  <label class="form-label small">Longitud (Decimal)</label>
                  <input
                    type="text"
                    class="form-control form-control-sm"
                    placeholder="Ej. -66.9036"
                    v-model="nuevoRegistro.longitud"
                  />
                </div>
              </div>

              <h5 class="form-section-title">
                2. Organización Comunal y Demografía (Maestro INE)
              </h5>
              <div class="row g-3">
                <div class="col-md-4">
                  <label class="form-label small"
                    >Entidad Federal (Estado)</label
                  >
                  <select
                    class="form-select form-select-sm"
                    v-model="estadoSeleccionado"
                    @change="cargarMunicipios"
                  >
                    <option :value="null">Seleccione Estado...</option>
                    <option
                      v-for="edo in estadosList"
                      :key="edo.id"
                      :value="edo.id"
                    >
                      {{ edo.nombre }}
                    </option>
                  </select>
                </div>

                <div class="col-md-4">
                  <label class="form-label small">Municipio</label>
                  <select
                    class="form-select form-select-sm"
                    v-model="municipioSeleccionado"
                    @change="cargarParroquias"
                    :disabled="!estadoSeleccionado"
                  >
                    <option :value="null">Seleccione Municipio...</option>
                    <option
                      v-for="mun in municipiosList"
                      :key="mun.id"
                      :value="mun.id"
                    >
                      {{ mun.nombre }}
                    </option>
                  </select>
                </div>

                <div class="col-md-4">
                  <label class="form-label small">Parroquia</label>
                  <select
                    class="form-select form-select-sm"
                    v-model="nuevoRegistro.parroquia_id"
                    :disabled="!municipioSeleccionado"
                    required
                  >
                    <option :value="null">Seleccione Parroquia...</option>
                    <option
                      v-for="par in parroquiasList"
                      :key="par.id"
                      :value="par.id"
                    >
                      {{ par.nombre }}
                    </option>
                  </select>
                </div>

                <div class="col-md-4">
                  <label class="form-label small">Sector</label>
                  <input
                    type="text"
                    class="form-control form-control-sm"
                    placeholder="Sector / Comunidad"
                    v-model="nuevoRegistro.sector"
                  />
                </div>
                <div class="col-md-4">
                  <label class="form-label small"
                    >Nombre Circuito Comunal / Comuna</label
                  >
                  <input
                    type="text"
                    class="form-control form-control-sm"
                    placeholder="Comuna asociada"
                    v-model="nuevoRegistro.comuna_nombre"
                  />
                </div>
                <div class="col-md-4">
                  <label class="form-label small"
                    >Código Circuito Comunal / Comuna</label
                  >
                  <input
                    type="text"
                    class="form-control form-control-sm"
                    placeholder="Código oficial"
                    v-model="nuevoRegistro.comuna_codigo"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label small"
                    >Nombre del Consejo Comunal</label
                  >
                  <input
                    type="text"
                    class="form-control form-control-sm"
                    placeholder="Consejo Comunal"
                    v-model="nuevoRegistro.consejo_nombre"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label small"
                    >Código SITUR del Consejo Comunal</label
                  >
                  <input
                    type="text"
                    class="form-control form-control-sm"
                    placeholder="Código SITUR"
                    v-model="nuevoRegistro.consejo_situr"
                  />
                </div>
                <div class="col-md-3">
                  <label class="form-label small">SAC Vinculada (SI/NO)</label>
                  <select
                    class="form-select form-select-sm"
                    v-model="nuevoRegistro.sac_vinculada"
                  >
                    <option :value="true">Sí</option>
                    <option :value="false">No</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label small"
                    >N° de Comunas Vinculadas</label
                  >
                  <input
                    type="number"
                    class="form-control form-control-sm"
                    v-model="nuevoRegistro.num_comunas"
                  />
                </div>
                <div class="col-md-3">
                  <label class="form-label small"
                    >N° de Consejos Comunales</label
                  >
                  <input
                    type="number"
                    class="form-control form-control-sm"
                    v-model="nuevoRegistro.num_cc"
                  />
                </div>
                <div class="col-md-3">
                  <label class="form-label small">N° de Comités de MTT</label>
                  <input
                    type="number"
                    class="form-control form-control-sm"
                    v-model="nuevoRegistro.num_comites"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label small">N° de Familias</label>
                  <input
                    type="number"
                    class="form-control form-control-sm"
                    placeholder="Total familias"
                    v-model="nuevoRegistro.num_familias"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label small">N° de Habitantes</label>
                  <input
                    type="number"
                    class="form-control form-control-sm"
                    placeholder="Total habitantes"
                    v-model="nuevoRegistro.num_habitantes"
                  />
                </div>
              </div>

              <h5 class="form-section-title">3. Información Técnica</h5>
              <div class="row g-3">
                <div class="col-md-4">
                  <label class="form-label small"
                    >Zona Servida por CANTV (SI/NO)</label
                  >
                  <select
                    class="form-select form-select-sm"
                    v-model="nuevoRegistro.zona_cantv"
                  >
                    <option :value="true">Sí</option>
                    <option :value="false">No</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label small">Elemento de la Red</label>
                  <input
                    type="text"
                    class="form-control form-control-sm"
                    placeholder="Ej. Central, Antena, Nodo"
                    v-model="nuevoRegistro.elemento_red"
                  />
                </div>
                <div class="col-md-4">
                  <label class="form-label small"
                    >MTT en Huella GPON (SI/NO)</label
                  >
                  <select
                    class="form-select form-select-sm"
                    v-model="nuevoRegistro.huella_gpon"
                  >
                    <option :value="true">Sí</option>
                    <option :value="false">No</option>
                  </select>
                </div>
              </div>

              <h5 class="form-section-title">
                4. Información de Voceros y Voceras
              </h5>
              <div class="row g-3 mb-3">
                <div class="col-md-4">
                  <label class="form-label small">N° Voceros (Mujeres)</label>
                  <input
                    type="number"
                    class="form-control form-control-sm"
                    v-model="nuevoRegistro.total_mujeres"
                  />
                </div>
                <div class="col-md-4">
                  <label class="form-label small">N° Voceros (Hombres)</label>
                  <input
                    type="number"
                    class="form-control form-control-sm"
                    v-model="nuevoRegistro.total_hombres"
                  />
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold"
                    >Total Voceras y Voceros</label
                  >
                  <input
                    type="number"
                    class="form-control form-control-sm bg-light"
                    :value="
                      Number(nuevoRegistro.total_mujeres) +
                      Number(nuevoRegistro.total_hombres)
                    "
                    readonly
                  />
                </div>
              </div>

              <h6 class="text-secondary small fw-bold">Datos del Vocero 1</h6>
              <div class="row g-3 mb-3">
                <div class="col-md-4">
                  <input
                    type="text"
                    class="form-control form-control-sm"
                    placeholder="Nombre y Apellido - V1"
                    v-model="nuevoRegistro.v1_nombre"
                  />
                </div>
                <div class="col-md-2">
                  <input
                    type="text"
                    class="form-control form-control-sm"
                    placeholder="Cédula - V1"
                    v-model="nuevoRegistro.v1_cedula"
                  />
                </div>
                <div class="col-md-2">
                  <input
                    type="date"
                    class="form-control form-control-sm"
                    v-model="nuevoRegistro.v1_nacimiento"
                  />
                </div>
                <div class="col-md-2">
                  <select
                    class="form-select form-select-sm"
                    v-model="nuevoRegistro.v1_sexo"
                  >
                    <option>Femenino</option>
                    <option>Masculino</option>
                  </select>
                </div>
                <div class="col-md-2">
                  <input
                    type="text"
                    class="form-control form-control-sm"
                    placeholder="Teléfono - V1"
                    v-model="nuevoRegistro.v1_telefono"
                  />
                </div>
              </div>

              <h6 class="text-secondary small fw-bold">Datos del Vocero 2</h6>
              <div class="row g-3 mb-3">
                <div class="col-md-4">
                  <input
                    type="text"
                    class="form-control form-control-sm"
                    placeholder="Nombre y Apellido - V2"
                    v-model="nuevoRegistro.v2_nombre"
                  />
                </div>
                <div class="col-md-2">
                  <input
                    type="text"
                    class="form-control form-control-sm"
                    placeholder="Cédula - V2"
                    v-model="nuevoRegistro.v2_cedula"
                  />
                </div>
                <div class="col-md-2">
                  <input
                    type="date"
                    class="form-control form-control-sm"
                    v-model="nuevoRegistro.v2_nacimiento"
                  />
                </div>
                <div class="col-md-2">
                  <select
                    class="form-select form-select-sm"
                    v-model="nuevoRegistro.v2_sexo"
                  >
                    <option>Femenino</option>
                    <option>Masculino</option>
                  </select>
                </div>
                <div class="col-md-2">
                  <input
                    type="text"
                    class="form-control form-control-sm"
                    placeholder="Teléfono - V2"
                    v-model="nuevoRegistro.v2_telefono"
                  />
                </div>
              </div>

              <h5 class="form-section-title">5. Control y Seguimiento</h5>
              <div class="row g-3">
                <div class="col-md-4">
                  <label class="form-label small">Fecha Última Visita</label
                  ><input
                    type="date"
                    class="form-control form-control-sm"
                    v-model="nuevoRegistro.fecha_visita"
                  />
                </div>
                <div class="col-md-8">
                  <label class="form-label small">Observación</label
                  ><input
                    type="text"
                    class="form-control form-control-sm"
                    placeholder="Notas de campo"
                    v-model="nuevoRegistro.observacion"
                  />
                </div>
              </div>

              <h5 class="form-section-title text-danger">
                Carga de Documentación Oficial
              </h5>
              <div class="row g-3 mb-4">
                <div class="col-md-12">
                  <label class="form-label small fw-bold"
                    >Adjuntar Acta de Conformación de la MTT (PDF o
                    Imagen)</label
                  >
                  <input
                    type="file"
                    class="form-control form-control-sm border-danger"
                    accept=".pdf,image/*"
                  />
                </div>
              </div>

              <div>
                <button type="submit" class="btn btn-success">
                  <i class="fa-solid fa-floppy-disk"></i> Enviar Registro
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- VISTA 3: ACTUALIZAR -->
        <div v-if="vistaActual === 'updateView'">
          <div class="card-container bg-white p-3 p-md-4 rounded shadow-sm">
            <h4 class="mb-3 text-primary fs-5">
              <i class="fa-solid fa-pen-to-square"></i> Actualización y
              Renovación de MTT
            </h4>
            <div class="input-group mb-4">
              <input
                type="text"
                class="form-control form-control-sm"
                placeholder="Ingrese Código MTT o Cédula de Vocero..."
              />
              <button class="btn btn-dark btn-sm">
                <i class="fa-solid fa-search"></i> Buscar MTT
              </button>
            </div>
            <div class="alert alert-warning small">
              <i class="fa-solid fa-triangle-exclamation"></i> Para actualizar,
              primero busque la MTT. (Simulado en frontend)
            </div>
          </div>
        </div>

        <!-- VISTA 4: BANDEJA GDC -->
        <div v-if="vistaActual === 'gdcView'">
          <div class="card-container bg-white p-3 p-md-4 rounded shadow-sm">
            <h4 class="mb-3 text-dark fs-5">
              <i class="fa-solid fa-shield-halved text-warning"></i> Bandeja GDC
              (Asignación de Códigos)
            </h4>
            <div class="alert alert-warning small">
              <i class="fa-solid fa-triangle-exclamation"></i> Verifique los
              datos contra el acta digitalizada para asignar el código oficial o
              devolver por inconsistencia.
            </div>
            <div class="table-responsive">
              <table class="table table-bordered align-middle small">
                <thead class="table-dark">
                  <tr>
                    <th>Expediente</th>
                    <th>Nombre MTT</th>
                    <th>Ubicación</th>
                    <th>Acta</th>
                    <th>Estatus</th>
                    <th>Acción GDC</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><b>EXP-2026-089</b></td>
                    <td>Comunidad Unido Venceremos</td>
                    <td>Miranda / Sucre</td>
                    <td>
                      <button class="btn btn-sm btn-outline-danger py-0">
                        <i class="fa-solid fa-file-pdf"></i> Ver
                      </button>
                    </td>
                    <td>
                      <span class="badge bg-success">Validado Regional</span>
                    </td>
                    <td>
                      <div
                        class="input-group input-group-sm mb-1"
                        style="min-width: 180px"
                      >
                        <input
                          type="text"
                          class="form-control form-control-sm"
                          placeholder="Ej. MTT-101-15-02"
                        />
                        <button class="btn btn-success btn-sm" type="button">
                          <i class="fa-solid fa-check"></i>
                        </button>
                      </div>
                      <button class="btn btn-sm btn-outline-danger w-100 py-0">
                        <i class="fa-solid fa-rotate-left"></i> Devolver
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- VISTA 5: MATRIZ DE DATOS -->
        <div v-if="vistaActual === 'databaseView'">
          <div class="table-container bg-white">
            <h4 class="mb-3 fs-6">
              <i class="fa-solid fa-table"></i> Matriz de Datos (45 Columnas
              Estructura)
            </h4>
            <div class="table-responsive">
              <table class="table table-bordered table-sm small align-middle">
                <thead class="table-light">
                  <tr>
                    <th>CÓDIGO</th>
                    <th>NOMBRE</th>
                    <th>ESTATUS</th>
                    <th>REGIÓN</th>
                    <th>ESTADO</th>
                    <th>MUNICIPIO</th>
                    <th>PARROQUIA</th>
                    <th>GPON</th>
                    <th>VERIFICADO</th>
                    <th>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="mtt in listaMTT" :key="mtt.codigo">
                    <td>{{ mtt.codigo }}</td>
                    <td>{{ mtt.nombre }}</td>
                    <td>{{ mtt.estatus }}</td>
                    <td>Capital</td>
                    <td>Distrito Capital</td>
                    <td>Libertador</td>
                    <td>Altagracia</td>
                    <td>Sí</td>
                    <td>Sí</td>
                    <td>
                      <button class="btn btn-sm btn-outline-primary py-0 px-2">
                        <i class="fa-solid fa-file-pdf"></i> Ficha
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* Reset para evitar márgenes forzados */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary-color: #0d6efd;
  --dark-color: #212529;
  --sidebar-width: 260px;
}
body {
  background-color: #f8f9fa !important;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif !important;
}

#loginOverlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(33, 37, 41, 0.95);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.system-wrapper {
  display: flex;
  min-height: 100vh;
  width: 100vw; /* Asegura 100% del viewport */
}

#sidebar {
  width: var(--sidebar-width);
  flex-shrink: 0;
  min-height: 100vh;
  background: var(--dark-color);
  color: #fff;
  transition: all 0.3s;
}
#sidebar .sidebar-header {
  padding: 20px;
  background: #111418;
  font-weight: bold;
  font-size: 1.1rem;
}
#sidebar ul.components {
  padding: 20px 0;
}
#sidebar ul li a {
  padding: 12px 20px;
  font-size: 0.95rem;
  display: block;
  color: #adb5bd;
  text-decoration: none;
  transition: 0.2s;
}
#sidebar ul li a:hover,
#sidebar ul li.active a {
  color: #fff;
  background: #343a40;
  border-left: 4px solid var(--primary-color);
}
#sidebar ul li a i {
  margin-right: 10px;
}

#content {
  flex: 1; /* Esto garantiza que tome el 100% del espacio restante */
  width: calc(100vw - var(--sidebar-width)); /* Forzar ancho exacto restante */
  padding: 25px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.card-kpi {
  border: none;
  border-radius: 10px;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  transition: transform 0.2s;
}
.card-kpi:hover {
  transform: translateY(-3px);
}
.table-container {
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  overflow-x: auto;
}
.badge-pending {
  background-color: #ffc107;
  color: #000;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
}
.badge-active {
  background-color: #198754;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
}
.form-section-title {
  border-bottom: 2px solid #0d6efd;
  padding-bottom: 5px;
  margin-top: 25px;
  margin-bottom: 15px;
  color: #0d6efd;
  font-weight: 600;
  font-size: 1.1rem;
}
</style>
