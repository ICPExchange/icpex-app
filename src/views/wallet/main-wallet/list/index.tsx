import type { FC } from 'react'
import React from 'react'
import { FileTextOutlined } from '@ant-design/icons'
import GhostButton from '../../ghost-button'
import styles from './index.module.less'
import { CommonTable, TokenDisplay, TokenTag } from '@/components'
import type { WalletToken } from '@/types/token'
import { truncateDecimal } from '@/utils/common'
import { goTokenDetail } from '@/utils/urls'

interface TokenListProps {
  data: WalletToken[]
  loading: boolean
}
const columns: any[] = [
  {
    title: 'Token',
    dataIndex: 'token',
    width: 100,
    render: (_: any, { symbol, name, logo }: WalletToken) => {
      return (
        <TokenDisplay logo={ logo } name={ name } symbol={ symbol } />
      )
    },
  },
  {
    title: 'Standard',
    dataIndex: 'standard',
    width: 100,
    render: (_: any, { protocol }: WalletToken) => {
      return (
        <TokenTag protocol={ protocol } />
      )
    },
  },
  {
    title: 'Balance',
    dataIndex: 'balance',
    width: 100,
    render: (_: any, { balance, price }: WalletToken) => {
      return (
        <>
          <div className={ styles.balance }>{ balance }</div>
          <div className={ styles.value }>≈${ truncateDecimal(price * balance) }</div>
        </>
      )
    },
  },
  {
    title: 'Price',
    dataIndex: 'price',
    width: 100,
    render: (_: any, { price }: WalletToken) => {
      return (
        <div className={ styles.price }>${ price }</div>
      )
    },
  },
  {
    title: 'Details',
    dataIndex: 'details',
    width: 100,
    render: (_: any, { canisterId }: WalletToken) => {
      return (
        <GhostButton icon={ <FileTextOutlined /> } onClick={ () => goTokenDetail(canisterId) }>Token</GhostButton>
      )
    },
  },
]
const TokenList: FC<TokenListProps> = ({ data, loading }) => {
  return (
    <CommonTable
      className={ styles.table }
      columns={ columns }
      dataSource={ data }
      pagination={ false }
      loading={ loading }
      rowKey="canisterId"
    />
  )
}

export default TokenList
