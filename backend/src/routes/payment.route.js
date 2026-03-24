import express from 'express'
import { RazorpayOrder, verifyPayment, freeEnroll } from '../controllers/payment.controller.js'
import authUser from '../middleware/auth.middleware.js'

const paymentRouter = express.Router()

paymentRouter.post('/razorpay-order', RazorpayOrder)
paymentRouter.post('/verifypayment', verifyPayment)
paymentRouter.post('/free-enroll', authUser, freeEnroll)

export default paymentRouter