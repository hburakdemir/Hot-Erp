import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext.jsx'

// AuthContext'e erisim icin yardimci hook
// Dogrudan useContext kullanmak yerine bu hook kullanilir cunku:
// 1. Context'in var olup olmadigini kontrol eder
// 2. AuthProvider disinda kullanilirsa anlamli bir hata verir
// 3. Gelecekte auth mantigi burada genisletilebilir
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth, AuthProvider icinde kullanilmalidir')
  }
  return context
}
