# @setsig/node

Official Node.js and TypeScript SDK for **setsig.com** — Physical Presence & Verification Infrastructure-as-a-Service (PaaS/IaaS).

[![npm version](https://img.shields.io/npm/v/@setsig/node.svg)](https://www.npmjs.com/package/@setsig/node)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)

---

## 📦 Kurulum (Installation)

```bash
npm install @setsig/node
# veya
pnpm add @setsig/node
# veya
yarn add @setsig/node
```

---

## 🚀 Hızlı Başlangıç (Quickstart)

```typescript
import { SetsigClient } from "@setsig/node";

const setsig = new SetsigClient({
  apiKey: process.env.SETSIG_API_KEY!, // 'pk_live_...' veya 'pk_test_...'
  secretKey: process.env.SETSIG_WEBHOOK_SECRET, // 'whsec_...'
});
```

---

## 🛠️ Temel Kullanım Örnekleri

### 1. Dinamik TOTP Mekan Kodu Üretimi (Kiosk & Ekranlar)
Turnike veya masa ekranında gösterilmek üzere dinamik QR yükü oluşturur:

```typescript
const token = await setsig.tokens.generate({
  venueId: "ven_kadikoy_workshop_01",
  ttlSeconds: 60,
});

console.log("Karekod Yükü:", token.qrPayload);
console.log("Kalan Süre:", token.ttlRemaining);
```

### 2. Fiziksel Varlık Oturumu Doğrulama (`sessions.verify`)
Kullanıcının taradığı dinamik QR'ı, GPS telemetrisini, donanım kanıtını ve isteğe bağlı görsel kanıtı doğrular:

```typescript
const result = await setsig.sessions.verify({
  qrPayload: scannedPayload,
  clientBinding: {
    clientToken: "TKT_BILETIX_894102",
    userRef: "usr_mertcan_avci",
  },
  telemetry: {
    latitude: 40.990234,
    longitude: 29.028912,
    accuracyMeters: 4.2,
  },
  visualProof: {
    imageHashSha256: "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
    storageKey: "proofs/tenant-1/sess-1.webp",
    capturedAt: new Date().toISOString(),
  },
});

if (result.status === "verified") {
  console.log("Kriptografik İspat İmzası:", result.proof.signature);
  console.log("Görsel Kanıt Onaylandı mı?:", result.verification.visualProofVerified);
}
```

### 3. Zamanlama Saldırısına Dayanıklı Webhook Doğrulama
`crypto.timingSafeEqual` kullanarak gelen webhook'un setsig sunucularından çıktığını teyit eder:

```typescript
import { verifyWebhookSignature } from "@setsig/node";

app.post("/webhooks/setsig", express.raw({ type: "application/json" }), (req, res) => {
  const signature = req.headers["x-setsig-signature"] as string;

  try {
    const isValid = verifyWebhookSignature(req.body, signature, process.env.SETSIG_WEBHOOK_SECRET!);
    if (!isValid) return res.status(401).send("Invalid signature");

    const event = JSON.parse(req.body.toString());
    console.log("Gelen Olay:", event.event, event.data.sessionId);
    res.json({ received: true });
  } catch (err) {
    res.status(400).send("Webhook verification error");
  }
});
```

---

## 🛡️ Hata Tipleri (Error Handling)

```typescript
import {
  SetsigError,
  AuthenticationError,
  InsufficientCreditsError,
  ReplayAttackError,
  GeofenceOutOfBoundsError,
} from "@setsig/node";

try {
  await setsig.sessions.verify(...);
} catch (err) {
  if (err instanceof InsufficientCreditsError) {
    console.error("Bakiye yetersiz! Lütfen kredi yükleyin.");
  } else if (err instanceof ReplayAttackError) {
    console.error("Bu QR kod daha önce okutulmuş (replay attack engellendi).");
  } else if (err instanceof GeofenceOutOfBoundsError) {
    console.error("Kullanıcı mekanın coğrafi sınırları dışında.");
  }
}
```

---

## 📄 Lisans
Apache-2.0 © setsig.com — AVCI Ventures & Kurucu Bireysel Fikri Mülkiyet (IP) Kalkanı

