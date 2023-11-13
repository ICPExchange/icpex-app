import type { FC } from 'react'
import React from 'react'
import classNames from 'classnames'
import styles from './index.module.less'
import sharePng from '@/assets/share.png'

interface ShareProps {
  className?: string
  href?: string
}
const Share: FC<ShareProps> = ({ className, href }) => {
  const handleClick = () => {
    href && window.open(href, '_blank')
  }
  return (
    <img className={ classNames(className, styles.share) } src={ sharePng } alt="share" onClick={ handleClick } />
  )
}

export default Share
