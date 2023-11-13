import type { FC } from 'react'
import React from 'react'
import styles from './index.module.less'
import { Copy, Share } from '@/components'

interface WalletInfoId {
  label: string
  id: string
  shareHref: string
  copyText: string
}
export interface WalletInfoProps {
  ids?: WalletInfoId[]
}
const WalletInfo: FC<WalletInfoProps> = ({ ids }) => {
  return (
    <div className={ styles.info }>
      {
        ids
          ? <div className={ styles.ids }>
            {
              ids.map((item) => {
                return (
                  <div className={ styles.id } key={ item.label }>
                    <div className={ styles.label }>{ item.label }</div>
                    <div className={ styles.value }>{ item.id }</div>
                    <div className={ styles.icons }><Share className={ styles.icon } href={ item.shareHref } /><Copy className={ styles.icon } text={ item.copyText } /></div>
                  </div>
                )
              })
            }
          </div>
          : null
      }
    </div>
  )
}

export default WalletInfo
