import { Router, Response, Request, NextFunction, RequestHandler } from 'express';
import { signUp, confirmSignUp, signIn, logout } from './controller';
import { AuthenticatedRequest, authenticateToken } from './middleware';

const router = Router();

type AsyncRequestHandler = (req: Request | AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;

// エラーハンドリングラッパー
const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 認証ルート
router.post('/signup', asyncHandler(signUp));
router.post('/confirm', asyncHandler(confirmSignUp));
router.post('/signin', asyncHandler(signIn));
router.post('/logout', authenticateToken, asyncHandler(logout));

// 保護されたルート
router.get('/protected', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({ 
    message: '保護されたルートにアクセスできました', 
    user: req.user 
  });
}));

// ヘルスチェック
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy' });
});

export default router;
