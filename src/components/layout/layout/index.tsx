import type { FC } from 'react'
import React from 'react'
import { Route, Routes } from 'react-router-dom'
import LayoutHeader from '../header'
import Faucet from '../faucet'
import LayoutContent from '../content'
import { CreatePool, CreateToken, Exchange, LiquidPool, Wallet } from '@/views'

const NotFound = () => {
  return <div>404 - Page Not Found</div>
}
const Layout: FC = () => {
  return (
    <>
      <Faucet />
      <LayoutHeader />
      <LayoutContent>
        <Routes>
          <Route path="/exchange" element={ <Exchange /> } />
          <Route path="/createPool" element={ <CreatePool /> } />
          <Route path="/liquidPool" element={ <LiquidPool /> } />
          <Route path="/createToken" element={ <CreateToken /> } />
          <Route path="/wallet" element={ <Wallet /> } />
          <Route path="*" element={ <NotFound /> } />
        </Routes>
      </LayoutContent>
    </>
  )
}

export default Layout
