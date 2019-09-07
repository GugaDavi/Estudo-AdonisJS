'use strict'

const crypto = require('crypto')
const { subDays, isAfter } = require('date-fns')

const User = use('App/Models/User')
const Mail = use('Mail')

class ForgotPasswordController {
  async store ({ request, response }) {
    try {
      const email = request.input('email')

      const user = await User.findByOrFail('email', email)

      user.token = crypto.randomBytes(10).toString('hex')
      user.token_created_at = new Date()

      await user.save()

      await Mail.send(
        ['emails.forgot_password'],
        {
          email,
          token: user.token,
          link: `${request.input('redirect_url')}?token=${user.token}`
        },
        message => {
          message
            .to(user.email)
            .from('gguedes.tech@gmail.com', 'Gustavo Davi | TravelMate')
            .subject('Recuperação de Senha')
        }
      )

      return user
    } catch (error) {
      console.log(error)
      return response
        .status(error.status)
        .send({ error: { message: 'Algo não deu certo, esse e-mail existe?' } })
    }
  }

  async update ({ request, response }) {
    try {
      const { token, password } = request.all()

      const user = await User.findByOrFail('token', token)

      const limitDate = subDays(new Date(), 2)

      const tokenExpired = isAfter(user.token_created_at, limitDate)

      if (!tokenExpired) {
        return response
          .status(401)
          .send({ error: { message: 'Token Expirado ou Invalido' } })
      }

      user.token = null
      user.token_created_at = null
      user.password = password

      await user.save()
    } catch (error) {
      console.log(error)
      return response
        .status(error.status)
        .send({ error: { message: 'O envio do token é obrigatorio' } })
    }
  }
}

module.exports = ForgotPasswordController
