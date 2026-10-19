import dotenv from "dotenv";
import path from "path";
import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";
import type { ServiceAccount } from "firebase-admin/app";
import serviceAccount from "../../firbase.config.json"

dotenv.config({ path: path.join(process.cwd(), ".env") });



const firebaseApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: serviceAccount
          ? cert(serviceAccount as ServiceAccount)
          : applicationDefault(),
      });

export default firebaseApp;