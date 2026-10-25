import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import {
  Building2,
  TreePine,
  House,
  Store,
  Landmark,
  Coins,
  Users,
  Smile,
  ArrowUpRight,
  ChevronRight,
  Plus,
  Minus,
  Sun,
  Moon,
  Play,
  Pause,
  RotateCcw,
  MousePointer2,
  Hammer,
  Eraser,
  Save,
  CircleHelp,
  Trophy,
  Leaf,
  Map,
  Menu,
  Check,
  Pencil,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Building } from '@/game/Building'
import {
  catalog,
  newCity,
  stats,
  citySchema,
  type City,
  type Kind,
} from '@/game/model'

export const Route = createFileRoute('/')({ component: Home })
const categories = [
  'All buildings',
  'Residential',
  'Commercial',
  'Nature',
  'Infrastructure',
]
const goals = [
  {
    title: 'A place to call home',
    text: 'Reach 600 residents',
    target: 600,
    reward: 1500,
  },
  {
    title: 'A greener tomorrow',
    text: 'Build 6 pocket parks',
    target: 6,
    reward: 1000,
  },
  {
    title: 'Small town, big dreams',
    text: 'Place 40 buildings',
    target: 40,
    reward: 2500,
  },
]
function Home() {
  const [city, setCity] = useState<City>(newCity)
  const [category, setCategory] = useState('All buildings')
  const [selected, setSelected] = useState<Kind | null>(null)
  const [tool, setTool] = useState<'build' | 'inspect' | 'erase'>('inspect')
  const [night, setNight] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [zoom, setZoom] = useState(1)
  const [panel, setPanel] = useState<'help' | 'stats' | 'goals' | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [muted, setMuted] = useState(true)
  const [mobile, setMobile] = useState(false)
  const [rename, setRename] = useState(false)
  const saveId = useRef('')
  const s = stats(city)
  useEffect(() => {
    let active = true
    let id: string
    try {
      id = localStorage.getItem('city-builder-save') || crypto.randomUUID()
      localStorage.setItem('city-builder-save', id)
    } catch {
      id = crypto.randomUUID()
      toast(
        'Browser storage is unavailable. This session’s save cannot be restored after closing the page.',
      )
    }
    saveId.current = id
    fetch(`/.netlify/functions/city?id=${id}`, {
      signal: AbortSignal.timeout(8000),
    })
      .then((r) => {
        if (!r.ok) throw Error()
        return r.json()
      })
      .then((data) => {
        if (active && data.state) {
          const parsed = citySchema.safeParse(data.state)
          if (parsed.success) setCity(parsed.data)
        }
      })
      .catch(() => {
        if (active)
          toast(
            'Cloud save is unavailable. You can still build and try saving later.',
          )
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])
  useEffect(() => {
    if (!speed || loading) return
    const timer = setInterval(
      () =>
        setCity((c) => ({
          ...c,
          day: c.day + 1,
          coins: c.coins + stats(c).income,
        })),
      20000 / speed,
    )
    return () => clearInterval(timer)
  }, [speed, loading])
  async function save() {
    setSaving(true)
    try {
      const r = await fetch(`/.netlify/functions/city?id=${saveId.current}`, {
        method: 'POST',
        signal: AbortSignal.timeout(10000),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(city),
      })
      if (!r.ok) throw Error()
      toast.success('Your little world is saved. See you soon!')
    } catch {
      toast.error('Could not save your city. Please try again.')
    } finally {
      setSaving(false)
    }
  }
  function clickTile(i: number) {
    if (loading) {
      toast('Your city is loading. Just a moment…')
      return
    }
    const tile = city.tiles[i]
    if (tool === 'inspect') {
      toast(
        tile === 'empty'
          ? 'An open plot. Pick a building below to start construction.'
          : tile === 'river'
            ? 'Willow River — a little room for nature.'
            : `${catalog.find((b) => b.kind === tile)?.name ?? 'Woodland'} · Plot ${i + 1}`,
      )
      return
    }
    if (tile === 'river') {
      toast.error('The river is protected. Choose a land tile.')
      return
    }
    if (tool === 'erase') {
      if (tile === 'empty') return
      setCity((c) => ({
        ...c,
        coins:
          c.coins +
          Math.floor((catalog.find((b) => b.kind === tile)?.cost ?? 0) * 0.5),
        tiles: c.tiles.map((t, j) => (i === j ? 'empty' : t)),
      }))
      return
    }
    if (!selected) return
    if (!['empty', 'tree'].includes(tile)) {
      toast.error('This plot is occupied. Clear it with the bulldozer first.')
      return
    }
    const b = catalog.find((b) => b.kind === selected)!
    if (city.coins < b.cost) {
      toast.error(
        'Not enough coins. Let your city earn income or choose a smaller building.',
      )
      return
    }
    setCity((c) => ({
      ...c,
      coins: c.coins - b.cost,
      tiles: c.tiles.map((t, j) => (i === j ? selected : t)),
    }))
    if (!muted) {
      try {
        const audio = new AudioContext()
        const oscillator = audio.createOscillator()
        const gain = audio.createGain()
        oscillator.connect(gain)
        gain.connect(audio.destination)
        gain.gain.setValueAtTime(0.04, audio.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.15)
        oscillator.frequency.value = 660
        oscillator.start()
        oscillator.stop(audio.currentTime + 0.15)
        oscillator.onended = () => audio.close()
      } catch {
        /* Audio support is optional */
      }
    }
  }
  function claim(i: number) {
    if (city.claimed.includes(i)) return
    setCity((c) => ({
      ...c,
      coins: c.coins + goals[i].reward,
      claimed: [...c.claimed, i],
    }))
    toast.success(
      `Milestone complete! +${goals[i].reward.toLocaleString()} coins`,
    )
  }
  const values = [s.population, s.parks, s.buildings]
  const icons = [Building2, House, Store, TreePine, Landmark]
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobile ? 'open' : ''}`}>
        <a className="brand" href="/" aria-label="City Builder home">
          <span className="brand-icon">
            <Building2 size={25} />
          </span>
          <span>
            city<span className="brand-light">builder</span>
            <small>YOUR WORLD. YOUR WAY.</small>
          </span>
        </a>
        <div className="workspace-label">YOUR PLAYGROUND</div>
        <nav>
          <button
            className="nav-item active"
            onClick={() => {
              setPanel(null)
              setMobile(false)
            }}
          >
            <Map size={19} /> My city <span className="nav-dot" />
          </button>
          <button className="nav-item" onClick={() => setPanel('stats')}>
            <Building2 size={19} /> City overview
          </button>
          <button className="nav-item" onClick={() => setPanel('goals')}>
            <Trophy size={19} /> Milestones{' '}
            <span className="pill">
              {goals.filter((_, i) => !city.claimed.includes(i)).length}
            </span>
          </button>
        </nav>
        <div className="sidebar-line" />
        <div className="workspace-label">MAKE SOMETHING GREAT</div>
        <div className="tip-illustration">
          <svg viewBox="-40 -65 80 85" aria-hidden="true">
            <Building kind="house" />
          </svg>
          <span>
            <TreePine size={30} />
          </span>
        </div>
        <h3>
          Big dreams.
          <br />
          Little beginnings.
        </h3>
        <p>
          Every great city starts with a single building. What’s next for yours?
        </p>
        <button className="text-link" onClick={() => setPanel('help')}>
          A little inspiration <ArrowUpRight size={15} />
        </button>
        <div className="sidebar-bottom">
          <button className="nav-item" onClick={() => setPanel('help')}>
            <CircleHelp size={19} /> How to play
          </button>
          <div className="profile">
            <span className="avatar">Y</span>
            <div>
              <strong>You, the visionary</strong>
              <small>Mayor of {city.name}</small>
            </div>
            <span className="online-dot" />
          </div>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-toggle icon-btn"
              onClick={() => setMobile(!mobile)}
              aria-label="Toggle navigation"
            >
              <Menu size={20} />
            </button>
            <span>Your playground</span>
            <ChevronRight size={14} />
            <strong>My city</strong>
          </div>
          <div className="top-actions">
            <span className="session-label">
              <span className="online-dot" /> A little world of your own
            </span>
            <button
              className="icon-btn"
              onClick={() => setPanel('help')}
              aria-label="Game help"
            >
              <CircleHelp size={20} />
            </button>
            <span className="avatar small">Y</span>
          </div>
        </header>
        <div className="page-content">
          <section className="heading-row">
            <div>
              <div className="eyebrow">LET’S BUILD SOMETHING BEAUTIFUL</div>
              <h1>
                A little city.<span> Endless possibilities.</span>
              </h1>
              <p>A home for your imagination. A world made by you.</p>
            </div>
            <button
              className="save-btn"
              onClick={save}
              disabled={saving || loading}
            >
              <Save size={16} />
              {saving ? 'Saving…' : 'Save city'}
            </button>
          </section>
          <section className="resource-bar" aria-label="City resources">
            <div className="city-name">
              <span className="city-icon">
                <Building2 size={23} />
              </span>
              <div>
                {rename ? (
                  <input
                    autoFocus
                    aria-label="City name"
                    maxLength={32}
                    value={city.name}
                    onChange={(e) =>
                      setCity((c) => ({ ...c, name: e.target.value }))
                    }
                    onBlur={() => {
                      setCity((c) => ({
                        ...c,
                        name: c.name.trim() || 'Willow Creek',
                      }))
                      setRename(false)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') e.currentTarget.blur()
                    }}
                  />
                ) : (
                  <button onClick={() => setRename(true)}>
                    {city.name}
                    <Pencil size={11} />
                  </button>
                )}
                <small>
                  Level {Math.floor(s.buildings / 10) + 1} ·{' '}
                  {s.buildings >= 40 ? 'Growing city' : 'Growing town'}
                </small>
              </div>
            </div>
            <div className="resource">
              <span className="stat-icon gold">
                <Coins size={21} />
              </span>
              <div>
                <small>City treasury</small>
                <strong>
                  {city.coins.toLocaleString()} <em>+{s.income}/day</em>
                </strong>
              </div>
            </div>
            <div className="resource">
              <span className="stat-icon blue">
                <Users size={21} />
              </span>
              <div>
                <small>Population</small>
                <strong>
                  {s.population.toLocaleString()} <em>residents</em>
                </strong>
              </div>
            </div>
            <div className="resource">
              <span className="stat-icon green">
                <Smile size={21} />
              </span>
              <div>
                <small>Happiness</small>
                <strong>
                  {s.happiness}%{' '}
                  <em>
                    {s.happiness > 80 ? 'Life is good!' : 'More parks help'}
                  </em>
                </strong>
              </div>
            </div>
          </section>
          <section
            className={`game-map ${night ? 'night' : ''}`}
            aria-label="Interactive city map"
          >
            <div className="map-heading">
              <span className="live-dot" /> {city.name}
              <span className="map-label">YOUR CITY, COMING TO LIFE</span>
            </div>
            <div className="weather">
              <Sun size={17} /> 24° <span>Clear skies</span>
            </div>
            <div className="cloud cloud-one" />
            <div className="cloud cloud-two" />
            <svg
              className="city-svg"
              viewBox="0 0 1000 580"
              role="group"
              aria-label="Isometric city. Select a building, then choose an empty plot."
            >
              <defs>
                <filter id="island-shadow">
                  <feDropShadow
                    dx="0"
                    dy="18"
                    stdDeviation="17"
                    floodColor="#466c5a"
                    floodOpacity=".16"
                  />
                </filter>
                <linearGradient id="water" x2="1" y2="1">
                  <stop stopColor="#84c4ca" />
                  <stop offset="1" stopColor="#acdcd9" />
                </linearGradient>
              </defs>
              <g transform={`translate(500 105) scale(${zoom}) translate(0 0)`}>
                <path
                  d="M-324 162L0 324 324 162V179L0 341-324 179Z"
                  fill="#a1b794"
                />
                <path d="M0 324L324 162V179L0 341Z" fill="#88a786" />
                <g filter="url(#island-shadow)">
                  {city.tiles.map((tile, i) => {
                    const x = i % 12,
                      y = Math.floor(i / 12),
                      px = (x - y) * 27,
                      py = (x + y) * 13.5
                    return (
                      <g
                        key={i}
                        transform={`translate(${px},${py})`}
                        className={`map-tile ${tool === 'build' && ['empty', 'tree'].includes(tile) ? 'buildable' : ''}`}
                        role="button"
                        tabIndex={0}
                        aria-label={`Plot ${i + 1}: ${tile}`}
                        onClick={() => clickTile(i)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            clickTile(i)
                          }
                        }}
                      >
                        <path
                          className="tile-ground"
                          d="M0 0L27 13.5 0 27-27 13.5Z"
                          fill={
                            tile === 'river'
                              ? 'url(#water)'
                              : (x + y) % 3 === 0
                                ? '#b4ce9b'
                                : '#bfd5a8'
                          }
                          stroke={tile === 'river' ? '#a2d3d2' : '#b2ca9a'}
                          strokeWidth=".7"
                        />
                        {tile === 'river' && (
                          <path
                            d="M-9 13L0 17 10 12M2 8L10 11"
                            fill="none"
                            stroke="#d1ece3"
                            strokeWidth="1.2"
                            opacity=".8"
                          />
                        )}
                        {tile !== 'empty' && tile !== 'river' && (
                          <g transform="translate(0 13.5)">
                            <Building kind={tile} variant={i} />
                          </g>
                        )}
                        {tile === 'empty' && (i * 7) % 13 === 0 && (
                          <path
                            d="M-4 13L-3 9M0 15L1 11M3 13L5 10"
                            stroke="#8caf7c"
                            strokeWidth="1.3"
                          />
                        )}
                      </g>
                    )
                  })}
                </g>
              </g>
              <g className="birds" stroke="#779f95" strokeWidth="2" fill="none">
                <path d="M175 154q7-7 14 0q7-7 14 0M207 136q5-5 10 0q5-5 10 0" />
              </g>
            </svg>
            {loading && (
              <div className="load-status">Connecting to your cloud save…</div>
            )}
            <div className="map-tip">
              <MousePointer2 size={15} />
              {tool === 'build'
                ? `Place ${catalog.find((b) => b.kind === selected)?.name.toLowerCase()} on an open plot`
                : tool === 'erase'
                  ? 'Choose a building to remove · 50% refund'
                  : 'A little planning. A lot of possibility.'}
            </div>
            <div className="map-tools">
              <button
                className={tool === 'inspect' ? 'chosen' : ''}
                onClick={() => setTool('inspect')}
                title="Inspect a plot"
                aria-label="Inspect a plot"
              >
                <MousePointer2 size={19} />
              </button>
              <button
                className={tool === 'erase' ? 'chosen' : ''}
                onClick={() => setTool('erase')}
                title="Bulldoze · 50% refund"
                aria-label="Bulldoze"
              >
                <Eraser size={19} />
              </button>
              <span />
              <button
                onClick={() => setZoom((z) => Math.min(1.35, z + 0.1))}
                aria-label="Zoom in"
              >
                <Plus size={19} />
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(0.65, z - 0.1))}
                aria-label="Zoom out"
              >
                <Minus size={19} />
              </button>
              <button onClick={() => setZoom(1)} aria-label="Reset view">
                <RotateCcw size={17} />
              </button>
            </div>
            <div className="map-bottom">
              <div className="time-controls">
                <button
                  onClick={() => setSpeed(speed ? 0 : 1)}
                  aria-label={speed ? 'Pause simulation' : 'Play simulation'}
                >
                  {speed ? <Pause size={13} /> : <Play size={13} />}
                </button>
                <button
                  className={speed === 1 ? 'selected-speed' : ''}
                  onClick={() => setSpeed(1)}
                >
                  1×
                </button>
                <button
                  className={speed === 3 ? 'selected-speed' : ''}
                  onClick={() => setSpeed(3)}
                >
                  3×
                </button>
                <span />
                <span>Day {city.day}</span>
                <span className="time-dot" />
                {speed ? 'City is growing' : 'Taking a breather'}
              </div>
              <div className="day-controls">
                <button
                  aria-label={muted ? 'Enable building sounds' : 'Mute sounds'}
                  onClick={() => setMuted(!muted)}
                >
                  {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <button
                  className={!night ? 'chosen' : ''}
                  onClick={() => setNight(false)}
                  aria-label="Day mode"
                >
                  <Sun size={16} />
                </button>
                <button
                  className={night ? 'chosen' : ''}
                  onClick={() => setNight(true)}
                  aria-label="Night mode"
                >
                  <Moon size={16} />
                </button>
              </div>
            </div>
          </section>
          <section className="build-section">
            <div className="section-title">
              <div>
                <h2>
                  Your next great addition{' '}
                  <span>Make room for something good.</span>
                </h2>
              </div>
              <span className="build-hint">
                <Hammer size={14} /> Select a building, then place it on the map
              </span>
            </div>
            <div className="category-tabs">
              {categories.map((c, i) => {
                const Icon = icons[i]
                return (
                  <button
                    key={c}
                    className={category === c ? 'active' : ''}
                    onClick={() => setCategory(c)}
                  >
                    <Icon size={15} />
                    {c}
                  </button>
                )
              })}
            </div>
            <div className="building-cards">
              {catalog
                .filter(
                  (b) =>
                    category === 'All buildings' || b.category === category,
                )
                .map((b) => (
                  <button
                    className={`building-card ${selected === b.kind && tool === 'build' ? 'selected' : ''}`}
                    key={b.kind}
                    onClick={() => {
                      setSelected(b.kind)
                      setTool('build')
                    }}
                    title={b.description}
                  >
                    <div
                      className="building-art"
                      style={{ background: `${b.color}22` }}
                    >
                      <svg viewBox="-52 -95 104 112">
                        <path d="M-36-1L0-19 36-1 0 17Z" fill="#c0d5a7" />
                        <g transform="translate(0 -2)">
                          <Building kind={b.kind} />
                        </g>
                      </svg>
                      <span className="add-building">
                        {selected === b.kind && tool === 'build' ? (
                          <Check size={12} />
                        ) : (
                          <Plus size={12} />
                        )}
                      </span>
                    </div>
                    <strong>{b.name}</strong>
                    <small>
                      <Coins size={12} />
                      {b.cost.toLocaleString()}
                      <span>
                        {b.people
                          ? `+${b.people} people`
                          : b.kind === 'park'
                            ? '+3 happiness'
                            : b.income
                              ? `+${b.income}/day`
                              : 'Connect your city'}
                      </span>
                    </small>
                  </button>
                ))}
            </div>
          </section>
          <section className="bottom-grid">
            <div className="milestone-preview">
              <span className="milestone-icon">
                <Trophy size={23} />
              </span>
              <div>
                <small>THE NEXT CHAPTER</small>
                <h3>
                  {goals.find((_, i) => !city.claimed.includes(i))?.title ??
                    'Look at you grow!'}
                </h3>
                <p>Good things grow, one small step at a time.</p>
              </div>
              <button onClick={() => setPanel('goals')}>
                View milestones <ArrowUpRight size={16} />
              </button>
            </div>
            <div className="green-note">
              <Leaf size={22} />
              <p>
                A happier city starts with a little more green.
                <br />
                <strong>Plant a park. Make someone’s day.</strong>
              </p>
            </div>
          </section>
          <footer>
            <span>Made for the joy of making.</span>
            <span>
              City Builder <span className="footer-dot">·</span> A little world,
              by you.
            </span>
          </footer>
        </div>
      </main>
      <Dialog
        open={panel !== null}
        onOpenChange={(open) => {
          if (!open) setPanel(null)
        }}
      >
        <DialogContent className="game-dialog">
          <DialogHeader>
            <DialogTitle>
              {panel === 'help'
                ? 'Your city starts here.'
                : panel === 'stats'
                  ? `${city.name}, at a glance`
                  : 'Little steps. Big milestones.'}
            </DialogTitle>
            <DialogDescription>
              {panel === 'help'
                ? 'No rush. No perfect plan. Just a little imagination.'
                : panel === 'stats'
                  ? 'A growing world, shaped by every choice you make.'
                  : 'Give your city something to work toward and collect coin rewards.'}
            </DialogDescription>
          </DialogHeader>
          {panel === 'help' ? (
            <div className="help-steps">
              <p>
                <b>01 · Pick your next addition</b>Browse the building
                collection. Houses add residents, shops earn coins, and parks
                improve happiness.
              </p>
              <p>
                <b>02 · Find its little corner</b>Click an open green plot to
                build. Use the eraser to remove buildings and recover half their
                cost. The river is protected.
              </p>
              <p>
                <b>03 · Watch your city grow</b>Every 20 seconds is a new day.
                Your buildings earn coins each day. Pause or speed up whenever
                you like.
              </p>
              <p>
                <b>04 · Keep your world</b>Use Save city to store progress in
                the cloud. Your save is linked to this browser, so keep its site
                data to return to your city.
              </p>
            </div>
          ) : panel === 'stats' ? (
            <div className="overview-grid">
              {[
                ['Residents', s.population],
                ['Buildings', s.buildings],
                ['Happiness', `${s.happiness}%`],
                ['Income / day', s.income],
                ['City parks', s.parks],
                ['Day', city.day],
              ].map(([label, value]) => (
                <div key={label}>
                  <small>{label}</small>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          ) : (
            <div className="goal-list">
              {goals.map((g, i) => (
                <div key={g.title}>
                  <Trophy size={22} />
                  <div>
                    <h3>{g.title}</h3>
                    <p>
                      {g.text} · {Math.min(values[i], g.target)}/{g.target}
                    </p>
                    <progress value={values[i]} max={g.target} />
                  </div>
                  <button
                    disabled={city.claimed.includes(i) || values[i] < g.target}
                    onClick={() => claim(i)}
                  >
                    {city.claimed.includes(i)
                      ? 'Collected'
                      : values[i] >= g.target
                        ? 'Collect reward'
                        : `+${g.reward.toLocaleString()}`}
                  </button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
