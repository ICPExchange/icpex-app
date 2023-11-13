import React, { useEffect, useState } from 'react'
import styles from './index.module.less'
import { getTokenCnt } from '@/utils/create-token'
import { formatNumber } from '@/utils/common'

const Header = () => {
  const [total, setTotal] = useState('0')

  const getCnt = async () => {
    const res = await getTokenCnt()

    console.log('getTokenCnt:', res)

    setTotal(formatNumber(Number(res)))
  }

  useEffect(() => {
    getCnt()
  }, [])

  return (<div className={ styles.header }>
    <div>
      <div className={ styles.text }>No coding required.</div>
      <div className={ styles.text }>Create your own tokens with one click!</div>
      <div className={ styles.num }>{ total }</div>
      <div className={ styles['text-small'] }>Tokens Created</div>
    </div>
    <div className={ styles.img } />
  </div>)
}

export default Header
