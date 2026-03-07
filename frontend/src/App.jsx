import DashboardLayout from './components/layout/DashboardLayout';
import { AppProvider } from './context/AppContext';

import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <DashboardLayout />
      </ToastProvider>
    </AppProvider>
  )
}

export default App
