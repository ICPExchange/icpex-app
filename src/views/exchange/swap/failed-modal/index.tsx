import { Modal } from 'antd'
import React, { forwardRef, useImperativeHandle, useState } from 'react'
import styles from './index.module.less'
import { CenterTitle, CommonButton } from '@/components'

export interface FailedModalRef {
  showModal: () => void
  closeModal: () => void
}
const FailedModal = forwardRef<FailedModalRef>((_, ref) => {
  const [open, setOpen] = useState(false)
  const handleCancel = () => {
    setOpen(false)
  }

  const showModal = () => {
    setOpen(true)
  }
  useImperativeHandle(ref, () => ({
    showModal,
    closeModal: handleCancel,
  }))

  return (
    <Modal width={ 532 } title={ <CenterTitle title="Transaction failed" /> } open={ open } centered maskClosable={ false } footer={ false } onCancel={ handleCancel }>
      <div className={ styles.body }>
        <div className={ styles.tip }>
          For some reasons (such as network errors, etc.), your transaction was unsuccessful, and the amount will be returned to the sub-wallet.
        </div>
        <CommonButton type="primary" size="large" block>Click to view</CommonButton>
      </div>
    </Modal>
  )
})

FailedModal.displayName = 'FailedModal'

export default FailedModal
