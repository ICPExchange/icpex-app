import React from 'react'
import { Radio } from 'antd'
import type { RadioGroupProps, RadioProps } from 'antd/es/radio/interface'

import classNames from 'classnames'
import styles from './index.module.less'

const CommonButtonRadio: React.FC<RadioGroupProps & RadioProps & {
  list: { label: string; value: string }[]
}> = ({ list, ...props }) => {
  const { defaultValue, className } = props

  return (
    <Radio.Group className={ styles['radio-group'] } defaultValue={ defaultValue } buttonStyle="solid">
      {
        list?.map(
          (item, index) => (<Radio.Button className={ classNames(styles.radio, className) } key={ index } value={ item.value }>{ item.label }</Radio.Button>),
        )
      }
    </Radio.Group>
  )
}

export default CommonButtonRadio
