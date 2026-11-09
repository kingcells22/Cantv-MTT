import React, { useState } from 'react';
import { MTTRecord, ViewType } from '../../types/mtt';
import { Bloque1Identificacion } from '../forms/Bloque1Identificacion';
import { Bloque2Comunal } from '../forms/Bloque2Comunal';
import { Bloque3Tecnico } from '../forms/Bloque3Tecnico';
import { Bloque4Voceros } from '../forms/Bloque4Voceros';
import { Bloque5Seguimiento } from '../forms/Bloque5Seguimiento';
import { mttSchema } from '../../schemas/mttSchema';
import { FilePlus, Save, AlertCircle, CheckCircle } from 'lucide-react';

interface RegistroViewProps {
  onAddRecord: (data: Omit<MTTRecord, 'id' | 'expediente_num'>) => MTTRecord;
  onSwitchView: (view: ViewType) => void;
}

const initialFormValues: Partial<MTTRecord> = {
  codigo_mtt: null,
  region: 'CAPITAL',
  entidad_federal: 'DISTRITO CAPITAL',
  municipio: 'LIBERTADOR',
  parroquia: 'ALTAGRACIA',
  parroquia_id: '010101',
  codigo_circuito_comunal: null,
  nombre_circuito_comunal: '',
  nombre_mtt: '',
  tipo_mtt: 'URBANA',
  fecha_creacion: new Date().toISOString().split('T')[0],
  ano_creacion: new Date().getFullYear(),
  estatus_mtt: 'ACTIVA',
  fecha_cambio_estatus: null,
  georreferenciacion: 'SI',
  coordenadas_decimales: '',
  correo_mtt: '',
  uso_redes_sociales: 'NO',
  red_social_mas_utilizada: null,
  codigo_situr_cc: null,
  nombre_cc_referencia: '',
  sac_vinculada: 'NO',
  sac_conectada: null,
  cec_comuna: 'COMUNA',
  num_cc: null,
  num_comites_mtt: null,
  num_familias: null,
  num_habitantes: null,
  zona_servida: 'SI',
  medio_transmision: 'FIBRA ÓPTICA',
  otras_operadoras: null,
  elemento_red: 'CENTRAL',
  mtt_en_huella_gpon: 'NO',
  estatus_vocerias: 'VIGENTE',
  voceros_mujeres: null,
  voceros_hombres: null,
  total_voceros: null,
  v1_nombre_apellido: '',
  v1_cedula: null,
  v1_fecha_nacimiento: null,
  v1_sexo: null,
  v1_telefono: '',
  v2_nombre_apellido: '',
  v2_cedula: null,
  v2_fecha_nacimiento: null,
  v2_sexo: null,
  v2_telefono: '',
  activador_mtt: '',
  fecha_ultima_visita: null,
  observacion: 'SIN OBSERVACIÓN',
  verificado: 'NO',
  fecha_verificacion: null,
  acta_nombre: '',
};

export const RegistroView: React.FC<RegistroViewProps> = ({ onAddRecord, onSwitchView }) => {
  const [formData, setFormData] = useState<Partial<MTTRecord>>(initialFormValues);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Validate and transform with Zod schema (enforces the 4 Golden Rules)
      const validated = mttSchema.parse(formData);

      const newRecord = onAddRecord(validated as any);
      setSuccessMsg(
        `¡Registro completado exitosamente! Se generó el expediente: ${newRecord.expediente_num}. Remitido a validación estadal.`
      );
      setFormData(initialFormValues);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      if (err.errors && err.errors.length > 0) {
        setErrorMsg(`Error de validación: ${err.errors[0].message} (Campo: ${err.errors[0].path.join('.')})`);
      } else {
        setErrorMsg('Error de validación en el formulario. Por favor revise los campos obligatorios.');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="border-b border-gray-200 pb-3 mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
            <FilePlus className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Formulario de Registro - Nueva MTT
            </h2>
            <p className="text-xs text-gray-500">
              Estructura oficial institucional de 51 variables normativas (Diccionario v6.0 / v7.0)
            </p>
          </div>
        </div>
      </div>

      {/* Info alert banner matching template */}
      <div className="bg-blue-50 border border-blue-200 text-blue-900 text-xs rounded-lg p-3 mb-6 flex items-start space-x-2">
        <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Instrucción Normativa: </span>
          Complete todos los módulos requeridos. Los campos de texto libre no suministrados se guardarán como{' '}
          <strong className="underline">«N/D»</strong>, los conteos vacíos como <strong className="underline">null</strong> y el campo de observación por defecto como{' '}
          <strong className="underline">«SIN OBSERVACIÓN»</strong>.
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-300 text-red-800 text-xs rounded-lg p-3 mb-4 flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
          <button
            onClick={() => onSwitchView('databaseView')}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs shadow-sm transition"
          >
            Ver en Matriz
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Bloque1Identificacion formData={formData} onChange={handleFieldChange} />
        <Bloque2Comunal formData={formData} onChange={handleFieldChange} />
        <Bloque3Tecnico formData={formData} onChange={handleFieldChange} />
        <Bloque4Voceros formData={formData} onChange={handleFieldChange} />
        <Bloque5Seguimiento formData={formData} onChange={handleFieldChange} />

        <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setFormData(initialFormValues)}
            className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            Limpiar Formulario
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md hover:shadow-lg transition flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Enviar Registro a Validación</span>
          </button>
        </div>
      </form>
    </div>
  );
};

