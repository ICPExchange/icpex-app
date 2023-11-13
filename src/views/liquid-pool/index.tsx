import type { FC } from 'react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { observer } from 'mobx-react'
import { Button } from 'antd'
import styles from './index.module.less'
import CategorySelector from './category-selector'
import Alert from './alert'
import TypeParameter from './type-parameter'
import type { TokensParameterProps } from './tokens-parameter'
import TokensParameter from './tokens-parameter'
import AddressParameter from './address-parameter'
import type { AddLiquidityModalRef } from './add-liquidity-modal'
import AddLiquidityModal from './add-liquidity-modal'
import type { TunableParameterModalRef } from './tunable-parameter-modal'
import TunableParameterModal from './tunable-parameter-modal'
import type { RiskWarningModalRef } from './risk-warning-modal'
import RiskWarningModal from './risk-warning-modal'
import type { RemoveLiquidityModalRef } from './remove-liquidity-modal'
import RemoveLiquidityModal from './remove-liquidity-modal'
import ExplorePoolList from './list/explore'
import LiquidityPoolList from './list/liquidity'
import { CommonButton, DimensionSelector, Empty } from '@/components'
import type { Token } from '@/types/token'
import type { FilterFunction } from '@/hooks/use-explore-pools'
import { useExplorePools } from '@/hooks/use-explore-pools'
import appStore from '@/store/app'
import { requestConnect } from '@/utils/plug/connect'
import type { Pool } from '@/types/pool'
import { useTokens } from '@/hooks/use-tokens'

const dimentions = [
  {
    value: 'explore',
    label: 'Explore',
    style: {
      width: '143px',
    },
  },
  {
    value: 'your',
    label: 'Your Liquidity',
    style: {
      width: '181px',
    },
  },
]

