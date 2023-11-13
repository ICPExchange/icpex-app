import type { FC, ReactNode } from 'react'
import { EditFilled, QuestionCircleFilled } from '@ant-design/icons'
import { Tooltip } from 'antd'
import React from 'react'
import styles from './index.module.less'

interface ParameterItemProps {
  label: string
  tooltipTitle: string
  value?: string
  unit?: string
  onEdit?: () => void
  children?: ReactNode
  direction?: 'row' | 'col'
  style?: React.CSSProperties
}

const ParameterItem: FC<ParameterItemProps> = ({ label, tooltipTitle, value, unit, onEdit, children, direction = 'row', style }) => {
  const classes = [styles.parameter, styles[direction]]
  return (
    <div className={ classes.join(' ') } style={ style }>
      <div className={ styles.label }>
        { label }
        <Tooltip title={ tooltipTitle }>
          <QuestionCircleFilled className={ styles.question } />
        </Tooltip>
      </div>
      <div className={ styles.value }>
        {
        children
        || <>
          { value }{ unit || null }<EditFilled className={ styles.editable } onClick={ onEdit } />
          </>
      }
      </div>
    </div>
  )
}

export default ParameterItem
