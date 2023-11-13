import type { FC } from 'react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import TokenBar from '../token-bar'
import TokenList from './list'
import type { WithdrawModalModalRef } from './withdraw-modal'
import WithdrawModal from './withdraw-modal'
import { getSubWalletTokens } from '@/utils/token'
import type { SubWalletToken } from '@/types/token'

interface WalletProps {
  userId: string
  accountId: string
}
const SubWallet: FC<WalletProps> = ({ userId }) => {
  const [loading, setLoading] = useState(false)
  const [hideZeroBalance, setHideZeroBalance] = useState(false)
  const [searchCanister, setSearchCanister] = useState('')
  const [tokens, setTokens] = useState<SubWalletToken[]>([])
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
      return true
    })
  }, [tokens, hideZeroBalance, searchCanister])

  const getList = useCallback(async () => {
    setLoading(true)
    const newTokens = await getSubWalletTokens()
    setLoading(false)
    newTokens.length && setTokens(newTokens)
  }, [userId])

  useEffect(() => {
    if (!userId)
      return
    getList()
  }, [userId])

  const withdrawModalRef = useRef<WithdrawModalModalRef>(null)
  const openModal = (token: SubWalletToken) => {
    if (token.balance <= 0)
      return
    withdrawModalRef.current?.openModal(token)
  }
  return (
    <>
      <TokenBar hide={ hideZeroBalance } onHideChange={ setHideZeroBalance } searchCanister={ searchCanister } onSeachChange={ setSearchCanister } />
      <TokenList data={ filterTokens } loading={ loading } onWithdrawal={ openModal } />
      <WithdrawModal ref={ withdrawModalRef } />
    </>
  )
}

export default SubWallet
