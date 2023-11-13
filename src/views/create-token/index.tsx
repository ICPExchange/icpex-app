import React, { useRef } from 'react'
import Header from './components/Header'
import StepCreate from './components/StepCreate'
import List from './components/List'

const CreateToken = () => {
  const listRef = useRef<any>()

  const handleCreated = () => {
    listRef.current?.refreshToken()
    setTimeout(() => {
      listRef.current?.getList(2000)
    }, 1000)
  }

  return (
    <>
      <Header />
      <StepCreate onOk={ handleCreated } />
      <List propRef={ listRef } />
    </>
  )
}

export default CreateToken
