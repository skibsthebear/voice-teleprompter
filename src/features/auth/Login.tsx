import { useState, FormEvent } from "react"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { login, clearError, selectIsLoading, selectError } from "./authSlice"

export const Login = () => {
  const dispatch = useAppDispatch()
  const isLoading = useAppSelector(selectIsLoading)
  const error = useAppSelector(selectError)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    dispatch(clearError())
    await dispatch(login({ email, password }))
  }

  return (
    <section className="hero is-fullheight has-background-black">
      <div className="hero-body">
        <div className="container">
          <div className="columns is-centered">
            <div className="column is-4">
              <div className="box">
                <h1 className="title has-text-centered">
                  Voice-Activated Teleprompter
                </h1>
                <p className="subtitle has-text-centered has-text-grey">
                  Please login to continue
                </p>

                <form onSubmit={handleSubmit}>
                  <div className="field">
                    <label className="label">Email</label>
                    <div className="control has-icons-left">
                      <input
                        className="input"
                        type="email"
                        placeholder="email@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                      <span className="icon is-small is-left">
                        <i className="fas fa-envelope"></i>
                      </span>
                    </div>
                  </div>

                  <div className="field">
                    <label className="label">Password</label>
                    <div className="control has-icons-left">
                      <input
                        className="input"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                      <span className="icon is-small is-left">
                        <i className="fas fa-lock"></i>
                      </span>
                    </div>
                  </div>

                  {error && (
                    <div className="notification is-danger is-light">
                      <button
                        className="delete"
                        onClick={() => dispatch(clearError())}
                        type="button"
                      ></button>
                      {error}
                    </div>
                  )}

                  <div className="field">
                    <div className="control">
                      <button
                        className={`button is-primary is-fullwidth ${isLoading ? "is-loading" : ""}`}
                        type="submit"
                        disabled={isLoading}
                      >
                        Login
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
