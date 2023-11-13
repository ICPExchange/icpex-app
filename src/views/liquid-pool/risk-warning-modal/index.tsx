import { Checkbox, Modal } from 'antd'
import React, { forwardRef, useImperativeHandle, useState } from 'react'
import type { CheckboxChangeEvent } from 'antd/es/checkbox'
import styles from './index.module.less'
import { CenterTitle, CommonButton } from '@/components'

export interface RiskWarningModalRef {
  showModal: () => void
  closeModal: () => void
}

export interface RiskWarningModalProps {
  onAgrees?: () => void
}
const RiskWarningModal = forwardRef<RiskWarningModalRef, RiskWarningModalProps>(({ onAgrees }, ref) => {
  const [open, setOpen] = useState(false)
  const [checked, setChecked] = useState(false)
  const handleCancel = () => {
    setOpen(false)
  }
  const showModal: RiskWarningModalRef['showModal'] = () => {
    setOpen(true)
  }
  useImperativeHandle(ref, () => ({
    showModal,
    closeModal: handleCancel,
  }))

  const handleChange = (e: CheckboxChangeEvent) => {
    setChecked(e.target.checked)
  }

  const handleContinue = () => {
    if (!checked)
      return
    localStorage.setItem('agreeRisk', 'true')
    handleCancel()
    onAgrees && onAgrees()
  }

  return (
    <Modal width={ 532 } title={ <CenterTitle>Add capital risk warning</CenterTitle> } open={ open } centered maskClosable={ false } footer={ false } onCancel={ handleCancel }>
      <div className={ styles.statement }>
        Adding assets to a liquidity pool and becoming a liquidity provider is not risk-free. When the market price of the token fluctuates greatly, the income of adding assets may be lower than the income of ordinary holding the token, and may even cause losses.
      </div>
      <div className={ styles.service }>
        <Checkbox checked={ checked } onChange={ handleChange } /> I have read, understand, and agree to the <a href="https://docs.icpex.org/legal-and-privacy/terms-of-service" target="_blank" rel="noreferrer">Terms Of Service</a>.
      </div>
      <CommonButton type="primary" size="large" block disabled={ !checked } onClick={ handleContinue }>Continue</CommonButton>
    </Modal>
  )
})

RiskWarningModal.displayName = 'RiskWarningModal'

export default RiskWarningModal
