import { Modal } from 'antd'
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react'
import classNames from 'classnames'
import { RightOutlined } from '@ant-design/icons'
import { observer } from 'mobx-react'
import styles from './index.module.less'
import type { UserTokenUse } from '@/types/token'
import { localVerity } from '@/utils/plug/connect'
import { canisterId as routerCanisterId, idlFactory as routerIdlFactory } from '@/canisters/icpl_router'
import appStore from '@/store/app'
import { dip20Transfer, icrc1Transfer } from '@/utils/plug/transaction'
import type { NotificationType } from '@/components/notification'
import Notification from '@/components/notification'
import { CenterTitle } from '@/components'
import { goTransactions } from '@/utils/urls'

interface PoolInfo {
  isSingle: boolean
  methodName: string
  args: any[]
}
export interface ApprovalModalRef {
  showModal: (baseToken: UserTokenUse, quoteToken: UserTokenUse, pool: PoolInfo) => void
  closeModal: () => void
}
export interface ApprovalModalProps {
  onSuccess?: () => void
  onFail?: () => void
}
const ApprovalModal = forwardRef<ApprovalModalRef, ApprovalModalProps>(({ onSuccess: afterSuccess, onFail: afterFail }, ref) => {
  const [open, setOpen] = useState(false)
  const [baseToken, setBaseToken] = useState<UserTokenUse>()
  const [quoteToken, setQuoteToken] = useState<UserTokenUse>()
  const [isSingle, setIsSingle] = useState<boolean>(false)
  const [progress, setProgress] = useState(0)
  // notification
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notificationType, setNotificationType] = useState<NotificationType>('loading')
  const notificationConfig = useMemo(() => {
    const baseText = `${baseToken?.amountToUse || 0} ${baseToken?.symbol}`
    const quoteText = isSingle ? `${quoteToken?.symbol}` : `${quoteToken?.amountToUse || 0} ${quoteToken?.symbol}`
    const baseMessage = `${baseText} + ${quoteText}`
    return {
      loading: {
        message: `Add LP ${baseMessage}`,
        actionText: 'View progress',
        action: () => { setOpen(true) },
      },
      success: {
        message: `Add LP ${baseMessage}`,
        actionText: 'View in transactions',
        action: () => { goTransactions() },
      },
      error: {
        message: `Add LP ${baseMessage} failed`,
      },
    }
  }, [baseToken, quoteToken, isSingle])

  const liquidText = useMemo(() => {
    if (!baseToken || !quoteToken)
      return ''
    let tokenText = baseToken.symbol ?? ''
    tokenText += quoteToken.symbol ? ` + ${quoteToken.symbol}` : ''
    return tokenText
  }, [baseToken, quoteToken])

  const handleCancel = useCallback(() => {
    setOpen(false)
  }, [])

  const handleFail = useCallback(() => {
    afterFail && afterFail()
    setNotificationType('error')
    handleCancel()
  }, [afterFail, handleCancel])

  const handleSuccess = useCallback(() => {
    afterSuccess && afterSuccess()
    setNotificationType('success')
    handleCancel()
  }, [afterSuccess, handleCancel])

  const setNextState = useCallback(() => {
    setProgress(prevState => prevState + 1)
  }, [])

  const createTransaction = useCallback((token: UserTokenUse) => {
    const onSuccess = () => {
      setNextState()
    }
    const onFail = (res: any) => {
      // approve failed
      console.error(`approve ${token.symbol} error`, res)
      handleFail()
    }
    const { protocol } = token
    const transferParams = { ...token, amount: Number(token.amountToUse) }
    if (protocol === 'DIP20')
      return dip20Transfer(transferParams, onSuccess, onFail)

    if (protocol === 'ICRC-1')
      return icrc1Transfer(transferParams, onSuccess, onFail)
  }, [setNextState, handleFail])

  const createPoolAction = useCallback((pool: PoolInfo) => {
    const onSuccess = () => {
      handleSuccess()
    }
    const onFail = (res: any) => {
      // create pool failed
      console.error('createPool error', res)
      handleFail()
    }
    const CREATE_POOL_ACTION = {
      idl: routerIdlFactory,
      canisterId: routerCanisterId,
      methodName: pool.methodName,
      args: [...pool.args],
      onSuccess,
      onFail,
    } as any
    return CREATE_POOL_ACTION
  }, [handleSuccess, handleFail])

  const handleTransactions: ApprovalModalRef['showModal'] = async (baseToken, quoteToken, pool) => {
    setNextState()
    const transactions: any[] = [createTransaction(baseToken)]
    if (!pool.isSingle)
      transactions.push(createTransaction(quoteToken))
    transactions.push(createPoolAction(pool))
    try {
      await localVerity()
      await window.ic.plug.batchTransactions(transactions)
    }
    catch (error) {
      if (error instanceof Error) {
        // approve reject
        console.error('catch error:', error.message)
        if (error.message.includes('reject')) {
          handleFail()
          return
        }
      }
      handleFail()
    }
  }

  const showModal: ApprovalModalRef['showModal'] = async (baseToken, quoteToken, pool) => {
    if (!appStore.transferAccount)
      return
    setOpen(true)
    setNotificationOpen(true)
    setNotificationType('loading')
    setProgress(0)
    setIsSingle(pool.isSingle)
    setBaseToken(baseToken)
    setQuoteToken(quoteToken)
    handleTransactions(baseToken, quoteToken, pool)
  }

  useImperativeHandle(ref, () => ({
    showModal,
    closeModal: handleCancel,
  }))

  return (
    <>
      <Notification open={ notificationOpen } type={ notificationType } config={ notificationConfig } />
      <Modal width={ 725 } title={ <CenterTitle title="Add LP in progress" /> } open={ open } centered maskClosable={ false } footer={ false } onCancel={ handleCancel }>
        <div className={ styles.body }>
          <div className={ styles.tip }>
            Please wait some time for transactions to finish
          </div>
          <div className={ styles.progress }>
            {
            baseToken
              ? <>
                <div className={ styles.item }>
                  <div className={ classNames(styles.circle, styles.check, progress === 1 ? styles.active : null, progress > 1 ? styles.complete : null) } />
                  <div className={ styles.desc }>Approving { baseToken.symbol }</div>
                </div>
                <div>
                  <RightOutlined className={ styles.right } />
                </div>
              </>
              : null
          }
            {
           (!isSingle && quoteToken)
             ? <>
               <div className={ styles.item }>
                 <div className={ classNames(styles.circle, styles.check, progress === 2 ? styles.active : null, progress > 2 ? styles.complete : null) } />
                 <div className={ styles.desc }>Approving { quoteToken.symbol }</div>
               </div>
               <div>
                 <RightOutlined className={ styles.right } />
               </div>
             </>
             : null
          }
            <div className={ styles.item }>
              <div className={ classNames(styles.circle, styles.liquid, progress === (isSingle ? 2 : 3) ? styles.active : null, progress > (isSingle ? 2 : 3) ? styles.complete : null) } />
              <div className={ styles.desc }>{ liquidText }</div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
})

ApprovalModal.displayName = 'ApprovalModal'

export default observer(ApprovalModal)
