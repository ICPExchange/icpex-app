import type { ChangeEvent, FC } from 'react'
import React, { useEffect, useRef, useState } from 'react'
import { useClickAway } from 'ahooks'
import { QuestionCircleFilled, SettingOutlined } from '@ant-design/icons'
import { Input, Tooltip } from 'antd'
import classNames from 'classnames'
import styles from './index.module.less'
import { CommonButton } from '@/components'

export interface PrivatePoolSlippageProps {
  slippage: string
  onSlippage?: (value: string) => void
}
const PrivatePoolSlippage: FC<PrivatePoolSlippageProps> = ({ slippage, onSlippage }) => {
  const [isSettingOpen, setIsSettingOpen] = useState(false)

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

  return (
    <div className={ styles.operation }>
      <div className={ styles['setting-wrapper'] }>
        <div className={ styles.proportion }>
          Any Ratio <Tooltip overlayStyle={{ maxWidth: '1000px' }} title="You can remove liquidity in any proportion.">
            <QuestionCircleFilled className={ styles.question } />
          </Tooltip>
          <div ref={ settingButtonRef } className={ classNames(styles.action, isSettingOpen ? styles['action-active'] : null) } onClick={ handleSetting }>
            <SettingOutlined />
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
    </div>
  )
}

export default PrivatePoolSlippage
