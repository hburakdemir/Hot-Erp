import { Check } from 'lucide-react'

// Ozellestirilmis checkbox bileseni
// Neden native input gizlendi: tarayici farkliliklari nedeniyle tutarsiz gorunum
// sr-only sinifi ekran okuyucular icin gorsel olarak gizler ama erisebilir birakir
export default function Checkbox({ label, error, checked, onChange, name, id, children }) {
  const inputId = id || name
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="flex items-start gap-3 cursor-pointer group">
        <div className="relative shrink-0 mt-0.5">
          <input
            type="checkbox"
            id={inputId}
            name={name}
            checked={checked}
            onChange={onChange}
            className="sr-only peer"
          />
          <div className={`
            w-5 h-5 rounded-md border-2 flex items-center justify-center
            transition-all duration-150
            ${checked ? 'bg-navy-800 border-navy-800' : `bg-white ${error ? 'border-red-400' : 'border-navy-300 group-hover:border-navy-500'}`}
          `}>
            {checked && <Check size={11} strokeWidth={3} className="text-white" />}
          </div>
        </div>
        <span className="text-sm text-navy-700 leading-snug">{children || label}</span>
      </label>
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1 ml-8">
          <span className="inline-block w-1 h-1 rounded-full bg-red-500 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}
