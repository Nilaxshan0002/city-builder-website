import type { Kind } from './model'
export function Building({
  kind,
  variant = 0,
}: {
  kind: Kind | 'tree'
  variant?: number
}) {
  if (kind === 'tree' || kind === 'park')
    return (
      <g>
        <ellipse cy="4" rx="20" ry="9" fill="#609566" opacity=".22" />
        {(kind === 'park' ? [-13, 10] : [0]).map((x, i) => (
          <g key={x} transform={`translate(${x},${i * 5})`}>
            <path d="M0 0V-25" stroke="#8e7653" strokeWidth="4" />
            <path
              d="M-13-16 Q-22-38 0-49 Q21-40 13-17Z"
              fill={i ? '#528e69' : '#6eab7a'}
            />
            <path d="M0-49 Q21-40 13-17L0-13Z" fill="#498b65" />
          </g>
        ))}
        {kind === 'park' && (
          <path d="M-18 6L18-11" stroke="#e1d2a5" strokeWidth="5" />
        )}
      </g>
    )
  if (kind === 'road')
    return (
      <g>
        <path d="M-26 0L0-13 26 0 0 13Z" fill="#aab7ad" />
        <path
          d="M-22 0L22 0"
          stroke="#e9e7cc"
          strokeWidth="1.3"
          strokeDasharray="5 4"
          transform="rotate(27)"
        />
      </g>
    )
  if (kind === 'solar')
    return (
      <g>
        <path d="M0 1V-14M15-7V-22" stroke="#6b7c7d" strokeWidth="3" />
        <path
          d="M-24-24L5-38 25-25-4-10Z"
          fill="#567e9b"
          stroke="#d2e4e5"
          strokeWidth="2"
        />
        <path
          d="M-14-28L7-15M-4-33L17-20M-15-17L15-31"
          stroke="#a4c8d5"
          strokeWidth="1"
        />
      </g>
    )
  if (kind === 'water')
    return (
      <g>
        <path
          d="M-13 1L-10-36M13 1L10-36M-12-5L12-28M12-5L-12-28"
          stroke="#8a9f93"
          strokeWidth="3"
        />
        <path d="M-17-54V-34Q0-22 17-34V-54Z" fill="#a4cece" />
        <ellipse cy="-54" rx="17" ry="8" fill="#d9eeea" />
        <path d="M0-62L19-54 0-47-19-54Z" fill="#79afb5" />
      </g>
    )
  const tall = kind === 'office' ? 73 : kind === 'apartment' ? 57 : 28
  const color =
    kind === 'office'
      ? '#b1d2d9'
      : kind === 'apartment'
        ? '#e5c58e'
        : kind === 'shop'
          ? '#ebaa90'
          : variant % 2
            ? '#f0d9b0'
            : '#f4e5cb'
  return (
    <g className="building">
      <path
        d="M-21 2L0 13 27-1 5-12Z"
        fill="#446b56"
        opacity=".16"
        transform="translate(9,5)"
      />
      <path d={`M-19 0V${-tall}L0 ${-tall + 10}V10Z`} fill={color} />
      <path
        d={`M0 10V${-tall + 10}L22 ${-tall}V0Z`}
        fill={kind === 'office' ? '#7dabb9' : '#c7b18f'}
      />
      {kind === 'house' || kind === 'shop' ? (
        <>
          <path
            d={`M-25 ${-tall}L-5 ${-tall - 18} 25 ${-tall} 0 ${-tall + 13}Z`}
            fill={
              kind === 'shop' ? '#c96f5c' : variant % 2 ? '#779e9b' : '#dc926d'
            }
          />
          <path
            d={`M-5 ${-tall - 18}L25 ${-tall} 0 ${-tall + 13}Z`}
            fill={
              kind === 'shop' ? '#ae5c4d' : variant % 2 ? '#567c81' : '#bb745b'
            }
          />
          <path d="M-8 5V-10L-2-7V8Z" fill="#708c83" />
          {kind === 'shop' && (
            <path d="M-20-18L0-8V-2L-20-12Z" fill="#fff1d0" />
          )}
        </>
      ) : (
        <path
          d={`M-19 ${-tall}L2 ${-tall - 10} 22 ${-tall} 0 ${-tall + 10}Z`}
          fill={kind === 'office' ? '#dfebe6' : '#f5dfb9'}
        />
      )}
      {Array.from(
        {
          length:
            kind === 'house' || kind === 'shop' ? 1 : kind === 'office' ? 5 : 3,
        },
        (_, i) => (
          <g key={i} transform={`translate(0,${-i * 11})`}>
            <path
              d="M-15-17L-10-14V-8L-15-11ZM-7-13L-3-11V-5L-7-7Z"
              fill="#87b2b8"
            />
            <path
              d="M5-12L10-14V-8L5-6ZM14-16L18-18V-12L14-10Z"
              fill="#527d8b"
            />
          </g>
        ),
      )}
    </g>
  )
}
