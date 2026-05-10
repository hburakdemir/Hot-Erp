const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

const DEMO_PASSWORD = 'Uyeler123!'

const PERMISSIONS = [
  { key: 'member.view', category: 'Uyeler', description: 'Üye listesini görüntüleme' },
  { key: 'member.create', category: 'Uyeler', description: 'Yeni üye oluşturma' },
  { key: 'member.update', category: 'Uyeler', description: 'Üye bilgilerini güncelleme' },
  { key: 'member.delete', category: 'Uyeler', description: 'Üye silme' },
  { key: 'role.view', category: 'Roller', description: 'Rolleri görüntüleme' },
  { key: 'role.create', category: 'Roller', description: 'Rol oluşturma' },
  { key: 'role.update', category: 'Roller', description: 'Rol ve izinleri güncelleme' },
  { key: 'role.delete', category: 'Roller', description: 'Rol silme' },
  { key: 'announcement.create', category: 'Duyuru', description: 'Duyuru oluşturma' },
  { key: 'task.manage', category: 'Görev', description: 'Görev yönetimi' },
  { key: 'inventory.manage', category: 'Envanter', description: 'Envanter yönetimi' },
  { key: 'audit.view', category: 'Denetim', description: 'Denetim kayıtlarını görüntüleme' },
]

const ALL_KEYS = PERMISSIONS.map((p) => p.key)

const COMMITTEE_PREFIX = [
  'Organizasyon Komitesi',
  'Kurumsal İletişim Komitesi',
  'Saha Etkinlikleri Komitesi',
  'Halka İlişkiler Komitesi',
  'Sosyal Aktiviteler Komitesi',
  'Medya ve Tasarım Komitesi',
]

/** @type {{ name: string, description: string, permissionKeys: string[] }[]} */
const ROLE_DEFINITIONS = [
  {
    name: 'Topluluk Başkanı',
    description: 'Topluluk genel yönetimi — tam yetki',
    permissionKeys: ALL_KEYS,
  },
  {
    name: 'Başkan Yardımcısı',
    description: 'Başkanın yardımcısı — rol silme hariç tam yetki',
    permissionKeys: ALL_KEYS.filter((k) => k !== 'role.delete'),
  },
  ...COMMITTEE_PREFIX.flatMap((prefix) => [
    {
      name: `${prefix} Direktörü`,
      description: `${prefix} direktörü`,
      permissionKeys: [
        'member.view',
        'member.update',
        'announcement.create',
        'task.manage',
        'inventory.manage',
      ],
    },
    {
      name: `${prefix} Koordinatörü`,
      description: `${prefix} koordinatörü`,
      permissionKeys: ['member.view', 'announcement.create', 'task.manage'],
    },
  ]),
  {
    name: 'Stajyer',
    description: 'Gözlem ve destek — salt okunur üye listesi',
    permissionKeys: ['member.view'],
  },
  {
    name: 'Üye',
    description: 'Standart topluluk üyesi',
    permissionKeys: ['member.view'],
  },
]

const FIRST_NAMES = [
  'Ayşe',
  'Mehmet',
  'Zeynep',
  'Can',
  'Elif',
  'Burak',
  'Selin',
  'Emre',
  'Deniz',
  'Cem',
  'Defne',
  'Kerem',
  'Melis',
  'Onur',
  'İpek',
  'Barış',
  'Sude',
  'Alp',
  'Yasin',
  'Nihan',
  'Ece',
  'Buğra',
  'Cansu',
  'Dilara',
  'Furkan',
  'Gizem',
  'Halil',
  'İrem',
  'Kaan',
  'Leyla',
  'Murat',
  'Nazlı',
  'Oğuz',
  'Pınar',
  'Rıza',
  'Seda',
  'Tolga',
  'Umut',
  'Vildan',
  'Yasin',
  'Zehra',
]

const LAST_NAMES = [
  'Yılmaz',
  'Kaya',
  'Demir',
  'Şahin',
  'Çelik',
  'Arslan',
  'Öztürk',
  'Aydın',
  'Koç',
  'Polat',
  'Yıldız',
  'Acar',
  'Aslan',
  'Erdoğan',
  'Kılıç',
  'Şimşek',
  'Türk',
  'Özdemir',
  'Karaca',
  'Yücel',
]

/** Fakülte ve örnek bölümler — Hacettepe */
const FACULTY_DEPARTMENTS = [
  { faculty: 'Mühendislik Fakültesi', departments: ['Bilgisayar Mühendisliği', 'Endüstri Mühendisliği', 'Elektrik-Elektronik Mühendisliği'] },
  { faculty: 'İktisadi ve İdari Bilimler Fakültesi', departments: ['İşletme', 'İktisat', 'Siyaset Bilimi ve Kamu Yönetimi'] },
  { faculty: 'Edebiyat Fakültesi', departments: ['Psikoloji', 'Sosyoloji', 'Tarih'] },
  { faculty: 'Tıp Fakültesi', departments: ['Tıp', 'Sağlık Bilimleri Enstitüsü'] },
  { faculty: 'Eczacılık Fakültesi', departments: ['Eczacılık'] },
  { faculty: 'Hukuk Fakültesi', departments: ['Hukuk'] },
  { faculty: 'İletişim Fakültesi', departments: ['Halkla İlişkiler ve Tanıtım', 'Radyo, Televizyon ve Sinema'] },
  { faculty: 'Eğitim Fakültesi', departments: ['Matematik Öğretmenliği', 'Türkçe Öğretmenliği'] },
  { faculty: 'Fen Fakültesi', departments: ['Matematik', 'Fizik', 'Kimya'] },
  { faculty: 'Spor Bilimleri Fakültesi', departments: ['Antrenörlük Eğitimi', 'Beden Eğitimi ve Spor Öğretmenliği'] },
]

