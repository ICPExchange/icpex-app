import type { FC } from 'react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from 'antd'
import classNames from 'classnames'
import styles from './index.module.less'

import Header from './header'
import logo2Png from '@/assets/guide/logo2.png'
import bestPng from '@/assets/guide/best.png'
import anyPng from '@/assets/guide/any.png'
import multiplePng from '@/assets/guide/multiple.png'
import githubPng from '@/assets/guide/github.png'
import telegramPng from '@/assets/guide/telegram.png'
import xPng from '@/assets/guide/x.png'
import discordPng from '@/assets/guide/discord.png'
import documentPng from '@/assets/guide/document.png'
import customPng from '@/assets/guide/custom.png'
import liquidityPng from '@/assets/guide/liquidity.png'
import miningPng from '@/assets/guide/mining.png'
import crowdpoolingPng from '@/assets/guide/crowdpooling.png'
import dashboardsPng from '@/assets/guide/dashboards.png'

const features = [
  {
    title: 'Best Liquidity',
    desc: 'ICPEx uses the Proactive Market Maker (PMM) algorithm to help LPs and market makers aggregate assets and provide strong liquidity in an easier way. At the same time, ICPEx provides a variety of liquidity products and solutions for users to choose from.',
    icon: bestPng,
    direction: 'ltr',
  },
  {
    title: 'Any Asset',
    desc: 'You can buy and sell any digital assets including homogenized tokens and NFTs with one click on ICPEx. ICPEx will compare prices across the entire network through an efficient routing algorithm, allowing you to get the best benefit.',
    icon: anyPng,
    direction: 'rtl',
  },
  {
    title: 'Multiple Chains',
    desc: 'In addition to the Dfinity blockchain, ICPEx will also continue to integrate ETH, BSC, HECO and other excellent blockchains. ICPEx will bring sufficient liquidity to the decentralized financial network with flexible scalability and rich functionality.',
    icon: multiplePng,
    direction: 'ltr',
  },
]

const sosocialPlatforms = [
  {
    img: githubPng,
    name: 'Github',
    src: 'https://github.com/ICPExchange',
  },
  {
    img: telegramPng,
    name: 'Telegram',
    src: 'https://t.me/icpexchange',
  },
  {
    img: xPng,
    name: 'Twitter',
    src: 'https://twitter.com/ICPExchange',
    width: '66px',
  },
  {
    img: discordPng,
    name: 'Discord',
    src: 'https://discord.gg/ams722dsun',
  },
  {
    img: documentPng,
    name: 'Document',
    src: 'https://docs.icpex.org/',
    width: '68px',
  }]

const tools = [
  {
    img: customPng,
    router: '',
    name: 'Custom Tokens',
    txt: 'One-click creation of tokens without coding.',
    url: '/createToken',
  },
  {
    img: liquidityPng,
    router: '',
    name: 'Liquidity Pools',
    txt: 'Participate freely in liquid markets and customize your market making strategy.',
    url: '/liquidPool',
  },
  {
    img: dashboardsPng,
    router: '',
    name: 'Dashboards',
    txt: 'Get the latest information about the ICPEx platform such as Volume, TVL, etc.',
    url: '/dashboard',
  },
  {
    img: miningPng,
    router: '',
    name: 'Liquidity Mining',
    txt: 'Stake assets for market making to get ICPEx rewards.',
    soon: true,
  },
  {
    img: crowdpoolingPng,
    router: '',
    name: 'Crowdpooling',
    txt: 'Get parity tokens with community-built pool mechanism.',
    soon: true,
  },
]

