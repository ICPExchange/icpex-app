import type { ChangeEvent, FC } from 'react'
import React, { useEffect, useRef, useState } from 'react'
import { SettingOutlined } from '@ant-design/icons'
import { Input } from 'antd'
import { useClickAway } from 'ahooks'
import classNames from 'classnames'
import styles from './index.module.less'
import { CommonButton } from '@/components'

export interface SettingProps {
  slippage: string
  onSlippage?: (value: string) => void
  className?: string
}
const Setting: FC<SettingProps> = ({ slippage, onSlippage, className }) => {
  const [open, setOpen] = useState(false)
  const handleSetting = () => {
    setOpen(!open)
  }
  const settingButtonRef = useRef<HTMLDivElement>(null)
  const settingRef = useRef<HTMLDivElement>(null)
  useClickAway(() => {
    setOpen(false)
  }, [settingRef, settingButtonRef])

  const triggerSlippage = (value: string) => {
    onSlippage && onSlippage(value)
  }
  const handleAuto = () => {
    triggerSlippage('0.5')
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

  useEffect(() => {
    if (!open) {
      if (Number(slippage) === 0)
        triggerSlippage('0.1')
    }
  }, [open])
  return (
    <div className={ styles['setting-wrapper'] }>
      <div ref={ settingButtonRef } className={ classNames(styles.icon, className ?? null) } onClick={ handleSetting }>
        <SettingOutlined />
      </div>
      {
        open
          ? <div className={ styles.setting } ref={ settingRef }>
            <div className={ styles['setting-top'] }>
              <div>Slippage Tolerance</div>
              <div className={ styles['setting-st'] }>{ slippage }%</div>
            </div>
            <div className={ styles['setting-bottom'] }>
              <CommonButton type="primary" size="small" className={ styles['setting-auto'] } onClick={ handleAuto }>Auto</CommonButton>
              <div className={ styles['setting-input-wrapper'] }>
                <Input bordered={ false } className={ styles['setting-input'] } value={ slippage } onChange={ handleSlippageChange } /> <div className={ styles['setting-unit'] }>%</div>
              </div>
            </div>
          </div>
          : null
    }
    </div>
  )
}

export default Setting
