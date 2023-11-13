import type { FC } from 'react'
import React from 'react'
import { Slider } from 'antd'
import styles from './index.module.less'
import { CommonButton } from '@/components'

export interface PercentageProps {
  value: number
  onChange?: (value: number) => void
}
const presetValues = [25, 50, 75, 100]
const Percentage: FC<PercentageProps> = ({ value, onChange }) => {
  const handleChange: PercentageProps['onChange'] = (value) => {
    onChange && onChange(value)
  }
  return (
    <div>
      <div className={ styles.label }>Amount</div>
      <div className={ styles.amount }>{ value }%</div>
      <Slider className={ styles.slider } value={ value } onChange={ handleChange } />
      <div className={ styles.preset }>
        {
            presetValues.map((presetValue) => {
              return (
                <CommonButton key={ presetValue } type={ value === presetValue ? 'primary' : 'default' } size="small" className={ styles.button } onClick={ (() => handleChange(presetValue)) }>{ presetValue }%</CommonButton>
              )
            })
        }
      </div>
    </div>
  )
}

export default Percentage
