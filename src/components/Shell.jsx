import React from 'react'

import {
  NavLink,
  Outlet,
} from 'react-router-dom'

import {
  LayoutDashboard,
  FileSearch,
  BadgeCheck,
  LogOut,
  Link2,
  GitCompareArrows,
  QrCode,
} from 'lucide-react'

import { supabase } from '../lib/supabase'
import Swal from 'sweetalert2'

export default function Shell() {

  // ============================================================
  // LOGOUT WITH SWEETALERT
  // ============================================================

  async function handleLogout() {
    const result = await Swal.fire({
      title: 'Sign out?',
      text: 'You will need to sign in again to access the LostLink Admin Console.',
      icon: 'warning',

      showCancelButton: true,

      confirmButtonText: 'Yes, sign out',
      cancelButtonText: 'Cancel',

      reverseButtons: true,

      confirmButtonColor: '#486581',
      cancelButtonColor: '#94a3b8',

      background: '#ffffff',
      color: '#243b53',

      customClass: {
        popup: 'lostlink-swal',
        confirmButton: 'lostlink-swal-confirm',
        cancelButton: 'lostlink-swal-cancel',
      },
    })

    if (!result.isConfirmed) {
      return
    }

    try {

      const {
        error,
      } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      await Swal.fire({
        title: 'Signed out',
        text: 'You have been signed out successfully.',
        icon: 'success',

        timer: 1300,

        showConfirmButton: false,

        background: '#ffffff',
        color: '#243b53',
      })

    } catch (error) {

      await Swal.fire({
        title: 'Unable to sign out',
        text:
          error.message ||
          'Something went wrong. Please try again.',

        icon: 'error',

        confirmButtonText: 'OK',
        confirmButtonColor: '#486581',

        background: '#ffffff',
        color: '#243b53',
      })
    }
  }

  return (
    <div className="app-shell">

      {/* ========================================================
          SIDEBAR
      ======================================================== */}

      <aside className="sidebar">

        {/* ======================================================
            BRAND
        ====================================================== */}

        <div className="brand">

          <div className="brand-icon">
            <Link2 size={20} />
          </div>

          <div>

            <b>
              LostLink
            </b>

            <span>
              Admin Console
            </span>

          </div>

        </div>

        {/* ======================================================
            NAVIGATION
        ====================================================== */}

        <nav>

          {/* DASHBOARD */}

          <NavLink
            to="/"
            end
          >
            <LayoutDashboard
              size={18}
            />

            Dashboard
          </NavLink>

          {/* REPORTS */}

          <NavLink
            to="/reports"
          >
            <FileSearch
              size={18}
            />

            Reports
          </NavLink>

          {/* MATCHES */}

          <NavLink
            to="/matches"
          >
            <GitCompareArrows
              size={18}
            />

            Matches
          </NavLink>

          {/* CLAIMS */}

          <NavLink
            to="/claims"
          >
            <BadgeCheck
              size={18}
            />

            Claims
          </NavLink>

          {/* VERIFY QR */}

          <NavLink
            to="/qr-verification"
          >
            <QrCode
              size={18}
            />

            Verify QR
          </NavLink>

        </nav>

        {/* ======================================================
            LOGOUT
        ====================================================== */}

        <button
          type="button"
          className="logout"
          onClick={handleLogout}
        >
          <LogOut
            size={18}
          />

          Sign out
        </button>

      </aside>

      {/* ========================================================
          PAGE CONTENT
      ======================================================== */}

      <main>
        <Outlet />
      </main>

    </div>
  )
}