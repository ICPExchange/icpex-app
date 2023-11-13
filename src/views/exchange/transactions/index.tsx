import type { FC } from 'react'
import React, { useEffect, useMemo, useState } from 'react'
import type { RadioChangeEvent } from 'antd'
import { Radio } from 'antd'
import { observer } from 'mobx-react'
import styles from './index.module.less'
import { CommonTable } from '@/components'
import type { Transaction } from '@/utils/service/pool'
import { getTransactions } from '@/utils/service/pool'
import { truncateDecimal } from '@/utils/common'
import appStore from '@/store/app'

const types = [
  {
    label: 'All',
    value: 'All',
  },
  {
    label: 'Swaps',
    value: 'Swap',
  },
  {
    label: 'Adds',
    value: 'AddLiquidity',
  },
  {
    label: 'Removes',
    value: 'RemoveLiquidity',
  },
]

const columns: any[] = [
  {
    title: 'Action',
    dataIndex: 'action',
    width: 180,
  },
  {
    title: 'Total Value',
    dataIndex: 'totalValue',
    width: 110,
    render: (totalValue: number) => {
      return `$${truncateDecimal(totalValue)}`
    },
  },
  {
    title: 'Token Amount A',
    dataIndex: 'tokenAmountA',
    width: 150,
    render: (tokenAmountA: number, { tokenSymbolA }: Transaction) => {
      return `${tokenAmountA} ${tokenSymbolA}`
    },
  },
  {
    title: 'Token Amount B',
    dataIndex: 'tokenAmountB',
    width: 150,
    render: (tokenAmountB: number, { tokenSymbolB }: Transaction) => {
      return `${tokenAmountB} ${tokenSymbolB}`
    },
  },
  {
    title: 'Time(UTC)',
    dataIndex: 'ts',
    width: 180,
  },
]
const Transactions: FC = () => {
  const [type, setType] = useState<Transaction['operation']>('All')
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<Transaction[]>([])
  const filterList = useMemo(() => {
    setLoading(true)
    if (type === 'All') {
      setLoading(false)
      return list
    }
    else {
      setLoading(false)
      return list.filter(item => item.operation === type)
    }
  }, [type, list])
  const handleType = (e: RadioChangeEvent) => {
    setType(e.target.value)
  }

  const getList = async () => {
    setLoading(true)
    const [err, res] = await getTransactions({ operation: 'All', caller: appStore.userId })
    if (!err) {
      const handledList = res.data.data.map((item) => {
        const { totalValue, tokenAmountA, tokenAmountB, ts, ...rest } = item
        return {
          totalValue: truncateDecimal(totalValue),
          tokenAmountA: truncateDecimal(tokenAmountA),
          tokenAmountB: truncateDecimal(tokenAmountB),
          ts: ts.split('.')[0],
          ...rest,
        }
      })
      setList(handledList)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (appStore.userId)
      getList()
  }, [appStore.userId])

  return (
    <div className={ styles.transactions }>
      <header className={ styles.header }>
        <div className={ styles['header-left'] }>Transactions</div>
        <div className={ styles['header-right'] }>
          <Radio.Group name="radiogroup" size="small" value={ type } onChange={ handleType }>
            {
                types.map((item) => {
                  return (
                    <Radio value={ item.value } key={ item.value }>{ item.label }</Radio>
                  )
                })
            }
          </Radio.Group>
        </div>
      </header>
      <CommonTable
        className={ styles.table }
        columns={ columns }
        dataSource={ filterList }
        loading={ loading }
        pagination={ false }
        rowKey="ts"
    />
    </div>
  )
}

export default observer(Transactions)
