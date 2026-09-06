import React, { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const [stats, setStats] = useState({
    lost: 0,
    found: 0,
    matches: 0,
    pending: 0,
    recovered: 0,
  })

  const [recentReports, setRecentReports] = useState([])
  const [matches, setMatches] = useState([])
  const [claims, setClaims] = useState([])

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [actionId, setActionId] = useState(null)
  const [error, setError] = useState('')

  const loadDashboard = useCallback(async (manual = false) => {
    if (manual) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    setError('')

    try {
      const [
        lostRes,
        foundRes,
        matchCountRes,
        pendingCountRes,
        recoveredRes,
        reportsRes,
        matchesRes,
        claimsRes,
      ] = await Promise.all([
        supabase
          .from('item_reports')
          .select('*', { count: 'exact', head: true })
          .eq('report_type', 'lost'),

        supabase
          .from('item_reports')
          .select('*', { count: 'exact', head: true })
          .eq('report_type', 'found'),

        supabase
          .from('matches')
          .select('*', { count: 'exact', head: true })
          .in('status', ['possible', 'claimed']),

        supabase
          .from('claims')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),

        supabase
          .from('item_reports')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'recovered'),

        supabase
          .from('item_reports')
          .select(`
            id,
            report_type,
            title,
            category,
            location_text,
            event_date,
            status,
            created_at
          `)
          .order('created_at', { ascending: false })
          .limit(5),

        supabase
          .from('match_details')
          .select('*')
          .in('match_status', ['possible', 'claimed'])
          .order('match_score', { ascending: false })
          .limit(3),

        supabase
          .from('claim_details')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(3),
      ])

      const responses = [
        lostRes,
        foundRes,
        matchCountRes,
        pendingCountRes,
        recoveredRes,
        reportsRes,
        matchesRes,
        claimsRes,
      ]

      const failed = responses.find((response) => response.error)

      if (failed?.error) {
        throw failed.error
      }

      setStats({
        lost: lostRes.count || 0,
        found: foundRes.count || 0,
        matches: matchCountRes.count || 0,
        pending: pendingCountRes.count || 0,
        recovered: recoveredRes.count || 0,
      })

      setRecentReports(reportsRes.data || [])
      setMatches(matchesRes.data || [])
      setClaims(claimsRes.data || [])
    } catch (err) {
      console.error('Dashboard load error:', err)
      setError(err.message || 'Unable to load dashboard.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  async function reviewClaim(claimId, status) {
    const message =
      status === 'approved'
        ? 'Approve this ownership claim?'
        : 'Reject this ownership claim?'

    if (!window.confirm(message)) return

    setActionId(claimId)
    setError('')

    try {
      const { error } = await supabase.rpc('admin_review_claim', {
        p_claim_id: claimId,
        p_status: status,
      })

      if (error) throw error

      await loadDashboard(true)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Unable to update claim.')
    } finally {
      setActionId(null)
    }
  }

  const openReports = stats.lost + stats.found

  if (loading) {
    return (
      <section className="center">
        <div className="dashboard-loader">
          <div className="loader-ring" />
          <strong>Loading LostLink</strong>
          <span>Preparing your dashboard...</span>
        </div>
      </section>
    )
  }

  return (
    <section className="dashboard-page">

      {/* ================= HEADER ================= */}

      <header className="page-head dashboard-head">
        <div>
          <span className="eyebrow">ADMIN OVERVIEW</span>

          <h1>Welcome back, Admin 👋</h1>

          <p>
            Here's what's happening with LostLink today.
          </p>
        </div>

        <button
          className="ghost refresh-button"
          disabled={refreshing}
          onClick={() => loadDashboard(true)}
        >
          <RefreshIcon spinning={refreshing} />

          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </header>

      {error && (
        <div className="error-panel">
          {error}
        </div>
      )}

      {/* ================= STATISTICS ================= */}

      <div className="stats five dashboard-stats">

        <StatCard
          title="Open Reports"
          value={openReports}
          icon={<DocumentIcon />}
          detail={`${stats.lost} lost • ${stats.found} found`}
          tone="green"
        />

        <StatCard
          title="Lost Reports"
          value={stats.lost}
          icon={<SearchIcon />}
          detail="Currently reported lost"
          tone="red"
        />

        <StatCard
          title="Possible Matches"
          value={stats.matches}
          icon={<LinkIcon />}
          detail="Awaiting verification"
          tone="green"
        />

        <StatCard
          title="Pending Claims"
          value={stats.pending}
          icon={<ClockIcon />}
          detail="Need admin review"
          tone="orange"
        />

        <StatCard
          title="Recovered"
          value={stats.recovered}
          icon={<CheckIcon />}
          detail="Successfully returned"
          tone="green"
        />

      </div>

      {/* ================= MAIN GRID ================= */}

      <div className="dashboard-content-grid">

        {/* RECENT REPORTS */}

        <article className="panel dashboard-panel reports-panel">

          <PanelHeader
            title="Recent Reports"
            subtitle="Latest lost and found submissions"
            action="View all"
            href="/reports"
          />

          {recentReports.length === 0 ? (
            <EmptyState
              title="No reports yet"
              text="Lost and found reports will appear here."
            />
          ) : (
            <div className="recent-report-list">

              {recentReports.map((report) => (
                <div
                  className="report-row"
                  key={report.id}
                >

                  <div className={`report-icon ${report.report_type}`}>
                    {report.report_type === 'lost'
                      ? <SearchIcon />
                      : <CheckIcon />}
                  </div>

                  <div className="report-main">
                    <strong>{report.title}</strong>

                    <small>
                      {report.category || 'Uncategorized'}
                      {' • '}
                      {report.location_text}
                    </small>
                  </div>

                  <div className="report-date">
                    <span>
                      {formatDate(report.event_date)}
                    </span>

                    <small>
                      {formatTime(report.created_at)}
                    </small>
                  </div>

                  <span className={`status ${report.status}`}>
                    {report.status}
                  </span>

                </div>
              ))}

            </div>
          )}

        </article>

        {/* POSSIBLE MATCHES */}

        <article className="panel dashboard-panel">

          <PanelHeader
            title="Possible Matches"
            subtitle="Top intelligent matches"
            action="View all"
            href="/matches"
          />

          {matches.length === 0 ? (
            <EmptyState
              title="No possible matches"
              text="LostLink will automatically show matching items here."
            />
          ) : (
            <div className="dashboard-match-list">

              {matches.map((match) => (
                <div
                  className="dashboard-match"
                  key={match.id}
                >

                  <div className="match-info">
                    <div className="match-mini-icon">
                      <LinkIcon />
                    </div>

                    <div>
                      <strong>
                        {match.lost_title || 'Lost item'}
                      </strong>

                      <small>
                        vs. {match.found_title || 'Found item'}
                      </small>

                      <small>
                        📍 {match.found_location}
                      </small>
                    </div>
                  </div>

                  <div className="match-score-box">
                    <strong>
                      {Math.round(
                        Number(match.match_score || 0)
                      )}%
                    </strong>

                    <span>
                      {matchLabel(match.match_score)}
                    </span>
                  </div>

                </div>
              ))}

            </div>
          )}

        </article>

      </div>

      {/* ================= CLAIMS + QR ================= */}

      <div className="dashboard-bottom-grid">

        {/* PENDING CLAIMS */}

        <article className="panel dashboard-panel">

          <PanelHeader
            title="Pending Claims"
            subtitle="Ownership claims needing review"
            action="View all"
            href="/claims"
          />

          {claims.length === 0 ? (
            <EmptyState
              title="No pending claims"
              text="You're all caught up."
            />
          ) : (
            <div className="dashboard-claims">

              {claims.map((claim) => (
                <div
                  className="dashboard-claim-row"
                  key={claim.id}
                >

                  <div>

                    <span className="pill">
                      Pending
                    </span>

                    <strong>
                      {claim.lost_title || 'Lost item'}
                    </strong>

                    <small>
                      Claim #{shortId(claim.id)}
                    </small>

                    <small>
                      Match score:{' '}
                      {Math.round(
                        Number(claim.match_score || 0)
                      )}%
                    </small>

                  </div>

                  <div className="actions">

                    <button
                      className="primary"
                      disabled={actionId === claim.id}
                      onClick={() =>
                        reviewClaim(claim.id, 'approved')
                      }
                    >
                      {actionId === claim.id
                        ? 'Working...'
                        : 'Approve'}
                    </button>

                    <button
                      className="reject-button"
                      disabled={actionId === claim.id}
                      onClick={() =>
                        reviewClaim(claim.id, 'rejected')
                      }
                    >
                      Reject
                    </button>

                  </div>

                </div>
              ))}

            </div>
          )}

        </article>

        {/* QR VERIFICATION */}

        <article className="panel dashboard-panel qr-dashboard-card">

          <div className="qr-dashboard-icon">
            <QrIcon />
          </div>

          <div>
            <span className="eyebrow">
              QR VERIFICATION
            </span>

            <h2>Verify & release item</h2>

            <p>
              Scan an approved claimant's QR code to verify
              ownership and complete the recovery process.
            </p>
          </div>

          <button
            className="primary qr-action"
            onClick={() => {
              window.location.href = '/qr-verification'
            }}
          >
            <QrIcon />
            Start Verification
          </button>

        </article>

      </div>


    </section>
  )
}


/* ======================================================
   COMPONENTS
====================================================== */

function StatCard({
  title,
  value,
  icon,
  detail,
  tone = 'green',
}) {
  return (
    <article className={`stat modern-stat ${tone}`}>

      <div className={`stat-icon ${tone}`}>
        {icon}
      </div>

      <div className="stat-content">

        <span>{title}</span>

        <strong>{value}</strong>

        <small>{detail}</small>

      </div>

    </article>
  )
}


function PanelHeader({
  title,
  subtitle,
  action,
  href,
}) {
  return (
    <div className="panel-header">

      <div>
        <h2>{title}</h2>

        {subtitle && (
          <p>{subtitle}</p>
        )}
      </div>

      {action && (
        <button
          className="panel-link"
          onClick={() => {
            if (href) {
              window.location.href = href
            }
          }}
        >
          {action}
          <span>→</span>
        </button>
      )}

    </div>
  )
}


function EmptyState({
  title,
  text,
}) {
  return (
    <div className="dashboard-empty">

      <div className="empty-icon">
        <SearchIcon />
      </div>

      <strong>{title}</strong>

      <p>{text}</p>

    </div>
  )
}


function FlowStep({
  number,
  title,
}) {
  return (
    <span className="flow-step">

      <b>{number}</b>

      {title}

    </span>
  )
}


/* ======================================================
   HELPERS
====================================================== */

function formatDate(date) {
  if (!date) return '—'

  return new Date(`${date}T00:00:00`)
    .toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
}


function formatTime(date) {
  if (!date) return ''

  return new Date(date)
    .toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
}


function shortId(id) {
  if (!id) return '—'

  return id
    .replaceAll('-', '')
    .slice(0, 8)
    .toUpperCase()
}


function matchLabel(score) {
  const value = Number(score || 0)

  if (value >= 90) {
    return 'High match'
  }

  if (value >= 75) {
    return 'Strong match'
  }

  if (value >= 60) {
    return 'Moderate match'
  }

  return 'Possible match'
}


/* ======================================================
   INLINE ICONS
====================================================== */

function IconBase({
  children,
  className = '',
}) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}


