import React from 'react'
import { Table } from 'antd'
import classNames from 'classnames'

import styles from './index.module.less'

const CommonTable: React.FC<React.ComponentProps<typeof Table> & {
  className?: string
  headerRender?: React.ReactElement
}> = (props) => {
  const { className, headerRender } = props

  return (
    <>
      {
        headerRender ? <div className={ styles.header }>{ headerRender }</div> : null
      }

      <Table
        { ...props }
        className={ classNames(styles.table, className) }
      />
    </>
  )
}

export default CommonTable
