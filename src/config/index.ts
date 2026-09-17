import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  ip_address: process.env.IP_ADDRESS,
  database_url: process.env.DATABASE_URL,
  backup_database_url: process.env.BACKUP_DATABASE_URL,
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt: {
    jwt_secret: process.env.JWT_SECRET,
    jwt_expire_in: process.env.JWT_EXPIRE_IN,
  },
  email: {
    from: process.env.EMAIL_FROM,
    user: process.env.EMAIL_USER,
    port: process.env.EMAIL_PORT,
    host: process.env.EMAIL_HOST,
    pass: process.env.EMAIL_PASS,
  },
  super_admin: {
    email: process.env.SUPER_ADMIN_EMAIL,
    password: process.env.SUPER_ADMIN_PASSWORD,
  },
  stripe: {
    secret_key: process.env.STRIPE_API_SECRET,
    webhook_secret: process.env.WEBHOOK_SECRET,
  },

  redis:{
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  },
  kafka:{
    url: process.env.KAFKA_URL
  },
  elasticSearch: {
    url: process.env.ELASTICSEARCH_URL
  },
  urls:{
    frontend: process.env.FRONTEND_URL,
    dashboard: process.env.DASHBOARD_URL
  },
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    bucket: process.env.AWS_BUCKET_NAME || process.env.AWS_S3_BUCKET,
    baseUrl: process.env.AWS_S3_BASE_URL,
  },
};