function DocumentIcon() {
  return (
    <IconBase>
      <path d="M6 2h8l4 4v16H6z" />
      <path d="M14 2v5h5" />
      <path d="M9 13h6" />
      <path d="M9 17h6" />
    </IconBase>
  )
}


function SearchIcon() {
  return (
    <IconBase>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </IconBase>
  )
}


function LinkIcon() {
  return (
    <IconBase>
      <path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.1 1" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.1-1" />
    </IconBase>
  )
}


function ClockIcon() {
  return (
    <IconBase>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </IconBase>
  )
}


function CheckIcon() {
  return (
    <IconBase>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 3 3 5-6" />
    </IconBase>
  )
}


function QrIcon() {
  return (
    <IconBase>
      <rect x="3" y="3" width="6" height="6" />
      <rect x="15" y="3" width="6" height="6" />
      <rect x="3" y="15" width="6" height="6" />
      <path d="M15 15h2v2" />
      <path d="M19 15h2v2" />
      <path d="M15 19h2v2" />
      <path d="M19 19h2" />
    </IconBase>
  )
}


function RefreshIcon({
  spinning,
}) {
  return (
    <IconBase
      className={
        spinning
          ? 'refresh-spin'
          : ''
      }
    >
      <path d="M20 6v5h-5" />
      <path d="M4 18v-5h5" />
      <path d="M18 9a7 7 0 0 0-11-3L4 9" />
      <path d="M6 15a7 7 0 0 0 11 3l3-3" />
    </IconBase>
  )
}