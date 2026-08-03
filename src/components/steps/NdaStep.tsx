import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { UIEvent } from 'react'
import { createPortal } from 'react-dom'
import { WuCheckbox, WuFormGroup, WuInput, WuLightbox } from '@npm-questionpro/wick-ui-lib'
import ndaAgreement from '../../../assets/nda-agreement.png'
import { NDA_SECTIONS } from '../../data/study'
import type { ParticipantDetails } from '../../types'

export function NdaPanel({
  details,
  onChange,
  agreed,
  onAgree,
  scrolledToEnd,
}: {
  details: ParticipantDetails
  onChange: (details: ParticipantDetails) => void
  agreed: boolean
  onAgree: (agreed: boolean) => void
  scrolledToEnd: boolean
}) {
  const set = (patch: Partial<ParticipantDetails>) => onChange({ ...details, ...patch })

  return (
    <>
      <p className="nda-panel-copy">
        Please review and accept the confidentiality agreement and enter your details below:
      </p>
      <div className="nda-panel-form">
        <WuFormGroup
          Label={<span className="nda-form-label">Name</span>}
          Input={
            <WuInput
              value={details.name}
              placeholder="Ada Lovelace"
              autoComplete="name"
              onChange={(e) => set({ name: e.currentTarget.value })}
              variant='outlined'
            />
          }
        />
        <WuFormGroup
          Label={<span className="nda-form-label">Email address</span>}
          Input={
            <WuInput
              type="email"
              value={details.email}
              placeholder="you@example.com"
              autoComplete="email"
              onChange={(e) => set({ email: e.currentTarget.value })}
              variant='outlined'
            />
          }
        />
      </div>
      <WuCheckbox
        className="nda-panel-check"
        checked={agreed}
        disabled={!scrolledToEnd}
        onChange={onAgree}
        Label="I have read and agree to the agreement, including its confidentiality terms."
      />
    </>
  )
}

function NdaDocument({ onScrolledToEnd }: { onScrolledToEnd: (scrolled: boolean) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const reachedRef = useRef(false)

  useLayoutEffect(() => {
    const el = scrollRef.current
    if (el && el.scrollHeight - el.scrollTop - el.clientHeight <= 2) {
      reachedRef.current = true
      onScrolledToEnd(true)
    }
  }, [onScrolledToEnd])

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    if (reachedRef.current) return
    const el = e.currentTarget
    if (el.scrollHeight - el.scrollTop - el.clientHeight <= 2) {
      reachedRef.current = true
      onScrolledToEnd(true)
    }
  }

  return (
    <div className="nda-a4-scroll" ref={scrollRef} onScroll={handleScroll}>
      <div className="nda-a4-page">
        <div className="nda-doc-letterhead">
          <div className="nda-doc-brand">
            <span className="nda-doc-logo">Q</span>
            <div>
              <div className="nda-doc-brand-name">QuestionPro Research</div>
              <div className="nda-doc-brand-sub">Usability Test Program</div>
            </div>
          </div>
          <span className="nda-doc-confid">Strictly Confidential</span>
        </div>

        <h1 className="nda-doc-title">Participant Non-Disclosure Agreement</h1>
        <p className="nda-doc-no">
          Document QPR-NDA-001 &nbsp;·&nbsp; Version 1.0 &nbsp;·&nbsp; Effective January 2026
        </p>

        <p className="nda-doc-intro">
          Thank you for participating in the <strong>QuestionPro Website Usability Study</strong>.
          Before we begin, please review the following confidentiality terms. By signing below you
          agree to protect the information you will be shown during this session.
        </p>

        {NDA_SECTIONS.map((section) => (
          <section className="nda-doc-section" key={section.heading}>
            <h2 className="nda-doc-sec-head">{section.heading}</h2>
            <p className="nda-doc-sec-body">{section.body}</p>
          </section>
        ))}

        <div className="nda-doc-accept">
          <strong>Acceptance.</strong> I confirm that I have read and understood the terms above, and
          I agree to keep all information shared during this session confidential. I also consent to
          being recorded for research purposes only.
        </div>

        <div className="nda-doc-sig-grid">
          <div className="nda-doc-sig-col">
            <div className="nda-doc-sig-cap">Participant</div>
            <div className="nda-doc-sig-line" />
            <div className="nda-doc-sig-name">Name &amp; signature</div>
          </div>
          <div className="nda-doc-sig-col">
            <div className="nda-doc-sig-cap">Date</div>
            <div className="nda-doc-sig-line" />
            <div className="nda-doc-sig-name">Date of agreement</div>
          </div>
        </div>

        <div className="nda-doc-foot">
          <span>QuestionPro Inc. — Confidential</span>
          <span>QPR-NDA-001</span>
        </div>
      </div>
    </div>
  )
}

export default function NdaStep({
  onScrolledToEnd,
}: {
  onScrolledToEnd: (scrolled: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  const hostRef = useRef<HTMLDivElement>(null)
  const [popupEl, setPopupEl] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    const t = window.setTimeout(() => setOpen(true), 700)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    onScrolledToEnd(false)
  }, [onScrolledToEnd])

  useLayoutEffect(() => {
    if (!open) return
    const host = hostRef.current?.closest<HTMLElement>('.split-right')
    if (!host) return

    let ro: ResizeObserver | undefined
    let resizeCleanup: (() => void) | undefined
    let popped = false

    const apply = (popup: HTMLElement, wrap: HTMLElement) => {
      const rect = host.getBoundingClientRect()
      Object.assign(wrap.style, {
        position: 'fixed',
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        overflow: 'hidden',
      })
      for (const el of wrap.querySelectorAll<HTMLElement>('[data-animation="lightbox"]')) {
        Object.assign(el.style, {
          position: 'absolute',
          inset: '0',
          width: '100%',
          height: '100%',
        })
      }
      const overlay = Array.from(wrap.children).find(
        (el): el is HTMLElement =>
          el.tagName === 'DIV' &&
          el.getAttribute('role') === 'presentation' &&
          !el.hasAttribute('data-animation'),
      )
      if (overlay) {
        Object.assign(overlay.style, {
          position: 'absolute',
          inset: '0',
          pointerEvents: 'none',
        })
      }
      if (!popped) {
        popped = true
        ro = new ResizeObserver(apply.bind(null, popup, wrap))
        ro.observe(host)
        resizeCleanup = () => window.removeEventListener('resize', onWindowResize)
        window.addEventListener('resize', onWindowResize)
      }
    }
    const onWindowResize = () => {
      const popup = document.querySelector<HTMLDivElement>('[data-slot="wu-lightbox"]')
      if (popup?.parentElement) apply(popup, popup.parentElement)
    }

    const waitForPopup = () => {
      const popup = document.querySelector<HTMLDivElement>('[data-slot="wu-lightbox"]')
      if (popup?.parentElement) {
        setPopupEl(popup)
        apply(popup, popup.parentElement)
        return
      }
      rafId = requestAnimationFrame(waitForPopup)
    }
    let rafId = requestAnimationFrame(waitForPopup)

    return () => {
      cancelAnimationFrame(rafId)
      ro?.disconnect()
      resizeCleanup?.()
      setPopupEl(null)
    }
  }, [open])

  return (
    <div ref={hostRef} className="nda-lightbox-host">
      <WuLightbox
        open={open}
        onOpenChange={() => setOpen(true)}
        items={[{ src: ndaAgreement, type: 'image', name: 'Participant non-disclosure agreement' }]}
      />
      {popupEl && createPortal(<NdaDocument onScrolledToEnd={onScrolledToEnd} />, popupEl)}
    </div>
  )
}
