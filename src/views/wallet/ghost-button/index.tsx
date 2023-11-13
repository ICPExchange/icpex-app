import type { FC } from 'react'
import React from 'react'
import type { ButtonProps } from 'antd'
import classNames from 'classnames'
import styles from './index.module.less'

const GhostButton: FC<ButtonProps> = ({ className, icon, disabled, children, onClick }) => {
  return (
    <button className={ classNames(styles.button, className, disabled ? styles.disabled : null) } disabled={ disabled } onClick={ onClick }>
      {
        icon
          ? <span className={ styles.icon }>{ icon }</span>
          : null
      }
      <span>{ children }</span>
    </button>
  )
}

export default GhostButton
