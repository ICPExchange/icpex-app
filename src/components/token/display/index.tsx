import type { FC } from 'react'
import React from 'react'
import classNames from 'classnames'
import styles from './index.module.less'

export interface TokenDisplayProps {
  logo: string
  symbol: string
  name: string
  className?: string
}

const TokenDisplay: FC<TokenDisplayProps> = ({ logo, symbol, name, className }) => {
  return (
    <div className={ classNames(styles.token, className) }>
      <div className={ styles.logo }>
        <img src={ logo } alt="logo" />
      </div>
      <div>
        <div className={ styles.symbol }>{ symbol }</div>
        <div className={ styles.name }>{ name }</div>
      </div>
    </div>
  )
}

export default TokenDisplay
