type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail(
  apiKey: string,
  from: string,
  payload: EmailPayload
): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend error ${res.status}: ${text}`);
  }
}

export function buildInvitationEmail(params: {
  parentName: string;
  childName: string;
  magicLink: string;
  appUrl: string;
}): EmailPayload {
  const { parentName, childName, magicLink, appUrl } = params;
  return {
    to: '',
    subject: `Votre accès au passeport de ${childName} — Brickodeurs`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1f2937;background:#fff">
  <h1 style="color:#f97316;font-size:22px;margin-bottom:8px">🧱 Brickodeurs</h1>
  <p>Bonjour ${parentName},</p>
  <p>Votre enfant <strong>${childName}</strong> vient de s'inscrire sur le passeport numérique Brickodeurs !</p>
  <p>Cliquez sur le lien ci-dessous pour créer votre compte parent et suivre sa progression :</p>
  <p style="text-align:center;margin:32px 0">
    <a href="${magicLink}"
       style="background:#f97316;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:bold;display:inline-block">
      Accéder au passeport
    </a>
  </p>
  <p style="color:#6b7280;font-size:12px">Ce lien est valide 7 jours. Si vous n'attendiez pas cet email, ignorez-le.</p>
  <p style="color:#6b7280;font-size:12px"><a href="${appUrl}" style="color:#6b7280">${appUrl}</a></p>
</body>
</html>`,
  };
}

export function buildBadgeNotificationEmail(params: {
  parentName: string;
  childName: string;
  skillTitle: string;
  domainName: string;
  appUrl: string;
}): EmailPayload {
  const { parentName, childName, skillTitle, domainName, appUrl } = params;
  return {
    to: '',
    subject: `${childName} a obtenu un badge ${domainName} ! 🎉`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1f2937;background:#fff">
  <h1 style="color:#f97316;font-size:22px;margin-bottom:8px">🧱 Brickodeurs</h1>
  <p>Bonjour ${parentName},</p>
  <p>Bonne nouvelle ! <strong>${childName}</strong> vient de valider la compétence :</p>
  <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:20px 0;text-align:center">
    <p style="font-size:18px;font-weight:bold;color:#1f2937;margin:0">${skillTitle}</p>
    <p style="color:#6b7280;margin:4px 0 0">Domaine : ${domainName}</p>
  </div>
  <p>Consultez son passeport complet :</p>
  <p style="text-align:center;margin:24px 0">
    <a href="${appUrl}/parent/enfant"
       style="background:#f97316;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:bold;display:inline-block">
      Voir le passeport
    </a>
  </p>
  <p style="color:#6b7280;font-size:12px"><a href="${appUrl}" style="color:#6b7280">${appUrl}</a></p>
</body>
</html>`,
  };
}
