import { Modal, Spin } from 'antd'
import React, { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { useDebounceFn, useUpdateEffect } from 'ahooks'
import { Principal } from '@dfinity/principal'
import type { TokenSequence } from '../micro-operation'
import MicroOperation from '../micro-operation'
import type { RemoveProgressModalRef } from '../remove-progress-modal'
import RemoveProgressModal from '../remove-progress-modal'
import styles from './index.module.less'
import Percentage from './percentage'
import type { TokensProps } from './tokens'
import Tokens from './tokens'
import PrivatePoolSlippage from './private-pool-slippage'
import type { Pool, TokenInPool } from '@/types/pool'
import { truncateString } from '@/utils/principal'
import { CommonButton, Share } from '@/components'
import type { UserToken, UserTokenUse } from '@/types/token'
import { TokenUsage } from '@/types/token'
import appStore from '@/store/app'
import { divideAndConvertToNumber, generateDeadline, multiplyAndConvertToBigInt } from '@/utils/common'
import { queryRatioByBase, queryRatioByQuote, queryTokensAmount } from '@/utils/pool'
import { DECIMALS } from '@/utils/constants'
import { getBalance } from '@/utils/token'
import { getPrincipalDashboardURL } from '@/utils/urls'

export interface RemoveLiquidityModalRef {
  showModal: (pool: Pool) => void
  closeModal: () => void
}
export interface RemoveLiquidityModalProps {
  onRefresh?: () => void
}
const RemoveLiquidityModal = forwardRef<RemoveLiquidityModalRef, RemoveLiquidityModalProps>(({ onRefresh }, ref) => {
  const [open, setOpen] = useState(false)
  const [sequence, setSequence] = useState<TokenSequence>('base-quote')
  const [pool, setPool] = useState<Pool>({} as Pool)
  const [baseToken, setBaseToken] = useState<UserTokenUse>({} as UserTokenUse)
  const [quoteToken, setQuoteToken] = useState<UserTokenUse>({} as UserTokenUse)
  const [selectedToken, setSelectedToken] = useState<TokensProps['selectedToken']>('base')
  const isPrivate = useMemo(() => {
    return pool.type === 'private'
  }, [pool.type])

  const isSingle = useMemo(() => {
    return !!pool.isSingle
  }, [pool.isSingle])

  const [spinning, setSpinning] = useState(false)
  const [percentage, setPercentage] = useState(0)
  const [amount, setAmount] = useState({
    base: 0,
    quote: 0,
  })
  const { run: queryAmount } = useDebounceFn(async (percentage: number) => {
    if (percentage === 0) {
      setAmount({
        base: 0,
        quote: 0,
      })
      return
    }
    setSpinning(true)
    const [baseAmount, quoteAmount] = await queryTokensAmount(pool, appStore.userId, multiplyAndConvertToBigInt(percentage / 100, DECIMALS))
    setAmount({
      base: baseAmount,
      quote: quoteAmount,
    })
    setSpinning(false)
  }, {
    wait: 300,
  })
  const handlePercentage = (percentage: number) => {
    setPercentage(percentage)
    queryAmount(percentage)
  }

  const [tokensRatio, setTokensRatio] = useState(0)
  const handleRatio = async () => {
    if (pool.type === 'private' || isSingle)
      return
    const queryFunc = sequence === 'base-quote' ? queryRatioByBase : queryRatioByQuote
    const [quantityBigint] = await queryFunc(pool.canisterId, multiplyAndConvertToBigInt(1, sequence === 'base-quote' ? baseToken.decimals : quoteToken.decimals))
    const ratio = divideAndConvertToNumber(quantityBigint, sequence === 'base-quote' ? quoteToken.decimals : baseToken.decimals)
    setTokensRatio(ratio)
  }
  useUpdateEffect(() => {
    if (open && pool.canisterId && baseToken.decimals && quoteToken.decimals) {
      handleRatio()
      queryAmount(percentage)
    }
  }, [open, sequence, pool.canisterId, baseToken, quoteToken])

  const [slippage, setSlippage] = useState('0.1')

  const getBalanceByUsage = async (token: TokenInPool, tokenUsage: TokenUsage) => {
    const balance = await getBalance({ ...token, userId: appStore.userId })
    const userToken: UserTokenUse = {
      ...token,
      balance,
      amountToUse: '',
    }
    switch (tokenUsage) {
      case TokenUsage.BASE:
        setBaseToken(userToken)
        break
      case TokenUsage.QUOTE:
        setQuoteToken(userToken)
        break
    }
  }

  const closeModal = () => {
    setOpen(false)
  }

  const showModal: RemoveLiquidityModalRef['showModal'] = (pool) => {
    setOpen(true)
    setTokensRatio(0)
    setSequence('base-quote')
    setPool(pool)
    if (appStore.userId) {
      getBalanceByUsage(pool.base, TokenUsage.BASE)
      getBalanceByUsage(pool.quote, TokenUsage.QUOTE)
    }
  }

  useImperativeHandle(ref, () => ({
    showModal,
    closeModal,
  }))

  const progressModalRef = useRef<RemoveProgressModalRef>(null)
  const openProgressModal = () => {
    const p = multiplyAndConvertToBigInt(percentage / 100, DECIMALS)
    const poolCanister = Principal.fromText(pool.canisterId)
    const baseAmount = (pool.type === 'private' && selectedToken === 'quote') ? 0n : multiplyAndConvertToBigInt(amount.base, baseToken.decimals)
    const quoteAmount = (isSingle || (pool.type === 'private' && selectedToken === 'base')) ? 0n : multiplyAndConvertToBigInt(amount.quote, quoteToken.decimals)
    const s = multiplyAndConvertToBigInt(Number(slippage) / 100, DECIMALS)
    const deadline = generateDeadline()
    const removeArgs = [p, poolCanister, baseAmount, quoteAmount, s, deadline]
    progressModalRef.current?.showModal(pool, selectedToken, removeArgs)
  }

  const handleConfirm = () => {
    if (percentage === 0)
      return
    if (!slippage)
      return
    openProgressModal()
  }

  const handleSuccess = () => {
    closeModal()
    onRefresh && onRefresh()
  }

  const titleComponent = useMemo(() => {
    return (
      <div className={ styles.title }>
        Remove Liquidity
        <div className={ styles.canister }>
          { truncateString(pool.canisterId) }
          <Share href={ getPrincipalDashboardURL(pool.canisterId) } />
        </div>
      </div>
    )
  }, [pool.canisterId])

  return (
    <>
      <Modal width={ 532 } title={ titleComponent } open={ open } centered maskClosable={ false } footer={ false } onCancel={ closeModal } zIndex={ 800 }>
        <Spin spinning={ spinning }>
          <div className={ styles.body }>
            <Percentage value={ percentage } onChange={ handlePercentage } />
            <Tokens isPrivate={ isPrivate } baseToken={ baseToken } quoteToken={ quoteToken } amount={ amount } selectedToken={ selectedToken } onChange={ setSelectedToken } />
            {
              isPrivate
                ? <PrivatePoolSlippage slippage={ slippage } onSlippage={ setSlippage } />
                : !isSingle
                    ? <MicroOperation isPrivate={ isPrivate } isSingle={ isSingle } baseToken={ baseToken } quoteToken={ quoteToken } i={ pool.i } sequence={ sequence } slippage={ slippage } tokensRatio={ tokensRatio } onReload={ handleRatio } onSequence={ setSequence } onSlippage={ setSlippage } />
                    : null
            }
            {
              percentage > 0
                ? <CommonButton type="primary" size="large" block className={ styles.confirm } onClick={ handleConfirm }>Remove</CommonButton>
                : <CommonButton size="large" disabled block className={ styles.confirm }>Select the percentage</CommonButton>
            }
          </div>
        </Spin>
      </Modal>
      <RemoveProgressModal ref={ progressModalRef } onSuccess={ handleSuccess } />
    </>
  )
})

RemoveLiquidityModal.displayName = 'RemoveLiquidityModal'

export default RemoveLiquidityModal
