import type { FC } from 'react'
import React, { useEffect, useRef, useState } from 'react'
import type { MenuProps } from 'antd'
import { Dropdown } from 'antd'
import { CaretDownOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import PlugConnect from '@psychedelic/plug-connect'
import { observer } from 'mobx-react'
import classNames from 'classnames'
import styles from './index.module.less'
import type { WalletModalRef } from './wallet-modal'
import WalletModal from './wallet-modal'

// import logoPng from '@/assets/logo.png'
import logoBetaPng from '@/assets/logo-beta.png'
import deploymentPng from '@/assets/deployment.png'
import transactionPng from '@/assets/transaction.png'
import twitterPng from '@/assets/twitter.png'
import discordPng from '@/assets/discord.png'
import telegramPng from '@/assets/telegram.png'
import documentPng from '@/assets/document.png'
import githubPng from '@/assets/githubb.png'
import { host, whitelist } from '@/utils/env'
import { verifyConnectionAndAgent } from '@/utils/plug/connect'
import appStore, { setAppConnect } from '@/store/app'
import { truncateString } from '@/utils/principal'

interface MenuItem {
  title: string
  desc?: string
  href?: string
  icon?: string
  children?: MenuItem[]
}

const menus: MenuItem[] = [
  {
    title: 'Exchange',
    href: '/exchange',
  },
  {
    title: 'Pools',
    href: '/liquidPool',
  },
  {
    title: 'Tools',
    children: [
      {
        title: 'Create Token',
        desc: 'One-click creation of tokens without coding.',
        icon: deploymentPng,
        href: '/createToken',
      },
      {
        title: 'Create Liquidity Pool',
        desc: 'Create and manager liquidity markets and customize your market making strategies.',
        icon: transactionPng,
        href: '/createPool',
      },
    ],
  },
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Walllet',
    href: '/wallet',
  },
  {
    title: 'Feedback',
    href: 'https://forms.gle/7iVKkM4H15enrcxNA',
  },
]
const settings = [{
  icon: twitterPng,
  label: 'Twitter',
  href: 'https://twitter.com/ICPExchange',
}, {
  icon: discordPng,
  label: 'Discord',
  href: 'https://discord.gg/ams722dsun',
}, {
  icon: telegramPng,
  label: 'Telegram',
  href: 'https://t.me/icpexchange',
}, {
  icon: documentPng,
  label: 'Document',
  href: 'https://docs.icpex.org/',
}, {
  icon: githubPng,
  label: 'Github',
  href: 'https://github.com/ICPExchange',
}]

const LayoutHeader: FC = observer(() => {
  const [moreOpen, setMoreOpen] = useState(false)
  const navigate = useNavigate()
  const handleClick = (href = '/') => {
    navigate(href)
  }
  const getMenuItems = (children: MenuItem[]) => {
    return children.map((item) => {
      const { icon, title, desc, href } = item
      return {
        key: title,
        label: (
          <div key={ href } className={ styles.href } onClick={ () => handleClick(href) }>
            <img src={ icon } alt="logo" />
            <div>
              <div className={ styles.title }>{ title }</div>
              <div className={ styles.desc }>{ desc }</div>
            </div>
          </div>
        ),
      }
    })
  }
  const Meuns = menus.map((item) => {
    const { title, href, children } = item
    if (!children) {
      if (href?.includes('http')) {
        return (
          <a className={ styles['menu-item-a'] } key={ title } target="_blank" rel="noopener noreferrer" href={ href }>{ title }</a>
        )
      }
      return (
        <div className={ styles['menu-item'] } key={ title } onClick={ () => handleClick(href) }>{ title }</div>
      )
    }
    else {
      return (
        <Dropdown placement="bottomLeft" menu={{ items: getMenuItems(children) }} key={ title } arrow>
          <div className={ styles['menu-item'] }>
            { title } <CaretDownOutlined />
          </div>
        </Dropdown>
      )
    }
  })
  const onConnectCallback = async () => {
    setAppConnect()
  }

  const settingItems: MenuProps['items'] = settings.map((item) => {
    const { icon, label, href } = item
    return {
      key: label,
      label: (
        <a className={ styles.plat } target="_blank" rel="noopener noreferrer" href={ href }>
          <img src={ icon } alt="icon" />{ label }
        </a>
      ),
    }
  })

  useEffect(() => {
    verifyConnectionAndAgent().finally(() => {
      appStore.setVerified(true)
    })
  }, [])

  const walletModalRef = useRef<WalletModalRef>(null)
  const openModal = () => {
    walletModalRef.current?.showModal()
  }

  return (
    <>
      <header className={ styles.header }>
        <div className={ styles['header-main'] }>
          <div className={ styles.left }>
            <a href="/" rel="noopener noreferrer">
              <img className={ styles.logo } src={ logoBetaPng } alt="logo" />
            </a>
            <div className={ styles.menu }>{ Meuns }</div>
          </div>
          <div className={ styles.right }>
            {
              appStore.userId
                ? <div className={ styles.connect } onClick={ openModal }>
                  <div className={ styles.icp }>· ICP</div>
                  <div className={ styles.principal }>{ truncateString(appStore.userId) }</div>
                </div>
                : <PlugConnect dark whitelist={ whitelist } host={ host } onConnectCallback={ onConnectCallback } />
            }
            <Dropdown placement="bottomRight" menu={{ items: settingItems }} arrow onOpenChange={ setMoreOpen }>
              <div className={ classNames(styles.more, moreOpen ? styles.active : null) } />
            </Dropdown>
          </div>
        </div>
      </header>
      <WalletModal ref={ walletModalRef } />
    </>
  )
})

export default LayoutHeader
