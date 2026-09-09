import React, {
  useEffect,
  useState,
} from 'react'

import { supabase } from '../lib/supabase'

export default function Reports() {
  const [rows, setRows] = useState([])
  const [filter, setFilter] = useState('all')

  async function load() {
    let query = supabase
      .from('item_reports')
      .select(`
        id,
        title,
        report_type,
        category,
        brand,
        color,
        location_text,
        event_date,
        status,
        created_at
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
      error,
    } = await query

    if (error) {
      console.error(
        'Failed to load reports:',
        error,
      )

      setRows([])
      return
    }

    setRows(
      data || [],
    )
  }

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
            Track submissions from open report through recovery.
          </p>
        </div>

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

      </header>

      {/* ======================================================
          REPORT TABLE
      ====================================================== */}

      <div className="table-card">

        <table>

          <thead>
            <tr>
              <th>
                Item
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
                key={
                  report.id
                }
              >

                {/* ITEM */}

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
                      .join(' · ')}
                  </small>
                </td>

                {/* TYPE */}

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

                {/* CATEGORY */}

                <td>
                  {
                    report.category
                  }
                </td>

                {/* LOCATION */}

                <td>
                  {
                    report.location_text
                  }
                </td>

                {/* DATE */}

                <td>
                  {
                    report.event_date
                  }
                </td>

                {/* STATUS */}

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

        {/* EMPTY STATE */}

        {!rows.length && (
          <div className="empty">
            No reports yet.
          </div>
        )}

      </div>

    </section>
  )
}