import { useState, type ReactElement } from 'react'
import SimulatorLayout from './components/modules/Simulator/SimulatorLayout'
import WelcomeScreen from './components/modules/Welcome/WelcomeScreen'

function App(): ReactElement {
  // Simple state to control the view
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  if (!isLoggedIn) {
    return <WelcomeScreen onStart={() => setIsLoggedIn(true)} />
  }

  return <SimulatorLayout />
}

export default App