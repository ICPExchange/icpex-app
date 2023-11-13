import type { FC } from 'react'
import React, { useMemo, useState } from 'react'
import { observer } from 'mobx-react'
import { useLocation } from 'react-router-dom'
import styles from './index.module.less'
import MainWallet from './main-wallet'
import SubWallet from './sub-wallet'
import { DimensionSelector } from '@/components'
import appStore from '@/store/app'

const dimentions = [
  {
    value: 'main',
    label: 'Main Wallet',
    style: {
      width: '143px',
    },
  },
  {
    value: 'sub',
    label: 'Sub Wallet',
    style: {
      width: '181px',
    },
  },
]

const Wallet: FC = () => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const [dimension, setDimension] = useState(queryParams.get('tab') === 'subWallet' ? 'sub' : 'main')
  const isMain = useMemo(() => dimension === 'main', [dimension])
  const walletInfo = useMemo(() => ({
    userId: appStore.userId,
    accountId: appStore.accountId,
  }), [appStore.userId, appStore.accountId])

  return (
    <div className={ styles.wallet }>
      <DimensionSelector value={ dimension } options={ dimentions } onChange= { setDimension } />
      {
        isMain ? <MainWallet { ...walletInfo } /> : <SubWallet { ...walletInfo } />
      }
    </div>
  )
}

export default observer(Wallet)
