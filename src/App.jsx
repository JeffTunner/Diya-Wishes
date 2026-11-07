import { useState, useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import Sky from './Sky.jsx'
import LightBloom from './components/LightBloom.jsx'
import DiyaScreen from './screens/DiyaScreen.jsx'
import GreetingScreen from './screens/GreetingScreen.jsx'
import WishScreen from './screens/WishScreen.jsx'
import HubScreen from './screens/HubScreen.jsx'
import FactScreen from './screens/FactScreen.jsx'
import CrackersScreen from './screens/CrackersScreen.jsx'
import RangoliScreen from './screens/RangoliScreen.jsx'
import AdminScreen from './screens/AdminScreen.jsx'

export default function App() {
  const skyRef = useRef(null)

  // State machine: 'diya' -> 'greeting' -> 'wish' -> 'hub', and 'fact', 'crackers', 'rangoli'
  const [currentScreen, setCurrentScreen] = useState('diya')
  const [isAdmin, setIsAdmin] = useState(() => window.location.hash === '#admin')
  const [bloomActive, setBloomActive] = useState(false)
  const [bloomOrigin, setBloomOrigin] = useState({ x: '50%', y: '50%' })

  // Extract recipient name safely (?name=..., max 24 chars)
  const [recipientName, setRecipientName] = useState(() => {
    try {
      const param = new URLSearchParams(window.location.search).get('name') || ''
      return param.trim().slice(0, 24)
    } catch {
      return ''
    }
  })

  // Hashchange listener for #admin
  useEffect(() => {
    const handleHash = () => {
      setIsAdmin(window.location.hash === '#admin')
    }
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  // Trigger signature golden light bloom transition
  const triggerBloom = (origin = { x: '50%', y: '50%' }) => {
    setBloomOrigin(origin)
    setBloomActive(true)
    setTimeout(() => {
      setBloomActive(false)
    }, 1100)
  }

  // Handle returning from Admin screen
  const handleExitAdmin = () => {
    window.location.hash = ''
    setIsAdmin(false)
    setCurrentScreen('hub')
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#07030f] text-[#fff1d0]">
      {/* Persistent Living Sky Canvas & Atmospheric Glow */}
      <Sky ref={skyRef} lit={currentScreen !== 'diya'} />

      {/* Signature Golden Light Bloom Overlay */}
      <LightBloom active={bloomActive} origin={bloomOrigin} />

      {/* Screens with AnimatePresence */}
      <AnimatePresence mode="wait">
        {isAdmin ? (
          <AdminScreen
            key="admin"
            onExitAdmin={handleExitAdmin}
            skyRef={skyRef}
          />
        ) : (
          <>
            {currentScreen === 'diya' && (
              <DiyaScreen
                key="diya"
                onLightComplete={() => setCurrentScreen('greeting')}
                triggerBloom={triggerBloom}
              />
            )}

            {currentScreen === 'greeting' && (
              <GreetingScreen
                key="greeting"
                recipientName={recipientName}
                onContinue={() => setCurrentScreen('wish')}
                triggerBloom={triggerBloom}
              />
            )}

            {currentScreen === 'wish' && (
              <WishScreen
                key="wish"
                recipientName={recipientName}
                skyRef={skyRef}
                onContinue={() => setCurrentScreen('hub')}
                triggerBloom={triggerBloom}
              />
            )}

            {currentScreen === 'hub' && (
              <HubScreen
                key="hub"
                onNavigate={(screen) => setCurrentScreen(screen)}
                triggerBloom={triggerBloom}
              />
            )}

            {currentScreen === 'fact' && (
              <FactScreen
                key="fact"
                onBack={() => setCurrentScreen('hub')}
                triggerBloom={triggerBloom}
              />
            )}

            {currentScreen === 'crackers' && (
              <CrackersScreen
                key="crackers"
                skyRef={skyRef}
                onBack={() => setCurrentScreen('hub')}
                triggerBloom={triggerBloom}
              />
            )}

            {currentScreen === 'rangoli' && (
              <RangoliScreen
                key="rangoli"
                onBack={() => setCurrentScreen('hub')}
                triggerBloom={triggerBloom}
              />
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
