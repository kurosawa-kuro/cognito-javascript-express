import 'dotenv/config';
import express from 'express';
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import authRoutes from './routes';

// AWS SDK v3の設定
export const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'ap-northeast-1',
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  } : undefined
});

const app = express();

// ミドルウェアの設定
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORSの設定
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// ルートの設定
app.use('/auth', authRoutes);

// エラーハンドリング
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'サーバーエラーが発生しました', error: err.message });
});

// サーバーの起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
