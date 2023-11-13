import { QuestionCircleFilled } from '@ant-design/icons'
import { Input, Modal, Tooltip } from 'antd'
import type { ChangeEvent, MouseEvent } from 'react'
import React, { forwardRef, useImperativeHandle, useMemo, useState } from 'react'
import classNames from 'classnames'
import styles from './index.module.less'
import { CenterTitle, CommonButton } from '@/components'

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
const options: (TradingFeeRateOption & { desc: string })[] = [
  {
    key: 'Extremely Low',
    value: '0.01',
    desc: 'Fees will be the same as in most other pools.',
  },
  {
    key: 'Low level',
    value: '0.3',
    desc: 'So the fee will be same as most other pools.',
  },
  {
    key: 'High level',
    value: '1',
    desc: 'Most suitable for swapping exotic assets.',
  },
  {
    key: 'Custom',
    value: '',
    desc: '',
  },
]

const TradingFeeRateModal = forwardRef<TradingFeeRateModalRef, TradingFeeRateModalProps>(({ onConfirm }, ref) => {
  const [open, setOpen] = useState(false)
  const [option, setOption] = useState<TradingFeeRateOption>({
    key: 'Extremely Low',
    value: '0.01',
  })
  const [customValue, setCustomValue] = useState('')
  const [showWarning, setShowWarning] = useState(false)
  const showModal: TradingFeeRateModalRef['showModal'] = ({ key, value }) => {
    setOpen(true)
    setOption({ key, value })
    key === 'Custom' && setCustomValue(value)
  }
  const handleCancel = () => {
    setOpen(false)
  }

  useImperativeHandle(ref, () => ({
    showModal,
  }))

  const handleOption = (option: TradingFeeRateOption) => {
    setOption(option)
    setShowWarning(false)
  }

  const getCustomOption = (): TradingFeeRateOption => ({ key: 'Custom', value: customValue })
  const valueRangeValidate = (value: string) => {
    return Number(value) > 0 && Number(value) <= 10
  }
  const customValidate = (inputString: string) => {
    const regex = /^\d*\.?\d{0,2}$/
    const value = inputString.replace(/[^0-9.]/g, '')
    if (regex.test(value)) {
      setCustomValue(value)
      setOption({ key: 'Custom', value })
      setShowWarning(!valueRangeValidate(value))
    } else {
      setShowWarning(true)
    }
  }
  const handleCustomSelected = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    if (option.key === 'Custom')
      return
    customValue && customValidate(customValue)
    setOption(getCustomOption())
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    customValidate(value)
  }

  const handleConfirm = () => {
    if (showWarning)
      return
    if (!valueRangeValidate(option.value)) {
      setShowWarning(true)
      return
    }
    onConfirm && onConfirm(option.key === 'Custom' ? getCustomOption() : option)
    handleCancel()
  }
  const Title = useMemo(() => {
    return (
      <CenterTitle>
        Trading Fee Rate
        <Tooltip title="Pools with lower trading fees will attract more traders.">
          <QuestionCircleFilled className={ styles.question } />
        </Tooltip>
      </CenterTitle>
    )
  }, [])
  return (
    <Modal width={ 600 } title={ Title } open={ open } centered footer={ false } onCancel={ handleCancel }>
      <div className={ styles.body }>
        {
        options.map((item) => {
          const { key, value, desc } = item
          if (key === 'Custom') {
            return (
              <div key={ key } className={ classNames(styles.custom, option.key === key ? styles['custom-active'] : null, showWarning ? styles['custom-warning'] : null) } onClick={ handleCustomSelected }>
                Custom <Input bordered={ false } className={ styles.input } value={ customValue } onChange={ handleChange } /> <span className={ styles.unit }>%</span>
              </div>
            )
          }
          return (
            <div key={ key } className={ classNames(styles.option, option.key === key ? styles['option-active'] : null) } onClick={ () => handleOption({ key, value }) }>
              <div className={ styles.top }>
                <div>{ key }</div>
                <div>{ value }%</div>
              </div>
              <div className={ styles.bottom }>{ desc }</div>
            </div>
          )
        })
      }
        {
          showWarning
            ? <div className={ styles.warning }>The trading fee rate must be between 0% to 10%</div>
            : null
        }
        <CommonButton type="primary" size="large" block className={ styles.confirm } onClick={ handleConfirm }>Confirm</CommonButton>
      </div>
    </Modal>
  )
})

TradingFeeRateModal.displayName = 'TradingFeeRateModal'

export default TradingFeeRateModal
