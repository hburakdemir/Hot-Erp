import { ChevronDown } from 'lucide-react'

// Native select bileseni - ozellestirilmis gorunum
// Neden native select: erisebilirlik, mobil klavye destegi ve basit kullanim
// Alternatif: react-select veya radix-ui Select (daha zengin ozellik seti)
export default function Select({ label, icon: Icon, error, options = [], placeholder = 'Seciniz...', wrapperClassName = '', ...props }) {
  return (
    <div className={`flex flex-col ${wrapperClassName}`}>
      {label && (
        <label className="label-base" htmlFor={props.id || props.name}>{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none z-10">
            <Icon size={16} strokeWidth={1.75} />
          </span>
        )}
        <select
          className={`input-base appearance-none cursor-pointer ${Icon ? 'pl-10' : ''} pr-10 ${error ? 'input-error' : ''} ${!props.value ? 'text-zinc-400' : 'text-navy-900'}`}
          {...props}
        >
          <option value="" disabled hidden>{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
          <ChevronDown size={16} />
        </span>
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-red-500 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}
