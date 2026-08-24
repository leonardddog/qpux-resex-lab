import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(root, 'assets', 'thank-you.svg')
const OUT = join(root, 'assets', 'thank-you-wink.json')

const FR = 60
const OP = 240 // 4s loop
const EASE_OUT = { x: [0.33, 0.33], y: [0, 0] }
const EASE_IN = { x: [0.67, 0.67], y: [1, 1] }
// rotation is 1-dimensional -> single-element easing arrays
const ROT_EASE_OUT = { x: [0.37], y: [0] }
const ROT_EASE_IN = { x: [0.63], y: [1] }
// opacity is 1-dimensional -> single-element easing arrays
const OP_EASE_OUT = { x: [0.37], y: [0] }
const OP_EASE_IN = { x: [0.63], y: [1] }

// Eyes: the open dot-eye vector doubles as template for the left open eye;
// the arc vector is the "closed eye" shown during the blink.
const EYE_OPEN_D = 'M100.47 31.8792' // dot eye (right side, stays static)
const EYE_BLINK_D = 'M83.6434 36.3533' // arc eye (left side, blinks via swap)
// single blink per loop, ~550ms total @60fps
const BLINK_START = 90 // frame the eye begins closing
const CLOSE_FRAMES = 6
const CLOSED_FRAMES = 20
const OPEN_FRAMES = 7

function blinkOpacityKeys(startsOpen) {
  const openV = startsOpen ? 100 : 0
  const shutV = startsOpen ? 0 : 100
  const closeEnd = BLINK_START + CLOSE_FRAMES
  const openStart = closeEnd + CLOSED_FRAMES
  return [
    // NOTE: every non-hold keyframe MUST carry i/o easings - lottie-web 5.13
    // freezes evaluation at any keyframe missing them
    { t: 0, s: [openV], h: 1 },
    { t: BLINK_START, s: [openV], e: [shutV], i: OP_EASE_IN, o: OP_EASE_OUT },
    { t: closeEnd, s: [shutV], e: [shutV], i: OP_EASE_IN, o: OP_EASE_OUT },
    { t: openStart, s: [shutV], e: [openV], i: OP_EASE_IN, o: OP_EASE_OUT },
    { t: openStart + OPEN_FRAMES, s: [openV] },
  ]
}

// Hair strands sway around their attachment tip; prefixes are matched in
// document order and consecutive matching paths merge into one layer.
const STRANDS = [
  {
    name: 'hair-strand-left',
    prefixes: ['M72.8384 31.9193', 'M82.9146 29.9975'],
    anchorAt: 'bottom-right',
    amplitudeDeg: 2.5,
    invert: false,
  },
  {
    name: 'hair-strand-right',
    prefixes: ['M113.871 19.7181'],
    anchorAt: 'bottom-left',
    amplitudeDeg: 2.5,
    invert: true,
  },
]

function strandConfigFor(d) {
  return STRANDS.find((s) => s.prefixes.some((pre) => d.startsWith(pre))) ?? null
}

// ---------- SVG parsing ----------

function parsePaths(svg) {
  const paths = []
  const re = /<path\s+d="([^"]+)"\s+fill="([^"]+)"\s*\/>/g
  let m
  while ((m = re.exec(svg)) !== null) {
    paths.push({ d: m[1], fill: m[2] })
  }
  return paths
}

function parseColor(fill) {
  const named = { white: '#ffffff', black: '#000000' }
  const hex = named[fill?.trim()?.toLowerCase()] ?? fill
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) throw new Error(`Unsupported fill: ${fill}`)
  const int = parseInt(m[1], 16)
  return [((int >> 16) & 255) / 255, ((int >> 8) & 255) / 255, (int & 255) / 255]
}

// ---------- Path data parsing ----------

function tokenize(d) {
  return d.match(/[MLHVCSQTAZ]|-?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g) ?? []
}

