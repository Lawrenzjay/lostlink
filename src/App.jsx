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
  const [state, setState] = useState({
    loading: true,
    session: null,
    isAdmin: false,
  })

  // ============================================================
  // RESOLVE CURRENT SESSION
  // ============================================================

  async function resolve(session) {
    // ----------------------------------------------------------
    // NO SESSION
    // ----------------------------------------------------------

    if (!session) {
      setState({
        loading: false,
        session: null,
        isAdmin: false,
      })

      return
    }

    // ----------------------------------------------------------
    // CHECK PROFILE ROLE
    // ----------------------------------------------------------

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

    // ----------------------------------------------------------
    // NOT ADMIN
    // ----------------------------------------------------------

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

    // ----------------------------------------------------------
    // VALID ADMIN
    // ----------------------------------------------------------

    setState({
      loading: false,
      session,
      isAdmin: true,
    })
  }

  // ============================================================
  // AUTH SESSION LISTENER
  // ============================================================

  useEffect(() => {
    let mounted = true

    // ----------------------------------------------------------
    // INITIAL SESSION
    // ----------------------------------------------------------

    supabase.auth
      .getSession()
      .then(
        ({
          data,
        }) => {
          if (mounted) {
            resolve(
              data.session,
            )
          }
        },
      )
      .catch((error) => {
        console.error(
          'Session error:',
          error,
        )

        if (mounted) {
          setState({
            loading: false,
            session: null,
            isAdmin: false,
          })
        }
      })

    // ----------------------------------------------------------
    // AUTH CHANGES
    // ----------------------------------------------------------

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
            if (mounted) {
              resolve(
                session,
              )
            }
          },
        )

    // ----------------------------------------------------------
    // CLEANUP
    // ----------------------------------------------------------

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
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

  // ============================================================
  // ADMIN CHECK
  // ============================================================

  const isAuthenticatedAdmin =
    Boolean(
      state.session &&
      state.isAdmin,
    )

  // ============================================================
  // ROUTES
  // ============================================================

  return (
    <Routes>

      {/* ======================================================
          LOGIN
      ====================================================== */}

      <Route
        path="/login"
        element={
          isAuthenticatedAdmin
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

      {/* ======================================================
          PROTECTED ADMIN AREA
      ====================================================== */}

      <Route
        element={
          isAuthenticatedAdmin
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

        {/* DASHBOARD */}

        <Route
          index
          element={
            <Dashboard />
          }
        />

        {/* REPORTS */}

        <Route
          path="reports"
          element={
            <Reports />
          }
        />

        {/* MATCHES */}

        <Route
          path="matches"
          element={
            <Matches />
          }
        />

        {/* CLAIMS */}

        <Route
          path="claims"
          element={
            <Claims />
          }
        />

        {/* VERIFY QR / RELEASE ITEM */}

        <Route
          path="qr-verification"
          element={
            <VerifyRelease />
          }
        />

        {/* OPTIONAL OLD ROUTE REDIRECT */}

        <Route
          path="verify"
          element={
            <Navigate
              to="/qr-verification"
              replace
            />
          }
        />

      </Route>

      {/* ======================================================
          UNKNOWN ROUTES
      ====================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to={
              isAuthenticatedAdmin
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