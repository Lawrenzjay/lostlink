import React, {
  useState,
} from 'react'

import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [error, setError] =
    useState('')

  async function submit(event) {
    event.preventDefault()

    setError('')

    const {
      error: loginError,
    } =
      await supabase.auth
        .signInWithPassword({
          email,
          password,
        })

    if (loginError) {
      setError(
        loginError.message,
      )
    }
  }

  return (
    <div className="login-wrap">

      <form
        className="login-card"
        onSubmit={submit}
      >

        <div className="eyebrow">
          LOSTLINK ADMIN
        </div>

        <h1>
          Welcome back
        </h1>

        <p>
          Manage reports, matches and ownership claims.
        </p>

        {/* EMAIL */}

        <label>
          Email

          <input
            value={email}
            onChange={(event) =>
              setEmail(
                event.target.value,
              )
            }
            type="email"
            required
          />
        </label>

        {/* PASSWORD */}

        <label>
          Password

          <input
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value,
              )
            }
            type="password"
            required
          />
        </label>

        {/* ERROR */}

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {/* SUBMIT */}

        <button
          className="primary"
          type="submit"
        >
          Sign in
        </button>

      </form>

    </div>
  )
}