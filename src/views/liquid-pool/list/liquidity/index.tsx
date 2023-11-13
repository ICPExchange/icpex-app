import type { TablePaginationConfig } from 'antd'
import { Table } from 'antd'
import type { FC } from 'react'
import classNames from 'classnames'
import React from 'react'
import { observer } from 'mobx-react'
import { MinusOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons'
import styles from './index.module.less'
import { CommonButton, CommonTable, Copy, Share } from '@/components'
import type { Pool } from '@/types/pool'
import { truncateString } from '@/utils/principal'
import { capitalizeFirstLetter, truncateDecimal } from '@/utils/common'
import singleLogo from '@/assets/single.svg'
import appStore from '@/store/app'
import { getPrincipalDashboardURL, goPoolDetail } from '@/utils/urls'

const { Column } = Table

interface PoolListProps {
  data?: Pool[]
  onAdd?: (pool: Pool) => void
  onRemove?: (pool: Pool) => void
  onEdit?: (pool: Pool) => void
}

const pagination = {
  pageSize: 10,
  position: ['bottomCenter'] as TablePaginationConfig['position'],
}

const LiquidityPoolList: FC<PoolListProps> = observer(({ data, onAdd, onRemove, onEdit }) => {
  const handleAdd: PoolListProps['onAdd'] = (pool) => {
    onAdd && onAdd(pool)
  }
  const handleRemove: PoolListProps['onRemove'] = (pool) => {
    onRemove && onRemove(pool)
  }
  const handleEdit: PoolListProps['onEdit'] = (pool) => {
    onEdit && onEdit(pool)
  }
  return (
    <>
      <CommonTable dataSource={ data } rowKey="canisterId" pagination={ pagination }>
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
          ) }
        />
        <Column
          title="Trading Pair"
          dataIndex="pair"
          width={ 180 }
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
          ) }
        />
        <Column
          title="Trading Fee Rate"
          dataIndex="rate"
          width={ 160 }
          render={ (_: any, { fee }: Pool) => (
            <div className={ styles.fee }>
              <div className={ styles.rate }>
                { fee * 100 }%
              </div>
            </div>
          ) }
        />
        <Column
          title="Token Amount"
          dataIndex="amount"
          width={ 190 }
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
          } }
        />
        <Column
          title="Your Liquidity"
          dataIndex="liquidity"
          width={ 150 }
          render={ (_: any, pool: Pool) => (
            <div className={ styles.liquidity }>
              <div className={ styles['liquidity-info'] }>
                {
                pool.type !== 'private'
                  ? <>
                    <div>
                      LP Tokens <span>{ pool.userLp }</span>
                    </div>
                    <div>
                      Fees Earned <span>${ pool.userEarnedFee }</span>
                    </div>
                  </>
                  : <div>
                    Fees Earned <span>${ pool.userEarnedFee }</span>
                  </div>
                }
              </div>
            </div>
          ) } />
        <Column
          title="Action"
          dataIndex="action"
          width={ 130 }
          render={ (_: any, pool: Pool) => (
            <div className={ styles.action }>
              {
                appStore.userId && pool.base.owner
                  ? <>
                    <CommonButton type="primary" shape="circle" size="small" onClick={ () => handleAdd(pool) }>
                      <PlusOutlined />
                    </CommonButton>
                    <CommonButton type="primary" shape="circle" size="small" onClick={ () => handleRemove(pool) }>
                      <MinusOutlined />
                    </CommonButton>
                    {
                    pool.type === 'private'
                      ? <CommonButton type="primary" shape="circle" size="small" onClick={ () => handleEdit(pool) }>
                        <SettingOutlined />
                      </CommonButton>
                      : null
                    }
                  </>
                  : null
            }
            </div>) } />
      </CommonTable>
    </>
  )
})

export default LiquidityPoolList
