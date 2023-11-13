import type { ChangeEvent, FC } from 'react'
import React, { useEffect, useRef, useState } from 'react'
import { Input, Tooltip } from 'antd'
import { QuestionCircleFilled, ReloadOutlined, SettingOutlined, SwapOutlined } from '@ant-design/icons'
import classNames from 'classnames'
import { useClickAway } from 'ahooks'
import styles from './index.module.less'
import type { UserToken } from '@/types/token'
import { CommonButton } from '@/components'

export type TokenSequence = 'base-quote' | 'quote-base'
export interface MicroOperationProps {
  isPrivate: boolean
  isSingle: boolean
  baseToken: UserToken
  quoteToken: UserToken
  i: number
  sequence: TokenSequence
  tokensRatio: number
  slippage: string
  onReload?: () => Promise<any>
  onSequence?: (value: TokenSequence) => void
  onSlippage?: (value: string) => void
}
const MicroOperation: FC<MicroOperationProps> = ({ isPrivate, isSingle, baseToken, quoteToken, i, sequence, tokensRatio, slippage, onReload, onSequence, onSlippage }) => {
  const [isSettingOpen, setIsSettingOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const handleSequence = () => {
    if (isSingle)
      return
    onSequence && onSequence(sequence === 'base-quote' ? 'quote-base' : 'base-quote')
  }

  const handleSetting = () => {
    setIsSettingOpen(!isSettingOpen)
  }
  const settingButtonRef = useRef<HTMLDivElement>(null)
  const settingRef = useRef<HTMLDivElement>(null)
  useClickAway(() => {
    setIsSettingOpen(false)
  }, [settingRef, settingButtonRef])

  const triggerSlippage = (value: string) => {
    onSlippage && onSlippage(value)
  }
  const handleAuto = () => {
    triggerSlippage('0.1')
  }
  const handleSlippageChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    const regex = /^\d*\.?\d{0,2}$/
    if (regex.test(value)) {
      if (Number(value) > 10)
        value = '10'
      triggerSlippage(value)
    }
  }

  // slippage must bigger than 0
  useEffect(() => {
    if (!isSettingOpen) {
      if (Number(slippage) === 0)
        triggerSlippage('0.1')
    }
  }, [isSettingOpen])

  const handleRealod = () => {
    if (!onReload)
      return
    setLoading(true)
    onReload().finally(() => {
      setTimeout(() => {
        setLoading(false)
      }, 100)
    })
  }

  return (
    <div className={ styles.operation }>
      {
        !isPrivate
          ? <div className={ styles['setting-wrapper'] }>
            <div className={ styles.proportion }>
              <div className={ styles['proportion-left'] }>
                {
                    sequence === 'base-quote'
                      ? <div>
                        1 { baseToken.symbol }= { tokensRatio || '-' } { quoteToken.symbol }
                      </div>
                      : <div>
                        1 { quoteToken.symbol }= { tokensRatio || '-' } { baseToken.symbol }
                      </div>
                    }
                {
                    isSingle
                      ? <div className={ styles.initPrice }>
                        Init Price
                        <Tooltip overlayStyle={{ maxWidth: '1000px' }} title="The minimum selling price set by this single-token pool.">
                          <QuestionCircleFilled className={ styles.info } />
                        </Tooltip>：1 { baseToken.symbol } = { i } { quoteToken.symbol }
                      </div>
                      : null
                }
              </div>
              <div className={ styles['proportion-right'] }>
                <div className={ styles.action } onClick={ handleSequence }>
                  <SwapOutlined />
                </div>
                <div className={ styles.action } onClick={ handleRealod }>
                  <ReloadOutlined className={ classNames(loading ? styles.loading : null) } />
                </div>
                <div ref={ settingButtonRef } className={ classNames(styles.action, isSettingOpen ? styles['action-active'] : null) } onClick={ handleSetting }>
                  <SettingOutlined />
                </div>
              </div>
            </div>
            {
            isSettingOpen
              ? <div className={ styles.setting } ref={ settingRef }>
                <div className={ styles['setting-top'] }>
                  <div>Slippage Tolerance</div>
                  <div className={ styles['setting-st'] }>{ slippage }%</div>
                </div>
                <div className={ styles['setting-bottom'] }>
                  <CommonButton size="small" className={ styles['setting-auto'] } onClick={ handleAuto }>Auto</CommonButton>
                  <div className={ styles['setting-input-wrapper'] }>
                    <Input bordered={ false } className={ styles['setting-input'] } value={ slippage } onChange={ handleSlippageChange } /> <div className={ styles['setting-unit'] }>%</div>
                  </div>
                </div>
              </div>
              : null
            }
          </div>
          : null
        }
    </div>
  )
}

export default MicroOperation
