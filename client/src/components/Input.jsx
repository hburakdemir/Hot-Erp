import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

// forwardRef: parent bilesenin bu input'a dogrudan ref atayabilmesini saglar
// ornegin otomatik focus veya form kutuphaneleri icin kullanislidir
const Input = forwardRef(function Input(
  { label, icon: Icon, error, type = 'text', className = '', wrapperClassName = '', hint, ...props },
  ref
) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword  = type === 'password'
  const inputType   = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className={`flex flex-col gap-0 ${wrapperClassName}`}>
      {label && (
        <label className="label-base" htmlFor={props.id || props.name}>
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
            <Icon size={16} strokeWidth={1.75} />
          </span>
        )}
        <input
          ref={ref}
          type={inputType}
          className={`
            input-base
            ${Icon ? 'pl-10' : ''}
            ${isPassword ? 'pr-11' : ''}
            ${error ? 'input-error' : ''}
            ${className}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-navy-700 transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Sifreyi gizle' : 'Sifreyi goster'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-red-500 shrink-0" />
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-xs text-zinc-400">{hint}</p>
      )}
    </div>
  )
})

export default Input
