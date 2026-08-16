import type { Sexo } from '../types/player'

type GenderIconProps = {
  sexo: Sexo
  className?: string
}

export function GenderIcon({ sexo, className = 'size-3.5' }: GenderIconProps) {
  if (sexo === 'feminino') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        className={`${className} text-pink-500`}
      >
        <circle cx="12" cy="9" r="5" stroke="currentColor" strokeWidth="2.25" />
        <path
          d="M12 14v7M9 18h6"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={`${className} text-blue-500`}
    >
      <circle cx="10" cy="14" r="5" stroke="currentColor" strokeWidth="2.25" />
      <path
        d="M14 10l5.5-5.5M15 4.5h4.5V9"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
