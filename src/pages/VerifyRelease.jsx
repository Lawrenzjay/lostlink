import React, {
  useEffect,
  useRef,
  useState,
} from 'react'

import { Html5QrcodeScanner } from 'html5-qrcode'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function VerifyRelease() {
  const navigate = useNavigate()

  const [code, setCode] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const scanned = useRef(false)
  const scannerRef = useRef(null)

  // ============================================================
  // VERIFY AND RELEASE CLAIM
  // ============================================================

  async function release(raw) {
    const value = String(
      raw || code,
    )
      .trim()
      .toUpperCase()

    if (!value) {
      setError(
        'Please scan or enter a claim code.',
      )
      return
    }

    if (busy) {
      return
    }

    setBusy(true)
    setError('')
    setResult(null)

    try {
      const {
        data,
        error: rpcError,
      } = await supabase.rpc(
        'admin_release_claim',
        {
          p_claim_code: value,
        },
      )

      if (rpcError) {
        throw rpcError
      }

      const releasedData =
        Array.isArray(data)
          ? data[0]
          : data

      setResult(
        releasedData || {
          claim_code: value,
        },
      )

      setCode(value)

    } catch (err) {
      console.error(
        'Verify release error:',
        err,
      )

      setError(
        err.message ||
          'Unable to verify and release this claim.',
      )

    } finally {
      setBusy(false)
    }
  }

  // ============================================================
  // QR SCANNER
  // ============================================================

  useEffect(() => {
    let scanner

    const timer =
      setTimeout(() => {
        try {
          scanner =
            new Html5QrcodeScanner(
              'qr-reader',
              {
                fps: 8,

                qrbox: {
                  width: 220,
                  height: 220,
                },

                rememberLastUsedCamera:
                  true,

                showTorchButtonIfSupported:
                  true,
              },
              false,
            )

          scannerRef.current =
            scanner

          scanner.render(
            (text) => {
              if (
                scanned.current
              ) {
                return
              }

              scanned.current =
                true

              const value =
                String(text)
                  .trim()
                  .toUpperCase()

              setCode(value)

              release(value)
                .finally(() => {
                  setTimeout(() => {
                    scanned.current =
                      false
                  }, 1500)
                })
            },

            () => {
              // Ignore normal frame scan errors
            },
          )

        } catch (err) {
          console.error(
            'QR scanner error:',
            err,
          )

          setError(
            'Unable to start the camera scanner. You can still enter the claim code manually.',
          )
        }
      }, 150)

    return () => {
      clearTimeout(timer)

      if (
        scannerRef.current
      ) {
        scannerRef.current
          .clear()
          .catch(() => {})

        scannerRef.current =
          null
      }
    }
  }, [])

  // ============================================================
  // UI
  // ============================================================

  return (
    <section className="verify-release-page">

      {/* ========================================================
          HEADER
      ======================================================== */}

      <header className="page-head">

        <div>
          <span className="eyebrow">
            ITEM RELEASE
          </span>

          <h1>
            Verify Claim QR
          </h1>

          <p>
            Scan the approved client's QR code,
            or enter the claim code manually.
          </p>
        </div>

        <button
          className="ghost"
          type="button"
          onClick={() =>
            navigate('/dashboard')
          }
        >
          ← Back to Dashboard
        </button>

      </header>

      {/* ========================================================
          MAIN GRID
      ======================================================== */}

      <div className="verify-grid">

        {/* ======================================================
            CAMERA
        ====================================================== */}

        <article className="panel verify-panel">

          <div className="verify-panel-head">

            <div className="verify-icon">
              <QrIcon />
            </div>

            <div>
              <h2>
                Camera Scanner
              </h2>

              <p>
                Scan the QR code shown by the approved claimant.
              </p>
            </div>

          </div>

          <div
            id="qr-reader"
            className="qr-reader-box"
          />

          <div className="scanner-help">
            Allow camera permission when your browser asks for access.
          </div>

        </article>

        {/* ======================================================
            MANUAL VERIFICATION
        ====================================================== */}

        <article className="panel verify-panel">

          <div className="verify-panel-head">

            <div className="verify-icon manual">
              <CodeIcon />
            </div>

            <div>
              <h2>
                Manual Verification
              </h2>

              <p>
                Enter the approved claim code if scanning is unavailable.
              </p>
            </div>

          </div>

          <label className="field-label">

            Claim Code

            <input
              value={code}
              onChange={(event) => {
                setCode(
                  event.target.value
                    .toUpperCase(),
                )

                setError('')
                setResult(null)
              }}
              placeholder="Example: A1B2C3D4E5F6"
              disabled={busy}
            />

          </label>

          <button
            className="primary verify-btn"
            type="button"
            disabled={
              busy ||
              !code.trim()
            }
            onClick={() =>
              release()
            }
          >
            {busy
              ? 'Verifying...'
              : 'Verify & Release Item'}
          </button>

          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="error-panel verify-message">

              <strong>
                Verification failed
              </strong>

              <p>
                {error}
              </p>

            </div>
          )}

          {/* ==================================================
              SUCCESS
          ================================================== */}

          {result && (
            <div className="success-panel verify-message">

              <div className="success-icon">
                ✓
              </div>

              <div>

                <b>
                  Release Complete
                </b>

                <p>
                  Claim{' '}
                  <strong>
                    {result.claim_code ||
                      code}
                  </strong>{' '}
                  was released successfully.
                  The match is resolved and the
                  related item reports are now
                  recovered.
                </p>

              </div>

            </div>
          )}

          {/* ==================================================
              INFORMATION
          ================================================== */}

          <div className="verification-note">

            <strong>
              Before releasing the item
            </strong>

            <p>
              Confirm that the person showing the QR code is physically present before completing the release.
            </p>

          </div>

        </article>

      </div>

    </section>
  )
}


// ============================================================
// QR ICON
// ============================================================

function QrIcon() {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="6"
        height="6"
      />

      <rect
        x="15"
        y="3"
        width="6"
        height="6"
      />

      <rect
        x="3"
        y="15"
        width="6"
        height="6"
      />

      <path d="M15 15h2v2" />
      <path d="M19 15h2v2" />
      <path d="M15 19h2v2" />
      <path d="M19 19h2" />
    </svg>
  )
}


// ============================================================
// CODE ICON
// ============================================================

function CodeIcon() {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m8 9-3 3 3 3" />
      <path d="m16 9 3 3-3 3" />
      <path d="m14 5-4 14" />
    </svg>
  )
}