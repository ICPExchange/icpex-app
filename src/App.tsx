import { BrowserRouter, Route, Routes } from 'react-router-dom'
import React from 'react'
import { observer } from 'mobx-react'
import { Guide } from './views'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={ <Guide /> } />
      </Routes>
    </BrowserRouter>
  )
}

export default observer(App)