const EMPLOYMENT_STATUSES = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'ON_LEAVE', 'PROBATION']

function avatarUrl(username) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`
}

function pickStudy(index) {
  const f = FACULTY_DEPARTMENTS[index % FACULTY_DEPARTMENTS.length]
  const dept = f.departments[index % f.departments.length]
  return { faculty: f.faculty, department: dept }
}

async function main() {
  console.log('Veritabanı tohumlanıyor (Hacettepe Topluluğu)...')

  const permissionRecords = []
  for (const p of PERMISSIONS) {
    const row = await prisma.permission.upsert({
      where: { key: p.key },
      update: { description: p.description, category: p.category },
      create: { key: p.key, description: p.description, category: p.category },
    })
    permissionRecords.push(row)
  }

  const keyToId = Object.fromEntries(permissionRecords.map((r) => [r.key, r.id]))

  const roles = []
  for (const def of ROLE_DEFINITIONS) {
    const role = await prisma.role.upsert({
      where: { name: def.name },
      update: { description: def.description },
      create: { name: def.name, description: def.description },
    })
    roles.push(role)

    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } })
    if (def.permissionKeys.length) {
      await prisma.rolePermission.createMany({
        data: def.permissionKeys.map((key) => ({
          roleId: role.id,
          permissionId: keyToId[key],
        })),
      })
    }
  }

  const baskanRole = roles.find((r) => r.name === 'Topluluk Başkanı')
  const hashedSuper = await bcrypt.hash('Baskan123!', 10)

  const superadminUser = await prisma.user.upsert({
    where: { username: 'topluluk.baskan' },
    update: {
      password: hashedSuper,
      firstName: 'Topluluk',
      lastName: 'Başkanı',
      university: 'Hacettepe Üniversitesi',
      faculty: 'Öğrenci Toplulukları',
      department: 'Yönetim',
      avatarUrl: avatarUrl('topluluk-baskan'),
      employmentStatus: 'ACTIVE',
      isActive: true,
      email: 'baskan@topluluk.hacettepe.edu.tr',
    },
    create: {
      email: 'baskan@topluluk.hacettepe.edu.tr',
      username: 'topluluk.baskan',
      password: hashedSuper,
      firstName: 'Topluluk',
      lastName: 'Başkanı',
      university: 'Hacettepe Üniversitesi',
      faculty: 'Öğrenci Toplulukları',
      department: 'Yönetim',
      avatarUrl: avatarUrl('topluluk-baskan'),
      employmentStatus: 'ACTIVE',
      isActive: true,
    },
  })

  await prisma.userRole.deleteMany({ where: { userId: superadminUser.id } })
  await prisma.userRole.create({
    data: { userId: superadminUser.id, roleId: baskanRole.id },
  })

  const hashedEmployee = await bcrypt.hash(DEMO_PASSWORD, 10)

  const assignRoles = roles.filter((r) => r.name !== 'Topluluk Başkanı')

  for (let i = 0; i < 52; i++) {
    const fn = FIRST_NAMES[i % FIRST_NAMES.length]
    const ln = LAST_NAMES[i % LAST_NAMES.length]
    const username = `uye_${String(i + 1).padStart(3, '0')}`
    const email = `${username}@stud.hacettepe.edu.tr`
    const { faculty, department } = pickStudy(i)
    const employmentStatus = EMPLOYMENT_STATUSES[i % EMPLOYMENT_STATUSES.length]
    const active = employmentStatus !== 'TERMINATED'

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        firstName: fn,
        lastName: ln,
        university: 'Hacettepe Üniversitesi',
        faculty,
        department,
        avatarUrl: avatarUrl(username),
        employmentStatus,
        isActive: active,
        password: hashedEmployee,
      },
      create: {
        email,
        username,
        password: hashedEmployee,
        firstName: fn,
        lastName: ln,
        university: 'Hacettepe Üniversitesi',
        faculty,
        department,
        avatarUrl: avatarUrl(username),
        employmentStatus,
        isActive: active,
      },
    })

    await prisma.userRole.deleteMany({ where: { userId: user.id } })
    const rolePick = assignRoles[i % assignRoles.length]
    await prisma.userRole.create({
      data: { userId: user.id, roleId: rolePick.id },
    })
  }

  await prisma.club.upsert({
    where: { name: 'Hacettepe Öğrenci Topluluğu' },
    update: {},
    create: {
      name: 'Hacettepe Öğrenci Topluluğu',
      description: 'Hacettepe Üniversitesi öğrenci topluluğu',
      category: 'Üniversite',
      isActive: true,
    },
  })

  console.log('\nTamamlandı.')
  console.log('Başkan e-posta   : baskan@topluluk.hacettepe.edu.tr')
  console.log('Başkan şifre     : Baskan123!')
  console.log(`Örnek üyeler (52) şifre: ${DEMO_PASSWORD}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
