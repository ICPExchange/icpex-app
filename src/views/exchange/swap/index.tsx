import type { FC } from 'react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ExclamationCircleFilled, ReloadOutlined } from '@ant-design/icons'
import { Principal } from '@dfinity/principal'
import { useDebounceFn } from 'ahooks'
import { Button, Tooltip } from 'antd'
import { observer } from 'mobx-react'
import classNames from 'classnames'
import { useSearchParams } from 'react-router-dom'
import styles from './index.module.less'
import { Parameter } from './parameter'
import Setting from './setting'
import type { SwapModalRef } from './swap-modal'
import SwapModal from './swap-modal'
import TokenSelect from './token-select'
import { TokenListModal } from '@/components'
import type { UserTokenUse } from '@/types/token'
import arrowPng from '@/assets/arrow.png'
import swapPng from '@/assets/swap.png'
import type { TokenListModalProps, TokenListModalRef } from '@/components/token/list-modal'
import { divide, divideAndConvertToNumber, executionInterrupt, generateDeadline, multiplyAndConvertToBigInt, truncateDecimal } from '@/utils/common'
import { queryReceiveAmountAndPath } from '@/utils/swap'
import { to } from '@/utils/catch'
import appStore from '@/store/app'
import { computeFee } from '@/utils/fee'
import { requestConnect } from '@/utils/plug/connect'
import { useTokens } from '@/hooks/use-tokens'

enum TokenUsage {
  PAY = 'pay',
  RECEIVE = 'receive',
}
const buttonMap: {
  [key: string]: {
    type: 'default' | 'primary'
    text: string
    disabled: boolean
    danger: boolean
  }
} = {
  connect: {
    type: 'primary',
    text: 'Connect',
    disabled: false,
    danger: false,
  },
  reviewOrder: {
    type: 'primary',
    text: 'Review Order',
    disabled: false,
    danger: false,
  },
  confirmOrder: {
    type: 'primary',
    text: 'Confirm Order',
    disabled: false,
    danger: false,
  },
  selectToken: {
    type: 'default',
    text: 'Select Token',
    disabled: true,
    danger: false,
  },
  enterAmount: {
    type: 'default',
    text: 'Enter an amount to see more trading details',
    disabled: true,
    danger: false,
  },
  smallerAmount: {
    type: 'default',
    text: 'Enter an amount to see more trading details',
    disabled: true,
    danger: false,
  },
  insufficientLiquidity: {
    type: 'default',
    text: 'Insufficient liquidity for this trade',
    disabled: true,
    danger: true,
  },
  insufficientBalance: {
    type: 'default',
    text: 'Insufficient xxx balance',
    disabled: true,
    danger: true,
  },
  loading: {
    type: 'default',
    text: 'loading',
    disabled: true,
    danger: false,
  },
  error: {
    type: 'default',
    text: 'Unavailable Order',
    disabled: true,
    danger: true,
  },
}

