import { QuestionCircleFilled } from '@ant-design/icons'
import { Modal, Tooltip } from 'antd'
import React, { forwardRef, useImperativeHandle, useMemo, useState } from 'react'
import classNames from 'classnames'
import styles from './index.module.less'
import { CenterTitle, CommonButton } from '@/components'
import type { PoolType } from '@/types/pool'

export interface VolatilityEoefficientOption {
  key: 'Medium' | 'Low' | 'High'
  value: string
}
export interface VolatilityEoefficientModalRef {
  showModal: (option: VolatilityEoefficientOption) => void
}
export interface VolatilityEoefficientModalProps {
  onConfirm?: (option: VolatilityEoefficientOption) => void
  poolType?: PoolType
}

const commonOptions: (VolatilityEoefficientOption & { desc: string })[] = [
  {
    key: 'Medium',
    value: '0.5',
    desc: 'Suitable for most situations.',
  },
  {
    key: 'Low',
    value: '0.01',
    desc: 'Results in a relatively fixed price.',
  },
  {
    key: 'High',
    value: '1',
    desc: 'Results in a more volatile price.',
  },
]
const anchoredOptions: (VolatilityEoefficientOption & { desc: string })[] = [
  {
    key: 'Medium',
    value: '0.05',
    desc: 'Suitable for most situations.',
  },
  {
    key: 'Low',
    value: '0.01',
    desc: 'Results in a relatively fixed price.',
  },
  {
    key: 'High',
    value: '0.1',
    desc: 'Results in a more volatile price.',
  },
]
const VolatilityEoefficientModal = forwardRef<VolatilityEoefficientModalRef, VolatilityEoefficientModalProps>(({ onConfirm, poolType }, ref) => {
  const [open, setOpen] = useState(false)
  const options = useMemo(() => {
    return poolType === 'anchored' ? anchoredOptions : commonOptions
  }, [poolType])
  const [option, setOption] = useState<VolatilityEoefficientOption>({
    key: 'Medium',
    value: '0.5',
  })
  const showModal: VolatilityEoefficientModalRef['showModal'] = (option) => {
    setOpen(true)
    setOption(option)
  }
  const handleCancel = () => {
    setOpen(false)
  }

  useImperativeHandle(ref, () => ({
    showModal,
  }))

  const handleConfirm = () => {
    onConfirm && onConfirm(option)
    handleCancel()
  }

  const Title = useMemo(() => {
    return (
      <CenterTitle>
        Volatility Coefficient
        <Tooltip title="The smaller the volatility coefficient, the smaller the volatility of the trading market and the deeper the market depth.">
          <QuestionCircleFilled className={ styles.question } />
        </Tooltip>
      </CenterTitle>
    )
  }, [])
  return (
    <Modal width={ 600 } title={ Title } open={ open } centered footer={ false } onCancel={ handleCancel }>
      {
        options.map((item) => {
          const { key, value, desc } = item
          return (
            <div key={ key } className={ classNames(styles.option, option.key === key ? styles['option-active'] : null) } onClick={ () => setOption({ key, value }) }>
              <div className={ styles.top }>
                <div>{ key }</div>
                <div>K={ value }</div>
              </div>
              <div className={ styles.bottom }>{ desc }</div>
            </div>
          )
        })
      }
      <CommonButton type="primary" size="large" block className={ styles.confirm } onClick={ handleConfirm }>Confirm</CommonButton>
    </Modal>
  )
})

VolatilityEoefficientModal.displayName = 'VolatilityEoefficientModal'

export default VolatilityEoefficientModal
