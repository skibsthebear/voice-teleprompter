import { useEffect } from "react"
import { NavBar } from "./features/navbar/NavBar"
import { Content } from "./features/content/Content"
import { Login } from "./features/auth/Login"
import { useAppDispatch, useAppSelector } from "./app/hooks"
import {
  setupAuthListener,
  selectIsAuthenticated,
  selectIsInitialized,
} from "./features/auth/authSlice"

const App = () => {
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const isInitialized = useAppSelector(selectIsInitialized)

  // Setup auth state listener on mount
  useEffect(() => {
    const unsubscribe = setupAuthListener(dispatch)
    return () => unsubscribe()
  }, [dispatch])

  // Show loading while checking auth state
  if (!isInitialized) {
    return (
      <div className="hero is-fullheight has-background-black">
        <div className="hero-body">
          <div className="container has-text-centered">
            <p className="title has-text-white">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login />
  }

  // Show main app if authenticated
  return (
    <div className="app">
      <NavBar />
      <Content />
    </div>
  )
}

export default App
