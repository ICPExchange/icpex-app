import type { FC, ReactNode } from 'react'
import { QuestionCircleFilled } from '@ant-design/icons'
import { Tooltip } from 'antd'
import React from 'react'
import styles from './index.module.less'

interface ParameterProps {
  label: string
  tooltipTitle: string | ReactNode
  value?: string
  direction?: 'row' | 'col'
  className?: string
  style?: React.CSSProperties
}

export const Parameter: FC<ParameterProps> = ({ label, tooltipTitle, value, direction = 'row', className, style }) => {
  const classes = [styles[direction]]
  if (className)
    classes.push(className)

  return (
    <div className={ classes.join(' ') } style={ style }>
      <div className={ styles.label }>
        { label }
        <Tooltip title={ tooltipTitle }>
          <QuestionCircleFilled className={ styles.question } />
        </Tooltip>
      </div>
      <div className={ styles.value }>
        { value }
      </div>
    </div>
  )
}
