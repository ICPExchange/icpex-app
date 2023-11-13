import type { FC } from 'react'
import React from 'react'
import classNames from 'classnames'
import { Button } from 'antd'
import styles from './index.module.less'

interface DimensionSelectorOption {
  value: string
  label: string
  style?: React.CSSProperties
}
interface DimensionSelectorProps {
  value?: string
  options: DimensionSelectorOption[]
  onChange: (value: string) => void
  className?: string
  style?: React.CSSProperties
}
const DimensionSelector: FC<DimensionSelectorProps> = ({ value, options, onChange, className, style }) => {
  const buttonComponents = options.map((option) => {
    const { value: optionValue, label, style } = option
    const isActive = optionValue === value
    const type = isActive ? 'primary' : 'text'
    return (
      <Button className={ classNames(isActive ? styles.active : null) } key={ optionValue } type={ type } style= { style } onClick={ () => onChange(optionValue) }>{ label }</Button>
    )
  })
  return (
    <div className={ classNames(styles.selector, className) } style={ style }>
      { buttonComponents }
    </div>
  )
}

export default DimensionSelector
