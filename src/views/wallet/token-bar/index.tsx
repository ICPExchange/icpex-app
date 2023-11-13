import type { ChangeEvent, FC } from 'react'
import React from 'react'
import { Input, Switch } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import GhostButton from '../ghost-button'
import styles from './index.module.less'

interface TokenBarProps {
  isMain?: boolean
  hide?: boolean
  onHideChange?: (value: boolean) => void
  searchCanister?: string
  onSeachChange?: (value: string) => void
  onAdd?: () => void
}
const TokenBar: FC<TokenBarProps> = ({ isMain, hide, onHideChange, searchCanister, onSeachChange, onAdd }) => {
  const handleHideChange = (checked: boolean) => {
    onHideChange && onHideChange(checked)
  }
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim()
    onSeachChange && onSeachChange(value)
  }
  return (
    <div className={ styles.bar }>
      <div className={ styles.title }>Token</div>
      <div className={ styles.actions }>
        <div>
          Hide Zero Balance<Switch className={ styles.switch } size="small" checked={ hide } onChange={ handleHideChange } />
        </div>
        <Input className={ styles.search } placeholder="Search by symbol or canister id" prefix={ <SearchOutlined /> } allowClear value={ searchCanister } onChange={ handleSearchChange } />
        {
          isMain
            ? <GhostButton className={ styles.add } icon={ <PlusOutlined /> } onClick={ onAdd }>Add Token</GhostButton>
            : null
        }
      </div>
    </div>
  )
}

export default TokenBar
