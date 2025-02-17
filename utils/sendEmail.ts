import { SMTPClient } from "denoMailer";

export async function sendVerificationEmail(
  to: string,
  verificationCode: string,
) {
  const clientUrl = Deno.env.get("CLIENT_URL");
  const verificationUrl = clientUrl + "/verify/" + verificationCode;
  let content = await Deno.readTextFile(
    "./utils/mailTemplates/verification.template.html",
  );
  content = content.replace(/{{verificationUrl}}/g, verificationUrl);
  await sendEmail(to, content, "Verify your Profile");
}

export async function sendPasswordResetEmail(
  to: string,
  resetToken: string,
) {
  const clientUrl = Deno.env.get("CLIENT_URL");
  const verificationUrl = clientUrl + "/auth/password/reset/" + resetToken;
  let content = await Deno.readTextFile(
    "./utils/mailTemplates/passwordReset.template.html",
  );
  content = content.replace(/{{RESET_LINK}}/g, verificationUrl);
  await sendEmail(to, content, "Reset your password");
}

async function sendEmail(to: string, content: string, subject: string) {
  const emailPassword = Deno.env.get("EMAIL_PASSWORD");
  const email = Deno.env.get("EMAIL");
  if (!emailPassword || !email) {
    return;
  }
  const client = new SMTPClient({
    connection: {
      hostname: "smtp.gmail.com",
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
}
