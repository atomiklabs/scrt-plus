import React, { useEffect, useState } from 'react'

import { useSecret } from './hooks/useSecret'
import * as query from './contract/query'

function Counter() {
  const { secretjs } = useSecret()
  const [countNumber, setCountNumber] = useState(100)

  useEffect(() => {
    const counter = async () => {
      if (secretjs) {
        setCountNumber(await query.getCount(secretjs))
      }
    }

    counter()
  }, [secretjs])

  return <div>Counter: {countNumber}</div>
}

export default Counter
