import type { FC } from 'react'
import React, { useMemo } from 'react'
import classNames from 'classnames'
import copy from 'copy-to-clipboard'
import { ConfigProvider, notification } from 'antd'
import { CheckCircleFilled } from '@ant-design/icons'
import styles from './index.module.less'
import copyPng from '@/assets/copy.png'

interface CopyProps {
  className?: string
  text?: string
}
const Copy: FC<CopyProps> = ({ className, text }) => {
  const [api, contextHolder] = notification.useNotification()
  const successIcon = useMemo(() => (<CheckCircleFilled className={ classNames(styles.icon, styles['icon-success']) } />), [])
  const handleClick = () => {
    if (!text)
      return
    const res = copy(text)
    if (res) {
      api.success({
        icon: successIcon,
        message: 'Copy Successful',
        placement: 'topRight',
        className: 'com-notification',
      })
    }
  }
  return (
    <ConfigProvider theme={{
      components: {
        Notification: {
          marginSM: 34,
          zIndexPopup: 2000,
          width: 378,
          lineHeightLG: 2,
        },
      },
    }}>
      { contextHolder }
      <img className={ classNames(className, styles.copy) } src={ copyPng } alt="copy" onClick={ handleClick } />
    </ConfigProvider>
  )
}

export default Copy