export const LiquidPool: FC = observer(() => {
  const navigate = useNavigate()
  const [dimension, setDimension] = useState('explore')
  const [category, setCategory] = useState('type')
  const [poolType, setPoolType] = useState('all')
  const [tokenOne, setTokeOne] = useState<Token>()
  const [tokenTwo, setTokeTwo] = useState<Token>()
  const [address, setAddress] = useState<string>()
  const [searchParams] = useSearchParams()
  const { tokens } = useTokens()

  useEffect(() => {
    const tempType = searchParams.get('categoryType')
    if (tempType) {
      setCategory(tempType)
    }
  }, [searchParams])

  const filterFunc: FilterFunction = useCallback((pool) => {
    if (dimension === 'your') {
      if (!appStore.userId) {
        return false
      }
      else {
        if (!pool.hasLiquidity)
          return false
      }
    }
    if (category === 'type') {
      if (poolType === 'all')
        return true
      return pool.type === poolType
    }
    if (category === 'tokens') {
      const tokenMap = {
        [pool.base.canisterId]: true,
        [pool.quote.canisterId]: true,
      }
      if (tokenOne && tokenTwo)
        return tokenMap[tokenOne.canisterId] && tokenMap[tokenTwo.canisterId]
      if (tokenOne)
        return tokenMap[tokenOne.canisterId]
      if (tokenTwo)
        return tokenMap[tokenTwo.canisterId]
    }
    if (category === 'address') {
      if (address)
        return pool.canisterId.includes(address.toLowerCase())
    }
    return true
  }, [appStore.userId, dimension, category, poolType, tokenOne, tokenTwo, address])

  const { pools, filterPools, updatePools } = useExplorePools(filterFunc)

  const handleSearch = (value: string) => {
    setAddress(value)
  }
  const handleSelectToken: TokensParameterProps['onSelect'] = (order, token) => {
    switch (order) {
      case 'one':
        if (token.canisterId === tokenTwo?.canisterId)
          setTokeTwo(tokenOne)
        setTokeOne(token)
        break
      case 'two':
        if (token.canisterId === tokenOne?.canisterId)
          setTokeOne(tokenTwo)
        setTokeTwo(token)
        break
    }
  }

  const handleCreatePool = () => {
    navigate('/createPool')
  }

  const addLiquidityPoolRef = useRef<Pool>()
  const riskWarningModalRef = useRef<RiskWarningModalRef>(null)
  const handleRisk = (pool: Pool) => {
    addLiquidityPoolRef.current = pool
    riskWarningModalRef.current?.showModal()
  }

  const addLiquidityModalRef = useRef<AddLiquidityModalRef>(null)
  const handleAgree = () => {
    addLiquidityModalRef.current?.showModal(addLiquidityPoolRef.current!)
  }

  const handleAddLiquidity = (pool: Pool) => {
    const isAgreed = localStorage.getItem('agreeRisk') === 'true'
    if (!isAgreed) {
      handleRisk(pool)
      return
    }
    addLiquidityModalRef.current?.showModal(pool)
  }

  const removeLiquidityModalRef = useRef<RemoveLiquidityModalRef>(null)
  const handleRemove = (pool: Pool) => {
    removeLiquidityModalRef.current?.showModal(pool)
  }

  const tunableParameterModalRef = useRef<TunableParameterModalRef>(null)
  const handleTunable = (pool: Pool) => {
    tunableParameterModalRef.current?.showModal(pool)
  }

  useEffect(() => {
    const searchPayToken = searchParams.get('payToken')
    const searchReceiveToken = searchParams.get('receiveToken')
    if (!tokens?.length)
      return
    const payTarget = tokens.find(item => item.canisterId === searchPayToken)
    const receiveTarget = tokens.find(item => item.canisterId === searchReceiveToken)
    payTarget?.canisterId && setTokeOne(payTarget)
    receiveTarget?.canisterId && setTokeTwo(receiveTarget)
  }, [searchParams, tokens])

  const getContent = () => {
    if (dimension === 'your') {
      if (!appStore.userId) {
        return (
          <div className={ styles.personal }>
            <Alert
              message="Incentives for Liquidity Providers"
              description="Liquidity providers will receive trading fee incentives in all transactions, and the value of the trading fee rate is defined by the creator of the liquidity pool. The amount of incentive you get is proportional to your share in the liquidity pool. The trading fee will be injected into the liquidity pool, and you can obtain the corresponding incentive quota by withdrawing your liquidity."
              closable
            />
            <Empty className={ styles.empty } />
            <div className={ styles.tip }>Your liquidity positions will appear here</div>
            <CommonButton type="primary" size="large" className={ styles.btn } onClick={ requestConnect }>Connect</CommonButton>
          </div>
        )
      }
      const participate = pools.find(pool => pool.hasLiquidity)
      if (!participate) {
        return (
          <div className={ styles.personal }>
            <Alert
              message="Incentives for Liquidity Providers"
              description="Liquidity providers will receive trading fee incentives in all transactions, and the value of the trading fee rate is defined by the creator of the liquidity pool. The amount of incentive you get is proportional to your share in the liquidity pool. The trading fee will be injected into the liquidity pool, and you can obtain the corresponding incentive quota by withdrawing your liquidity."
              closable
            />
            <Empty className={ styles.empty } />
            <div className={ styles.tip }>You don&apos;t have any liquidity positions yet, click the button below to add.</div>
            <CommonButton type="primary" size="large" className={ styles.btn } onClick={ handleCreatePool }>Add Liquidity</CommonButton>
          </div>
        )
      }
    }
    return (
      <>
        <CategorySelector activeKey={ category } onChange={ setCategory } />
        <div className={ styles.condition }>
          {
          category === 'type'
            ? <TypeParameter value={ poolType } onChange={ setPoolType } />
            : category === 'tokens'
              ? <TokensParameter tokenOne={ tokenOne } tokenTwo={ tokenTwo } onSelect={ handleSelectToken } />
              : <AddressParameter value={ address } onSearch={ handleSearch } />
        }
          <Button type="primary" className={ styles.create } onClick={ handleCreatePool }>Create Pools</Button>
        </div>
        {
          dimension === 'explore'
            ? <ExplorePoolList data={ filterPools } onAdd={ handleAddLiquidity } />
            : <LiquidityPoolList data={ filterPools } onAdd={ handleAddLiquidity } onRemove={ handleRemove } onEdit={ handleTunable } />
        }
        <RiskWarningModal ref={ riskWarningModalRef } onAgrees={ handleAgree } />
        <AddLiquidityModal ref={ addLiquidityModalRef } onSuccess={ updatePools } />
        <RemoveLiquidityModal ref={ removeLiquidityModalRef } onRefresh={ updatePools } />
        <TunableParameterModal ref={ tunableParameterModalRef } onRefresh={ updatePools } />
      </>
    )
  }

  return (
    <div className={ styles.content }>
      <DimensionSelector value={ dimension } options={ dimentions } onChange= { setDimension } />
      {
        getContent()
      }
    </div>
  )
})
