import type { ChangeEvent, FC } from 'react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { InfoCircleFilled, PlusOutlined, QuestionCircleFilled } from '@ant-design/icons'
import { Input, Tooltip, message, notification } from 'antd'
import { observer } from 'mobx-react'
import { Principal } from '@dfinity/principal'
import classNames from 'classnames'
import type { SelectorOption } from '../selector'
import Selector from '../selector'
import type { ApprovalModalRef } from '../approval-modal'
import ProgressModal from '../approval-modal'
import type { ContentLeftProps } from '../content-left'
import styles from './index.module.less'
import TokenSelect from './token-select'
import type { TradingFeeRateModalRef, TradingFeeRateOption } from '@/components/pool/trading-fee-rate-modal'
import { CommonButton, ParameterItem, TokenListModal, TradingFeeRateModal, VolatilityEoefficientModal } from '@/components'
import type { VolatilityEoefficientModalRef, VolatilityEoefficientOption } from '@/components/pool/volatility-eoefficient-modal'
import { TokenUsage } from '@/types/token'
import type { UserTokenUse } from '@/types/token'
import type { TokenListModalProps, TokenListModalRef } from '@/components/token/list-modal'
import appStore from '@/store/app'
import { requestConnect } from '@/utils/plug/connect'
import type { PoolTemplate, PoolType } from '@/types/pool'
import { divide, generateDeadline, isZero, multiplyAndConvertToBigInt } from '@/utils/common'
import { DECIMALS } from '@/utils/constants'

const poolTypes: SelectorOption<PoolType>[] = [
  {
    label: 'Public Pool',
    value: 'public',
  },
  {
    label: 'Private Pool',
    value: 'private',
  },
  {
    label: 'Anchored Pool',
    value: 'anchored',
  },
]
const poolTemplates: SelectorOption<PoolTemplate>[] = [
  {
    label: 'Standard',
    value: 'standard',
  },
  {
    label: 'Single-Token',
    value: 'single',
  },
]

