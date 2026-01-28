import { useState, type ReactElement } from 'react'
import SimulatorLayout from './features/simulator/components/SimulatorLayout'
import WelcomeScreen from './features/simulator/components/Welcome/WelcomeScreen'

function App(): ReactElement {
  // Simple state to control the view
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  if (!isLoggedIn) {
    return <WelcomeScreen onStart={() => setIsLoggedIn(true)} />
  }

  return <SimulatorLayout />
}

export default App