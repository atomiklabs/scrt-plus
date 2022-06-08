import React from 'react'

import './App.css'
import { SecretContext } from './hooks/useSecret'
import Counter from './Counter'

function App() {
  return (
    <SecretContext>
      <div className='App'>
        <header className='App-header'>
          <p>SECRET NETWORK</p>
          <Counter />
        </header>
      </div>
    </SecretContext>
  )
}

export default App