const footerItems = [
  {
    title: 'Developer',
    links: [
      {
        label: 'Github',
        href: 'https://github.com/ICPExchange',
      },
    ],
  },
  {
    title: 'Community',
    links: [
      {
        label: 'Twitter',
        href: 'https://twitter.com/ICPExchange',
      },
      {
        label: 'Discord',
        href: 'https://discord.gg/ams722dsun',
      },
      {
        label: 'Telegram',
        href: 'https://t.me/icpexchange',
      },
      {
        label: 'Feedback',
        href: 'https://forms.gle/7iVKkM4H15enrcxNA',
      },
    ],
  },
  {
    title: 'Tools',
    links: [
      {
        label: 'Custom Tokens',
        href: '/createToken',
      },
      {
        label: 'Liquidity Pools',
        href: '/liquidPool',
      },
      {
        label: 'Dashboards',
        href: '/dashboard',
      },
    ],
  },
  {
    title: 'About',
    links: [
      {
        label: 'Medium',
        href: 'https://medium.com/@icpex',
      },
      {
        label: 'Document',
        href: 'https://docs.icpex.org',
      },
      {
        label: 'Media Kit',
        href: 'https://docs.icpex.org/resources/media-kit',
      },
    ],
  },
]
const Guide: FC = () => {
  const navigate = useNavigate()
  const handleClick = () => {
    navigate('/Exchange')
  }
  return (
    <div className={ styles.guide }>
      <Header />
      <div className={ styles.content }>
        <div className={ styles.entry } id="Home">
          <div className={ styles.introduction }>
            <div className={ styles['introduction-text'] }>
              Decentralized Finance Hub for Web3
            </div>
          </div>
          <Button type="primary" size="large" className={ styles.button } onClick={ handleClick }>Go to App</Button>
        </div>
        <div id="Intro" className={ styles.intro }>
          {
          features.map((item) => {
            const { title, desc, icon, direction } = item
            return (
              <div key={ title } className={ styles.feature }>
                {
                  direction === 'ltr'
                    ? <>
                      <div className={ styles.w700 }>
                        <div className={ styles.title }>{ title }</div>
                        <div>{ desc }</div>
                      </div>
                      <img src={ icon } alt="icon" />
                    </>
                    : <>
                      <img src={ icon } alt="icon" />
                      <div className={ styles.w700 }>
                        <div className={ styles.title }>{ title }</div>
                        <div>{ desc }</div>
                      </div>
                    </>
                }
              </div>
            )
          })
        }
        </div>
        <div className={ styles.secondTitle } id="Tools">
          Powerful Tools
        </div>
        <div className={ styles.tool }>
          {
            tools.map((item, index) => (
              <a rel="noopener noreferrer" href={ item.url } key={ index }>
                <div className={ classNames(styles['tool-item'], item.soon ? styles.soon : null) }>
                  <div className={ classNames(styles['tool-item-icon']) }>
                    <img src={ item.img } alt="icon" />
                  </div>
                  <div className={ styles['tool-item-title'] }>
                    { item.name }
                  </div>
                  <div className={ styles['tool-item-desc'] }>
                    { item.txt }
                  </div>
                </div>
              </a>
            ))
          }
        </div>
        <div className={ styles.secondTitle } id="Contact">
          Contact ICPEx
        </div>
        <div className={ styles.contactText }>
          Learn more about the ICPEx project, interact with the development team,
          participate in community discussions, and express your views on building the future of decentralized finance together.
        </div>
        <div className={ styles.platforms }>
          {
            sosocialPlatforms.map((item, index) => {
              return (
                <a target="_blank" rel="noopener noreferrer" key={ index } href={ item.src }>
                  <div className={ styles['platforms-item'] }>
                    <div className={ styles['platforms-image'] }>
                      <img src={ item.img } style={{ width: item.width }} alt="icon" />
                    </div>
                    { item.name }
                  </div>
                </a>
              )
            })
          }
        </div>
      </div>
      <div className={ styles.footer }>
        <div className={ styles['footer-content'] }>
          <div className={ styles['footer-content-left'] }>
            <img src={ logo2Png } alt="icon" />
            <div>
              <span>
                contact@icpex.org
              </span>
              <div className={ styles.line } />
              <div className={ styles.font18 }>
                COPYRIGHT © 2023 - 2024 ICPEx
              </div>
            </div>
          </div>
          <div className={ styles['footer-content-right'] }>
            {
              footerItems.map((item) => {
                const { title, links } = item
                return (
                  <div key={ title } className={ styles.category }>
                    <h3 className={ styles['category-title'] }>{ title }</h3>
                    <div className={ styles['category-links'] }>
                      {
                        links.map((link) => {
                          const { label, href } = link
                          return (
                            <div key={ label } className={ styles['category-links-item'] }>
                              <a target="_blank" rel="noopener noreferrer" href={ href }>
                                { label }
                              </a>
                            </div>
                          )
                        })
                      }
                    </div>
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default Guide
