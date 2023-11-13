import type { FC, MouseEvent } from 'react'
import React from 'react'
import styles from './index.module.less'
import Portal from '@/components/portal'
import faucetReceivedPng from '@/assets/faucet-received.png'
import faucetSuccessPng from '@/assets/faucet-success.png'
import waitPng from '@/assets/wait-small.svg'

interface ModalProps {
  status: 'loading' | 'success' | 'fail' | 'received'
  onClose: () => void
}
const Modal: FC<ModalProps> = ({ status, onClose }) => {
  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    if (status !== 'loading') {
      onClose()
    }
  }
  return (
    <>
      {
        ['loading', 'success', 'received'].includes(status)
          ? <Portal>
            <div className={ styles.modal }>
              <div className={ styles.mask } onClick={ handleClick } />
              <div className={ styles.content }>
                {
                  status === 'loading'
                    ? <div className={ styles.wait }>
                      <div className={ styles.icon }>
                        <img src={ waitPng } alt="wait" />
                      </div>
                      <div className={ styles.waitText }>Wait for a moment…</div>
                    </div>
                    : <>
                      <img className={ styles.result } src={ status === 'success' ? faucetSuccessPng : faucetReceivedPng } alt="faucet-modal" />
                      <div className={ styles.close } onClick={ onClose } />
                    </>
                }
              </div>
            </div>
          </Portal>
          : null
    }
    </>
  )
}

export default Modal
