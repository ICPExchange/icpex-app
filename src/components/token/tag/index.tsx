import type { FC } from 'react'
import React from 'react'
import classNames from 'classnames'
import styles from './index.module.less'

const tagColor: Record<string, string> = {
  EXT: '#24A550',
  DIP20: '#8B9AC9',
  ICRC1: '#6A8EFF',
}
interface TokenTagProps {
  protocol: string
  className?: string
}
const TokenTag: FC<TokenTagProps> = ({ protocol, className }) => {
  const upperName = protocol.toUpperCase()
  const bgColor = tagColor[upperName] || tagColor.EXT
  return (
    <div className={ classNames(styles.tag, className) } style={{ backgroundColor: bgColor }}>{ upperName }</div>
  )
}

export default TokenTag
