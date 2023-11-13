import type { ChangeEvent, FC } from 'react'
import React, { useCallback } from 'react'
import { CaretDownOutlined } from '@ant-design/icons'
import { Input } from 'antd'
import classNames from 'classnames'
import styles from './index.module.less'
import type { UserTokenUse } from '@/types/token'

interface TokenSelectProps {
  token?: UserTokenUse
  label: string
  showMax?: boolean
  inputDisabled?: boolean
  locked?: boolean
  danger?: boolean
  onSelect?: () => void
  onChange?: (value: string) => void
}

const TokenSelect: FC<TokenSelectProps> = ({ token, label, showMax = true, inputDisabled, locked, danger, onSelect, onChange }) => {
  const triggerChange = useCallback((value = '') => {
    if (inputDisabled)
      return
    onChange && onChange(value)
  }, [inputDisabled, onChange])

  const handleMax = useCallback(() => {
    if (!token)
      return
    triggerChange(`${token.balance}`)
  }, [token, triggerChange])

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const regex = /^\d*\.?\d{0,18}$/
    if (regex.test(value))
      triggerChange(value)
  }, [triggerChange])

  return (
    <>
      <div className={ styles.header }>
        <div>{ label }</div>
        <div className={ styles['header-right'] }>Balance: { token?.balance || 0 }
          {
            showMax
              ? <span onClick={ handleMax }>MAX</span>
              : null
          }
        </div>
      </div>
      <div className={ classNames(styles.content, locked ? styles.lock : null, danger ? styles.danger : null) }>
        <div className={ styles.select } onClick={ onSelect }>
          <div className={ styles.token }>
            {
              token
                ? <>
                  <div className={ styles.logo }>
                    <img src={ token.logo } alt="logo" />
                  </div>
                  { token.symbol }
                </>
                : 'Select Token'
            }
          </div><CaretDownOutlined />
        </div>
        {
          (token && !locked)
            ? <Input value={ token.amountToUse } bordered={ false } type="text" className={ styles.input } onChange={ handleChange } disabled={ inputDisabled } />
            : <>{ token?.amountToUse }</>
        }
      </div>
    </>
  )
}

export default TokenSelect
