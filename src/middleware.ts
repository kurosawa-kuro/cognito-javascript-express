import { 
  GetUserCommand,
  GetUserCommandOutput
} from "@aws-sdk/client-cognito-identity-provider";
import { Request, Response, NextFunction } from 'express';
import { cognitoClient } from './app';

export interface AuthenticatedRequest extends Request {
  user?: GetUserCommandOutput;
}

export interface CognitoError extends Error {
  name: string;
  $metadata?: {
    httpStatusCode: number;
  };
}

// 認証ミドルウェア
export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ 
        message: '認証トークンが必要です',
        error: 'Authorization headerが見つかりません'
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ 
        message: '認証トークンが必要です',
        error: 'Bearer tokenが見つかりません'
      });
      return;
    }

    const command = new GetUserCommand({ AccessToken: token });
    const data = await cognitoClient.send(command);
    req.user = data;
    next();
  } catch (error) {
    const cognitoError = error as CognitoError;
    const statusCode = cognitoError.$metadata?.httpStatusCode || 401;
    
    let errorMessage = '認証に失敗しました';
    switch (cognitoError.name) {
      case 'NotAuthorizedException':
        errorMessage = 'トークンが無効または期限切れです';
        break;
      case 'UserNotFoundException':
        errorMessage = 'ユーザーが見つかりません';
        break;
      default:
        errorMessage = '認証処理中にエラーが発生しました';
    }

    res.status(statusCode).json({ 
      message: errorMessage,
      error: cognitoError.message
    });
  }
};
