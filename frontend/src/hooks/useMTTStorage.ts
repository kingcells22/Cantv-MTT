import { useState, useEffect } from 'react';
import { MTTRecord } from '../types/mtt';
import initialMttDataRaw from '../data/mtt_dataset.json';
import { mttService, catalogoService } from '../services/api';

const STORAGE_KEY = 'mtt_records_sincomtt_v2';

export const useMTTStorage = () => {
  const [records, setRecords] = useState<MTTRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize records from localStorage or initial dataset and sync with FastAPI + Redis
  useEffect(() => {
    try {
      // Purgar clave obsoleta v1 si existía en el navegador con filas basura de Excel
      if (localStorage.getItem('mtt_records_sincomtt_v1')) {
        localStorage.removeItem('mtt_records_sincomtt_v1');
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecords(JSON.parse(stored));
      } else {
        // Map raw data from Excel JSON (2,557 registros verificados)
        const mapped: MTTRecord[] = (initialMttDataRaw as any[]).map((item, index) => {
          const isPending = !item.codigo_mtt || item.codigo_mtt === '' || item.codigo_mtt === 'PENDIENTE';
          const numericId = item.id ? Number(item.id) : index + 1;
          return {
            id: `mtt-${numericId}`,
            backend_id: numericId,
            codigo_mtt: isPending ? null : item.codigo_mtt,
            region: item.region || 'CAPITAL',
            entidad_federal: item.entidad_federal || 'DISTRITO CAPITAL',
            municipio: item.municipio || 'LIBERTADOR',
            parroquia: item.parroquia || 'ALTAGRACIA',
            codigo_circuito_comunal: item.codigo_circuito_comunal || null,
            nombre_circuito_comunal: item.nombre_circuito_comunal || 'N/D',
            nombre_mtt: item.nombre_mtt || `Mesa Técnica ${index + 1}`,
            tipo_mtt: (item.tipo_mtt as any) || 'URBANA',
            fecha_creacion: item.fecha_creacion || '2024-05-10',
            ano_creacion: item.ano_creacion ? Number(item.ano_creacion) : 2024,
            estatus_mtt: (item.estatus_mtt as any) || 'ACTIVA',
            fecha_cambio_estatus: item.fecha_cambio_estatus || null,
            georreferenciacion: (item.georreferenciacion as any) || 'SI',
            coordenadas_decimales: item.coordenadas_decimales || '10.4806, -66.9036',
            correo_mtt: item.correo_mtt || 'N/D',
            uso_redes_sociales: (item.uso_redes_sociales as any) || 'NO',
            red_social_mas_utilizada: item.red_social_mas_utilizada || null,
            codigo_situr_cc: item.codigo_situr_cc || null,
            nombre_cc_referencia: item.nombre_cc_referencia || 'N/D',
            sac_vinculada: (item.sac_vinculada as any) || 'NO',
            sac_conectada: (item.sac_conectada as any) || null,
            cec_comuna: (item.cec_comuna as any) || null,
            num_cc: item.num_cc ? Number(item.num_cc) : null,
            num_comites_mtt: item.num_comites_mtt ? Number(item.num_comites_mtt) : null,
            num_familias: item.num_familias ? Number(item.num_familias) : null,
            num_habitantes: item.num_habitantes ? Number(item.num_habitantes) : null,
            zona_servida: (item.zona_servida as any) || 'SI',
            medio_transmision: item.medio_transmision || 'FIBRA ÓPTICA',
            otras_operadoras: item.otras_operadoras || null,
            elemento_red: item.elemento_red || 'CENTRAL',
            mtt_en_huella_gpon: (item.mtt_en_huella_gpon as any) || 'SI',
            estatus_vocerias: (item.estatus_vocerias as any) || 'VIGENTE',
            voceros_mujeres: item.voceros_mujeres ? Number(item.voceros_mujeres) : 3,
            voceros_hombres: item.voceros_hombres ? Number(item.voceros_hombres) : 2,
            total_voceros: item.total_voceros ? Number(item.total_voceros) : 5,
            v1_nombre_apellido: item.v1_nombre_apellido || 'JUAN PÉREZ',
            v1_cedula: item.v1_cedula ? Number(item.v1_cedula) : 12345678,
            v1_fecha_nacimiento: item.v1_fecha_nacimiento || '1980-04-12',
            v1_sexo: (item.v1_sexo as any) || 'HOMBRE',
            v1_telefono: item.v1_telefono || '0412-1234567',
            v2_nombre_apellido: item.v2_nombre_apellido || 'MARÍA GÓMEZ',
            v2_cedula: item.v2_cedula ? Number(item.v2_cedula) : 87654321,
            v2_fecha_nacimiento: item.v2_fecha_nacimiento || '1985-09-20',
            v2_sexo: (item.v2_sexo as any) || 'MUJER',
            v2_telefono: item.v2_telefono || '0414-9876543',
            activador_mtt: item.activador_mtt || 'N/D',
            fecha_ultima_visita: item.fecha_ultima_visita || null,
            observacion: item.observacion || 'SIN OBSERVACIÓN',
            verificado: (item.verificado as any) || (index % 2 === 0 ? 'SI' : 'NO'),
            fecha_verificacion: item.fecha_verificacion || null,
            expediente_num: `EXP-2026-${String(index + 1).padStart(3, '0')}`,
            acta_nombre: `Acta_Conformacion_${item.nombre_mtt?.replace(/\s+/g, '_') || 'MTT'}.pdf`,
            estatus_validacion: isPending ? 'VALIDADO_REGIONAL' : 'APROBADO_GDC',
          };
        });

        // Ensure we also have the explicit samples from the template
        const templateItems: MTTRecord[] = [
          {
            id: 'mtt-template-1',
            codigo_mtt: 'MTT-101-04-01',
            region: 'CAPITAL',
            entidad_federal: 'DISTRITO CAPITAL',
            municipio: 'LIBERTADOR',
            parroquia: 'ALTAGRACIA',
            codigo_circuito_comunal: 'COM-01',
            nombre_circuito_comunal: 'Comuna Socialista Catia',
            nombre_mtt: 'Luz de Catia',
            tipo_mtt: 'URBANA',
            fecha_creacion: '2024-05-10',
            ano_creacion: 2024,
            estatus_mtt: 'ACTIVA',
            fecha_cambio_estatus: null,
            georreferenciacion: 'SI',
            coordenadas_decimales: '10.4806, -66.9036',
            correo_mtt: 'luzdecatia@cantv.gob.ve',
            uso_redes_sociales: 'SI',
            red_social_mas_utilizada: 'WHATSAPP',
            codigo_situr_cc: 'SITUR-1002',
            nombre_cc_referencia: 'Luchadores de Sucre',
            sac_vinculada: 'SI',
            sac_conectada: 'CANTV',
            cec_comuna: 'COMUNA',
            num_cc: 1,
            num_comites_mtt: 1,
            num_familias: 350,
            num_habitantes: 1200,
            zona_servida: 'SI',
            medio_transmision: 'FIBRA ÓPTICA',
            otras_operadoras: 'MOVILNET',
            elemento_red: 'CENTRAL',
            mtt_en_huella_gpon: 'SI',
            estatus_vocerias: 'VIGENTE',
            voceros_mujeres: 3,
            voceros_hombres: 3,
            total_voceros: 6,
            v1_nombre_apellido: 'Juan Pérez',
            v1_cedula: 12345678,
            v1_fecha_nacimiento: '1980-04-12',
            v1_sexo: 'HOMBRE',
            v1_telefono: '0412-1234567',
            v2_nombre_apellido: 'María Gómez',
            v2_cedula: 87654321,
            v2_fecha_nacimiento: '1985-09-20',
            v2_sexo: 'MUJER',
            v2_telefono: '0414-9876543',
            activador_mtt: 'Carlos Mendoza',
            fecha_ultima_visita: '2026-05-15',
            observacion: 'Renovación de vocerías período 2026',
            verificado: 'SI',
            fecha_verificacion: '2026-05-16',
            expediente_num: 'EXP-2026-001',
            acta_nombre: 'Acta_Luz_De_Catia_2026.pdf',
            estatus_validacion: 'APROBADO_GDC',
          },
          {
            id: 'mtt-template-2',
            codigo_mtt: null,
            region: 'CAPITAL',
            entidad_federal: 'MIRANDA',
            municipio: 'SUCRE',
            parroquia: 'PETARE',
            codigo_circuito_comunal: 'COM-089',
            nombre_circuito_comunal: 'Circuito Petare Norte',
            nombre_mtt: 'Comunidad Unido Venceremos',
            tipo_mtt: 'URBANA',
            fecha_creacion: '2025-08-14',
            ano_creacion: 2025,
            estatus_mtt: 'ACTIVA',
            fecha_cambio_estatus: null,
            georreferenciacion: 'SI',
            coordenadas_decimales: '10.4900, -66.8200',
            correo_mtt: 'N/D',
            uso_redes_sociales: 'NO',
            red_social_mas_utilizada: null,
            codigo_situr_cc: 'SITUR-2099',
            nombre_cc_referencia: 'Venceremos Unido',
            sac_vinculada: 'NO',
            sac_conectada: null,
            cec_comuna: 'COMUNA',
            num_cc: 2,
            num_comites_mtt: 1,
            num_familias: 410,
            num_habitantes: 1650,
            zona_servida: 'SI',
            medio_transmision: 'CABLE DE COBRE',
            otras_operadoras: 'OPERADORA PRIVADA',
            elemento_red: 'NODO NGN',
            mtt_en_huella_gpon: 'NO',
            estatus_vocerias: 'VIGENTE',
            voceros_mujeres: 4,
            voceros_hombres: 2,
            total_voceros: 6,
            v1_nombre_apellido: 'Elena Rondón',
            v1_cedula: 15420310,
            v1_fecha_nacimiento: '1984-02-11',
            v1_sexo: 'MUJER',
            v1_telefono: '0416-5544332',
            v2_nombre_apellido: 'José Gregorio Silva',
            v2_cedula: 14980712,
            v2_fecha_nacimiento: '1982-10-05',
            v2_sexo: 'HOMBRE',
            v2_telefono: '0412-9988776',
            activador_mtt: 'N/D',
            fecha_ultima_visita: '2026-06-01',
            observacion: 'SIN OBSERVACIÓN',
            verificado: 'NO',
            fecha_verificacion: null,
            expediente_num: 'EXP-2026-089',
            acta_nombre: 'Acta_Unido_Venceremos_Petare.pdf',
            estatus_validacion: 'VALIDADO_REGIONAL',
          },
        ];

        const initialList = [...templateItems, ...mapped];
        setRecords(initialList);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialList));
      }
    } catch (err) {
      console.error('Error loading MTT storage:', err);
    } finally {
      setLoading(false);
    }

    // Sincronización defensiva en segundo plano con PostgreSQL + Redis vía FastAPI (/api/catalogos/estados y /api/mtt)
    catalogoService.getEstados().catch(() => {});
    mttService
      .getAll()
      .then((apiRows) => {
        if (!Array.isArray(apiRows) || apiRows.length === 0) return;
        setRecords((prev) => {
          const byBackendId = new Map(apiRows.map((row) => [Number(row.backend_id ?? row.id), row]));
          const knownIds = new Set(prev.map((r) => r.backend_id).filter((id): id is number => typeof id === 'number'));

          const merged = prev.map((rec) => {
            const match = rec.backend_id ? byBackendId.get(rec.backend_id) : undefined;
            if (!match) return rec;
            return {
              ...rec,
              codigo_mtt: match.codigo_mtt ?? rec.codigo_mtt,
              estatus_mtt: (match.estatus_mtt as MTTRecord['estatus_mtt']) || rec.estatus_mtt,
            };
          });

          const brandNew: MTTRecord[] = apiRows
            .filter((row) => {
              const bid = Number(row.backend_id ?? row.id);
              return !isNaN(bid) && bid > 2563 && !knownIds.has(bid);
            })
            .map((row) => ({
              ...row,
              id: `mtt-${row.backend_id ?? row.id}`,
              estatus_validacion: row.codigo_mtt ? ('APROBADO_GDC' as const) : ('ENVIADO_REGIONAL' as const),
            }));

          const next = brandNew.length > 0 ? [...brandNew, ...merged] : merged;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          return next;
        });
      })
      .catch(() => {});
  }, []);

  const saveRecords = (updater: MTTRecord[] | ((prev: MTTRecord[]) => MTTRecord[])) => {
    setRecords((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const addRecord = (record: Omit<MTTRecord, 'id' | 'expediente_num'>) => {
    const newId = `mtt-${Date.now()}`;
    const newExpediente = `EXP-2026-${String(records.length + 1).padStart(3, '0')}`;
    const newRecord: MTTRecord = {
      ...record,
      id: newId,
      expediente_num: newExpediente,
      estatus_validacion: 'ENVIADO_REGIONAL',
      verificado: 'NO',
    };
    saveRecords((prev) => [newRecord, ...prev]);

    // Persistir en PostgreSQL vía POST /api/mtt (invalida caché Redis mtt:list:*)
    mttService
      .create(newRecord)
      .then((res) => {
        if (res?.mtt_id) {
          saveRecords((prev) =>
            prev.map((r) => (r.id === newId ? { ...r, backend_id: Number(res.mtt_id) } : r))
          );
        }
      })
      .catch((err) => {
        console.warn('POST /api/mtt no disponible, registro mantenido en almacenamiento local:', err?.message || err);
      });

    return newRecord;
  };

  const updateRecord = (id: string, updates: Partial<MTTRecord>) => {
    saveRecords((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const assignCode = (id: string, codigo: string) => {
    const target = records.find((r) => r.id === id);
    const fechaVerif = new Date().toISOString().split('T')[0];

    saveRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              codigo_mtt: codigo,
              estatus_mtt: 'ACTIVA',
              estatus_validacion: 'APROBADO_GDC' as const,
              verificado: 'SI' as const,
              fecha_verificacion: fechaVerif,
            }
          : r
      )
    );

    // Sincronizar asignación oficial en PostgreSQL vía PATCH /api/mtt/{id}/codigo
    const backendId = target?.backend_id;
    if (backendId && !isNaN(backendId)) {
      mttService.assignCode(backendId, codigo).catch((err) => {
        console.warn('PATCH /api/mtt/{id}/codigo no disponible, código guardado localmente:', err?.message || err);
      });
    }
  };

  const returnRecord = (id: string, motivo: string) => {
    saveRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              estatus_validacion: 'DEVUELTO' as const,
              motivo_devolucion: motivo,
            }
          : r
      )
    );
  };

  const approveRegional = (id: string) => {
    saveRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              estatus_validacion: 'VALIDADO_REGIONAL' as const,
            }
          : r
      )
    );
  };

  return {
    records,
    loading,
    addRecord,
    updateRecord,
    assignCode,
    returnRecord,
    approveRegional,
  };
};

