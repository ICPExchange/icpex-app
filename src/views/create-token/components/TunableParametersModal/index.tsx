import { QuestionCircleFilled } from '@ant-design/icons'
import { Button, Input, Modal, Tooltip, message } from 'antd'
import type { ChangeEvent } from 'react'
import React, { useCallback, useEffect, useState } from 'react'
import classNames from 'classnames'
import styles from './index.module.less'
import ConfirmModal from './Confirm'
import { ModalType } from './constant'
import { getPrincipalDashboardURL } from '@/utils/urls'
import type { UserToken } from '@/types/token'
import { truncateString } from '@/utils/principal'
import { Copy, Share } from '@/components'

export interface TradingFeeRateOption {
  key: 'Extremely Low' | 'Low level' | 'High level' | 'Custom'
  value: string
}
export interface TradingFeeRateModalRef {
  showModal: (option: TradingFeeRateOption) => void
}
export interface TradingFeeRateModalProps {
  onConfirm?: (option: TradingFeeRateOption) => void
}

const TunableParametersModal: React.FC<{
  visible: boolean
  data?: UserToken
  onCancel: () => void
}> = ({ visible, data, onCancel }) => {
  const [customValue, setCustomValue] = useState('')
  const [confirmModalType, setConfirmModalType] = useState<number | null>(null)

  const [messageApi, contextHolder] = message.useMessage()

  const handleCancel = () => {
    onCancel?.()
  }

  useEffect(() => {
    if (visible)
      setCustomValue('')
  }, [visible])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const regex = /^\d*\.?\d{0,2}$/
    if (regex.test(value))
      setCustomValue(value)
  }

  const tipComponent = (label: string, tip: string) => (
    <div className={ styles.title }>
      { label }
      <Tooltip overlayStyle={{ maxWidth: '1000px' }} title={ tip }>
        <QuestionCircleFilled className={ styles.question } />
      </Tooltip>
    </div>
  )

  const handleShowConfirm = (type: number) => {
    if (type === ModalType.ADD && !customValue) {
      messageApi.warning('Issue Additional Tokens Cannot be empty')
      return
    }

    onCancel()
    setConfirmModalType(type)
  }

  const handleHideConfirmModal = useCallback(() => {
    setConfirmModalType(null)
    setCustomValue('')
    onCancel?.()
  }, [])

  return (
    <>
      { contextHolder }
      <Modal width={ 600 } title={ <div className={ styles.title }>Set Tunable Parameters</div> } open={ visible } centered maskClosable={ false } footer={ false } onCancel={ handleCancel }>
        <div className={ styles.body }>
          <div className={ styles.icp }>
            <div className={ styles.left }>
              <img className={ styles.logo } src={ data?.logo } alt="logo" />
              <div className={ styles['icp-right'] }>
                <div className={ styles.owner }>{ data?.symbol }</div>
                <div className={ styles.owner }>{ data?.name }</div>
              </div>
            </div>
            <div className={ styles.right }>
              <div className={ styles.address }>{ truncateString(data?.canisterId, 20) }</div>
              <span className={ styles.space }>
                <Share href={ getPrincipalDashboardURL(data?.canisterId || '') } />
              </span>
              <span>
                <Copy text={ data?.canisterId } />
              </span>
            </div>
          </div>

          <div className={ styles.supply }>
            <span>Total supply</span>
            <span className={ styles.num }>{ data?.totalSupply }</span>
          </div>

          {
            data?.canMint && <div className={ styles['add-tip'] }>
              { tipComponent('Issue Additional Tokens', 'The number of additional tokens that need to be issued this time.') }
            </div>
          }
          {
            data?.canMint
              ? <div className={ styles.add }>
                <Input className={ styles['input-token'] } value={ customValue } placeholder="0-999,999,999,999" onChange={ handleChange } />
                <Button className={ styles['add-confirm'] } onClick={ () => handleShowConfirm(ModalType.ADD) }>confirm</Button>
              </div>
              : null
          }
          <div className={ classNames(styles.add, styles.relinquish) }>
            <div className={ classNames(styles['input-token'], styles['input-div']) }> { tipComponent('Relinquish Ownership', 'Relinquish token ownerships to make token more decentralized.') }</div>
            <Button className={ styles['add-confirm'] } onClick={ () => handleShowConfirm(ModalType.REMOVE) }>confirm</Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal type={ confirmModalType } baseData={ data } addValue={ customValue } onCancel={ handleHideConfirmModal } />
    </>
  )
}

export default TunableParametersModal
