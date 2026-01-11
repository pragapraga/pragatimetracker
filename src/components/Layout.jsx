import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Layout.css'

function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Failed to logout:', error)
    }
  }

  return (
    <div className={`layout ${collapsed ? 'sidebar-collapsed' : ''} ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
      {/* Mobile Header */}
      <header className="mobile-header">
        <button className="hamburger-btn" onClick={() => setMobileMenuOpen(true)}>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <h1>TimeTracker</h1>
        {user && (
          <img
            src={user.photoURL || '/default-avatar.png'}
            alt="Profile"
            className="mobile-avatar"
          />
        )}
      </header>

      {/* Overlay for mobile */}
      <div className="sidebar-overlay" onClick={closeMobileMenu}></div>

      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-title">TimeTracker</h1>
          <button
            className="collapse-btn desktop-only"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '\u276F' : '\u276E'}
          </button>
          <button className="close-btn mobile-only" onClick={closeMobileMenu}>
            &times;
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/"
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            onClick={closeMobileMenu}
          >
            <span className="nav-icon">&#128337;</span>
            <span className="nav-text">Time Slots</span>
          </NavLink>
          <NavLink
            to="/goals"
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            onClick={closeMobileMenu}
          >
            <span className="nav-icon">&#127919;</span>
            <span className="nav-text">Goals</span>
          </NavLink>
        </nav>

        {/* User Section */}
        {user && (
          <div className="sidebar-user">
            <div className="user-info">
              <img
                src={user.photoURL || '/default-avatar.png'}
                alt="Profile"
                className="user-avatar"
              />
              <div className="user-details">
                <span className="user-name">{user.displayName || 'User'}</span>
                <span className="user-email">{user.email}</span>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Logout">
              <span className="logout-icon">&#x2190;</span>
              <span className="nav-text">Logout</span>
            </button>
          </div>
        )}
      </aside>

      <div className="main-wrapper">
        <main className="main-content">
          <Outlet />
        </main>

        <footer className="footer">
          <p>TimeTracker - Track your time, achieve your goals</p>
        </footer>
      </div>
    </div>
  )
}

export default Layout
