import crypto from "node:crypto";

// دالة تقرأ إجمالي زوار الموقع من Google Analytics (GA4) عبر حساب خدمة
// تحتاج متغيرات البيئة التالية في إعدادات Netlify:
//   GA_PROPERTY_ID  - الرقم التعريفي لخاصية GA4 (رقم فقط، ليس G-XXXX)
//   GA_CLIENT_EMAIL - بريد حساب الخدمة من Google Cloud
//   GA_PRIVATE_KEY  - المفتاح الخاص لحساب الخدمة (بصيغة PEM)
// راجع docs/GA_VISITOR_COUNTER_SETUP.md لخطوات الإعداد كاملة

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const START_DATE = "2023-01-01";
const CACHE_TTL_MS = 60 * 60 * 1000; // ساعة واحدة

let cache = { visitors: null, expires: 0 };

function base64url(input) {
  return Buffer.from(input).toString("base64url");
}

async function getAccessToken(clientEmail, privateKey) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/analytics.readonly",
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    })
  );
  const unsigned = `${header}.${claims}`;
  const signature = crypto
    .createSign("RSA-SHA256")
    .update(unsigned)
    .sign(privateKey.replace(/\\n/g, "\n"), "base64url");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signature}`,
    }),
  });
  if (!res.ok) throw new Error(`token request failed: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

async function fetchTotalUsers(propertyId, accessToken) {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: START_DATE, endDate: "today" }],
        metrics: [{ name: "totalUsers" }],
      }),
    }
  );
  if (!res.ok) throw new Error(`runReport failed: ${res.status}`);
  const data = await res.json();
  const value = Number(data?.rows?.[0]?.metricValues?.[0]?.value);
  if (!Number.isFinite(value)) throw new Error("unexpected report shape");
  return value;
}

export default async () => {
  const propertyId = process.env.GA_PROPERTY_ID;
  const clientEmail = process.env.GA_CLIENT_EMAIL;
  const privateKey = process.env.GA_PRIVATE_KEY;

  if (!propertyId || !clientEmail || !privateKey) {
    return new Response(JSON.stringify({ error: "not configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    if (!cache.visitors || Date.now() > cache.expires) {
      const token = await getAccessToken(clientEmail, privateKey);
      const visitors = await fetchTotalUsers(propertyId, token);
      cache = { visitors, expires: Date.now() + CACHE_TTL_MS };
    }
    return new Response(JSON.stringify({ visitors: cache.visitors }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300, s-maxage=3600",
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "unavailable" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
};
