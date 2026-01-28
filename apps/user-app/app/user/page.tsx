import React from 'react'
import { AuthStatusOverlay } from './auth-status-overlay'

const UserHome = () => {
  return (
    <div className="relative">
      <AuthStatusOverlay />
      <div>UserHome</div>
    </div>
  )
}

export default UserHome