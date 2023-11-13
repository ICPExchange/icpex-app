import type { ChangeEvent, FC } from 'react'
import React from 'react'
import { Input } from 'antd'
import styles from './index.module.less'

export interface CanisterProps {
  locked?: boolean
  value?: string
  onChange?: (value: string) => void
}
const Canister: FC<CanisterProps> = ({ locked, value, onChange }) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (locked)
      return
    const value = e.target.value.trim()
    onChange && onChange(value)
  }
  return (
    <div className={ styles.canister }>
      <div>Canister lD</div>
      <Input className={ styles.input } disabled={ locked } allowClear placeholder="Enter the canister id" value={ value } onChange={ handleChange } />
    </div>
  )
}

export default Canister