function parseSubpaths(d) {
  const tokens = tokenize(d)
  let pos = 0

  const isNum = () => pos < tokens.length && /^[+-\d]/.test(tokens[pos])
  const nextNum = () => {
    const t = Number(tokens[pos++])
    if (Number.isNaN(t)) throw new Error('Expected number in path data')
    return t
  }
  const nextCmd = () => {
    while (pos < tokens.length && !/[A-Za-z]/.test(tokens[pos])) pos++
    return pos < tokens.length ? tokens[pos++] : null
  }

  const subpaths = []
  let cur = null
  let x = 0
  let y = 0
  let startX = 0
  let startY = 0
  let prevC2 = null
  let prevQ = null

  const startSubpath = (sx, sy) => {
    cur = { start: [sx, sy], segments: [], closed: false }
    subpaths.push(cur)
    x = startX = sx
    y = startY = sy
    prevC2 = prevQ = null
  }

  const line = (ex, ey) => {
    cur.segments.push({ c1: [x, y], c2: [ex, ey], to: [ex, ey] })
    x = ex
    y = ey
    prevC2 = prevQ = null
  }

  const cubic = (c1x, c1y, c2x, c2y, ex, ey) => {
    cur.segments.push({ c1: [c1x, c1y], c2: [c2x, c2y], to: [ex, ey] })
    prevC2 = [c2x, c2y]
    x = ex
    y = ey
  }

  while (true) {
    const raw = nextCmd()
    if (!raw) break
    const rel = raw === raw.toLowerCase()
    switch (raw.toUpperCase()) {
      case 'M': {
        let dx = nextNum()
        let dy = nextNum()
        if (rel) {
          dx += x
          dy += y
        }
        startSubpath(dx, dy)
        while (isNum()) {
          let lx = nextNum()
          let ly = nextNum()
          if (rel) {
            lx += x
            ly += y
          }
          line(lx, ly)
        }
        break
      }
      case 'L':
        do {
          let lx = nextNum()
          let ly = nextNum()
          if (rel) {
            lx += x
            ly += y
          }
          line(lx, ly)
        } while (isNum())
        break
      case 'H':
      case 'V':
        do {
          let val = nextNum()
          if (rel) val += raw.toUpperCase() === 'H' ? x : y
          const ex = raw.toUpperCase() === 'H' ? val : x
          const ey = raw.toUpperCase() === 'V' ? val : y
          line(ex, ey)
        } while (isNum())
        break
      case 'C':
        do {
          let c1x = nextNum()
          let c1y = nextNum()
          let c2x = nextNum()
          let c2y = nextNum()
          let ex = nextNum()
          let ey = nextNum()
          if (rel) {
            c1x += x; c1y += y; c2x += x; c2y += y; ex += x; ey += y
          }
          cubic(c1x, c1y, c2x, c2y, ex, ey)
        } while (isNum())
        break
      case 'S':
        do {
          let c2x = nextNum()
          let c2y = nextNum()
          let ex = nextNum()
          let ey = nextNum()
          if (rel) {
            c2x += x; c2y += y; ex += x; ey += y
          }
          const c1 = prevC2 ? [2 * x - prevC2[0], 2 * y - prevC2[1]] : [x, y]
          cubic(c1[0], c1[1], c2x, c2y, ex, ey)
        } while (isNum())
        break
      case 'Q':
      case 'T': {
        const reflect = raw.toUpperCase() === 'T'
        do {
          let qx
          let qy
          let ex
          let ey
          if (reflect) {
            ex = nextNum()
            ey = nextNum()
            if (rel) {
              ex += x
              ey += y
            }
          } else {
            qx = nextNum()
            qy = nextNum()
            ex = nextNum()
            ey = nextNum()
            if (rel) {
              qx += x; qy += y; ex += x; ey += y
            }
          }
          const q = reflect ? (prevQ ? [2 * x - prevQ[0], 2 * y - prevQ[1]] : [x, y]) : [qx, qy]
          prevQ = q
          const c1 = [x + (2 / 3) * (q[0] - x), y + (2 / 3) * (q[1] - y)]
          const c2 = [ex + (2 / 3) * (q[0] - ex), ey + (2 / 3) * (q[1] - ey)]
          cubic(c1[0], c1[1], c2[0], c2[1], ex, ey)
        } while (isNum())
        break
      }
      case 'A':
        throw new Error('Arc (A) commands are not supported')
      case 'Z':
        if (cur) {
          cur.closed = true
          x = startX
          y = startY
          prevC2 = prevQ = null
        }
        break
      default:
        throw new Error(`Unsupported command: ${raw}`)
    }
  }
  return subpaths
}

// ---------- Lottie shape building ----------

