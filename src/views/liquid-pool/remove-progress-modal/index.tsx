import React, { forwardRef, useImperativeHandle, useMemo, useState } from 'react'
import { Modal, message } from 'antd'
import classNames from 'classnames'
import styles from './index.module.less'
import type { Pool } from '@/types/pool'
import type { NotificationType } from '@/components/notification'
import Notification from '@/components/notification'
import { to } from '@/utils/catch'
import { removeLiquidity } from '@/utils/create-pool'
import { CenterTitle } from '@/components'
import { goTransactions } from '@/utils/urls'

export interface RemoveProgressModalRef {
  showModal: (pool: Pool, selectedToken: 'base' | 'quote', removeArgs: any[]) => void
  closeModal: () => void
}
export interface RemoveProgressModalProps {
  onSuccess: () => void
}
const baseText = 'Removing Liquidity Position of '
const RemoveProgressModal = forwardRef<RemoveProgressModalRef, RemoveProgressModalProps>(({ onSuccess: afterSuccess }, ref) => {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [baseMessage, setBaseMessage] = useState('')
  // notification
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notificationType, setNotificationType] = useState<NotificationType>('loading')
  const notificationConfig = useMemo(() => {
    return {
      loading: {
        message: `Remove ${baseMessage}`,
        actionText: 'View progress',
        action: () => { setOpen(true) },
      },
      success: {
        message: `Removed ${baseMessage}`,
        actionText: 'View in transactions',
        action: () => { goTransactions() },
      },
      error: {
        message: `Remove ${baseMessage} failed`,
      },
    }
  }, [baseMessage])

  const closeModal = () => {
    setOpen(false)
  }

  const handleSuccess = () => {
    setNotificationType('success')
    setOpen(false)
    afterSuccess()
  }

  const handleFail = () => {
    setNotificationType('error')
    setOpen(false)
  }

  const handleRemove = async (args: any[]) => {
    const [p, poolCanister, baseAmount, quoteAmount, s, deadline] = args
    const [err] = await to(removeLiquidity(p, poolCanister, baseAmount, quoteAmount, s, deadline))
    if (!err) {
      handleSuccess()
    }
    else {
      handleFail()
      console.error(err)
    }
  }
  const showModal: RemoveProgressModalRef['showModal'] = (pool, selectedToken, removeArgs) => {
    let text = baseText
    if (pool.isSingle || pool.type === 'private') {
      if (pool.type === 'private')
        text += pool[selectedToken].symbol

      else
        text += pool.base.symbol
    }

    else { text += `${pool.base.symbol} and ${pool.quote.symbol}` }
    setBaseMessage(`LP of ${pool.base.symbol} + ${pool.quote.symbol}`)
    setOpen(true)
    setText(text)
    setNotificationOpen(true)
    setNotificationType('loading')
    handleRemove(removeArgs)
  }

  useImperativeHandle(ref, () => ({
    showModal,
    closeModal,
  }))

  return (
    <>
      <Notification open={ notificationOpen } type={ notificationType } config={ notificationConfig } />
      <Modal width={ 517 } title={ <CenterTitle title="Remove LP in progress" /> } open={ open } centered maskClosable={ false } footer={ false } onCancel={ closeModal }>
        <div className={ styles.body }>
          <div className={ styles.tip }>
            Please wait some time for transactions to finish
          </div>
          <div className={ styles.item }>
            <div className={ classNames(styles.circle, styles.liquid, styles.active) } />
            <div className={ styles.desc }>{ text }</div>
          </div>
        </div>
      </Modal>
    </>
  )
})

RemoveProgressModal.displayName = 'RemoveProgressModal'
export default RemoveProgressModal
