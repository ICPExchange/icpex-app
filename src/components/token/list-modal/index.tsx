import { Input, Modal, Spin, Tooltip } from 'antd'
import type { ChangeEvent, MouseEvent } from 'react'
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { ExclamationCircleOutlined, SearchOutlined, StarFilled, StarOutlined, UploadOutlined } from '@ant-design/icons'
import { observer } from 'mobx-react'
import TokenTag from '../tag'
import styles from './index.module.less'
import { useTokens } from '@/hooks/use-tokens'
import type { UserToken } from '@/types/token'
import CenterTitle from '@/components/modal/center-title'
import tokenStore from '@/store/token'
import manualPng from '@/assets/manual.png'
import GhostButton from '@/views/wallet/ghost-button'
import type { ImportTokenModalRef } from '@/views/wallet/import-token-modal'
import ImportTokenModal from '@/views/wallet/import-token-modal'
import appStore from '@/store/app'

export interface TokenListModalRef {
  showModal: () => void
}

export interface TokenListModalProps {
  onSelect?: (token: UserToken) => void
}
const TokenListModal = forwardRef<TokenListModalRef, TokenListModalProps>(({ onSelect }, ref) => {
  const [open, setOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const { tokens, loading, updateBalance, refresh: getList } = useTokens()
  const [searchTokens, setSearchTokens] = useState<UserToken[]>([])

  const showModal = () => {
    setSearchText('')
    setOpen(true)
    updateBalance()
  }
  const handleCancel = () => {
    setOpen(false)
  }

  useImperativeHandle(ref, () => ({
    showModal,
  }))

  useEffect(() => {
    const lowerValue = searchText.toLowerCase()
    const filterTokens = tokens.filter(token => token.symbol.toLowerCase().includes(lowerValue) || token.name.toLowerCase().includes(lowerValue) || token.canisterId.includes(lowerValue))
    setSearchTokens(filterTokens)
  }, [tokens, searchText])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.trim()
    setSearchText(value)
  }

  const handleClick: TokenListModalProps['onSelect'] = (token) => {
    onSelect && onSelect({
      ...token,
    })
    handleCancel()
  }

  const generateToolTip = (source: UserToken['source']) => {
    if (source === 'CERTIFICATION') {
      return 'This is an official token.'
    }
    return 'This token is a manually imported token. Please check the information carefully before trading to ensure its security, ICPEx does not assume any responsibility for this.'
  }

  const handlePin = (e: MouseEvent, tokenId: string) => {
    e.stopPropagation()
    tokenStore.addPinToken(tokenId)
  }

  const importTokenRef = useRef<ImportTokenModalRef>(null)
  const handleImport = () => {
    if (!appStore.userId)
      return
    importTokenRef.current?.show(appStore.userId)
  }

  return (
    <>
      <Modal open={ open } width={ 532 } zIndex={ 800 } title={ <CenterTitle title="Select Token" /> } footer={ false } onCancel={ handleCancel }>
        <div className={ styles.body }>
          <div className={ styles.search }>
            <Input value={ searchText } allowClear bordered={ false } size="large" placeholder="Search by symbol or canister id" prefix={ <SearchOutlined className={ styles.icon } /> } onChange={ handleChange } />
          </div>
          <Spin spinning={ loading }>
            <div className={ styles.list }>
              {
              searchTokens.map((token) => {
                return (
                  <div className={ styles.token } key={ token.canisterId } onClick={ () => handleClick(token) }>
                    <div className={ styles.collect } onClick={ e => handlePin(e, token.canisterId) }>
                      {
                        tokenStore.pinTokens.includes(token.canisterId)
                          ? <StarFilled />
                          : <StarOutlined />
                      }
                    </div>
                    <div className={ styles.content }>
                      <div className={ styles.logo }>
                        { token.logo ? <img src={ token.logo } alt="logo" /> : null }
                      </div>
                      <div className={ styles.info }>
                        <div className={ styles.base }>
                          <div className={ styles.name }>
                            <div>
                              { token.symbol }
                            </div>
                            {
                            token.source !== 'CERTIFICATION'
                              ? <img className={ styles.manual } src={ manualPng } alt="manual" />
                              : null
                          }
                          </div>
                          <div className={ styles.symbol }>
                            <div>
                              { token.name }
                            </div>
                            <Tooltip title={ generateToolTip(token.source) }>
                              <ExclamationCircleOutlined className={ styles.tip } />
                            </Tooltip>
                          </div>
                        </div>
                        <div className={ styles.tag }>
                          <TokenTag protocol={ token.protocol } />
                        </div>
                        <div className={ styles.balance }>
                          { token.balance }
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            }
            </div>
          </Spin>
          <div className={ styles.import }>
            <GhostButton icon={ <UploadOutlined /> } onClick={ handleImport }>Import Token</GhostButton>
          </div>
        </div>
      </Modal>
      <ImportTokenModal ref={ importTokenRef } onSuccess={ getList } />
    </>
  )
})

TokenListModal.displayName = 'TokenListModal'

export default observer(TokenListModal)
