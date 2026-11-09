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
import { FichaPdfModal } from './components/modals/FichaPdfModal';
import { VerActaModal } from './components/modals/VerActaModal';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboardView');
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);
  const [pdfRecord, setPdfRecord] = useState<MTTRecord | null>(null);
  const [actaRecord, setActaRecord] = useState<MTTRecord | null>(null);

  const { records, addRecord, updateRecord, assignCode, returnRecord, approveRegional } =
    useMTTStorage();
  const { rol } = useAuth();

  const handleOpenPdf = (record: MTTRecord) => setPdfRecord(record);
  const handleClosePdf = () => setPdfRecord(null);

  const handleViewActa = (record: MTTRecord) => setActaRecord(record);
  const handleCloseActa = () => setActaRecord(null);

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

