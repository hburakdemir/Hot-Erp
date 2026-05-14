const prisma = require('../../config/prisma')

const memberBaseWhere = {
  deletedAt: null,
  registrationStatus: 'APPROVED',
}

async function getSummary(permissions) {
  const summary = {
    membersByRole: null,
    membersByFaculty: null,
    membersByDepartment: null,
    eventsByCategory: null,
  }

  if (permissions.includes('member.view')) {
    const [roleGroups, facultyGroups, deptGroups] = await Promise.all([
      prisma.userRole.groupBy({
        by: ['roleId'],
        where: { user: memberBaseWhere },
        _count: { _all: true },
      }),
      prisma.user.groupBy({
        by: ['faculty'],
        where: { ...memberBaseWhere, faculty: { not: null } },
        _count: { _all: true },
      }),
      prisma.user.groupBy({
        by: ['department'],
        where: { ...memberBaseWhere, department: { not: null } },
        _count: { _all: true },
      }),
    ])

    const roles = await prisma.role.findMany({
      where: { id: { in: roleGroups.map((g) => g.roleId) } },
      select: { id: true, name: true },
    })
    const roleName = Object.fromEntries(roles.map((r) => [r.id, r.name]))

    summary.membersByRole = roleGroups.map((g) => ({
      roleId: g.roleId,
      roleName: roleName[g.roleId] ?? '—',
      count: g._count._all,
    }))

    summary.membersByFaculty = facultyGroups
      .filter((g) => g.faculty)
      .map((g) => ({ label: g.faculty, count: g._count._all }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12)

    summary.membersByDepartment = deptGroups
      .filter((g) => g.department)
      .map((g) => ({ label: g.department, count: g._count._all }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12)
  }

  if (permissions.includes('event.view')) {
    const catGroups = await prisma.event.groupBy({
      by: ['categoryId'],
      where: { deletedAt: null },
      _count: { _all: true },
    })
    const catIds = catGroups.map((g) => g.categoryId).filter(Boolean)
    const cats = catIds.length
      ? await prisma.eventCategory.findMany({
          where: { id: { in: catIds } },
          select: { id: true, name: true, color: true },
        })
      : []
    const catLabel = Object.fromEntries(cats.map((c) => [c.id, c.name]))
    summary.eventsByCategory = catGroups.map((g) => ({
      categoryId: g.categoryId,
      label: g.categoryId ? catLabel[g.categoryId] ?? 'Kategori yok' : 'Kategorisiz',
      count: g._count._all,
    }))
  }

  return summary
}

module.exports = { getSummary }
