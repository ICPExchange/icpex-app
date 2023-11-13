import type { FC } from 'react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { observer } from 'mobx-react'
import WalletInfo from '../wallet-info'
import TokenBar from '../token-bar'
import type { AddTokenModalRef } from '../add-token-modal'
import AddTokenModal from '../add-token-modal'
import TokenList from './list'
import { truncateString } from '@/utils/principal'
import { getAccountDashboardURL, getPrincipalDashboardURL } from '@/utils/urls'
import { getWalletTokens } from '@/utils/token'
import type { WalletToken } from '@/types/token'
import tokenStore from '@/store/token'

interface WalletProps {
  userId: string
  accountId: string
}
const MainWallet: FC<WalletProps> = ({ userId, accountId }) => {
  const info = useMemo(() => {
    return {
      assets: '0.0',
      ids: [
        {
          label: 'Principle ID: ',
          id: truncateString(userId),
          shareHref: getPrincipalDashboardURL(userId),
          copyText: userId,
        },
        {
          label: 'Account ID: ',
          id: truncateString(accountId),
          shareHref: getAccountDashboardURL(accountId),
          copyText: accountId,
        },
      ],
    }
  }, [userId, accountId])

  const [loading, setLoading] = useState(false)
  const [hideZeroBalance, setHideZeroBalance] = useState(false)
  const [searchCanister, setSearchCanister] = useState('')
  const [tokens, setTokens] = useState<WalletToken[]>([])
  const filterTokens = useMemo(() => {
    return tokens.filter((token) => {
      if (hideZeroBalance) {
        if (token.balance <= 0)
          return false
      }
      if (searchCanister) {
        const lowerSearch = searchCanister.toLowerCase()
        if (!token.canisterId.includes(lowerSearch) && !(token.symbol.toLowerCase().includes(lowerSearch)))
          return false
      }
      if (token.source !== 'CERTIFICATION') {
        if (!tokenStore.addTokens.includes(token.canisterId)) {
          return false
        }
      }
      return true
    })
  }, [tokens, hideZeroBalance, searchCanister, tokenStore.addTokens])

  const getList = useCallback(async () => {
    setLoading(true)
    const newTokens = await getWalletTokens(userId)
    setLoading(false)
    setTokens(newTokens)
  }, [userId])

  useEffect(() => {
    if (!userId)
      return
    getList()
  }, [userId])

  const addTokenModalRef = useRef<AddTokenModalRef>(null)
  const handleAdd = () => {
    if (!userId)
      return
    addTokenModalRef.current?.show(userId)
  }
  return (
    <>
      <WalletInfo { ...info } />
      <TokenBar isMain hide={ hideZeroBalance } onHideChange={ setHideZeroBalance } searchCanister={ searchCanister } onSeachChange={ setSearchCanister }onAdd={ handleAdd } />
      <TokenList data={ filterTokens } loading={ loading } />
      <AddTokenModal ref={ addTokenModalRef } onRefresh={ getList } />
    </>
  )
}

export default observer(MainWallet)
