import { Button, Modal } from 'antd'
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { Principal } from '@dfinity/principal'
import styles from './index.module.less'
import { CenterTitle, Notification } from '@/components'
import type { NotificationType } from '@/components/notification'
import type { SubWalletToken } from '@/types/token'
import { withdrawal } from '@/utils/wallet'
import { multiplyAndConvertToBigInt } from '@/utils/common'
import { goMainWallet } from '@/utils/urls'

export interface WithdrawModalModalRef {
  openModal: (token: SubWalletToken) => void
  closeModal: () => void
}
const WithdrawModal = forwardRef<WithdrawModalModalRef>((_, ref) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const tokenRef = useRef<SubWalletToken>()
  // notification
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notificationType, setNotificationType] = useState<NotificationType>('loading')
  const notificationConfig = useMemo(() => {
    const baseMessage = `${tokenRef.current?.symbol} token`
    return {
      loading: {
        message: `Withdraw ${baseMessage}`,
      },
      success: {
        message: `Withdrawed ${baseMessage}`,
        actionText: 'View in main-wallet',
        action: () => { goMainWallet() },
      },
      error: {
        message: `Withdraw ${baseMessage} failed`,
      },
    }
  }, [tokenRef.current])

  const closeModal = useCallback(() => {
    setOpen(false)
  }, [])

  const handleSuccess = useCallback(() => {
    setNotificationType('success')
    closeModal()
    setLoading(false)
  }, [])

  const handleError = useCallback(() => {
    setNotificationType('error')
    closeModal()
    setLoading(false)
  }, [])

  const handleWithdrawal = useCallback(async () => {
    if (!tokenRef.current)
      return
    setLoading(true)
    setNotificationOpen(true)
    setNotificationType('loading')
    const { canisterId, balance, decimals } = tokenRef.current
    const [_, res] = await withdrawal(Principal.fromText(canisterId), multiplyAndConvertToBigInt(balance, decimals))
    if (res) {
      if ('Ok' in res) {
        handleSuccess()
      } else {
        console.error(res.Err)
        handleError()
      }
    } else {
      handleError()
    }
  }, [])

  const openModal: WithdrawModalModalRef['openModal'] = useCallback((token) => {
    setOpen(true)
    tokenRef.current = token
  }, [])

  useImperativeHandle(ref, () => ({
    openModal,
    closeModal,
  }))

  return (
    <>
      <Modal width={ 532 } title={ <CenterTitle title="Withdraw" /> } open={ open } centered footer={ false } onCancel={ closeModal }>
        <div className={ styles.desc }>The tokens will be withdrawn to the main wallet.</div>
        <Button type="primary" size="large" block loading={ loading } onClick={ handleWithdrawal }>Continue</Button>
      </Modal>
      <Notification open={ notificationOpen } type={ notificationType } config={ notificationConfig } closeIcon />
    </>
  )
})

WithdrawModal.displayName = 'WithdrawModal'
export default WithdrawModal
