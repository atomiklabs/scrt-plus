import React from 'react'

import './App.css'
import { SecretContext } from './hooks/useSecret'

function App() {
  return (
    <SecretContext>
      <div className='App'>
        <header className='App-header'>
          <p>SECRET NETWORK</p>
        </header>
      </div>
    </SecretContext>
  )
}

export default App
