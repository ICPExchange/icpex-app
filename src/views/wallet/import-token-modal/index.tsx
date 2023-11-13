import { Alert, Button, Checkbox, ConfigProvider, Modal } from 'antd'
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import type { CheckboxChangeEvent } from 'antd/es/checkbox'
import { Principal } from '@dfinity/principal'
import styles from './index.module.less'
import Standard from './standard'
import Canister from './canister'
import { CenterTitle, Notification, Share, TokenDisplay, TokenTag } from '@/components'
import { checkTokenExist, importToken } from '@/utils/wallet'
import type { NotificationType } from '@/components/notification'
import { getPrincipalDashboardURL, goToken } from '@/utils/urls'

export interface ImportTokenModalRef {
  show: (userId: string) => void
  close: () => void
}

interface ImportTokenModalProps {
  onSuccess?: () => void
}

const buttonMap: {
  [key: string]: {
    type: 'default' | 'primary'
    text: string
    disabled: boolean
  }
} = {
  select: {
    type: 'default',
    text: 'Select the token standard',
    disabled: true,
  },
  enter: {
    type: 'default',
    text: 'Enter the canister id',
    disabled: true,
  },
  import: {
    type: 'primary',
    text: 'Import',
    disabled: false,
  },
  agree: {
    type: 'default',
    text: 'Confirm',
    disabled: false,
  },
  confirm: {
    type: 'primary',
    text: 'Confirm',
    disabled: false,
  },
}

const ImportTokenModal = forwardRef<ImportTokenModalRef, ImportTokenModalProps>(({ onSuccess }, ref) => {
  const [open, setOpen] = useState(false)
  const [protocol, setProtocol] = useState('')
  const [canisterId, setCanisterId] = useState('')
  const [buttonInfo, setButtonInfo] = useState(buttonMap.select)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkedToken, setCheckedToken] = useState({
    logo: '',
    name: '',
    symbol: '',
  })
  const [locked, setLocked] = useState(true)
  const [agree, setAgree] = useState(false)
  const id = useRef<string>()

  // notification
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notificationType, setNotificationType] = useState<NotificationType>('loading')
  const notificationConfig = useMemo(() => {
    return {
      loading: {
        message: 'Token importing',
      },
      success: {
        message: 'Token imported successful',
      },
      error: {
        message: 'Token imported failed',
      },
    }
  }, [])

  const hideError = useCallback(() => {
    setError('')
  }, [])

  useEffect(() => {
    hideError()
  }, [protocol, canisterId, agree])

  useEffect(() => {
    if (!protocol) {
      setButtonInfo(buttonMap.select)
      return
    }
    if (!canisterId) {
      setButtonInfo(buttonMap.enter)
      return
    }
    if (!checkedToken.name) {
      setButtonInfo(buttonMap.import)
      return
    }
    if (!agree) {
      setButtonInfo(buttonMap.agree)
      return
    }
    setButtonInfo(buttonMap.confirm)
  }, [protocol, canisterId, checkedToken, agree])

  const reset = useCallback(() => {
    setButtonInfo(buttonMap.select)
    setLocked(false)
    setProtocol('')
    setCanisterId('')
    setLoading(false)
  }, [])

  const close = useCallback(() => {
    setOpen(false)
  }, [])

  const show: ImportTokenModalRef['show'] = useCallback((userId) => {
    setOpen(true)
    reset()
    id.current = userId
  }, [])

  useImperativeHandle(ref, () => ({
    close,
    show,
  }))

  const handleAgree = useCallback((e: CheckboxChangeEvent) => {
    const checked = e.target.checked
    setAgree(checked)
  }, [])

  const handleImport = async () => {
    if (!protocol) {
      setError('Please Select Token Standard!')
      return
    }
    if (!canisterId) {
      setError('Please Input CanisterId!')
      return
    }
    let principal: Principal
    try {
      principal = Principal.fromText(canisterId)
    }
    catch (error) {
      setError(`${canisterId} may not be a valid Canister ID`)
      return
    }
    setLoading(true)
    const res = await checkTokenExist(principal, protocol)
    if (res) {
      setLocked(true)
      setCheckedToken({
        logo: res.logo,
        name: res.name,
        symbol: res.symbol,
      })
    }
    else {
      setError(`This canister id did not match the token standard "${protocol}"`)
    }
    setLoading(false)
  }

  const handleConfirm = async () => {
    if (!agree) {
      setError('Please check the risk')
      return
    }
    setLoading(true)
    setNotificationOpen(true)
    setNotificationType('loading')
    const res = await importToken(Principal.fromText(canisterId), protocol)
    if (res) {
      setNotificationType('success')
      onSuccess && onSuccess()
      close()
    } else {
      setNotificationType('error')
    }
    setLoading(false)
  }

  const handleClick = () => {
    if (buttonInfo.disabled)
      return
    switch (buttonInfo.text) {
      case 'Import':
        handleImport()
        break
      default:
        handleConfirm()
    }
  }

  return (
    <>
      <Modal width={ 574 } title={ <CenterTitle title="Import Token" /> } open={ open } centered maskClosable={ false } footer={ false } onCancel={ close }>
        <ConfigProvider
          theme={{
            components: {
              Input: {
                colorText: '#fff',
                paddingSM: 0,
                fontSize: 16,
                colorBgContainer: 'transparent',
                colorBorder: 'transparent',
                colorPrimaryHover: 'transparent',
                colorTextPlaceholder: '#fff',
                colorTextDisabled: '#fff',
                controlOutline: 'transparent',
                colorTextQuaternary: 'rgba(139,154,201,0.65)', // close icon
                colorTextTertiary: 'rgba(139,154,201,1)', // close icon
              },
            },
          }}>
          <Standard locked={ locked } value={ protocol } onChange={ setProtocol } />
          <Canister locked={ locked } value={ canisterId } onChange={ setCanisterId } />
          {
          buttonInfo.text === 'Confirm'
            ? <>
              <div className={ styles.token }>
                <TokenDisplay { ...checkedToken } />
                <TokenTag className={ styles.tag } protocol={ protocol } />
                <div>
                  <div className={ styles.canisterId }>{ canisterId } <Share href={ getPrincipalDashboardURL(canisterId) } /></div>
                  <div className={ styles.view } onClick={ () => goToken() }>View token info</div>
                </div>
              </div>
              <Alert description="Anyone can create a token with any name and LOGO on Internet Computer. If you purchase fake token, it may result in loss of assets. Please carefully identify the authenticity of tokens before investing!" type="warning" showIcon icon={ <ExclamationCircleOutlined className={ styles.exclamation } /> } />
              <div className={ styles.agree }>
                <Checkbox checked={ agree } onChange={ handleAgree } /> I have read the risk warning carefully and agree to do so at my own risk.
              </div>
            </>
            : null
        }
          {
          error !== ''
            ? <div className={ styles.error }>
              { error }
            </div>
            : null
        }
          <Button type={ buttonInfo.type } disabled={ buttonInfo.disabled } size="large" block loading={ loading } className={ styles.step } onClick={ handleClick }>{ buttonInfo.text }</Button>
        </ConfigProvider>
      </Modal>
      <Notification open={ notificationOpen } type={ notificationType } config={ notificationConfig } closeIcon />
    </>
  )
})

ImportTokenModal.displayName = 'ImportTokenModal'
export default ImportTokenModal
