const { Router } = require('express')
const controller       = require('./member.controller')
const authMiddleware   = require('../../middleware/auth.middleware')
const requirePermission = require('../../middleware/permission.middleware')
const validate         = require('../../middleware/validate.middleware')
const { createMemberSchema, updateMemberSchema } = require('./member.schema')

const router = Router()

// Tum uye route'lari kimlik dogrulama gerektirir
router.use(authMiddleware)

// GET /members - tum uyeleri listele
router.get('/', requirePermission('member.view'), controller.getAllMembers)

// GET /members/pending - bekleyen basvurular
router.get('/pending', requirePermission('member.view'), controller.getPendingMembers)

// GET /members/:id - tek uye getir
router.get('/:id', requirePermission('member.view'), controller.getMemberById)

// GET /members/club/:clubId - kuluba gore uyeleri getir
router.get('/club/:clubId', requirePermission('member.view'), controller.getMembersByClub)

// POST /members - yeni uye kaydi olustur
router.post('/', requirePermission('member.create'), validate(createMemberSchema), controller.createMember)

// PATCH /members/:id - uye guncelle (durum / rol)
router.patch('/:id', requirePermission('member.update'), validate(updateMemberSchema), controller.updateMember)

// DELETE /members/:id - uye sil
router.delete('/:id', requirePermission('member.delete'), controller.deleteMember)

module.exports = router
