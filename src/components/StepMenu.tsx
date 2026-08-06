import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { STEP_MENU_ITEMS, type StepTarget } from '../lib/stepNav'

interface StepMenuProps {
  open: boolean
  onClose: () => void
  onSelect: (target: StepTarget) => void
}

export default function StepMenu({ open, onClose, onSelect }: StepMenuProps) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q
      ? STEP_MENU_ITEMS.filter((item) => item.label.toLowerCase().includes(q))
      : STEP_MENU_ITEMS
  }, [query])

  useEffect(() => {
    if (!open) return
    setQuery('')
    setActiveIndex(0)
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [open])

  useEffect(() => {
    setActiveIndex((i) => Math.min(i, Math.max(items.length - 1, 0)))
  }, [items.length])

  useEffect(() => {
    const el = listRef.current?.querySelector('[data-active="true"]')
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, items.length])

  if (!open) return null

  const choose = (target: StepTarget) => {
    onSelect(target)
    onClose()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, items.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      const item = items[activeIndex]
      if (item) choose(item.id)
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div
      className="step-menu-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="step-menu-panel" role="dialog" aria-label="Step navigation">
        <input
          ref={inputRef}
          className="step-menu-input"
          type="text"
          placeholder="Jump to a step…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {items.length > 0 ? (
          <ul className="step-menu-list" ref={listRef}>
            {items.map((item, index) => {
              const showGroup = index === 0 || items[index - 1].group !== item.group
              return (
                <Fragment key={item.id}>
                  {showGroup ? <li className="step-menu-group">{item.group}</li> : null}
                  <li
                    className="step-menu-item"
                    data-active={index === activeIndex}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => choose(item.id)}
                  >
                    {item.label}
                  </li>
                </Fragment>
              )
            })}
          </ul>
        ) : (
          <p className="step-menu-empty">No steps match “{query}”</p>
        )}
        <footer className="step-menu-footer">
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>esc Close</span>
        </footer>
      </div>
    </div>
  )
}
