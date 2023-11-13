import type { FC, ReactNode } from 'react'
import React from 'react'
import styles from './index.module.less'

interface CenterTitleProps {
  title?: string
  children?: ReactNode
}
const CenterTitle: FC<CenterTitleProps> = ({ title, children }) => {
  return (
    <div className={ styles.title }>
      {
        children || title
      }
    </div>
  )
}

export default CenterTitle
