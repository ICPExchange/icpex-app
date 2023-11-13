import { Modal, Tooltip } from 'antd'
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { PlusOutlined, QuestionCircleFilled } from '@ant-design/icons'
import classNames from 'classnames'
import { useDebounceFn, useUpdateEffect } from 'ahooks'
import { Principal } from '@dfinity/principal'
import type { AddProgressModalRef } from '../add-progress-modal'
import AddProgressModal from '../add-progress-modal'
import type { TokenSequence } from '../micro-operation'
import MicroOperation from '../micro-operation'
import styles from './index.module.less'
import TokenInput from './token-input'
import type { Pool, TokenInPool } from '@/types/pool'
import { truncateString } from '@/utils/principal'
import { CommonButton, Share } from '@/components'
import type { UserTokenUse } from '@/types/token'
import { TokenUsage } from '@/types/token'
import { getBalance } from '@/utils/token'
import appStore from '@/store/app'
import { divideAndConvertToNumber, divideAndPercentage, generateDeadline, multiplyAndConvertToBigInt } from '@/utils/common'
import { queryLpAndBaseAmount, queryLpAndQuoteAmount, queryRatio } from '@/utils/pool'
import { getPrincipalDashboardURL } from '@/utils/urls'

export interface AddLiquidityModalRef {
  showModal: (pool: Pool) => void
  closeModal: () => void
}
export interface AddLiquidityModalProps {
  onSuccess?: () => void
}
const AddLiquidityModal = forwardRef<AddLiquidityModalRef, AddLiquidityModalProps>(({ onSuccess }, ref) => {
  const [open, setOpen] = useState(false)
  const [sequence, setSequence] = useState<TokenSequence>('base-quote')
  const [pool, setPool] = useState<Pool>({} as Pool)
  const [baseToken, setBaseToken] = useState<UserTokenUse>({ transferFee: 0 } as UserTokenUse)
  const [quoteToken, setQuoteToken] = useState<UserTokenUse>({ transferFee: 0 } as UserTokenUse)
  const [lpInfo, setLpInfo] = useState({
    amount: 0,
    percentage: 0,
  })
  const isPrivate = useMemo(() => {
    return pool.type === 'private'
  }, [pool.type])
  const isSingle = useMemo(() => {
    return !!pool.isSingle
  }, [pool.isSingle])

  const [isBaseDanger, setIsBaseDanger] = useState(false)
  const [isQuoteDanger, setIsQuoteDanger] = useState(false)
  useEffect(() => {
    if (Number(baseToken.amountToUse) > baseToken.balance) {
      setIsBaseDanger(true)
      return
    }
    setIsBaseDanger(false)
  }, [baseToken])
  useEffect(() => {
    if (Number(quoteToken.amountToUse) > quoteToken.balance) {
      setIsQuoteDanger(true)
      return
    }
    setIsQuoteDanger(false)
  }, [quoteToken])

  const [tokensRatio, setTokensRatio] = useState(0)
  const handleRatio = async () => {
    if (pool.type === 'private' || isSingle)
      return
    const quantityBigint = await queryRatio(pool.canisterId)
    const ratioOnBase = divideAndConvertToNumber(quantityBigint, 18, 18)
    const ratio = sequence === 'base-quote' ? ratioOnBase : 1 / ratioOnBase
    setTokensRatio(ratio)
  }
  useUpdateEffect(() => {
    if (open && pool.canisterId && baseToken.decimals && quoteToken.decimals)
      handleRatio()
  }, [open, sequence, pool.canisterId, baseToken, quoteToken])

  const { run: setLpAndAmount } = useDebounceFn(async (value: string, type: 'base' | 'quote') => {
    if (pool.type === 'private' || isSingle)
      return
    const queryFunc = type === 'base' ? queryLpAndQuoteAmount : queryLpAndBaseAmount
    const [baseAmount, quoteAmount, lp, totalLp] = await queryFunc(
      pool.canisterId,
      multiplyAndConvertToBigInt(value, type === 'base' ? baseToken.decimals : quoteToken.decimals),
    )
    if (type === 'base') {
      setQuoteToken({
        ...quoteToken,
        amountToUse: `${divideAndConvertToNumber(quoteAmount, quoteToken.decimals)}`,
      })
    }
    else {
      setBaseToken({
        ...baseToken,
        amountToUse: `${divideAndConvertToNumber(baseAmount, baseToken.decimals)}`,
      })
    }
    setLpInfo({
      amount: divideAndConvertToNumber(lp, baseToken.decimals),
      percentage: divideAndPercentage(lp, totalLp, 6),
    })
  }, {
    wait: 300,
  })
  const handleBaseValueChange = (value: string) => {
    setBaseToken({
      ...baseToken,
      amountToUse: value,
    })
    if (Number(baseToken.amountToUse) > baseToken.balance) {
      return
    }
    setLpAndAmount(value, 'base')
  }
  const handleQuoteValueChange = (value: string) => {
    setQuoteToken({
      ...quoteToken,
      amountToUse: value,
    })
    if (Number(quoteToken.amountToUse) > quoteToken.balance) {
      return
    }
    setLpAndAmount(value, 'quote')
  }

  const [slippage, setSlippage] = useState('0.1')

  const progressModalRef = useRef<AddProgressModalRef>(null)
  const openProgressModal = () => {
    const methodName = pool.type === 'public' ? 'addLiquidity' : pool.type === 'private' ? 'addPrivateLiquidity' : 'addStableLiquidity'
    const principal = Principal.fromText(pool.canisterId)
    const baseAmount = multiplyAndConvertToBigInt(baseToken.amountToUse, baseToken.decimals)
    const quoteAmount = multiplyAndConvertToBigInt(quoteToken.amountToUse, quoteToken.decimals)
    const deadline = generateDeadline()
    let args: any[] = []

    if (isPrivate) {
      args = [principal, baseAmount, quoteAmount, deadline]
    }
    else {
      const splippage = multiplyAndConvertToBigInt(slippage, 18)
      args = [principal, baseAmount, quoteAmount, splippage, deadline]
    }
    const poolInfo = {
      isSingle,
      methodName,
      args,
    }
    progressModalRef.current?.showModal(baseToken, quoteToken, poolInfo)
  }
  const handleConfirm = () => {
    if (!baseToken.amountToUse)
      return
    if (!slippage)
      return
    if (isBaseDanger || isQuoteDanger) {
      return
    }
    openProgressModal()
  }
  const addLiquiditySuccess = () => {
    setOpen(false)
    onSuccess && onSuccess()
  }

  const getBalanceByUsage = async (token: TokenInPool, tokenUsage: TokenUsage) => {
    const balance = await getBalance({ userId: appStore.userId, ...token })
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

  const handleCancel = () => {
    setOpen(false)
  }

  const showModal: AddLiquidityModalRef['showModal'] = (pool) => {
    setOpen(true)
    setTokensRatio(0)
    setSequence('base-quote')
    setLpInfo({
      amount: 0,
      percentage: 0,
    })
    setIsBaseDanger(false)
    setIsQuoteDanger(false)
    setPool(pool)
    if (appStore.userId) {
      getBalanceByUsage(pool.base, TokenUsage.BASE)
      getBalanceByUsage(pool.quote, TokenUsage.QUOTE)
    }
  }

  useImperativeHandle(ref, () => ({
    showModal,
    closeModal: handleCancel,
  }))

  const titleComponent = useMemo(() => {
    return (
      <div className={ styles.title }>
        Add Liquidity
        <div className={ styles.canister }>
          <div>{ truncateString(pool.canisterId || '') }</div>
          <Share href={ getPrincipalDashboardURL(pool.canisterId) } />
        </div>
      </div>
    )
  }, [pool.canisterId])

  return (
    <>
      <AddProgressModal ref={ progressModalRef } onSuccess={ addLiquiditySuccess } />
      <Modal width={ 532 } title={ titleComponent } open={ open } centered maskClosable={ false } footer={ false } onCancel={ handleCancel } zIndex={ 800 }>
        <div className={ styles.body }>
          <TokenInput token={ baseToken } danger={ isBaseDanger } onChange={ handleBaseValueChange } />
          <div className={ styles.plus }>
            <PlusOutlined />
          </div>
          <TokenInput disabled={ isSingle } danger={ isQuoteDanger } token={ quoteToken } onChange={ handleQuoteValueChange } />
          <MicroOperation isPrivate={ isPrivate } isSingle={ isSingle } baseToken={ baseToken } quoteToken={ quoteToken } i={ pool.i } sequence={ sequence } slippage={ slippage } tokensRatio={ tokensRatio } onReload={ handleRatio } onSequence={ setSequence } onSlippage={ setSlippage } />
          {
          (!isPrivate && !!lpInfo.amount)
            ? <div className={ styles.share }>
              <div className={ styles.lp }>
                <div className={ styles['lp-left'] }>
                  <div className={ styles.logo }>
                    <img src={ baseToken.logo } alt="logo" />
                  </div>
                  <div className={ classNames(styles.logo, styles['logo-quote']) }>
                    <img src={ quoteToken.logo } alt="logo" />
                  </div>
                  <div className={ styles.tokens }>
                    { baseToken.symbol }-{ quoteToken.symbol }
                  </div>
                  <Tooltip overlayStyle={{ maxWidth: '1000px' }} title="This is your share of this liquidity pool represented as tokens.">
                    <QuestionCircleFilled className={ styles.info } />
                  </Tooltip>
                </div>
                <div className={ styles['lp-right'] }>{ lpInfo.amount }</div>
              </div>
              <div className={ styles.rate }>
                <div>Share Of Pool:</div>
                <div>
                  {
                lpInfo.percentage < 0.01
                  ? <>&lt;0.01</>
                  : <>{ lpInfo.percentage }</>
              }%
                </div>
              </div>
            </div>
            : null
        }
          {
          ((!isSingle && baseToken.amountToUse && quoteToken.amountToUse) || (isSingle && baseToken.amountToUse))
            ? <CommonButton type="primary" size="large" block className={ styles.confirm } onClick={ handleConfirm }>Confirm</CommonButton>
            : <CommonButton size="large" disabled block className={ styles.confirm }>Enter the amount</CommonButton>
        }
        </div>
      </Modal>
    </>
  )
})

AddLiquidityModal.displayName = 'AddLiquidityModal'

export default AddLiquidityModal
