import type { FC } from 'react'
import React, { useMemo, useState ,useEffect} from 'react'
import styles from './index.module.less'

const types = [
  {
    label: 'By Type',
    key: 'type',
  },
  {
    label: 'By Tokens',
    key: 'tokens',
  },
  {
    label: 'By Address',
    key: 'address',
  },
]

interface CategorySelectorProps {
  activeKey?: string
  onChange?: (value: string) => void
}
const CategorySelector: FC<CategorySelectorProps> = ({ activeKey, onChange }) => {
  const [innerActiveKey, setInnerActiveKey] = useState(activeKey)

  useEffect(()=>{
     setInnerActiveKey(activeKey)
  },[activeKey])
  const inkBarStyle = useMemo(() => {
    let index = types.findIndex(item => item.key === innerActiveKey)
    index = index < 0 ? 0 : index
    return {
      left: `${index * 186 + 40}px`,
    }
  }, [innerActiveKey])

  const onClick = (key: string) => {
    if (innerActiveKey !== key) {
      setInnerActiveKey(key)
      onChange && onChange(key)
    }
  }

  return (
    <div className={ styles.content }>
      <div className={ styles.tabs }>
        {
            types.map((type) => {
              const itemClasses = [styles.item]
              if (type.key === innerActiveKey)
                itemClasses.push(styles['item-active'])
              return (
                <div className={ itemClasses.join(' ') } key={ type.key } onClick={ () => onClick(type.key) }>{ type.label }</div>
              )
            })
        }
        <div className={ styles['ink-bar'] } style={ inkBarStyle } />
      </div>
    </div>
  )
}

export default CategorySelector
