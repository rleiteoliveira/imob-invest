import { useState, type ReactElement } from 'react'
import SimulatorLayout from './features/simulator/components/SimulatorLayout'
import WelcomeScreen from './features/simulator/components/Welcome/WelcomeScreen'
import { ThemeProvider } from './context/ThemeContext'

import ThemeSwitcher from './features/settings/components/ThemeSwitcher'

function AppContent(): ReactElement {
  // Simple state to control the view
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  return (
    <>
      <ThemeSwitcher />
      {!isLoggedIn ? (
        <WelcomeScreen onStart={() => setIsLoggedIn(true)} />
      ) : (
        <SimulatorLayout />
      )}
    </>
  )
}

function App(): ReactElement {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App