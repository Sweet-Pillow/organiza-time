type StarRatingProps = {
  value: number
  onChange?: (value: 1 | 2 | 3 | 4 | 5) => void
  readOnly?: boolean
  size?: 'sm' | 'md'
}

export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = 'md',
}: StarRatingProps) {
  const textSize = size === 'sm' ? 'text-base' : 'text-2xl'

  return (
    <div className={`inline-flex gap-0.5 ${textSize}`} role="img" aria-label={`${value} de 5 estrelas`}>
      {([1, 2, 3, 4, 5] as const).map((star) => {
        const filled = star <= value
        if (readOnly) {
          return (
            <span
              key={star}
              className={filled ? 'text-amber-500' : 'text-stone-300'}
              aria-hidden
            >
              ★
            </span>
          )
        }

        return (
          <button
            key={star}
            type="button"
            className={`transition ${filled ? 'text-amber-500' : 'text-stone-300 hover:text-amber-400'}`}
            onClick={() => onChange?.(star)}
            aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
          >
            ★
          </button>
        )
      })}
    </div>
  )
}