const Swap: FC = () => {
  const [payToken, setPayToken] = useState<UserTokenUse>()
  const [receiveToken, setReceiveToken] = useState<UserTokenUse>()
  const [slippage, setSlippage] = useState('0.5')
  const [buttonInfo, setButtonInfo] = useState(buttonMap.connect)
  const [loading, setLoading] = useState(false)
  const [isDanger, setIsDanger] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const currentTokenUsage = useRef<TokenUsage>()
  const { tokens } = useTokens()
  const [searchParams] = useSearchParams()

  const [tradingFee, setTradingFee] = useState(0)
  const [exchangeRatioDirection, setExchangeRatioDirection] = useState('forward')

  const handleExchangeRadioDirection = useCallback(() => {
    setExchangeRatioDirection(exchangeRatioDirection === 'forward' ? 'reverse' : 'forward')
  }, [exchangeRatioDirection])

  // fees
  const minimumReceive = useMemo(() => {
    if (!receiveToken)
      return '--'
    if (!receiveToken.amountToUse)
      return `0 ${receiveToken.symbol}`
    const amount = truncateDecimal(Number(receiveToken.amountToUse) * (1 - (Number(slippage) / 100)), 6)
    return `${amount} ${receiveToken.symbol}`
  }, [receiveToken?.symbol, receiveToken?.amountToUse])

  const platServiceFee = useMemo(() => {
    if (!receiveToken)
      return 0
    const receiveAmount = Number(receiveToken?.amountToUse ?? 0)
    return divideAndConvertToNumber(receiveAmount, 3, 2)
  }, [receiveToken?.amountToUse])

  const payTokenFees = useMemo(() => {
    if (!payToken || Number(payToken.amountToUse) === 0)
      return { transferFee: 0, burnFee: 0 }
    let payTokenTransferAmount = 0
    let payTokenBurnAmount = 0
    const baseAmount = Number(payToken.amountToUse || '')
    payTokenTransferAmount = computeFee({ amount: baseAmount, isFixed: payToken.isTransferFeeFixed, fee: payToken.transferFee })
    if (payToken.protocol === 'icrc1') {
      payTokenTransferAmount = payTokenTransferAmount * 2
    }
    payTokenBurnAmount = computeFee({ amount: baseAmount, isFixed: payToken.isBurnFeeFixed, fee: payToken.burnFee })
    return {
      transferFee: payTokenTransferAmount,
      burnFee: payTokenBurnAmount,
    }
  }, [payToken])

  const receiveTokenFees = useMemo(() => {
    if (!receiveToken || Number(receiveToken.amountToUse) === 0)
      return { transferFee: 0, burnFee: 0 }
    let receiveTokenTransferAmount = 0
    let receiveTokenBurnAmount = 0
    const quoteAmount = Number(receiveToken.amountToUse || '')
    receiveTokenTransferAmount = computeFee({ amount: quoteAmount, isFixed: receiveToken.isTransferFeeFixed, fee: receiveToken.transferFee })
    receiveTokenBurnAmount = computeFee({ amount: quoteAmount, isFixed: receiveToken.isBurnFeeFixed, fee: receiveToken.burnFee })
    return {
      transferFee: receiveTokenTransferAmount,
      burnFee: receiveTokenBurnAmount,
    }
  }, [receiveToken])

  const ServiceFee = useMemo(() => {
    if (!payToken || !receiveToken)
      return null
    const receiveSymbol = receiveToken.symbol
    return (
      <div className={ styles.serviceFee }>
        <div className={ styles['serviceFee-desc'] }>
          Service fee includes trading fee (set by the liquidity pool) , ICPEx service fee (0.1%) , burn fee and transfer fee (set by the token creator):
        </div>
        <div className={ styles['serviceFee-item'] }>Trading Fee: <div>{ tradingFee } { receiveSymbol }</div></div>
        <div className={ styles['serviceFee-item'] }>ICPEx Service Fee: <div>{ platServiceFee } { receiveSymbol }</div></div>
        <div className={ styles['serviceFee-item'] }>Burn Fee:  <div className={ styles['serviceFee-item-fee'] }>{ payTokenFees.burnFee } { payToken.symbol } <div className={ styles['serviceFee-item-fee-trail'] }>{ receiveTokenFees.burnFee } { receiveToken.symbol }</div></div></div>
        <div className={ styles['serviceFee-item'] }>Transfer Fee: <div className={ styles['serviceFee-item-fee'] }>{ payTokenFees.transferFee } { payToken.symbol }  <div className={ styles['serviceFee-item-fee-trail'] }>{ receiveTokenFees.transferFee } { receiveToken.symbol }</div></div></div>
      </div>
    )
  }, [payToken?.symbol, receiveToken?.symbol, payTokenFees, receiveTokenFees, tradingFee, platServiceFee])

  const exchangeRate = useMemo(() => {
    if (!payToken || !receiveToken)
      return 0
    if (!payToken.amountToUse || !receiveToken.amountToUse)
      return 0
    if (exchangeRatioDirection === 'forward') {
      return divide(Number(receiveToken.amountToUse), Number(payToken.amountToUse))
    }
    return divide(Number(payToken.amountToUse), Number(receiveToken.amountToUse))
  }, [payToken, receiveToken, exchangeRatioDirection])

  // init token, update token, set token
  useEffect(() => {
    if (!appStore.platToken || payToken)
      return
    setPayToken({ ...appStore.platToken, amountToUse: '' })
  }, [appStore.platToken])
  const setLatestBalanceOfToken = (target: UserTokenUse, func: React.Dispatch<UserTokenUse>) => {
    const newToken = appStore.tokens.find(token => token.canisterId === target.canisterId)
    if (!newToken)
      return
    if (newToken.balance === target.balance)
      return
    func({ ...newToken, amountToUse: target.amountToUse })
  }
  useEffect(() => {
    if (appStore.tokens.length === 0)
      return
    payToken && setLatestBalanceOfToken(payToken, setPayToken)
  }, [appStore.tokens])

  const tokenListModalRef = useRef<TokenListModalRef>(null)
  const openTokenListModal = (usage: TokenUsage) => {
    tokenListModalRef.current?.showModal()
    currentTokenUsage.current = usage
  }
  const handleSelect: TokenListModalProps['onSelect'] = (token) => {
    switch (currentTokenUsage.current) {
      case TokenUsage.PAY:
        setPayToken((preState) => {
          return {
            amountToUse: '',
            ...preState,
            ...token,
          }
        })
        if (token.canisterId === receiveToken?.canisterId)
          setReceiveToken(undefined)
        break
      case TokenUsage.RECEIVE:
        setReceiveToken((preState) => {
          return {
            amountToUse: '',
            ...preState,
            ...token,
          }
        })
        if (token.canisterId === payToken?.canisterId)
          setPayToken(undefined)
        break
    }
  }

  const handleChange = (value: string) => {
    setPayToken({
      ...payToken!,
      amountToUse: value,
    })
    setIsLocked(false)
  }
  const handleExchange = () => {
    if (!payToken || !receiveToken) {
      return false
    }
    setPayToken(receiveToken)
    setReceiveToken({ ...payToken, amountToUse: '' })
  }
  const resetReceiveToken = () => {
    if (!receiveToken)
      return
    setReceiveToken({
      ...receiveToken,
      amountToUse: '',
    })
  }

  // button status
  useEffect(() => {
    if (!appStore.userId) {
      setButtonInfo(buttonMap.connect)
      setIsDanger(false)
      return
    }
    if (!payToken || !receiveToken) {
      setButtonInfo(buttonMap.selectToken)
      setIsDanger(false)
      return
    }
    if (!Number(payToken.amountToUse)) {
      setButtonInfo(buttonMap.enterAmount)
      setIsDanger(false)
      return
    }
    if (Number(payToken.amountToUse) <= (payTokenFees.burnFee + payTokenFees.transferFee)) {
      setButtonInfo({
        ...buttonMap.smallerAmount,
        text: `${payToken.symbol} amount should greater than service fee`,
      })
      setIsDanger(false)
      return
    }
    if (Number(receiveToken.amountToUse) <= (tradingFee + platServiceFee + receiveTokenFees.burnFee + receiveTokenFees.transferFee)) {
      setButtonInfo({
        ...buttonMap.smallerAmount,
        text: `${receiveToken.symbol} amount should greater than service fee`,
      })
      setIsDanger(false)
      return
    }
    if (Number(payToken.amountToUse) > payToken.balance) {
      setButtonInfo({
        ...buttonMap.insufficientBalance,
        text: `Insufficient ${payToken.symbol} balance`,
      })
      setIsDanger(true)
    } else {
      setIsDanger(false)
    }
  }, [appStore.userId, payToken?.canisterId, payToken?.amountToUse, receiveToken?.canisterId, payTokenFees, receiveTokenFees, tradingFee, platServiceFee])

  // trade
  const queryRatioAndPath = useMemo(() => {
    return executionInterrupt(queryReceiveAmountAndPath)
  }, [])

  const path = useRef<{
    pools: Principal[]
    direction: bigint
  }>()
  const { run: getReceiveAmount } = useDebounceFn(async () => {
    if (!payToken || !receiveToken)
      return
    if (Number(payToken.amountToUse || '') === 0) {
      resetReceiveToken()
      return
    }
    if (Number(payToken.amountToUse) > payToken.balance)
      return
    if (Number(payToken.amountToUse) < (payTokenFees.burnFee + payTokenFees.transferFee)) {
      setReceiveToken({
        ...receiveToken,
        amountToUse: '',
      })
      return
    }
    setLoading(true)
    setButtonInfo(buttonMap.loading)
    const payPrincipal = Principal.fromText(payToken.canisterId)
    const receivePrincipal = Principal.fromText(receiveToken.canisterId)
    const payAmount = multiplyAndConvertToBigInt(payToken.amountToUse, payToken.decimals)
    const deadline = generateDeadline()
    const [err, res] = await to(queryRatioAndPath(payPrincipal, receivePrincipal, payAmount, deadline))
    setLoading(false)
    if (!err) {
      if ('Ok' in res) {
        const { decimals } = receiveToken
        const [amount, pools, direction, _, poolTradingFee] = res.Ok
        setTradingFee(divideAndConvertToNumber(poolTradingFee, decimals, 2))
        const amountOfNumber = divideAndConvertToNumber(amount, receiveToken.decimals, 18)
        setReceiveToken({
          ...receiveToken,
          amountToUse: `${amountOfNumber}`,
        })
        path.current = {
          pools,
          direction: BigInt(direction),
        }
        setButtonInfo(buttonMap.reviewOrder)
      } else {
        console.error(res.Err)
        setButtonInfo(buttonMap.insufficientLiquidity)
        setTradingFee(0)
        resetReceiveToken()
      }
    }
    else {
      setButtonInfo(buttonMap.error)
      setTradingFee(0)
      resetReceiveToken()
    }
  }, {
    wait: 300,
  })

  useEffect(() => {
    getReceiveAmount()
  }, [payToken?.canisterId, payToken?.amountToUse, receiveToken?.canisterId])

  const swapModalRef = useRef<SwapModalRef>(null)
  const handleClick = async () => {
    if (!appStore.userId) {
      requestConnect()
      return
    }
    if (!payToken || !receiveToken || !path.current) {
      return
    }
    if (Number(payToken.amountToUse) < (payTokenFees.burnFee + payTokenFees.transferFee)) {
      return
    }
    if (Number(receiveToken.amountToUse) < (tradingFee + platServiceFee + receiveTokenFees.burnFee + receiveTokenFees.transferFee)) {
      return
    }
    if (!isLocked) {
      setIsLocked(true)
      setButtonInfo(buttonMap.confirmOrder)
      return
    }
    setLoading(true)
    const payPrincipal = Principal.fromText(payToken.canisterId)
    const receivePrincipal = Principal.fromText(receiveToken.canisterId)
    const payAmount = multiplyAndConvertToBigInt(payToken.amountToUse, payToken.decimals)
    const minimunReceiveAmount = multiplyAndConvertToBigInt(Number(receiveToken.amountToUse) * (1 - (Number(slippage) / 100)), receiveToken.decimals)
    const deadline = generateDeadline()
    swapModalRef.current?.showModal(payToken, receiveToken, [
      payPrincipal,
      receivePrincipal,
      payAmount,
      minimunReceiveAmount,
      path.current.pools,
      path.current.direction,
      deadline,
    ])
  }
  const handleSuccess = async () => {
    setLoading(false)
    setIsLocked(false)
    setPayToken({
      ...payToken!,
      amountToUse: '',
    })
  }
  const handleFail = () => {
    setLoading(false)
    setIsLocked(false)
    setPayToken({
      ...payToken!,
      amountToUse: '',
    })
  }

  useEffect(() => {
    const searchPayToken = searchParams.get('payToken')
    const searchReceiveToken = searchParams.get('receiveToken')
    if (!tokens?.length)
      return
    const payTarget = tokens.find(item => item.canisterId === searchPayToken)
    const receiveTarget = tokens.find(item => item.canisterId === searchReceiveToken)
    payTarget?.canisterId && setPayToken({
      ...payTarget,
      amountToUse: '',
    })
    receiveTarget?.canisterId && setReceiveToken({
      ...receiveTarget,
      amountToUse: '',
    })
  }, [searchParams, tokens])

  return (
    <>
      <div className={ styles.swap }>
        <div className={ styles.header }>
          Swap
          <div className={ styles.operations }>
            <ReloadOutlined className={ classNames(styles.anticon, loading ? styles.loading : null) } onClick={ getReceiveAmount } />
            <Setting slippage={ slippage } onSlippage={ setSlippage } className={ styles.anticon } />
          </div>
        </div>
        <div className={ styles.content }>
          <TokenSelect label="Pay" danger={ isDanger } token={ payToken } onSelect={ () => openTokenListModal(TokenUsage.PAY) } onChange={ handleChange } />
          <div className={ styles.icon }>
            <img src={ arrowPng } alt="swap" onClick={ handleExchange } />
          </div>
          <TokenSelect label="Receive(Estimated)" locked={ isLocked } inputDisabled showMax={ false } token={ receiveToken } onSelect={ () => openTokenListModal(TokenUsage.RECEIVE) } />
          <div className={ styles.rate }>
            {
            receiveToken && receiveToken.amountToUse !== ''
              ? loading
                ? 'Find the best exchange route…'
                : <>
                  {
                  exchangeRatioDirection === 'forward'
                    ? <>1 { payToken?.symbol } = { exchangeRate } { receiveToken?.symbol }</>
                    : <>1 { receiveToken?.symbol } = { exchangeRate } { payToken?.symbol }</>
                }
                  <img src={ swapPng } className={ styles.exchange } onClick={ handleExchangeRadioDirection } />
                  <Tooltip overlayStyle={{ maxWidth: '350px' }} placement="bottom" title={ ServiceFee }>
                    <ExclamationCircleFilled />
                  </Tooltip>
                </>
              : null
          }
          </div>
          <Button type={ buttonInfo.type } disabled={ buttonInfo.disabled } danger={ buttonInfo.danger } loading={ loading } size="large" block onClick={ handleClick }>{ buttonInfo.text }</Button>
          <div>
            <Parameter className={ styles.tip } label="Slippage Tolerance" tooltipTitle="The slippage tolerance you set, it can be modified by going to the settings." value={ `${slippage} %` } />
            <Parameter className={ styles.tip } label="Minimum Received" tooltipTitle="The minimum amount of assets you can exchange under the current situation." value={ minimumReceive } />
          </div>
        </div>
      </div>
      <TokenListModal ref={ tokenListModalRef } onSelect={ handleSelect } />
      <SwapModal ref={ swapModalRef } onSuccess={ handleSuccess } onFail={ handleFail } />
    </>
  )
}

export default observer(Swap)
