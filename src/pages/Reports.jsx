import React, {
  useEffect,
  useState,
} from 'react'

import { supabase } from '../lib/supabase'

export default function Reports() {
  const [rows, setRows] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // ============================================================
  // LOAD REPORTS
  // ============================================================

  async function load() {
    setLoading(true)
    setError('')

    let query = supabase
      .from('admin_report_details')
      .select(`
        id,
        user_id,
        title,
        report_type,
        category,
        brand,
        color,
        description,
        location_text,
        event_date,
        image_url,
        status,
        created_at,
        updated_at,
        reporter_name,
        reporter_email
      `)
      .order(
        'created_at',
        {
          ascending: false,
        },
      )

    if (filter !== 'all') {
      query = query.eq(
        'status',
        filter,
      )
    }

    const {
      data,
      error: loadError,
    } = await query

    if (loadError) {
      console.error(
        'Failed to load reports:',
        loadError,
      )

      setError(
        loadError.message ||
          'Unable to load reports.',
      )

      setRows([])
      setLoading(false)

      return
    }

    setRows(
      data || [],
    )

    setLoading(false)
  }

  // ============================================================
  // RELOAD WHEN FILTER CHANGES
  // ============================================================

  useEffect(() => {
    load()
  }, [filter])

  return (
    <section>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="page-head">

        <div>

          <span className="eyebrow">
            ITEMS
          </span>

          <h1>
            Reports
          </h1>

          <p>
            Track submissions from open report through recovery
            and identify who submitted each report.
          </p>

        </div>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
          }}
        >

          <select
            className="select"
            value={filter}
            onChange={(event) =>
              setFilter(
                event.target.value,
              )
            }
          >

            <option value="all">
              All statuses
            </option>

            <option value="open">
              Open
            </option>

            <option value="matched">
              Matched
            </option>

            <option value="claimed">
              Claimed
            </option>

            <option value="recovered">
              Recovered
            </option>

          </select>

          <button
            type="button"
            className="ghost"
            onClick={load}
            disabled={loading}
          >
            {loading
              ? 'Refreshing...'
              : 'Refresh'}
          </button>

        </div>

      </header>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="error-panel">
          {error}
        </div>
      )}

      {/* ======================================================
          REPORT TABLE
      ====================================================== */}

      <div className="table-card">

        {loading ? (

          <div className="empty">
            Loading reports...
          </div>

        ) : (

          <>
            <table>

              <thead>
                <tr>

                  <th>
                    Item
                  </th>

                  <th>
                    Reported By
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    Category
                  </th>

                  <th>
                    Location
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Status
                  </th>

                </tr>
              </thead>

              <tbody>

                {rows.map((report) => (

                  <tr
                    key={report.id}
                  >

                    {/* =========================================
                        ITEM
                    ========================================= */}

                    <td>

                      <b>
                        {report.title}
                      </b>

                      <small>

                        {[
                          report.brand,
                          report.color,
                        ]
                          .filter(Boolean)
                          .join(' · ') ||
                          'No brand/color information'}

                      </small>

                    </td>

                    {/* =========================================
                        REPORTED BY
                    ========================================= */}

                    <td>

                      <div
                        className="reporter-info"
                      >

                        <div
                          className="reporter-avatar"
                        >
                          {getInitials(
                            report.reporter_name,
                          )}
                        </div>

                        <div
                          className="reporter-details"
                        >

                          <b>
                            {report.reporter_name ||
                              'Unknown User'}
                          </b>

                          <small>
                            {report.reporter_email ||
                              'No email available'}
                          </small>

                        </div>

                      </div>

                    </td>

                    {/* =========================================
                        TYPE
                    ========================================= */}

                    <td>

                      <span
                        className={
                          `pill ${report.report_type}`
                        }
                      >
                        {
                          report.report_type
                        }
                      </span>

                    </td>

                    {/* =========================================
                        CATEGORY
                    ========================================= */}

                    <td>
                      {report.category ||
                        'Uncategorized'}
                    </td>

                    {/* =========================================
                        LOCATION
                    ========================================= */}

                    <td>
                      {report.location_text ||
                        '—'}
                    </td>

                    {/* =========================================
                        DATE
                    ========================================= */}

                    <td>
                      {formatDate(
                        report.event_date,
                      )}
                    </td>

                    {/* =========================================
                        STATUS
                    ========================================= */}

                    <td>

                      <span
                        className={
                          `status ${report.status}`
                        }
                      >
                        {
                          report.status
                        }
                      </span>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

            {/* ===============================================
                EMPTY STATE
            =============================================== */}

            {!rows.length &&
              !error && (

              <div className="empty">
                No reports yet.
              </div>
            )}
          </>
        )}

      </div>

    </section>
  )
}


// ============================================================
// REPORTER INITIALS
// ============================================================

function getInitials(name) {
  if (!name) {
    return '?'
  }

  const parts =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)

  if (!parts.length) {
    return '?'
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase()
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase()
}


// ============================================================
// DATE FORMAT
// ============================================================

function formatDate(date) {
  if (!date) {
    return '—'
  }

  return new Date(
    `${date}T00:00:00`,
  ).toLocaleDateString(
    undefined,
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    },
  )
}