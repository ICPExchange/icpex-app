import type { FC } from 'react'
import { CaretDownOutlined, PlusOutlined } from '@ant-design/icons'
import React, { useRef } from 'react'
import styles from './index.module.less'
import type { Token, UserToken } from '@/types/token'
import { TokenListModal } from '@/components'
import type { TokenListModalProps, TokenListModalRef } from '@/components/token/list-modal'

export interface TokensParameterProps {
  tokenOne?: Token
  tokenTwo?: Token
  onSelect?: (order: string, token: UserToken) => void
}
const TokensParameter: FC<TokensParameterProps> = ({ tokenOne, tokenTwo, onSelect }) => {
  const tokenListModalRef = useRef<TokenListModalRef>(null)
  const orderRef = useRef('one')
  const handleClick = (order: 'one' | 'two') => {
    orderRef.current = order
    tokenListModalRef.current?.showModal()
  }
  const handleSelect: TokenListModalProps['onSelect'] = (token) => {
    onSelect && onSelect(orderRef.current, token)
  }
  return (
    <div className={ styles.content }>
      <div className={ styles.select } onClick={ () => handleClick('one') }>
        <div className={ styles.token }>
          {
              tokenOne
                ? <>
                  <div className={ styles.logo }>
                    <img src={ tokenOne.logo } alt="logo" />
                  </div>
                  { tokenOne.symbol }
                </>
                : 'Select Token'
            }
        </div>
        <CaretDownOutlined />
      </div>
      <PlusOutlined className={ styles.plus } />
      <div className={ styles.select } onClick={ () => handleClick('two') }>
        <div className={ styles.token }>
          {
              tokenTwo
                ? <>
                  <div className={ styles.logo }>
                    <img src={ tokenTwo.logo } alt="logo" />
                  </div>
                  { tokenTwo.symbol }
                </>
                : 'Select Token'
            }
        </div>
        <CaretDownOutlined />
      </div>
      <TokenListModal ref={ tokenListModalRef } onSelect={ handleSelect } />
    </div>
  )
}

export default TokensParameter
