import { Button, Spin } from 'antd'
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { observer } from 'mobx-react'
import { Principal } from '@dfinity/principal'
import classNames from 'classnames'
import styles from './index.module.less'
import SpecialFeaturesForm from './specialFeaturesForm'
import EnterTokenForm from './enterTokenForm'
import { createToken } from '@/utils/create-token'
import { canisterId, idlFactory } from '@/canisters/icpl_icpl'
import { canisterId as canisterIdBackend } from '@/canisters/icpl_backend'
import appStore from '@/store/app'
import { calculateTotalTokenAmountWithFeesToBigint } from '@/utils/fee'
import { Notification } from '@/components'
import type { NotificationType } from '@/components/notification'

const StepCreate: React.FC<{
  onOk: () => void
}> = ({ onOk }) => {
  const [loading, setLoading] = useState(false)
  // const [cacheTotalSupply, setCacheTotalSupply] = useState(1)

  const [mainCompleteData, setMainCompleteData] = useState<{ total_supply?: number; symbol?: string; url: string } | null>(null)
  const [isMainComplete, setIsMainComplete] = useState<boolean>(false)
  const [showMore, setShowMore] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notificationType, setNotificationType] = useState<NotificationType>('loading')
  const [notificationMessage, setNotificationMessage] = useState<string>('')

  // const [infoMessage, setInfoMessage] = useState('')

  const enterTokenFormRef = useRef<any>()
  const specialFeaturesFormRef = useRef<any>()

  const reset = () => {
    enterTokenFormRef.current?.clear()
    specialFeaturesFormRef.current?.clear()
  }

  const clearErr = () => {

  }

  const notificationConfig = useMemo(() => {
    return {
      loading: { message: 'Token Creating...' },
      success: { message: 'Token created successful', action: reset },
      error: { message: notificationMessage || 'Token creation failed', action: clearErr },
      // info: { message: infoMessage },
    }
  }, [notificationType, notificationMessage])

  const fetchCreate = useCallback(async (params: Record<string, any>) => {
    const {
      name, imgSrc, symbol, mint_on, flat_fee, flat_burn_fee, fee, burn_rate,
    } = params
    const decimals = ~~(params.decimals || 18)

    const feeFormat = flat_fee === undefined ? BigInt(0) : (flat_fee ? BigInt(fee * 10 ** decimals) : BigInt(fee / 100 * 10 ** 18))
    const burnRateFormat = flat_burn_fee === undefined ? BigInt(0) : (flat_burn_fee ? BigInt(burn_rate * 10 ** decimals) : BigInt(burn_rate / 100 * 10 ** 18))

    try {
      const res = await createToken(
        name || symbol,
        imgSrc,
        symbol,
        decimals,
        BigInt((params.total_supply || 1) * (10 ** decimals)),
        feeFormat,
        mint_on || false,
        burnRateFormat,
        flat_fee || false,
        flat_burn_fee || false,
      )

      if (res?.Ok) {
        reset()

        setNotificationType('success')
        return
      }
      setNotificationMessage(res?.Err)
      setNotificationType('error')
    } catch (err) {
      setNotificationMessage('')
      setNotificationType('error')
      throw err
    }
  }, [])

  const handleShowMore = () => {
    setShowMore(!showMore)
  }

  const handleSupplyChange = (v: any) => {
    // setCacheTotalSupply(v)
  }

  const handleMainCompleteChange = (v: { total_supply?: number; symbol?: string; url: string }) => {
    setMainCompleteData(v)
    setIsMainComplete(!!v.symbol && !!v.total_supply && !!v.url)
  }

  const handleSubmit = async () => {
    const step1V = enterTokenFormRef.current?.getFormData() || {}
    const step2V = specialFeaturesFormRef.current?.getFormData() || {}
    const formValues = {
      ...step1V,
      ...step2V,
    }

    const emptyKeys = Object.keys(step1V).filter(el => formValues[el] === undefined)

    if (emptyKeys?.length) {
      setNotificationOpen(false)
      setLoading(false)

      return
    }

    const platToken = appStore.platToken
    if (!platToken) {
      setNotificationMessage('')
      setNotificationType('error')
      return
    }

    setLoading(true)
    setNotificationType('loading')
    setNotificationOpen(true)
    const computeAmount = calculateTotalTokenAmountWithFeesToBigint({
      amount: 10_000,
      isTransferFeeFixed: platToken.isTransferFeeFixed,
      transferFee: platToken.transferFee,
      isBurnFeeFixed: platToken.isBurnFeeFixed,
      burnFee: platToken.burnFee,
      decimals: platToken.decimals,
    })
    try {
      await window.ic.plug.batchTransactions([
        {
          idl: idlFactory,
          canisterId,
          methodName: 'approve',
          args: [Principal.fromText(canisterIdBackend!), computeAmount],
          onSuccess: async () => {
            try {
              await fetchCreate(formValues)
            }
            catch (err: any) {
              console.warn('create request error:', err)
              setNotificationType('error')
            }
            finally {
              onOk?.()
              setLoading(false)
            }
          },
          onFail: (err: any) => {
            console.log('plug error:', err)
            setLoading(false)
            setNotificationType('error')
          },
        } as any,
      ])
    } catch (err) {
      setNotificationType('error')
      setLoading(false)
      throw err
    }
  }

  return (<>
    { notificationConfig && <Notification open={ notificationOpen } type={ notificationType } config={ notificationConfig } closeIcon={ notificationType !== 'loading' } /> }
    <Spin spinning={ loading }>
      <div className={ styles.section }>
        <div className={ styles.header }>
          Enter Token Parameters
          <div className={ styles.unfold } onClick={ handleShowMore }>
            More { showMore ? <CaretUpOutlined style={{ fontSize: '12px' }} /> : <CaretDownOutlined style={{ fontSize: '12px' }} /> }
          </div>
        </div>

        <div className={ styles.content }>
          <EnterTokenForm visible propRef={ enterTokenFormRef } showMore={ showMore } onSupplyChange={ handleSupplyChange } onMainCompleteChange={ handleMainCompleteChange } />
        </div>

        <div className={ classNames(styles.header, styles.header2) }>
          Special Features
        </div>

        <div className={ styles.content }>
          <SpecialFeaturesForm visible supply={ mainCompleteData?.total_supply || 0 } propRef={ specialFeaturesFormRef } />
        </div>
      </div>
    </Spin>
    <Button disabled={ loading || !isMainComplete } className={ classNames(styles.btn, isMainComplete ? styles.usual : '') } onClick={ handleSubmit }>
      <div>Create a token</div>
      <div className={ styles.small }>Service Fees:10000.00 IEXT</div>
    </Button>
  </>
  )
}

export default observer(StepCreate)
