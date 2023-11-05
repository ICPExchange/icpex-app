import type { FC } from 'react'
import React from 'react'
import styles from './index.module.less'
import logoBetaPng from '@/assets/logo-beta.png'

const items = [
  {
    label: 'Home',
  },
  {
    label: 'Intro',
  },
  {
    label: 'Tools',
  },
  {
    label: 'Docs',
    href: 'https://docs.icpex.org',
  },
  {
    label: 'Contact',
  },
]

const Header: FC = () => {
  return (
    <div className={ styles.header }>
      <div className={ styles.main }>
        <img className={ styles.logo } src={ logoBetaPng } alt="logo" />
        <div className={ styles.nav }>
          {
            items.map((item) => {
              const { label, href } = item
              if (href) {
                return (
                  <a key={ label } className={ styles['nav-item'] } target="_blank" rel="noopener noreferrer" href={ href }>{ label }</a>
                )
              }
              return (
                <a key={ label } className={ styles['nav-item'] } href={ `#${label}` }>{ label }</a>
              )
            })
        }
        </div>
      </div>
    </div>
  )
}

export default Header
