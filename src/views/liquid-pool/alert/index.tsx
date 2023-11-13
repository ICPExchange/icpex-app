import type { FC } from 'react'
import React, { useState } from 'react'
import { CloseOutlined } from '@ant-design/icons'
import styles from './index.module.less'

export interface AlertProps {
  message?: string
  description?: string
  closable?: boolean
  afterClose?: () => void
}
const Alert: FC<AlertProps> = ({ message, description, closable, afterClose }) => {
  const [closed, setClosed] = useState(false)
  const handleClose = () => {
    setClosed(true)
    afterClose && afterClose()
  }
  return (
    !closed
      ? <div className={ styles.alert }>

        <div className={ styles.message }>{ message }</div>
        <div className={ styles.description }>{ description }</div>
        {
            closable
              ? <div className={ styles.close } onClick={ handleClose }>
                <CloseOutlined />
              </div>
              : null
        }
      </div>
      : null
  )
}

export default Alert
