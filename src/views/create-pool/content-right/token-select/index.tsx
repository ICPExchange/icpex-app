import type { ChangeEvent, FC } from 'react'
import React, { useCallback, useMemo } from 'react'
import { CaretDownOutlined } from '@ant-design/icons'
import { Input } from 'antd'
import classNames from 'classnames'
import styles from './index.module.less'
import type { UserTokenUse } from '@/types/token'

interface TokenSelectProps {
  token?: UserTokenUse
  type?: 'both' | 'only-select'
  showMax?: boolean
  locked?: boolean
  onSelect: () => void
  onChange: (value: string) => void
}

const TokenSelect: FC<TokenSelectProps> = ({ token, type = 'both', showMax = true, locked, onSelect, onChange }) => {
  const contentStyle = useMemo(() => ({
    width: type === 'only-select' ? '50%' : '100%',
  }), [type])

  const handleSelect = useCallback(() => {
    if (locked)
      return
    onSelect()
  }, [locked, onSelect])

  const triggerChange = useCallback((value = '') => {
    if (locked)
      return
    onChange(value)
  }, [locked, onChange])

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
      {
        type === 'both'
          ? <div className={ styles.header }>
            <div className={ styles['header-right'] }>Balance: { token?.balance || '0' }
              {
                showMax
                  ? <span onClick={ handleMax }>MAX</span>
                  : null
              }
            </div>
          </div>
          : null
      }
      <div className={ classNames(styles.content, locked ? styles.lock : null) } style={ contentStyle }>
        <div className={ styles.select } onClick={ handleSelect }>
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
          </div>
          <CaretDownOutlined />
        </div>
        {
          (type === 'both' && token)
            ? <Input value={ token.amountToUse } bordered={ false } disabled={ locked } type="text" className={ styles.input } onChange={ handleChange } />
            : null
        }
      </div>
    </>
  )
}

export default TokenSelect
