import type { FC } from 'react'
import React, { useMemo } from 'react'
import styles from './index.module.less'

const descriptionMap = {
  'public-standard': [
    {
      label: 'Public Pool',
      children: [
        {
          label: 'Anyone can add liquidity',
        },
        {
          label: 'Parameters cannot be modified after creation',
        },
      ],
    },
    {
      label: 'Standard',
      children: [
        {
          label: '50/50 value liquidity provision (same as Uniswap)',
        },
        {
          label: 'More parameters can be set',
        },
      ],
    },
  ],
  'public-single': [
    {
      label: 'Public Pool',
      children: [
        {
          label: 'Anyone can add liquidity',
        },
        {
          label: 'Parameters cannot be modified after creation',
        },
      ],
    },
    {
      label: 'Single-Token',
      children: [
        {
          label: 'You are looking to sell tokens and make ask-side liquidity available',
        },
        {
          label: 'Supports initial single-token supply',
        },
      ],
    },
  ],
  'private': [
    {
      label: 'Private Pool',
      children: [
        {
          label: 'Only you (the pool creator) can add liquidity',
        },
        {
          label: 'Parameters cannot be modified after creation',
        },
      ],
    },
  ],
  'anchored': [
    {
      label: 'Anchored Pool',
      children: [
        {
          label: 'Anyone can add liquidity to this pool. Pool parameters cannot be modified after pool creation.',
        },
        {
          label: 'The pricing curve is similar to Curve Finance\'s. It\'s suitable for synthetic assets.',
        },
      ],
    },
  ],
}
export interface ContentLeftProps {
  type: 'public-standard' | 'public-single' | 'private' | 'anchored'
}
const ContentLeft: FC<ContentLeftProps> = ({ type }) => {
  const descriptions = useMemo(() => descriptionMap[type], [type])
  return (
    <div className={ styles.content }>
      {
        descriptions.map((desc) => {
          const { label, children } = desc
          return (
            <div className={ styles.description } key={ label }>
              <div className={ styles.title }>{ label }</div>
              <div>
                {
                   children.map(item => (<div className={ styles.item } key={ item.label }>{ item.label }</div>))
                }
              </div>
            </div>
          )
        })
      }
    </div>
  )
}

export default ContentLeft
