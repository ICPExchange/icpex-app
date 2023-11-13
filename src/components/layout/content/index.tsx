import type { FC, ReactNode } from 'react'
import React from 'react'
import styles from './index.module.less'

interface LayoutContentProps {
  children?: ReactNode
}
const LayoutContent: FC<LayoutContentProps> = ({ children }) => {
  return (
    <main className={ styles.content }>
      { children }
    </main>
  )
}

export default LayoutContent