function subpathShape(sp) {
  const segs = sp.segments
  if (segs.length === 0) return null
  const n = segs.length
  const v = []
  const tin = []
  const tout = []

  // Vertex i is the origin of segment i (plus one trailing endpoint for
  // open subpaths). In/out tangents are stored relative to each vertex;
  // closed subpaths wrap the first vertex's in-tangent from the last segment.
  const count = sp.closed ? n : n + 1
  for (let i = 0; i < count; i++) {
    const from = i === n ? segs[n - 1].to : i === 0 ? sp.start : segs[i - 1].to
    v.push([...from])
    const outSeg = i < n ? segs[i] : null
    tout.push(outSeg ? [outSeg.c1[0] - from[0], outSeg.c1[1] - from[1]] : [0, 0])
    if (i === 0 && !sp.closed) {
      tin.push([0, 0])
    } else {
      const inSeg = segs[(i - 1 + n) % n]
      tin.push([inSeg.c2[0] - from[0], inSeg.c2[1] - from[1]])
    }
  }

  return { ty: 'sh', ks: { a: 0, k: { c: !!sp.closed, v, i: tin, o: tout } } }
}

function bboxOf(subpaths) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  const add = ([px, py]) => {
    minX = Math.min(minX, px); maxX = Math.max(maxX, px)
    minY = Math.min(minY, py); maxY = Math.max(maxY, py)
  }
  for (const sp of subpaths) {
    add(sp.start)
    for (const s of sp.segments) {
      add(s.c1); add(s.c2); add(s.to)
    }
  }
  return { minX, minY, maxX, maxY }
}

// ---------- Lottie composition ----------

function groupPaths(paths) {
  const groups = []
  for (const p of paths) {
    let cfg = strandConfigFor(p.d)
    if (!cfg && p.d.startsWith(EYE_BLINK_D)) cfg = { type: 'eye-blink' }
    const last = groups[groups.length - 1]
    if (cfg && last && last.cfg === cfg) {
      last.paths.push(p)
    } else {
      groups.push({ cfg, paths: [p] })
    }
  }
  return groups
}

function rotationKeys(cfg) {
  const a = cfg.invert ? -cfg.amplitudeDeg : cfg.amplitudeDeg
  const b = -a
  return [
    { t: 0, s: [a], e: [b], i: ROT_EASE_IN, o: ROT_EASE_OUT },
    { t: OP / 2, s: [b], e: [a], i: ROT_EASE_OUT, o: ROT_EASE_IN },
    { t: OP, s: [a] },
  ]
}

function shapeGroup(path) {
  const shapes = parseSubpaths(path.d).map(subpathShape).filter(Boolean)
  if (shapes.length === 0) return null
  return {
    ty: 'gr',
    nm: 'group',
    it: [
      ...shapes,
      { ty: 'fl', nm: 'fill', c: { a: 0, k: parseColor(path.fill) }, o: { a: 0, k: 100 } },
      {
        ty: 'tr',
        p: { a: 0, k: [0, 0] },
        a: { a: 0, k: [0, 0] },
        s: { a: 0, k: [100, 100] },
        r: { a: 0, k: 0 },
        o: { a: 0, k: 100 },
      },
    ],
  }
}

function centerOf(bb) {
  return [(bb.minX + bb.maxX) / 2, (bb.minY + bb.maxY) / 2]
}

function translateSubpaths(subpaths, dx, dy) {
  const mv = ([x, y]) => [x + dx, y + dy]
  return subpaths.map((sp) => ({
    start: mv(sp.start),
    closed: sp.closed,
    segments: sp.segments.map((s) => ({ c1: mv(s.c1), c2: mv(s.c2), to: mv(s.to) })),
  }))
}

