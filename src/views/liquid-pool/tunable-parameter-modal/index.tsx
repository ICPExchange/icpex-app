import { Input, Modal, message } from 'antd'
import type { ChangeEvent } from 'react'
import React, { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { Principal } from '@dfinity/principal'
import styles from './index.module.less'
import { CenterTitle, CommonButton, Notification, ParameterItem, TradingFeeRateModal, VolatilityEoefficientModal } from '@/components'
import type { Pool, PoolType } from '@/types/pool'
import type { TradingFeeRateModalRef, TradingFeeRateOption } from '@/components/pool/trading-fee-rate-modal'
import type { VolatilityEoefficientModalRef, VolatilityEoefficientOption } from '@/components/pool/volatility-eoefficient-modal'
import { resetParameterOfPrivate } from '@/utils/create-pool'
import { multiplyAndConvertToBigInt } from '@/utils/common'
import { to } from '@/utils/catch'
import type { NotificationType } from '@/components/notification'

export interface TunableParameterModalRef {
  showModal: (pool: Pool) => void
  closeModal: () => void
}
export interface TunableParameterModalProps {
  onRefresh?: () => void
}
const TunableParameterModal = forwardRef<TunableParameterModalRef, TunableParameterModalProps>(({ onRefresh }, ref) => {
  const [open, setOpen] = useState(false)
  const [pool, setPool] = useState<Pool>()
  const [price, setPrice] = useState('0')

  const [tradingFeeRateOption, setTradingFeeRateOption] = useState<TradingFeeRateOption>({
    key: 'Extremely Low',
    value: '0.01',
  })
  const [volatilityEoefficientOption, setVolatilityEoefficientOption] = useState<VolatilityEoefficientOption>({
    key: 'Medium',
    value: '0.5',
  })
  const getTradingFeeRateKey = (value: number) => {
    switch (value) {
      case 0.01:
        return 'Extremely Low'
      case 0.3:
        return 'Low level'
      case 1:
        return 'High level'
      default:
        return 'Custom'
    }
  }
  const getVolatilityEoefficientKey = (poolType: PoolType, value: number) => {
    if (poolType === 'anchored') {
      switch (value) {
        case 0.01:
          return 'Low'
        case 0.05:
          return 'Medium'
        case 0.1:
          return 'High'
        default:
          return 'Medium'
      }
    } else {
      switch (value) {
        case 0.01:
          return 'Low'
        case 0.5:
          return 'Medium'
        case 1:
          return 'High'
        default:
          return 'Medium'
      }
    }
  }
  const handleCancel = () => {
    setOpen(false)
  }

  const showModal = (pool: Pool) => {
    setOpen(true)
    setPool(pool)
    setPrice(`${pool.i}`)
    setTradingFeeRateOption(
      {
        key: getTradingFeeRateKey(pool.fee * 100),
        value: `${pool.fee * 100}`,
      },
    )
    setVolatilityEoefficientOption(
      {
        key: getVolatilityEoefficientKey(pool.type, pool.k),
        value: `${pool.k}`,
      },
    )
  }

  useImperativeHandle(ref, () => ({
    showModal,
    closeModal: handleCancel,
  }))

  const handlePriceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    const regex = /^\d*\.?\d{0,2}$/
    if (regex.test(value))
      setPrice(value)
  }

  const tradingFeeRateModalRef = useRef<TradingFeeRateModalRef>(null)
  const openTradingFeeRateModal = () => {
    tradingFeeRateModalRef.current?.showModal(tradingFeeRateOption)
  }

  const volatilityEoefficientModalRef = useRef<VolatilityEoefficientModalRef>(null)
  const handleVolatilityCofficient = () => {
    volatilityEoefficientModalRef.current?.showModal(volatilityEoefficientOption)
  }

  // notification
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notificationType, setNotificationType] = useState<NotificationType>('loading')
  const notificationConfig = useMemo(() => {
    return {
      loading: {
        message: 'Loading',
      },
      success: {
        message: 'Parameters modified successfully！',
      },
      error: {
        message: 'Failed',
      },
    }
  }, [])

  const [loading, setLoading] = useState(false)
  const handleConfirm = async () => {
    if (Number(price) === 0)
      return
    setLoading(true)
    setNotificationOpen(true)
    const poolPrincipal = Principal.fromText(pool!.canisterId)
    const fee = multiplyAndConvertToBigInt(Number(tradingFeeRateOption.value) / 100, 18)
    const i = multiplyAndConvertToBigInt(price, 18)
    const k = multiplyAndConvertToBigInt(volatilityEoefficientOption.value, 18)
    const [err, _res] = await to(resetParameterOfPrivate(poolPrincipal, fee, i, k))
    if (!err) {
      setNotificationType('success')
      setLoading(false)
      handleCancel()
      onRefresh && onRefresh()
    } else {
      setNotificationType('error')
    }
  }

  return (
    <>
      <Notification open={ notificationOpen } type={ notificationType } config={ notificationConfig } />
      <Modal width={ 564 } open={ open } title={ <CenterTitle title="Set Tunable Parameters" /> } centered maskClosable={ false } footer={ false } onCancel={ handleCancel }>
        <div className="body">
          <ParameterItem label="Mid Price" tooltipTitle="Set the mid price you want to provide liquidity." direction="col" style={{ marginBottom: '16px' }}>
            <div className={ styles.price }>
              { `1 ${pool?.base.symbol} =` }<Input className={ styles.priceInput } bordered={ false } value={ price } onChange={ handlePriceChange } />{ pool?.quote.symbol }
            </div>
          </ParameterItem>
          <ParameterItem label="Trading Fee Rate" tooltipTitle="Pools with lower transaction fees will attract more traders." value={ `${tradingFeeRateOption.value}%` } onEdit={ openTradingFeeRateModal } />
          <ParameterItem label="Volatility Coefficient" tooltipTitle="The smaller the volatility coefficient, the smaller the volatility of the trading market and the deeper the market depth." value={ volatilityEoefficientOption.value } onEdit={ handleVolatilityCofficient } />
          <CommonButton loading={ loading } type="primary" size="large" block className={ styles.button } onClick={ handleConfirm }>Confirm</CommonButton>
        </div>
        <TradingFeeRateModal ref={ tradingFeeRateModalRef } onConfirm={ setTradingFeeRateOption } />
        <VolatilityEoefficientModal ref={ volatilityEoefficientModalRef } poolType={ pool?.type } onConfirm={ setVolatilityEoefficientOption } />
      </Modal>
    </>
  )
})

TunableParameterModal.displayName = 'TunableParameterModal'
export default TunableParameterModal
