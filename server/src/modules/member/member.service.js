const prisma  = require('../../config/prisma')
const logger  = require('../../config/logger')

// Uye listesini getirir, filtreleme ve sayfalama destekler
const getAllMembers = async ({ page = 1, limit = 20, status, clubId } = {}) => {
  const skip  = (page - 1) * limit

  // Filtre kosullarini dinamik olarak olustur
  const where = {}
  if (status) where.status = status
  if (clubId) where.clubId = clubId

  const [members, total] = await Promise.all([
    prisma.member.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true, email: true, username: true,
            firstName: true, lastName: true,
            university: true, department: true, year: true,
            isActive: true,
          },
        },
        club: {
          select: { id: true, name: true, category: true },
        },
      },
    }),
    prisma.member.count({ where }),
  ])

  return {
    members,
    pagination: {
      page, limit, total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

// Tek bir uye kaydini ID ile getirir
const getMemberById = async (id) => {
  const member = await prisma.member.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true, email: true, username: true,
          firstName: true, lastName: true,
          university: true, department: true, year: true,
          phone: true,
        },
      },
      club: true,
    },
  })

  if (!member) {
    const err = new Error('Uye bulunamadi')
    err.statusCode = 404
    throw err
  }

  return member
}

// Yeni uye kaydı olusturur
// Bir kullanici ayni kulube iki kez uye olamaz (unique kisiti var)
const createMember = async ({ userId, clubId, role = 'uye' }) => {
  // Kullanici var mi kontrol et
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    const err = new Error('Kullanici bulunamadi')
    err.statusCode = 404
    throw err
  }

  // Kulup var mi kontrol et
  const club = await prisma.club.findUnique({ where: { id: clubId } })
  if (!club) {
    const err = new Error('Kulup bulunamadi')
    err.statusCode = 404
    throw err
  }

  // Zaten uye mi kontrol et
  const existing = await prisma.member.findFirst({
    where: { userId, clubId },
  })

  if (existing) {
    const err = new Error('Bu kullanici bu kulube zaten uye')
    err.statusCode = 409
    throw err
  }

  const member = await prisma.member.create({
    data: { userId, clubId, role, status: 'pending' },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
      club: { select: { id: true, name: true } },
    },
  })

  logger.info({ memberId: member.id, userId, clubId }, 'Yeni uye kaydi olusturuldu')
  return member
}

// Uye bilgilerini gunceller - durum veya rol degisikligi
const updateMember = async (id, { status, role }) => {
  const member = await prisma.member.findUnique({ where: { id } })
  if (!member) {
    const err = new Error('Uye bulunamadi')
    err.statusCode = 404
    throw err
  }

  const updateData = {}
  if (status) {
    updateData.status = status
    // Onaylanma tarihini kaydet
    if (status === 'approved') updateData.approvedAt = new Date()
  }
  if (role) updateData.role = role

  const updated = await prisma.member.update({
    where: { id },
    data:  updateData,
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
      club: { select: { id: true, name: true } },
    },
  })

  logger.info({ memberId: id, status, role }, 'Uye bilgileri guncellendi')
  return updated
}

// Uye kaydini siler
const deleteMember = async (id) => {
  const member = await prisma.member.findUnique({ where: { id } })
  if (!member) {
    const err = new Error('Uye bulunamadi')
    err.statusCode = 404
    throw err
  }

  await prisma.member.delete({ where: { id } })
  logger.info({ memberId: id }, 'Uye kaydi silindi')
}

// Belirli bir kuluba ait uyeleri getirir
const getMembersByClub = async (clubId) => {
  const club = await prisma.club.findUnique({ where: { id: clubId } })
  if (!club) {
    const err = new Error('Kulup bulunamadi')
    err.statusCode = 404
    throw err
  }

  const members = await prisma.member.findMany({
    where: { clubId },
    orderBy: { joinedAt: 'asc' },
    include: {
      user: {
        select: {
          id: true, email: true, username: true,
          firstName: true, lastName: true,
          university: true, department: true, year: true,
        },
      },
    },
  })

  return { club, members }
}

// Bekleyen uyelik basvurularini getirir
const getPendingMembers = async () => {
  return prisma.member.findMany({
    where: { status: 'pending' },
    orderBy: { createdAt: 'asc' },
    include: {
      user: {
        select: {
          id: true, email: true, username: true,
          firstName: true, lastName: true,
          university: true, department: true,
        },
      },
      club: { select: { id: true, name: true } },
    },
  })
}

module.exports = {
  getAllMembers, getMemberById, createMember,
  updateMember, deleteMember, getMembersByClub, getPendingMembers,
}
