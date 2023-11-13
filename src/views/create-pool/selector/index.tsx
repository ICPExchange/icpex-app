import type { FC } from 'react'
import React from 'react'
import styles from './index.module.less'

export interface SelectorOption<T> {
  label: string
  value: T
}
export interface SelectorProps<T = string> {
  options?: SelectorOption<T>[]
  value?: T
  onChange: (value: T) => void
}
const Selector: FC<SelectorProps> = ({ value, options = [], onChange }) => {
  const style = {
    width: options.length === 2 ? '66.6%' : '100%',
  }
  return (
    <div className={ styles.selector } style= { style }>
      {
        options.map((item) => {
          const { label, value: optionsValue } = item
          const classes = [styles['selector-option']]
          value === optionsValue && classes.push(styles['selector-option--active'])
          return (
            <div className={ classes.join(' ') } key={ optionsValue } onClick={ () => onChange(optionsValue) }>{ label }</div>
          )
        })
      }
    </div>
  )
}

export default Selector
