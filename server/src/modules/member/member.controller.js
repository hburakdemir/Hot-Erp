const memberService = require('./member.service')
const { success } = require('../../utils/response')

// Tum uyeleri listele (filtreleme ve sayfalama destekli)
const getAllMembers = async (req, res, next) => {
  console.log("controllera girdik")
  try {
    const page   = parseInt(req.query.page)   || 1
    const limit  = parseInt(req.query.limit)  || 20
    const status = req.query.status || undefined
    const clubId = req.query.clubId || undefined
    const data = await memberService.getAllMembers({ page, limit, status, clubId })
    return success(res, data, 'Uyeler basariyla getirildi')
  } catch (err) { next(err) }
}

// Tek uye getir
const getMemberById = async (req, res, next) => {
  try {
    const member = await memberService.getMemberById(req.params.id)
    return success(res, member, 'Uye bilgileri getirildi')
  } catch (err) { next(err) }
}

// Yeni uye olustur
const createMember = async (req, res, next) => {
  try {
    const member = await memberService.createMember(req.body)
    return success(res, member, 'Uye kaydi olusturuldu', 201)
  } catch (err) { next(err) }
}

// Uye guncelle (durum / rol)
const updateMember = async (req, res, next) => {
  try {
    const member = await memberService.updateMember(req.params.id, req.body)
    return success(res, member, 'Uye bilgileri guncellendi')
  } catch (err) { next(err) }
}

// Uye sil
const deleteMember = async (req, res, next) => {
  try {
    await memberService.deleteMember(req.params.id)
    return success(res, null, 'Uye kaydi silindi')
  } catch (err) { next(err) }
}

// Kuluba gore uyeleri getir
const getMembersByClub = async (req, res, next) => {
  try {
    const data = await memberService.getMembersByClub(req.params.clubId)
    return success(res, data, 'Kulup uyeleri getirildi')
  } catch (err) { next(err) }
}

// Bekleyen basvurulari getir
const getPendingMembers = async (req, res, next) => {
  try {
    const members = await memberService.getPendingMembers()
    return success(res, members, 'Bekleyen basvurular getirildi')
  } catch (err) { next(err) }
}

module.exports = {
  getAllMembers, getMemberById, createMember,
  updateMember, deleteMember, getMembersByClub, getPendingMembers,
}
