import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

let app;

// Support both: environment variable (for Render/production) and local JSON file (for development)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Production: parse the JSON from the environment variable
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  app = initializeApp({
    credential: cert(serviceAccount),
  });
} else {
  // Development: read from local serviceAccountKey.json
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const serviceAccountKey = JSON.parse(
    readFileSync(join(__dirname, "serviceAccountKey.json"), "utf8")
  );
  app = initializeApp({
    credential: cert(serviceAccountKey),
  });
}

const auth = getAuth(app);
export default auth;
