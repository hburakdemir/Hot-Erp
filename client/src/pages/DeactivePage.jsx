import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth.js'
import Button from '../components/Button.jsx'
import Card from '../components/Card.jsx'

export default function DeactivePage() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Çıkış yapıldı')
      navigate('/login')
    } catch {
      toast.error('Çıkış yapılamadı')
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-cream-100 dark:bg-navy-950 p-4">
      <Card className="max-w-md w-full p-8 dark:bg-navy-900 dark:border-red-950/40">
        <h1 className="font-display text-2xl text-navy-900 dark:text-white mb-2">Hesap pasif</h1>
        <p className="text-sm text-zinc-600 dark:text-red-100/80 leading-relaxed mb-6">
          {user?.firstName ? `${user.firstName}, ` : ''}
          topluluk yönetimi hesabınızı pasifleştirdi. Bu ekranın dışındaki alanlara ve API’lere erişiminiz kapatıldı.
          Sorularınız için topluluk iletişim kanallarını kullanabilirsiniz.
        </p>
        <Button type="button" className="w-full gap-2" onClick={handleLogout}>
          <LogOut size={18} />
          Çıkış yap
        </Button>
      </Card>
    </div>
  )
}
