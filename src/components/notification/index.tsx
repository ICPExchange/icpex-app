import { ConfigProvider, notification } from 'antd'
import type { FC, ReactNode } from 'react'
import React, { useEffect, useMemo } from 'react'
import { CheckCircleFilled, ExclamationCircleFilled } from '@ant-design/icons'
import classNames from 'classnames'
import styles from './index.module.less'
import loadingSvg from '@/assets/wait-small.svg'

const notificationKey = 'updatable'
export type NotificationType = 'loading' | 'success' | 'error' | 'info'
export interface NotificationConfigItem {
  message: string
  description?: string
  actionText?: string
  action?: () => void
}
export interface NotificationProps {
  open: boolean
  type: NotificationType
  config: {
    loading: NotificationConfigItem
    success: NotificationConfigItem
    error: NotificationConfigItem
    info?: NotificationConfigItem
  }
  closeIcon?: boolean
  onClose?: () => void
}
const Notification: FC<NotificationProps> = ({ open, type, config, closeIcon = false, onClose }) => {
  const [api, contextHolder] = notification.useNotification()

  const loadingIcon = useMemo(() => (<div className={ classNames(styles['icon-wrapper'], styles['icon-loading']) }><img src={ loadingSvg } /></div>), [])
  const successIcon = useMemo(() => (<div className={ styles['icon-wrapper'] }><CheckCircleFilled className={ classNames(styles['icon-success']) } /></div>), [])
  const errorIcon = useMemo(() => (<div className={ styles['icon-wrapper'] }><ExclamationCircleFilled className={ (classNames(styles.icon, styles['icon-error'])) } /></div>), [])
  const infoIcon = useMemo(() => (<div className={ styles['icon-wrapper'] }><ExclamationCircleFilled className={ (classNames(styles.icon, styles['icon-info'])) } /></div>), [])

  const createDescription = (configItem: NotificationConfigItem) => {
    const { description, actionText, action } = configItem
    const descriptionDiv = description ? (<div className={ styles.description }>{ description }</div>) : null
    const actionDiv = actionText ? (<div className={ styles.action } onClick={ action }>{ actionText }</div>) : null
    return (
      <div>
        { descriptionDiv }
        { actionDiv }
      </div>
    )
  }

  const openNotification = (configItem: NotificationConfigItem, icon: ReactNode, duration: number) => {
    const { message } = configItem
    const descriptionComponent = createDescription(configItem)
    const close = !closeIcon
      ? {
          closeIcon: false,
        }
      : null
    api.open({
      key: notificationKey,
      className: 'com-notification',
      icon,
      message,
      description: descriptionComponent,
      duration,
      ...close,
      onClose: onClose || (() => undefined),
    })
  }

  const handleNotification = (type: NotificationType) => {
    const configItem = config[type] as NotificationConfigItem
    switch (type) {
      case 'loading':
        openNotification(configItem, loadingIcon, 0)
        break
      case 'success':
        openNotification(configItem, successIcon, 4.5)
        break
      case 'error':
        openNotification(configItem, errorIcon, 4.5)
        break
      case 'info':
        openNotification(configItem, infoIcon, 4.5)
    }
  }
  const closeNotification = () => {
    api.destroy(notificationKey)
  }

  useEffect(() => {
    if (open)
      handleNotification(type)
    else
      closeNotification()
  }, [open, type])

  return (
    <ConfigProvider theme={{
      components: {
        Notification: {
          marginSM: 34,
          zIndexPopup: 900,
          width: 378,
          lineHeightLG: 2,
        },
      },
    }}>
      <div>{ contextHolder }</div>
    </ConfigProvider>
  )
}

export default Notification
