import { SMTPClient } from "denoMailer";

export const EmailUtils = {
  async sendVerificationEmail(
    to: string,
    verificationCode: string,
  ) {
    const clientUrl = Deno.env.get("CLIENT_URL");
    const verificationUrl = clientUrl + "/verify/" + verificationCode;
    let content = await Deno.readTextFile(
      "./utils/mailTemplates/verification.template.html",
    );
    content = content.replace(/{{verificationUrl}}/g, verificationUrl);

    await this.sendEmail(to, content, "Verify your Profile");
  },

  async sendPasswordResetEmail(
    to: string,
    resetToken: string,
    expirationTime: string,
  ) {
    const clientUrl = Deno.env.get("CLIENT_URL");
    const verificationUrl = clientUrl + "/auth/password/reset/" + resetToken;
    let content = await Deno.readTextFile(
      "./utils/mailTemplates/passwordReset.template.html",
    );
    content = content.replace(/{{RESET_LINK}}/g, verificationUrl);
    content = content.replace(/{{EXPIRATION_TIME}}/g, expirationTime);

    await this.sendEmail(to, content, "Reset your password");
  },

  async sendEmail(to: string, content: string, subject: string) {
    const emailPassword = Deno.env.get("EMAIL_PASSWORD");
    const email = Deno.env.get("EMAIL");
    const mailHostname = Deno.env.get("MAIL_HOSTNAME");
    if (!emailPassword || !email || !mailHostname) {
      return;
    }
    const client = new SMTPClient({
      connection: {
        hostname: mailHostname,
        port: 465,
        tls: true,
        auth: {
          username: email,
          password: emailPassword,
        },
      },
    });

    await client.send({
      from: email,
      to,
      subject: subject,
      content: content,
      html: content,
    });

    await client.close();
  },
};
