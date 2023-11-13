import type { FC } from 'react'
import React, { useRef, useState } from 'react'
import { Principal } from '@dfinity/principal'
import { observer } from 'mobx-react'
import { message } from 'antd'
import styles from './index.module.less'
import Modal from './modal'
import { icpl_faucet } from '@/canisters/icpl_faucet'
import { canisterId as icplCanisterId } from '@/canisters/icpl_icpl'
import appStore from '@/store/app'
import { to } from '@/utils/catch'

const Faucet: FC = observer(() => {
  const [open, setOpen] = useState(true)
  const [messageApi, contextHolder] = message.useMessage()
  const [status, setStatus] = useState<'loading' | 'success' | 'fail' | 'received'>('fail')
  const received = useRef(false)
  const fetchIcpl = async () => {
    if (!appStore.userId) {
      messageApi.error('Please login plug wallet first')
      return
    }
    if (received.current) {
      setStatus('received')
      return
    }
    if (status === 'loading')
      return
    setStatus('loading')
    const [err] = await to(icpl_faucet.faucet(Principal.fromText(icplCanisterId!), Principal.fromText(appStore.userId)))
    if (!err) {
      setStatus('success')
      setOpen(false)
      received.current = true
    }
    else {
      if (err.message.includes('receive')) {
        setStatus('received')
        setOpen(false)
      }
      else {
        setStatus('fail')
        messageApi.error(err.message)
      }
    }
  }
  return (
    <>
      { contextHolder }
      <Modal status={ status } onClose={ () => setStatus('fail') } />
      {
        open
          ? <div className={ styles.faucet }>
            <div className={ styles.receive } onClick={ fetchIcpl } />
            <div className={ styles.close } onClick={ () => setOpen(false) } />
          </div>
          : null
        }
    </>
  )
})

export default Faucet
