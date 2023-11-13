import type { FC } from 'react'
import React, { useCallback } from 'react'
import { Button, ConfigProvider, Spin } from 'antd'
import { MinusOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons'
import { observer } from 'mobx-react'
import GhostButton from '../../ghost-button'
import styles from './index.module.less'
import type { ImportToken } from '@/types/token'
import { TokenDisplay, TokenTag } from '@/components'
import tokenStore from '@/store/token'

const columns = [
  {
    key: 'token',
    title: 'Token',
    width: 200,
  },
  {
    key: 'protocol',
    title: '',
    width: 100,
  },
  {
    key: 'canister',
    title: 'Canister ID',
    width: 300,
  },
  {
    key: 'operation',
    title: '',
    width: 100,
  },
]

interface TokenListProps {
  loading?: boolean
  data: ImportToken[]
  onImport: () => void
}
const TokenList: FC<TokenListProps> = ({ loading, data, onImport }) => {
  const handleAdd = useCallback((canisterId: string) => {
    tokenStore.addUserToken(canisterId)
  }, [])
  return (
    <ConfigProvider theme={{
      components: {
        Button: {
          controlHeightSM: 30,
          fontSize: 14,
        },
      },
    }}>
      <div className={ styles.header }>
        {
            columns.map((column) => {
              const { key, title, width } = column
              return (
                <div key={ key } style={{ width }}>{ title }</div>
              )
            })
        }
      </div>
      <Spin spinning={ loading }>
        <div className={ styles.body }>
          {
            data.map((item) => {
              return (
                <div key={ item.canisterId } className={ styles.row }>
                  <TokenDisplay className={ styles.token } logo={ item.logo } name={ item.name } symbol={ item.symbol } />
                  <div className={ styles.protocol }>
                    <TokenTag protocol={ item.protocol } />
                  </div>
                  <div className={ styles.canister }>{ item.canisterId }</div>
                  <div className={ styles.operation }>
                    {
                      item.source !== 'CERTIFICATION'
                        ? !tokenStore.addTokens.includes(item.canisterId)
                            ? <Button type="primary" size="small" shape="round" icon={ <PlusOutlined /> } onClick={ () => handleAdd(item.canisterId) }>Add</Button>
                            : <Button type="primary" size="small" shape="round" icon={ <MinusOutlined /> } onClick={ () => handleAdd(item.canisterId) }>Delete</Button>
                        : null
                    }
                  </div>
                </div>
              )
            })
        }
        </div>
      </Spin>
      <div className={ styles.import }>
        <GhostButton icon={ <UploadOutlined /> } onClick={ onImport }>Import Token</GhostButton>
      </div>
    </ConfigProvider>
  )
}

TokenList.displayName = 'TokenList'

export default observer(TokenList)
