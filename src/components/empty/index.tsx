import type { FC } from 'react'
import React from 'react'
import classNames from 'classnames'
import styles from './index.module.less'
import emptyPng from '@/assets/empty.png'

interface EmptyProps {
  className?: string
}
const Empty: FC<EmptyProps> = ({ className }) => {
  return (
    <div className={ classNames(styles.empty, className) }>
      <img src={ emptyPng } alt="empty" />
    </div>
  )
}

export default Empty
