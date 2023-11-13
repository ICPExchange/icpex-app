import { Button, Checkbox, Modal, Spin } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import { Principal } from '@dfinity/principal'
import { observer } from 'mobx-react'
import { ModalType } from './constant'
import styles from './index.module.less'
import { addToken, removeToken } from '@/utils/create-token'
import { canisterId, idlFactory } from '@/canisters/icpl_icpl'
import { canisterId as canisterIdBackend } from '@/canisters/icpl_backend'
import appStore from '@/store/app'
import type { UserToken } from '@/types/token'
import { calculateTotalTokenAmountWithFeesToBigint } from '@/utils/fee'
import { Notification } from '@/components'
import type { NotificationProps, NotificationType } from '@/components/notification'
import warnImg from '@/assets/warn-red.png'

const ConfirmModal: React.FC<{
  type: number | null
  addValue: string
  baseData?: UserToken
  onCancel: () => void
}> = ({ type, baseData, addValue, onCancel }) => {
  const [checkValue, setCheckValue] = useState(0)
  const [loading, setLoading] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notificationType, setNotificationType] = useState<NotificationType>('loading')
  const [notificationConfig, setNotificationConfig] = useState<NotificationProps['config']>()

  useEffect(() => {
    const isAdd = type === ModalType.ADD

    if (!type)
      return
    setNotificationConfig({
      loading: { message: isAdd ? 'Tokens are issuing...' : 'Token ownership relinquishing...' },
      success: { message: isAdd ? 'Tokens issued successful' : 'Token ownership relinquished successful', action: onCancel },
      error: { message: isAdd ? 'Tokens issued failed' : 'Token ownership relinquished failed', action: onCancel },
      info: { message: isAdd ? '' : 'You need to check Sure first' },
    })
  }, [type])

  const dataInfo = useMemo(() => {
    return type === ModalType.ADD
      ? {
          title: <div className={ styles.title }>Confirm the additiona lissuance of the token?</div>,
          content: (<>

            <div>Additional tokens issued: { addValue }</div>
            {
            baseData
              ? <div>The total supply after the issuance: { baseData.totalSupply + Number(addValue) }</div>
              : null
          }
          </>),
        }
      : {
          title: <div>
            <div className={ styles['warn-img'] } style={{ backgroundImage: `url(${warnImg})` }} />
            <div className={ styles.title }>Are you sure you want to relinquish</div>
            <div className={ styles.title }>ownership of this token?</div>
          </div>,
          content: (<div>You can relinquish ownership of your token by relinquishing control of the token canister. Once confirmed, this change is irreversible.</div>),
        }
  }, [type, addValue, baseData])

  const onAddToken = async () => {
    if (!baseData)
      return
    const { decimals, owner, canisterId } = baseData

    setLoading(true)

    try {
      await addToken(Principal.fromText(canisterId), Principal.fromText(owner), BigInt(Number(addValue) * 10 ** decimals))

      setNotificationType('success')
    }
    catch (err) {
      setNotificationType('error')
      throw err
    }
    finally {
      setLoading(false)
      onCancel?.()
    }
  }

  const onAdd = async () => {
    const platToken = appStore.platToken
    if (!platToken)
      return

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
      setLoading(true)

      await window.ic.plug.batchTransactions([
        {
          idl: idlFactory,
          canisterId,
          methodName: 'approve',
          args: [Principal.fromText(canisterIdBackend!), computeAmount],
          onSuccess: () => { onAddToken() },
          onFail: () => {
            setNotificationType('error')
          },
        } as any,
      ])
    }
    catch (err) {
      setLoading(false)
      setNotificationType('error')
      throw err
    }
  }

  const onRemove = async () => {
    if (!baseData)
      return
    setNotificationType('loading')
    setNotificationOpen(true)
    if (!checkValue) {
      setNotificationType('info')
      return
    }

    try {
      setLoading(true)
      await removeToken(Principal.fromText(baseData.canisterId))
      setNotificationType('success')
    }
    catch (err) {
      setNotificationType('error')
      throw err
    }
    finally {
      setLoading(false)
      onCancel?.()
    }
  }

  const handleCancel = () => {
    onCancel?.()
  }

  const handleOk = async () => {
    if (type === ModalType.ADD) {
      onAdd()
      return
    }

    onRemove()
  }

  const handleCheckboxChange = () => {
    setCheckValue(checkValue === 0 ? 1 : 0)
  }

  const isOkStyle = useMemo(() => {
    return type === ModalType.ADD
    || (
      type === ModalType.REMOVE
      && checkValue
    )
  }, [checkValue, type])

  return (
    <>
      { notificationConfig && <Notification open={ notificationOpen } type={ notificationType } config={ notificationConfig } /> }
      <Modal width={ 680 } title={ dataInfo?.title } open={ Boolean(type) } centered maskClosable={ false } footer={ false } onCancel={ handleCancel }>
        <Spin spinning={ loading }>
          <div className={ styles.body }>
            <div className={ styles['confirm-content'] }>
              { dataInfo?.content }
            </div>

            <div className={ styles.supply }>
              <span>Service Fee</span>
              <span>10000 ICPL</span>
            </div>

            {
              type === ModalType.REMOVE
              && <div className={ styles['checkbox-box'] }>
                <Checkbox.Group onChange={ handleCheckboxChange } value={ [checkValue] }>
                  <Checkbox value={ 1 } className={ styles.checkbox }>Yes, l am sure</Checkbox>
                </Checkbox.Group>
              </div>
            }

            <div className={ styles['confirm-footer'] }>
              <Button className={ styles.cancel } onClick={ handleCancel }>Cancel</Button>
              <Button className={ isOkStyle ? styles.ok : styles.cancel } onClick={ handleOk }>confirm</Button>
            </div>
          </div>
        </Spin>
      </Modal>
    </>
  )
}

export default observer(ConfirmModal)
