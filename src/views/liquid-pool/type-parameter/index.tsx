import type { FC } from 'react'
import React, { useEffect, useState } from 'react'
import styles from './index.module.less'
import { CommonButton } from '@/components'

const pools = [
  {
    label: 'All Pools',
    value: 'all',
  },
  {
    label: 'Public Pools',
    value: 'public',
  },
  {
    label: 'Private Pools',
    value: 'private',
  },
  {
    label: 'Anchored Pools',
    value: 'anchored',
  },
]

interface TypeParameterProps {
  value?: string
  onChange?: (value: string) => void
}
const TypeParameter: FC<TypeParameterProps> = ({ value, onChange }) => {
  const [innerValue, setInnerValue] = useState<string | undefined>(value)
  useEffect(() => {
    if (innerValue !== value)
      setInnerValue(value)
  }, [value])

  const handleChange = (value: string) => {
    if (innerValue !== value) {
      setInnerValue(value)
      onChange && onChange(value)
    }
  }
  return (
    <div className={ styles.content }>
      {
        pools.map((pool) => {
          return (
            <CommonButton className={ styles.button } type={ innerValue === pool.value ? 'primary' : 'default' } key={ pool.value } onClick={ () => handleChange(pool.value) }>{ pool.label }</CommonButton>
          )
        })
      }
    </div>
  )
}

export default TypeParameter
