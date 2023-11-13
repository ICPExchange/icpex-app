import React from 'react'
import type { ButtonProps } from 'antd'
import { Button } from 'antd'
import classNames from 'classnames'
import { PlusOutlined } from '@ant-design/icons'

import styles from './index.module.less'

const CommonButton: React.FC<ButtonProps & {
  isStretch?: boolean
}> = ({ isStretch, ...props }) => {
  const { children, className } = props
  return (
    <div className={ styles['btn-box'] }>
      <Button
        { ...props }
        className={ classNames(styles.btn, isStretch ? styles.stretch : null, className) }
      >
        { isStretch ? <PlusOutlined style={{ fontSize: '18px' }} /> : null }

        { children }
      </Button>
    </div>
  )
}

export default CommonButton
