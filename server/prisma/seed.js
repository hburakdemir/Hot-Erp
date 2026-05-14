const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

const DEMO_PASSWORD = 'Uyeler123!'

const PERMISSIONS = [
  { key: 'member.view', category: 'Uyeler', description: 'Üye listesini görüntüleme' },
  { key: 'member.create', category: 'Uyeler', description: 'Yeni üye oluşturma' },
  { key: 'member.update', category: 'Uyeler', description: 'Üye bilgilerini güncelleme' },
  { key: 'member.delete', category: 'Uyeler', description: 'Üye silme (soft)' },
  { key: 'role.view', category: 'Roller', description: 'Rolleri görüntüleme' },
  { key: 'role.create', category: 'Roller', description: 'Rol oluşturma' },
  { key: 'role.update', category: 'Roller', description: 'Rol ve izinleri güncelleme' },
  { key: 'role.delete', category: 'Roller', description: 'Rol silme' },
  { key: 'announcement.view', category: 'Duyurular', description: 'Duyuruları görüntüleme' },
  { key: 'announcement.create', category: 'Duyurular', description: 'Duyuru oluşturma' },
  { key: 'announcement.update', category: 'Duyurular', description: 'Duyuru güncelleme' },
  { key: 'announcement.delete', category: 'Duyurular', description: 'Duyuru silme (soft)' },
  { key: 'event.view', category: 'Etkinlikler', description: 'Etkinlikleri görüntüleme' },
  { key: 'event.create', category: 'Etkinlikler', description: 'Etkinlik oluşturma' },
  { key: 'event.update', category: 'Etkinlikler', description: 'Etkinlik / kategori / durum yönetimi' },
  { key: 'event.delete', category: 'Etkinlikler', description: 'Etkinlik silme (soft)' },
  { key: 'meeting.view', category: 'Toplantilar', description: 'Toplantıları görüntüleme' },
  { key: 'meeting.create', category: 'Toplantilar', description: 'Toplantı oluşturma' },
  { key: 'meeting.update', category: 'Toplantilar', description: 'Toplantı güncelleme' },
  { key: 'meeting.delete', category: 'Toplantilar', description: 'Toplantı silme (soft)' },
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
        'announcement.view',
        'announcement.create',
        'event.view',
        'meeting.view',
        'task.manage',
        'inventory.manage',
      ],
    },
    {
      name: `${prefix} Koordinatörü`,
      description: `${prefix} koordinatörü`,
      permissionKeys: ['member.view', 'announcement.view', 'announcement.create', 'event.view', 'task.manage'],
    },
  ]),
  {
    name: 'Stajyer',
    description: 'Gözlem ve destek — salt okunur üye listesi',
    permissionKeys: ['member.view', 'event.view', 'meeting.view'],
  },
  {
    name: 'Üye',
    description: 'Standart topluluk üyesi',
    permissionKeys: ['member.view', 'event.view', 'meeting.view'],
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
      registrationStatus: 'APPROVED',
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
      registrationStatus: 'APPROVED',
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
        registrationStatus: 'APPROVED',
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
        registrationStatus: 'APPROVED',
      },
    })

    await prisma.userRole.deleteMany({ where: { userId: user.id } })
    const rolePick = assignRoles[i % assignRoles.length]
    await prisma.userRole.create({
      data: { userId: user.id, roleId: rolePick.id },
    })
  }

  const club = await prisma.club.upsert({
    where: { name: 'Hacettepe Öğrenci Topluluğu' },
    update: {},
    create: {
      name: 'Hacettepe Öğrenci Topluluğu',
      description: 'Hacettepe Üniversitesi öğrenci topluluğu',
      category: 'Üniversite',
      isActive: true,
    },
  })

  if ((await prisma.participationStatus.count({ where: { scope: 'EVENT' } })) === 0) {
    await prisma.participationStatus.createMany({
      data: [
        { scope: 'EVENT', label: 'Katılıyorum', color: '#15803d', fontWeight: '600', sortOrder: 0 },
        { scope: 'EVENT', label: 'Katılmıyorum', color: '#b91c1c', sortOrder: 1 },
        { scope: 'EVENT', label: 'Belki', color: '#a16207', fontStyle: 'italic', sortOrder: 2 },
      ],
    })
  }

  if ((await prisma.participationStatus.count({ where: { scope: 'MEETING' } })) === 0) {
    await prisma.participationStatus.createMany({
      data: [
        { scope: 'MEETING', label: 'Katılacağım', color: '#15803d', sortOrder: 0 },
        { scope: 'MEETING', label: 'Katılamayacağım', color: '#b91c1c', sortOrder: 1 },
        { scope: 'MEETING', label: 'Müsait değilim', color: '#64748b', sortOrder: 2 },
      ],
    })
  }

  if ((await prisma.eventCategory.count()) === 0) {
    await prisma.eventCategory.createMany({
      data: [
        { name: 'Sosyal', description: 'Sosyal etkinlikler', color: '#7c3aed', sortOrder: 0 },
        { name: 'Akademik', description: 'Akademik içerik', color: '#0369a1', sortOrder: 1 },
        { name: 'Spor', color: '#059669', sortOrder: 2 },
      ],
    })
  }

  if ((await prisma.meetingCategory.count()) === 0) {
    await prisma.meetingCategory.createMany({
      data: [
        { name: 'Yönetim kurulu', color: '#0f172a', sortOrder: 0 },
        { name: 'Komite', color: '#334155', sortOrder: 1 },
      ],
    })
  }

  const hasSampleEvent = await prisma.event.findFirst({
    where: { clubId: club.id, title: 'Örnek tanışma kahvaltısı', deletedAt: null },
  })
  if (!hasSampleEvent) {
    const evCat = await prisma.eventCategory.findFirst({ where: { name: 'Sosyal', deletedAt: null } })
    if (evCat) {
      await prisma.event.create({
        data: {
          title: 'Örnek tanışma kahvaltısı',
          description: 'Yeni üyelerle tanışma — örnek kayıt',
          location: 'Kulüp ofisi',
          startDate: new Date(Date.now() + 7 * 86400000),
          endDate: null,
          startUndetermined: false,
          endUndetermined: true,
          clubId: club.id,
          categoryId: evCat.id,
          isPublic: true,
        },
      })
    }
  }

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
