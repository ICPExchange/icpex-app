import type { FC } from 'react'
import React from 'react'
import { DownOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { Dropdown } from 'antd'
import classNames from 'classnames'
import styles from './index.module.less'
import { TOKEN_PROTOCOLS } from '@/utils/constants'

export interface StandardProps {
  locked?: boolean
  value?: string
  onChange?: (key: string) => void
}
const Standard: FC<StandardProps> = ({ locked, value, onChange }) => {
  const onClick: MenuProps['onClick'] = ({ key }) => {
    if (locked)
      return
    onChange && onChange(key)
  }
  const items = TOKEN_PROTOCOLS.map((protocol) => {
    return {
      key: protocol,
      label: (
        <div className={ styles.item }>
          { protocol }
        </div>
      ),
    }
  })
  return (
    <Dropdown disabled={ locked } trigger={ ['click'] } menu={{ items, onClick, selectedKeys: [value || ''], style: { border: '1px solid rgba(93,82,224,1)' } }}>
      <div className={ styles.standard }>
        <div>Token Standard</div>
        <div className={ classNames(value ? styles.value : styles.placeholder) }>{ value || 'Select the token standard' }</div>
        <div className={ styles.icon }><DownOutlined /></div>
      </div>
    </Dropdown>
  )
}

export default Standard
