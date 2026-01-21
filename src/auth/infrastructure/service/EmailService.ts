import { Resend } from 'resend'

export interface EmailService {
  sendConfirmationEmail(email: string, token: string, nombre: string): Promise<void>
  sendPasswordResetEmail(email: string, token: string, nombre: string): Promise<void>
}

export class ResendEmailService implements EmailService {
  private resend: Resend
  private fromEmail: string
  private frontendUrl: string

  constructor(apiKey: string, fromEmail: string, frontendUrl: string) {
    this.resend = new Resend(apiKey)
    this.fromEmail = fromEmail
    this.frontendUrl = frontendUrl
  }

  async sendConfirmationEmail(email: string, token: string, nombre: string): Promise<void> {
    const confirmationUrl = `${this.frontendUrl}/auth/confirm?token=${token}`

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Confirma tu cuenta',
        html: this.getConfirmationEmailTemplate(nombre, confirmationUrl),
      })
    } catch (error) {
      console.error('Error al enviar email de confirmación:', error)
      throw new Error('No se pudo enviar el email de confirmación')
    }
  }

  async sendPasswordResetEmail(email: string, token: string, nombre: string): Promise<void> {
    const resetUrl = `${this.frontendUrl}/auth/reset-password?token=${token}`

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Recuperación de contraseña',
        html: this.getPasswordResetEmailTemplate(nombre, resetUrl),
      })
    } catch (error) {
      console.error('Error al enviar email de recuperación:', error)
      throw new Error('No se pudo enviar el email de recuperación')
    }
  }

  private getConfirmationEmailTemplate(nombre: string, confirmationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirma tu cuenta</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; border-radius: 10px; padding: 30px; margin-bottom: 20px;">
            <h1 style="color: #2563eb; margin-bottom: 20px;">¡Bienvenido/a, ${nombre}!</h1>
            <p style="font-size: 16px; margin-bottom: 20px;">
              Gracias por registrarte. Para activar tu cuenta, por favor confirma tu correo electrónico haciendo clic en el siguiente botón:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationUrl}" 
                 style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Confirmar mi cuenta
              </a>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Si no puedes hacer clic en el botón, copia y pega el siguiente enlace en tu navegador:
            </p>
            <p style="font-size: 12px; color: #666; word-break: break-all; background-color: #f1f5f9; padding: 10px; border-radius: 4px;">
              ${confirmationUrl}
            </p>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Este enlace expirará en 24 horas.
            </p>
            <p style="font-size: 14px; color: #666;">
              Si no creaste esta cuenta, puedes ignorar este correo.
            </p>
          </div>
          <div style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
          </div>
        </body>
      </html>
    `
  }

  private getPasswordResetEmailTemplate(nombre: string, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Recuperación de contraseña</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; border-radius: 10px; padding: 30px; margin-bottom: 20px;">
            <h1 style="color: #2563eb; margin-bottom: 20px;">Recuperación de contraseña</h1>
            <p style="font-size: 16px; margin-bottom: 20px;">
              Hola ${nombre},
            </p>
            <p style="font-size: 16px; margin-bottom: 20px;">
              Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el siguiente botón para crear una nueva contraseña:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Restablecer contraseña
              </a>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Si no puedes hacer clic en el botón, copia y pega el siguiente enlace en tu navegador:
            </p>
            <p style="font-size: 12px; color: #666; word-break: break-all; background-color: #f1f5f9; padding: 10px; border-radius: 4px;">
              ${resetUrl}
            </p>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Este enlace expirará en 24 horas.
            </p>
            <p style="font-size: 14px; color: #dc2626; font-weight: bold;">
              Si no solicitaste restablecer tu contraseña, ignora este correo. Tu cuenta permanecerá segura.
            </p>
          </div>
          <div style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
          </div>
        </body>
      </html>
    `
  }
}