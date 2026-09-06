import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Matches() {
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState(null)
  const [filter, setFilter] = useState('active')

  async function load() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('match_details')
      .select('*')
      .order('match_score', { ascending: false })

    if (error) {
      setError(error.message)
      setRows([])
    } else {
      setRows(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function archiveMatch(matchId) {
    const ok = window.confirm(
      'Archive this resolved match? The record will not be deleted.'
    )

    if (!ok) return

    setActionId(matchId)
    setError('')

    try {
      const { error } = await supabase
        .from('matches')
        .update({
          status: 'dismissed',
        })
        .eq('id', matchId)
        .eq('status', 'resolved')

      if (error) throw error

      await load()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Unable to archive match.')
    } finally {
      setActionId(null)
    }
  }

  async function restoreMatch(matchId) {
    const ok = window.confirm(
      'Restore this archived match to resolved records?'
    )

    if (!ok) return

    setActionId(matchId)
    setError('')

    try {
      const { error } = await supabase
        .from('matches')
        .update({
          status: 'resolved',
        })
        .eq('id', matchId)
        .eq('status', 'dismissed')

      if (error) throw error

      await load()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Unable to restore match.')
    } finally {
      setActionId(null)
    }
  }

  const activeRows = useMemo(
    () =>
      rows.filter((match) =>
        ['possible', 'claimed'].includes(match.match_status)
      ),
    [rows]
  )

  const resolvedRows = useMemo(
    () =>
      rows.filter(
        (match) => match.match_status === 'resolved'
      ),
    [rows]
  )

  const archivedRows = useMemo(
    () =>
      rows.filter(
        (match) => match.match_status === 'dismissed'
      ),
    [rows]
  )

  const visibleRows = useMemo(() => {
    if (filter === 'resolved') {
      return resolvedRows
    }

    if (filter === 'archived') {
      return archivedRows
    }

    return activeRows
  }, [
    filter,
    activeRows,
    resolvedRows,
    archivedRows,
  ])

  return (
    <section className="matches-page">

      <header className="page-head matches-head">
        <div>
          <span className="eyebrow">
            INTELLIGENT MATCHING
          </span>

          <h1>Matches</h1>

          <p>
            Review ranked lost and found pairs generated
            automatically by LostLink.
          </p>
        </div>

        <button
          className="ghost"
          onClick={load}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </header>

      {error && (
        <div className="error-panel">
          {error}
        </div>
      )}

      <div className="match-filter-bar">

        <button
          className={
            filter === 'active'
              ? 'match-filter active'
              : 'match-filter'
          }
          onClick={() => setFilter('active')}
        >
          Active
          <span>{activeRows.length}</span>
        </button>

        <button
          className={
            filter === 'resolved'
              ? 'match-filter active'
              : 'match-filter'
          }
          onClick={() => setFilter('resolved')}
        >
          Resolved
          <span>{resolvedRows.length}</span>
        </button>

        <button
          className={
            filter === 'archived'
              ? 'match-filter active'
              : 'match-filter'
          }
          onClick={() => setFilter('archived')}
        >
          Archived
          <span>{archivedRows.length}</span>
        </button>

      </div>

      {loading ? (
        <div className="match-loading">
          Loading matches...
        </div>
      ) : (
        <div className="match-grid">

          {visibleRows.map((m) => (
            <article
              className={`match-card match-card-${m.match_status}`}
              key={m.id}
            >

              <div className="match-top">

                <div>
                  <span className="eyebrow">
                    MATCH SCORE
                  </span>

                  <div className="score">
                    {Math.round(
                      Number(m.match_score || 0)
                    )}%
                  </div>
                </div>

                <div className="match-top-actions">

                  <span
                    className={`pill match-status-${m.match_status}`}
                  >
                    {formatStatus(m.match_status)}
                  </span>

                  {m.match_status === 'resolved' && (
                    <button
                      className="archive-btn"
                      disabled={actionId === m.id}
                      onClick={() =>
                        archiveMatch(m.id)
                      }
                    >
                      {actionId === m.id
                        ? 'Archiving...'
                        : 'Archive'}
                    </button>
                  )}

                  {m.match_status === 'dismissed' && (
                    <button
                      className="restore-btn"
                      disabled={actionId === m.id}
                      onClick={() =>
                        restoreMatch(m.id)
                      }
                    >
                      {actionId === m.id
                        ? 'Restoring...'
                        : 'Restore'}
                    </button>
                  )}

                </div>

              </div>

              <div className="match-columns">

                <div className="match-item lost-item">

                  <small>LOST</small>

                  <h3>
                    {m.lost_title || 'Untitled item'}
                  </h3>

                  <p>
                    {m.lost_category || 'No category'}
                    {' · '}
                    {m.lost_brand || 'No brand'}
                    {' · '}
                    {m.lost_color || 'No color'}
                  </p>

                  <p>
                    📍 {m.lost_location || 'No location'}
                  </p>

                  <p>
                    📅 {formatDate(m.lost_date)}
                  </p>

                </div>

                <div className="match-item found-item">

                  <small>FOUND</small>

                  <h3>
                    {m.found_title || 'Untitled item'}
                  </h3>

                  <p>
                    {m.found_category || 'No category'}
                    {' · '}
                    {m.found_brand || 'No brand'}
                    {' · '}
                    {m.found_color || 'No color'}
                  </p>

                  <p>
                    📍 {m.found_location || 'No location'}
                  </p>

                  <p>
                    📅 {formatDate(m.found_date)}
                  </p>

                </div>

              </div>

              <div className="score-breakdown">

                <span>
                  Category{' '}
                  {Math.round(
                    Number(m.category_score || 0)
                  )}
                  /25
                </span>

                <span>
                  Brand{' '}
                  {Math.round(
                    Number(m.brand_score || 0)
                  )}
                  /15
                </span>

                <span>
                  Color{' '}
                  {Math.round(
                    Number(m.color_score || 0)
                  )}
                  /15
                </span>

                <span>
                  Location{' '}
                  {Math.round(
                    Number(m.location_score || 0)
                  )}
                  /15
                </span>

                <span>
                  Date{' '}
                  {Math.round(
                    Number(m.date_score || 0)
                  )}
                  /10
                </span>

                <span>
                  Description{' '}
                  {Math.round(
                    Number(m.description_score || 0)
                  )}
                  /20
                </span>

              </div>

              {m.match_status === 'resolved' && (
                <div className="resolved-note">
                  ✓ This match has been successfully resolved.
                  You can archive it to keep the active records clean.
                </div>
              )}

              {m.match_status === 'dismissed' && (
                <div className="archived-note">
                  This match is archived. The record is still
                  stored in LostLink.
                </div>
              )}

            </article>
          ))}

          {!visibleRows.length && !error && (
            <div className="empty match-empty">

              {filter === 'active' &&
                'No active matches right now.'}

              {filter === 'resolved' &&
                'No resolved matches yet.'}

              {filter === 'archived' &&
                'No archived match records.'}

            </div>
          )}

        </div>
      )}

    </section>
  )
}

function formatDate(value) {
  if (!value) return 'No date'

  return new Date(`${value}T00:00:00`)
    .toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
}

function formatStatus(status) {
  if (!status) return 'Unknown'

  if (status === 'dismissed') {
    return 'Archived'
  }

  return status
    .charAt(0)
    .toUpperCase() +
    status.slice(1)
}
