import type { TablePaginationConfig } from 'antd'
import { Table } from 'antd'
import type { FC } from 'react'
import classNames from 'classnames'
import React from 'react'
import { observer } from 'mobx-react'
import styles from './index.module.less'
import { CommonButton, CommonTable, Copy, Share } from '@/components'
import type { Pool } from '@/types/pool'
import { truncateString } from '@/utils/principal'
import { capitalizeFirstLetter, formatAmountByUnit, truncateDecimal } from '@/utils/common'
import singleLogo from '@/assets/single.svg'
import appStore from '@/store/app'
import { getPrincipalDashboardURL, goPoolDetail } from '@/utils/urls'

const { Column } = Table

interface PoolListProps {
  data?: Pool[]
  onAdd?: (pool: Pool) => void
}

const pagination = {
  pageSize: 10,
  position: ['bottomCenter'] as TablePaginationConfig['position'],
}

const ExplorePoolList: FC<PoolListProps> = observer(({ data, onAdd }) => {
  const handleAdd: PoolListProps['onAdd'] = (pool) => {
    onAdd && onAdd(pool)
  }
  return (
    <>
      <CommonTable dataSource={ data } rowKey="canisterId" pagination= { pagination }>
        <Column
          title="Pool"
          dataIndex="pool"
          width={ 190 }
          render={ (_: any, { canisterId, type }: Pool) => (
            <div className={ styles.pool }>
              <div className={ styles.address }>
                <a className={ styles.pooltext } href={ `/pool/detail/${canisterId}` }>
                  { truncateString(canisterId) }
                </a>
                <Share href={ getPrincipalDashboardURL(canisterId) } />
                <Copy text={ canisterId } />
              </div>
              <div className={ styles.tag }>{ capitalizeFirstLetter(type) } Pool</div>
            </div>
          ) } />
        <Column
          title="Trading Pair"
          dataIndex="pair"
          width={ 200 }
          render={ (_: any, { base, quote }: Pool) => (
            <div className={ styles.pair }>
              <div className={ styles.logos }>
                <div className={ styles.logo }>
                  {
                    base.logo
                      ? <img src={ base.logo } alt="logo" />
                      : null
                }
                </div>
                <div className={ classNames(styles.logo, styles['quote-logo']) }>
                  {
                    quote.logo
                      ? <img src={ quote.logo } alt="logo" />
                      : null
                }
                </div>
                { base.symbol }/{ quote.symbol }
              </div>
            </div>
          ) } />
        <Column
          title="Trading Fee Rate"
          dataIndex="rate"
          width={ 170 }
          render={ (_: any, { fee }: Pool) => (
            <div className={ styles.fee }>
              <div className={ styles.rate }>
                { fee * 100 }%
              </div>
            </div>
          ) } />
        <Column
          title="Token Amount"
          dataIndex="amount"
          width={ 200 }
          render={ (_: any, { isSingle, base, quote }: Pool) => {
            const total = base.reserve + quote.reserve
            let baseProportion = 0
            let quoteProportion = 0
            if (total !== 0) {
              baseProportion = truncateDecimal((base.reserve / total * 100))
              quoteProportion = truncateDecimal(100 - baseProportion)
            }
            return (
              <div className={ styles.tvl }>
                <div className={ styles.quantity }>
                  <div className={ `${styles['quantity-token']} ${styles['quantity-base']}` }>{ truncateDecimal(base.reserve / 1000) } K { base.symbol } ({ baseProportion.toFixed(2) }%)</div>
                  {
                    !isSingle
                      ? <div className={ `${styles['quantity-token']} ${styles['quantity-quote']}` }>{ truncateDecimal(quote.reserve / 1000) } K { quote.symbol } ({ quoteProportion.toFixed(2) }%)</div>
                      : null

                    }
                  {
                    isSingle
                      ? <div className={ styles.single }>
                        <img src={ singleLogo } alt="single" />
                        Single
                      </div>
                      : null
                 }
                </div>
              </div>
            )
          } } />
        <Column
          title="Volume 24H"
          dataIndex="volume"
          width={ 130 }
          render={ (_: any, pool: Pool) => (
            <div className={ styles.volumn }>
              <div className={ styles['volumn-inner'] }>
                { pool.volumn24h ? formatAmountByUnit(pool.volumn24h) : '- -' }
              </div>
            </div>
          ) } />
        <Column
          title=""
          dataIndex="action"
          width={ 110 }
          render={ (_: any, pool: Pool) => (
            <div className={ styles.action }>
              {
                (appStore.userId && pool.base.owner && pool.type !== 'private')
                  ? <CommonButton type="primary" isStretch onClick={ () => handleAdd(pool) }>
                    add
                  </CommonButton>
                  : null
            }
            </div>) } />
      </CommonTable>
    </>
  )
})

export default ExplorePoolList
