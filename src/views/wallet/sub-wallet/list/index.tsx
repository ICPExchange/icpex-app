import type { FC } from 'react'
import React, { useMemo } from 'react'
import { FileTextOutlined } from '@ant-design/icons'
import GhostButton from '../../ghost-button'
import styles from './index.module.less'
import { CommonTable, TokenDisplay, TokenTag } from '@/components'
import type { SubWalletToken } from '@/types/token'
import { truncateDecimal } from '@/utils/common'
import { goTokenDetail } from '@/utils/urls'

interface TokenListProps {
  data: SubWalletToken[]
  loading: boolean
  onWithdrawal: (token: SubWalletToken) => void
}

const TokenList: FC<TokenListProps> = ({ data, loading, onWithdrawal }) => {
  const columns: any[] = useMemo(() => ([
    {
      title: 'Token',
      dataIndex: 'token',
      width: 250,
      render: (_: any, { symbol, name, logo }: SubWalletToken) => {
        return (
          <TokenDisplay logo={ logo } name={ name } symbol={ symbol } />
        )
      },
    },
    {
      title: 'Standard',
      dataIndex: 'standard',
      width: 170,
      render: (_: any, { protocol }: SubWalletToken) => {
        return (
          <TokenTag protocol={ protocol } />
        )
      },
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      width: 170,
      render: (_: any, { balance, price }: SubWalletToken) => {
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
      width: 140,
      render: (_: any, { price }: SubWalletToken) => {
        return (
          <div className={ styles.price }>${ price }</div>
        )
      },
    },
    {
      title: 'Details',
      dataIndex: 'details',
      width: 120,
      render: (_: any, { canisterId }: SubWalletToken) => {
        return (
          <GhostButton icon={ <FileTextOutlined /> } onClick={ () => goTokenDetail(canisterId) }>Token</GhostButton>
        )
      },
    },
    {
      title: 'Action',
      dataIndex: 'action',
      width: 150,
      render: (_: any, token: SubWalletToken) => {
        return (
          <GhostButton disabled={ token.balance === 0 } icon={ <FileTextOutlined /> } onClick={ () => onWithdrawal(token) }>Withdraw</GhostButton>
        )
      },
    },
  ]), [onWithdrawal])
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
