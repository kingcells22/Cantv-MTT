import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useMTTStorage } from './hooks/useMTTStorage';
import { ViewType, MTTRecord } from './types/mtt';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LoginModal } from './components/layout/LoginModal';
import { DashboardView } from './components/views/DashboardView';
import { RegistroView } from './components/views/RegistroView';
import { ActualizacionView } from './components/views/ActualizacionView';
import { BandejaGdcView } from './components/views/BandejaGdcView';
import { BandejaRegionalView } from './components/views/BandejaRegionalView';
import { MatrizDatosView } from './components/views/MatrizDatosView';
import { SmtpConfigView } from './components/views/SmtpConfigView';
import { FichaPdfModal } from './components/modals/FichaPdfModal';
import { VerActaModal } from './components/modals/VerActaModal';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboardView');
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);
  const [pdfRecord, setPdfRecord] = useState<MTTRecord | null>(null);
  const [actaRecord, setActaRecord] = useState<MTTRecord | null>(null);

  const { records, addRecord, updateRecord, assignCode, returnRecord, approveRegional } =
    useMTTStorage();
  const { rol, isAuthenticated } = useAuth();

  const handleOpenPdf = (record: MTTRecord) => setPdfRecord(record);
  const handleClosePdf = () => setPdfRecord(null);

  const handleViewActa = (record: MTTRecord) => setActaRecord(record);
  const handleCloseActa = () => setActaRecord(null);

  // Detección y apertura automática de Ficha al escanear el Código QR (/verificar/:codigo)
  React.useEffect(() => {
    if (!records || records.length === 0) return;
    const path = window.location.pathname;
    const match = path.match(/\/verificar\/(.+)/);
    const urlParams = new URLSearchParams(window.location.search);
    const queryCode = urlParams.get('verificar') || urlParams.get('codigo');

    const rawTarget = match ? decodeURIComponent(match[1]) : queryCode;
    if (rawTarget) {
      const cleanTarget = rawTarget.replace(/\/+$/, '').trim().toLowerCase();
      const found = records.find(
        (r) =>
          (r.codigo_mtt && r.codigo_mtt.trim().toLowerCase() === cleanTarget) ||
          (r.expediente_num && r.expediente_num.trim().toLowerCase() === cleanTarget) ||
          String(r.id).trim().toLowerCase() === cleanTarget
      );
      if (found) {
        setPdfRecord(found);
      }
    }
  }, [records]);

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboardView':
        return 'Página Principal';
      case 'registryView':
        return 'Registrar Nueva MTT';
      case 'updateView':
        return 'Actualizar / Vocerías';
      case 'gdcView':
        return 'Bandeja GDC (Asignación de Códigos)';
      case 'regionalView':
        return 'Bandeja de Validación Estadal';
      case 'databaseView':
        return 'Matriz de Datos (51 Cols)';
      case 'smtpConfigView':
        return 'Panel SuperAdmin (Configuración SMTP y Ciberseguridad)';
      default:
        return 'Sistema MTT';
    }
  };

  const counts = {
    total: records.length,
    pendientesGdc: records.filter(
      (r) => !r.codigo_mtt || r.codigo_mtt === '' || r.codigo_mtt === 'PENDIENTE'
    ).length,
    pendientesRegional: records.filter((r) => r.estatus_validacion === 'ENVIADO_REGIONAL').length,
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <LoginModal />
        {pdfRecord && <FichaPdfModal record={pdfRecord} onClose={handleClosePdf} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Login Screen Overlay */}
      <LoginModal />

      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
        counts={counts}
      />

      {/* Main Content Area */}
      <div className="lg:ml-64 flex-1 flex flex-col transition-all duration-300">
        <Navbar
          title={getViewTitle()}
          onToggleSidebar={() => setIsOpenMobile(!isOpenMobile)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {currentView === 'dashboardView' && (
            <DashboardView
              records={records}
              onOpenPdf={handleOpenPdf}
              onSwitchView={setCurrentView}
            />
          )}

          {currentView === 'registryView' && (
            <RegistroView onAddRecord={addRecord} onSwitchView={setCurrentView} />
          )}

          {currentView === 'updateView' && (
            <ActualizacionView
              records={records}
              onUpdateRecord={updateRecord}
              onSwitchView={setCurrentView}
            />
          )}

          {currentView === 'gdcView' && (
            <BandejaGdcView
              records={records}
              onAssignCode={assignCode}
              onReturnRecord={returnRecord}
              onViewActa={handleViewActa}
              onOpenPdf={handleOpenPdf}
            />
          )}

          {currentView === 'regionalView' && (
            <BandejaRegionalView
              records={records}
              onApproveRegional={approveRegional}
              onReturnRecord={returnRecord}
              onViewActa={handleViewActa}
              onOpenPdf={handleOpenPdf}
            />
          )}

          {currentView === 'databaseView' && (
            <MatrizDatosView records={records} onOpenPdf={handleOpenPdf} />
          )}

          {currentView === 'smtpConfigView' && (
            <SmtpConfigView />
          )}
        </main>
      </div>

      {/* Ficha PDF Modal */}
      <FichaPdfModal
        record={pdfRecord}
        isOpen={Boolean(pdfRecord)}
        onClose={handleClosePdf}
      />

      {/* Acta Preview Modal */}
      <VerActaModal
        record={actaRecord}
        isOpen={Boolean(actaRecord)}
        onClose={handleCloseActa}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

