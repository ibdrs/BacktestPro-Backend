import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }
    const user = await authService.register(email, password);
    res.status(201).json({ user });
  } catch (err: any) {
    if (err.message === 'Email already in use') {
      res.status(409).json({ error: err.message });
      return;
    }
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }
    const { token, user } = await authService.login(email, password);
    res.json({ token, user });
  } catch (err: any) {
    if (err.message === 'Invalid credentials') {
      res.status(401).json({ error: err.message });
      return;
    }
    next(err);
  }
}