// The left (viewer) eye blinks by swapping between two vectors instead of
// deforming one shape: a translated clone of the open dot-eye is shown while
// idle, and the arc "closed eye" vector from the artwork flashes on during
// blink windows. Hold-stepped opacity keeps them strictly complementary.
function buildEyeLayers(eyeCtx, docIndex) {
  const { dotSrc, arcSrc } = eyeCtx
  const dotSubs = parseSubpaths(dotSrc.d)
  const arcSubs = parseSubpaths(arcSrc.d)
  const [dcx, dcy] = centerOf(bboxOf(dotSubs))
  const [acx, acy] = centerOf(bboxOf(arcSubs))
  const dx = acx - dcx
  const dy = acy - dcy
  console.log(`Left-eye layers at arc center (${acx.toFixed(1)}, ${acy.toFixed(1)}); open-eye clone offset (${dx.toFixed(1)}, ${dy.toFixed(1)})`)

  const openShapes = translateSubpaths(dotSubs, dx, dy).map(subpathShape).filter(Boolean)
  const blinkShapes = arcSubs.map(subpathShape).filter(Boolean)

  const mkLayer = (nm, shapes, opacityKeys) => ({
    ddd: 0,
    ind: docIndex + 1,
    ty: 4,
    nm,
    sr: 1,
    ks: {
      o: { a: 1, k: opacityKeys },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [0, 0, 0] },
      a: { a: 0, k: [0, 0, 0] },
      s: { a: 0, k: [100, 100, 100] },
    },
    ao: 0,
    shapes: [
      {
        ty: 'gr',
        nm: 'group',
        it: [
          ...shapes,
          { ty: 'fl', nm: 'fill', c: { a: 0, k: parseColor(dotSrc.fill) }, o: { a: 0, k: 100 } },
          {
            ty: 'tr',
            p: { a: 0, k: [0, 0] },
            a: { a: 0, k: [0, 0] },
            s: { a: 0, k: [100, 100] },
            r: { a: 0, k: 0 },
            o: { a: 0, k: 100 },
          },
        ],
      },
    ],
    ip: 0,
    op: OP,
    st: 0,
    bm: 0,
  })

  return [
    mkLayer('eye-left-open', openShapes, blinkOpacityKeys(true)),
    mkLayer('eye-left-blink', blinkShapes, blinkOpacityKeys(false)),
  ]
}

function buildLayer(group, docIndex, eyeCtx) {
  const { cfg, paths } = group
  if (cfg?.type === 'eye-blink') {
    return buildEyeLayers(eyeCtx, docIndex)
  }

  const groups = paths.map(shapeGroup).filter(Boolean)
  if (groups.length === 0) return null

  let transform = {
    a: { a: 0, k: [0, 0, 0] },
    p: { a: 0, k: [0, 0, 0] },
    s: { a: 0, k: [100, 100, 100] },
  }
  let rotation = { a: 0, k: 0 }
  let name = `path-${docIndex + 1}`

  if (cfg) {
    const bb = bboxOf(paths.flatMap((p) => parseSubpaths(p.d)))
    const ax = cfg.anchorAt.endsWith('right') ? bb.maxX : bb.minX
    const ay = bb.maxY
    console.log(`Strand layer '${cfg.name}' anchored at (${ax.toFixed(1)}, ${ay.toFixed(1)}), ±${cfg.amplitudeDeg}°${cfg.invert ? ', phase-inverted' : ''}`)
    transform = {
      a: { a: 0, k: [ax, ay, 0] },
      p: { a: 0, k: [ax, ay, 0] },
      s: { a: 0, k: [100, 100, 100] },
    }
    rotation = { a: 1, k: rotationKeys(cfg) }
    name = cfg.name
  } else if (paths.length === 1 && paths[0].d.startsWith(EYE_OPEN_D)) {
    name = 'eye-right'
  }

  return {
    ddd: 0,
    ind: docIndex + 1,
    ty: 4,
    nm: name,
    sr: 1,
    ks: {
      o: { a: 0, k: 100 },
      r: rotation,
      ...transform,
    },
    ao: 0,
    shapes: groups,
    ip: 0,
    op: OP,
    st: 0,
    bm: 0,
  }
}

function buildComp(paths) {
  const dotSrc = paths.find((p) => p.d.startsWith(EYE_OPEN_D))
  const arcSrc = paths.find((p) => p.d.startsWith(EYE_BLINK_D))
  if (!dotSrc || !arcSrc) throw new Error('Eye template paths not found in SVG')

  // Lottie paints earlier layers on top -> reverse SVG document order
  const layers = groupPaths(paths)
    .flatMap((g, i) => buildLayer(g, i, { dotSrc, arcSrc }) ?? [])
    .reverse()
    .map((l, i) => ({ ...l, ind: i + 1 }))

  return {
    v: '5.7.4',
    fr: FR,
    ip: 0,
    op: OP,
    w: 244,
    h: 240,
    nm: 'thank-you-wink',
    ddd: 0,
    assets: [],
    layers,
  }
}

// ---------- main ----------

const svg = readFileSync(SRC, 'utf8')
const paths = parsePaths(svg)
console.log(`Parsed ${paths.length} paths from ${SRC}`)
if (paths.length === 0) throw new Error('No paths parsed - check SVG markup format')

const comp = buildComp(paths)
writeFileSync(OUT, JSON.stringify(comp))
console.log(`Wrote ${OUT} (${comp.layers.length} layers, ${(OP / FR).toFixed(1)}s @ ${FR}fps)`)
