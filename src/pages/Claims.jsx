import React, {
  useEffect,
  useState,
} from 'react'

import { supabase } from '../lib/supabase'

export default function Claims() {
  const [rows, setRows] = useState([])
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')

  // ============================================================
  // LOAD CLAIMS
  // ============================================================

  async function load() {
    const {
      data,
      error: loadError,
    } = await supabase
      .from('claim_details')
      .select('*')
      .order(
        'created_at',
        {
          ascending: false,
        },
      )

    if (loadError) {
      setError(
        loadError.message,
      )

      return
    }

    setError('')
    setRows(
      data || [],
    )
  }

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    load()
  }, [])

  // ============================================================
  // REVIEW CLAIM
  // ============================================================

  async function review(
    id,
    status,
  ) {
    setBusy(
      `${id}${status}`,
    )

    setError('')

    try {
      const {
        error: reviewError,
      } = await supabase.rpc(
        'admin_review_claim',
        {
          p_claim_id: id,
          p_status: status,
        },
      )

      if (reviewError) {
        throw reviewError
      }

      await load()

    } catch (err) {

      setError(
        err.message ||
          'Unable to review claim.',
      )

    } finally {

      setBusy('')
    }
  }

  return (
    <section>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="page-head">

        <div>

          <span className="eyebrow">
            OWNERSHIP VERIFICATION
          </span>

          <h1>
            Claims
          </h1>

          <p>
            Compare the match and review the claimant's private ownership proof.
          </p>

        </div>

        <button
          className="ghost"
          type="button"
          onClick={load}
        >
          Refresh
        </button>

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
          CLAIMS GRID
      ====================================================== */}

      <div className="claim-grid">

        {rows.map((claim) => (
          <article
            className="claim-detail"
            key={claim.id}
          >

            {/* ==================================================
                CLAIM HEADER
            ================================================== */}

            <div className="claim-head">

              <div>

                <span className="pill">
                  {claim.status}
                </span>

                <h3>
                  {claim.found_title ||
                    'Found item'}
                </h3>

                <p>
                  Claim #
                  {claim.id.slice(0, 8)}
                  {' · '}
                  Match{' '}

                  {claim.match_score
                    ? `${Math.round(
                        Number(
                          claim.match_score,
                        ),
                      )}%`
                    : '—'}
                </p>

              </div>

              {claim.claim_code && (
                <code>
                  {claim.claim_code}
                </code>
              )}

            </div>

            {/* ==================================================
                CLAIM FACTS
            ================================================== */}

            <div className="claim-facts">

              <div>

                <small>
                  LOST REPORT
                </small>

                <b>
                  {claim.lost_title ||
                    '—'}
                </b>

              </div>

              <div>

                <small>
                  FOUND REPORT
                </small>

                <b>
                  {claim.found_title ||
                    '—'}
                </b>

                <span>
                  {claim.found_location ||
                    ''}

                  {claim.found_date
                    ? ` · ${claim.found_date}`
                    : ''}
                </span>

              </div>

            </div>

            {/* ==================================================
                OWNERSHIP PROOF
            ================================================== */}

            <div className="proof">

              <small>
                CLAIMANT'S OWNERSHIP PROOF
              </small>

              <p>
                {claim.proof_text ||
                  'No proof supplied.'}
              </p>

            </div>

            {/* ==================================================
                PENDING ACTIONS
            ================================================== */}

            {claim.status ===
              'pending' && (

              <div className="actions">

                <button
                  type="button"
                  disabled={
                    Boolean(busy)
                  }
                  onClick={() =>
                    review(
                      claim.id,
                      'rejected',
                    )
                  }
                >
                  {busy ===
                  `${claim.id}rejected`
                    ? 'Rejecting...'
                    : 'Reject'}
                </button>

                <button
                  type="button"
                  className="primary"
                  disabled={
                    Boolean(busy)
                  }
                  onClick={() =>
                    review(
                      claim.id,
                      'approved',
                    )
                  }
                >
                  {busy ===
                  `${claim.id}approved`
                    ? 'Approving...'
                    : 'Approve & Issue QR'}
                </button>

              </div>
            )}

            {/* ==================================================
                APPROVED
            ================================================== */}

            {claim.status ===
              'approved' && (

              <div className="approved-note">

                Approved. Ask the client to open My Claims and present the QR code at release.

              </div>
            )}

            {/* ==================================================
                RELEASED
            ================================================== */}

            {claim.status ===
              'released' && (

              <div className="released-note">

                Released — both reports are now marked recovered.

              </div>
            )}

          </article>
        ))}

        {/* ====================================================
            EMPTY STATE
        ==================================================== */}

        {!rows.length &&
          !error && (

          <div className="empty">
            No claims yet.
          </div>
        )}

      </div>

    </section>
  )
}