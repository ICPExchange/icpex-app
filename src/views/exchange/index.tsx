import type { FC } from 'react'
import React, { useState } from 'react'

import { useLocation } from 'react-router-dom'
import Swap from './swap'
import styles from './index.module.less'
import Transactions from './transactions'
import { DimensionSelector } from '@/components'

const dimensions = [{
  label: 'Swap',
  value: 'swap',
  style: {
    width: '143px',
  },
}, {
  label: 'Transactions',
  value: 'transactions',
  style: {
    width: '181px',
  },
}]

export const Exchange: FC = () => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const [dimension, setDimension] = useState(queryParams.get('tab') === 'transactions' ? 'transactions' : 'swap')
  return (
    <div className={ styles.exchange }>
      <DimensionSelector value={ dimension } options={ dimensions } onChange={ setDimension } />
      {
        dimension === 'swap'
          ? <Swap />
          : <Transactions />
      }
    </div>
  )
}
