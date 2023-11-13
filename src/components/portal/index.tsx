import type { ReactNode } from 'react'
import type React from 'react'
import ReactDOM from 'react-dom'

interface PortalProps {
  children: ReactNode
}

const Portal: React.FC<PortalProps> = ({ children }) => {
  const portalRoot = document.body

  return ReactDOM.createPortal(
    children,
    portalRoot,
  )
}

export default Portal
