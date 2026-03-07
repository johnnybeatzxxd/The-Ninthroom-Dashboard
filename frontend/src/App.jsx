import { useState } from 'react';
import DashboardLayout from './components/layout/DashboardLayout';
import PinScreen from './components/layout/PinScreen';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';

function App() {
  const [unlocked, setUnlocked] = useState(false);

  return (
    <>
      {!unlocked && <PinScreen onUnlock={() => setUnlocked(true)} />}
      {unlocked && (
        <AppProvider>
          <ToastProvider>
            <DashboardLayout />
          </ToastProvider>
        </AppProvider>
      )}
    </>
  )
}

export default App
