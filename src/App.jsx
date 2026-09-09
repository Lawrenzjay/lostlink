import React, {
  useEffect,
  useState,
} from 'react'

import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'

import { supabase } from './lib/supabase'

import Shell from './components/Shell'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Reports from './pages/Reports'
import Matches from './pages/Matches'
import Claims from './pages/Claims'
import VerifyRelease from './pages/VerifyRelease'

export default function App() {
  const [state, setState] =
    useState({
      loading: true,
      session: null,
      isAdmin: false,
    })

  // ============================================================
  // CHECK SESSION + ADMIN ROLE
  // ============================================================

  async function resolve(session) {
    if (!session) {
      setState({
        loading: false,
        session: null,
        isAdmin: false,
      })

      return
    }

    const {
      data,
      error,
    } = await supabase
      .from('profiles')
      .select('role')
      .eq(
        'id',
        session.user.id,
      )
      .single()

    if (
      error ||
      data?.role !== 'admin'
    ) {
      await supabase.auth.signOut()

      setState({
        loading: false,
        session: null,
        isAdmin: false,
      })

      return
    }

    setState({
      loading: false,
      session,
      isAdmin: true,
    })
  }

  // ============================================================
  // AUTH LISTENER
  // ============================================================

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(
        ({
          data,
        }) => {
          resolve(
            data.session,
          )
        },
      )

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth
        .onAuthStateChange(
          (
            _event,
            session,
          ) => {
            resolve(
              session,
            )
          },
        )

    return () =>
      subscription.unsubscribe()
  }, [])

  // ============================================================
  // LOADING
  // ============================================================

  if (state.loading) {
    return (
      <div className="center">
        Loading LostLink…
      </div>
    )
  }

  const ok =
    state.session &&
    state.isAdmin

  // ============================================================
  // ROUTES
  // ============================================================

  return (
    <Routes>

      {/* LOGIN */}

      <Route
        path="/login"
        element={
          ok
            ? (
              <Navigate
                to="/"
                replace
              />
            )
            : (
              <Login />
            )
        }
      />

      {/* ADMIN ROUTES */}

      <Route
        element={
          ok
            ? (
              <Shell />
            )
            : (
              <Navigate
                to="/login"
                replace
              />
            )
        }
      >

        <Route
          path="/"
          element={
            <Dashboard />
          }
        />

        <Route
          path="/reports"
          element={
            <Reports />
          }
        />

        <Route
          path="/matches"
          element={
            <Matches />
          }
        />

        <Route
          path="/claims"
          element={
            <Claims />
          }
        />

        {/* QR VERIFICATION */}

        <Route
          path="/qr-verification"
          element={
            <VerifyRelease />
          }
        />

      </Route>

      {/* UNKNOWN ROUTE */}

      <Route
        path="*"
        element={
          <Navigate
            to={
              ok
                ? '/'
                : '/login'
            }
            replace
          />
        }
      />

    </Routes>
  )
}