interface ContentRightProps {
  onChange?: (type: ContentLeftProps['type']) => void
}
const ContentRight: FC<ContentRightProps> = ({ onChange }) => {
  const [poolType, setPoolType] = useState<PoolType>('public')
  const [poolTemplate, setPoolTemplate] = useState<PoolTemplate>('standard')
  const [baseToken, setBaseToken] = useState<UserTokenUse>()
  const [quoteToken, setQuoteToken] = useState<UserTokenUse>()
  const [initPrice, setInitPrice] = useState('')
  const isPublic = useMemo(() => poolType === 'public', [poolType])
  const isSingle = useMemo(() => poolTemplate === 'single', [poolTemplate])
  // const [messageApi, contextHolder] = message.useMessage()
  const infoIcon = useMemo(() => (<div className={ styles['icon-wrapper'] }><InfoCircleFilled className={ (classNames(styles.icon, styles['icon-info'])) } /></div>), [])
  const [api, contextHolder] = notification.useNotification()
  const openNotification = (message: string) => {
    api.info({
      icon: infoIcon,
      message,
      placement: 'topRight',
    })
  }
  const standardInitPrice = useMemo(() => {
    if (isPublic && poolTemplate === 'standard' && baseToken && quoteToken && !isZero(baseToken.amountToUse) && !isZero(quoteToken.amountToUse)) {
      return `1 ${baseToken.symbol} = ${divide(Number(quoteToken.amountToUse), Number(baseToken.amountToUse))} ${quoteToken.symbol}`
    }
    return ''
  }, [isPublic, poolTemplate, baseToken?.amountToUse, quoteToken?.amountToUse])

  useEffect(() => {
    const type = poolType === 'public' ? `${poolType}-${poolTemplate}` : poolType
    onChange && onChange(type as ContentLeftProps['type'])
  }, [poolType, poolTemplate])

  const handleType = useCallback((value: string) => {
    if (value !== 'public') {
      setInitPrice('1')
    }
    setPoolType(value as PoolType)
  }, [])

  const onAmountChange = (usage: TokenUsage, value: string) => {
    switch (usage) {
      case TokenUsage.BASE:
        baseToken && setBaseToken({ ...baseToken, amountToUse: value })
        if (poolType === 'anchored' && initPrice) {
          quoteToken && setQuoteToken({ ...quoteToken, amountToUse: `${Number(initPrice) * Number(value)}` })
        }
        break
      case TokenUsage.QUOTE:
        quoteToken && setQuoteToken({ ...quoteToken, amountToUse: value })
        if (poolType === 'anchored' && initPrice) {
          baseToken && setBaseToken({ ...baseToken, amountToUse: `${Math.round((Number(value) / Number(initPrice)))}` })
        }
        break
    }
  }

  const handleInitPriceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    const regex = /^\d*\.?\d{0,18}$/
    if (regex.test(value))
      setInitPrice(value)
    if (poolType === 'anchored' && value && baseToken && quoteToken) {
      setQuoteToken({ ...quoteToken, amountToUse: `${Number(value) * Number(baseToken.amountToUse)}` })
    }
  }

  const setLatestBalanceOfToken = (target: UserTokenUse, func: React.Dispatch<UserTokenUse>) => {
    if (!target)
      return
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
    baseToken && setLatestBalanceOfToken(baseToken, setBaseToken)
    quoteToken && setLatestBalanceOfToken(quoteToken, setQuoteToken)
  }, [appStore.tokens])

  const currentTokenUsage = useRef<TokenUsage>()
  const tokenListModalRef = useRef<TokenListModalRef>(null)
  const openTokenListModal = (usage: TokenUsage) => {
    tokenListModalRef.current?.showModal()
    currentTokenUsage.current = usage
  }

  const handleSelect: TokenListModalProps['onSelect'] = (newToken) => {
    switch (currentTokenUsage.current) {
      case TokenUsage.BASE:
        if (quoteToken && newToken.canisterId === quoteToken.canisterId) {
          setBaseToken(quoteToken)
          setQuoteToken(baseToken)
          return
        }
        setBaseToken({ ...newToken, amountToUse: baseToken ? baseToken.amountToUse : '' })
        break
      case TokenUsage.QUOTE:
        if (baseToken && newToken.canisterId === baseToken.canisterId) {
          setQuoteToken(baseToken)
          setBaseToken(quoteToken)
          return
        }
        setQuoteToken({ ...newToken, amountToUse: quoteToken ? quoteToken.amountToUse : '' })
        break
    }
  }

  const [volatilityEoefficientOption, setVolatilityEoefficientOption] = useState<VolatilityEoefficientOption>({
    key: 'Medium',
    value: '0.5',
  })
  const volatilityEoefficientModalRef = useRef<VolatilityEoefficientModalRef>(null)
  const handleVolatilityCofficient = () => {
    volatilityEoefficientModalRef.current?.showModal(volatilityEoefficientOption)
  }

  const [tradingFeeRateOption, setTradingFeeRateOption] = useState<TradingFeeRateOption>({
    key: 'Extremely Low',
    value: '0.01',
  })

  useEffect(() => {
    setPoolTemplate('standard')
    setVolatilityEoefficientOption(poolType === 'anchored'
      ? {
          key: 'Medium',
          value: '0.05',
        }
      : {
          key: 'Medium',
          value: '0.5',
        })
  }, [poolType])
  const tradingFeeRateModalRef = useRef<TradingFeeRateModalRef>(null)
  const handleTradingFeeRate = () => {
    tradingFeeRateModalRef.current?.showModal(tradingFeeRateOption)
  }

  const approvalProgressModalRef = useRef<ApprovalModalRef>(null)
  const openApprovalProgressModal = () => {
    if (!baseToken || !quoteToken)
      return
    const methodName = {
      public: 'createCommonPool',
      private: 'createPrivatePool',
      anchored: 'createStablePool',
    }[poolType]
    const base_token = Principal.fromText(baseToken.canisterId)
    const quote_token = Principal.fromText(quoteToken.canisterId)
    const base_in_amount = multiplyAndConvertToBigInt(baseToken.amountToUse, baseToken.decimals)
    const quote_in_amount = isSingle ? 0n : multiplyAndConvertToBigInt(quoteToken.amountToUse, quoteToken.decimals)
    const fee_rate = multiplyAndConvertToBigInt(Number(tradingFeeRateOption.value) / 100, DECIMALS)
    const i = multiplyAndConvertToBigInt(initPrice, DECIMALS)
    const k = multiplyAndConvertToBigInt(volatilityEoefficientOption.value, DECIMALS)
    const deadline = generateDeadline()
    const pool = {
      isSingle,
      methodName,
      args: [base_token, quote_token, base_in_amount, quote_in_amount, fee_rate, i, k, deadline],
    }
    approvalProgressModalRef.current?.showModal(
      { ...baseToken }, { ...quoteToken }, pool,
    )
  }

  const handleClick = () => {
    if (!appStore.userId) {
      requestConnect()
      return
    }
    if (!baseToken || !quoteToken) {
      openNotification('Please select tokens.')
      return
    }
    if (poolTemplate === 'standard') {
      if (isZero(baseToken.amountToUse) || isZero(quoteToken.amountToUse)) {
        openNotification('Please enter values')
        return
      }
      if (Number(baseToken.amountToUse) > baseToken.balance || Number(quoteToken.amountToUse) > quoteToken.balance) {
        openNotification('The value cannot be greater than the balance')
        return
      }
    }
    if (poolTemplate === 'single') {
      if (isZero(baseToken.amountToUse)) {
        openNotification('Please enter values')
        return
      }
      if (Number(baseToken.amountToUse) > baseToken.balance) {
        openNotification('The value cannot be greater than the balance')
        return
      }
    }
    if ((poolType === 'public' && poolTemplate === 'single') || poolType !== 'public') {
      if (!Number(initPrice)) {
        openNotification('The price value must bigger than zero')
        return
      }
    }
    openApprovalProgressModal()
  }

  const handleSuccess = () => {
    baseToken && setBaseToken({ ...baseToken, amountToUse: '' })
    quoteToken && setQuoteToken({ ...quoteToken, amountToUse: '' })
  }
  return (
    <div className={ styles.content }>
      { contextHolder }
      <div className={ styles.arguments }>
        <div className={ styles.title }>
          Create a pool
        </div>
        <div className={ styles.subtitle }>
          <span>01</span> Choose Pool Type
        </div>
        <Selector value={ poolType } options={ poolTypes } onChange={ handleType } />
        {
          isPublic
            ? <>
              <div className={ styles.subtitle }>
                <span>02</span> Choose Pool Template
              </div>
              <Selector value={ poolTemplate } options={ poolTemplates } onChange={ value => setPoolTemplate(value as PoolTemplate) } />
            </>
            : null
        }
        <div className={ styles.subtitle }>
          <span>{ isPublic ? '03' : '02' }</span> Supply Initial Tokens
        </div>
        <div className={ styles.base }>
          <TokenSelect token={ baseToken } onSelect={ () => openTokenListModal(TokenUsage.BASE) } onChange={ value => onAmountChange(TokenUsage.BASE, value) } />
        </div>
        <div className={ styles.plus }>
          <PlusOutlined />
        </div>
        <div style={{ marginTop: isSingle ? '25px' : '-12px' }}>
          <TokenSelect token={ quoteToken } type={ isSingle ? 'only-select' : 'both' } onSelect={ () => openTokenListModal(TokenUsage.QUOTE) } onChange={ value => onAmountChange(TokenUsage.QUOTE, value) } />
        </div>
        {
          standardInitPrice
            ? <div className={ styles.standardInit }>
              Init Price
              <Tooltip title="The initial swap price after the pool is created.">
                <QuestionCircleFilled className={ styles.question } />
              </Tooltip>
              { standardInitPrice }
            </div>
            : null
        }
        <div className={ styles.subtitle }>
          <span>{ isPublic ? '04' : '03' }</span> Parameters
        </div>
        {
          (isPublic && isSingle)
            ? <ParameterItem label="Init Price" tooltipTitle="Set the minimum selling price for single-token pool." style={{ marginBottom: '16px' }}>
              <div className={ styles.price }>
                {
                (baseToken && quoteToken)
                  ? <>
                    <span>1 { baseToken.symbol } = </span><Input className={ styles.priceInput } bordered={ false } value={ initPrice } onChange={ handleInitPriceChange } />{ quoteToken.symbol }
                  </>
                  : <div className={ styles.placeholder }>
                    Please select token first
                  </div>
              }
              </div>
            </ParameterItem>
            : null
        }
        {
          poolType === 'private'
            ? <ParameterItem label="Mid Price" tooltipTitle="Set the mid price you want to provide liquidity." direction="col" style={{ marginBottom: '16px' }}>
              <div className={ styles.price }>
                {
                (baseToken && quoteToken)
                  ? <>
                    <span>1 { baseToken.symbol } = </span><Input className={ styles.priceInput } bordered={ false } value={ initPrice } onChange={ handleInitPriceChange } />{ quoteToken.symbol }
                  </>
                  : <div className={ styles.placeholder }>
                    Please select token first
                  </div>
              }
              </div>
            </ParameterItem>
            : null
        }
        {
          poolType === 'anchored'
            ? <ParameterItem label="Anchored Exchange Rate" tooltipTitle="The anchored exchange rate refers to the exchange rate between two token assets where one's value is anchored by the other. For example, the anchored exchange rate between the US Dollar and USDT is 1." direction="col" style={{ marginBottom: '16px' }}>
              <div className={ styles.price }>
                {
                (baseToken && quoteToken)
                  ? <>
                    <span>1 { baseToken.symbol } = </span><Input className={ styles.priceInput } bordered={ false } value={ initPrice } onChange={ handleInitPriceChange } />{ quoteToken.symbol }
                  </>
                  : <div className={ styles.placeholder }>
                    Please select token first
                  </div>
              }
              </div>
            </ParameterItem>
            : null
        }
        <ParameterItem label="Trading Fee Rate" tooltipTitle="Pools with lower transaction fees will attract more traders." value={ tradingFeeRateOption.value } unit="%" onEdit={ handleTradingFeeRate } />
        <ParameterItem label="Volatility Coefficient" tooltipTitle="The smaller the volatility coefficient, the smaller the volatility of the trading market and the deeper the market depth." value={ volatilityEoefficientOption.value } onEdit={ handleVolatilityCofficient } />
      </div>
      <CommonButton type="primary" className={ styles.create } size="large" block onClick={ handleClick }>{ appStore.userId ? 'Create' : 'Connect' }</CommonButton>
      <TokenListModal ref={ tokenListModalRef } onSelect={ handleSelect } />
      <VolatilityEoefficientModal ref={ volatilityEoefficientModalRef } poolType={ poolType } onConfirm={ setVolatilityEoefficientOption } />
      <TradingFeeRateModal ref={ tradingFeeRateModalRef } onConfirm={ setTradingFeeRateOption } />
      <ProgressModal ref={ approvalProgressModalRef } onSuccess={ handleSuccess } />
    </div>
  )
}

export default observer(ContentRight)
