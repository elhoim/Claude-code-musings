import { Router } from 'express';
import { createUserSchema, loginSchema } from '@linguaflow/shared';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import * as authService from '../services/auth.service.js';

const router = Router();

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

router.post('/register', validate({ body: createUserSchema }), async (req, res, next) => {
  try {
    const tokens = await authService.register(req.body);
    res.status(201).json({ data: tokens });
  } catch (err) {
    next(err);
  }
});

router.post('/login', validate({ body: loginSchema }), async (req, res, next) => {
  try {
    const tokens = await authService.login(req.body);
    res.json({ data: tokens });
  } catch (err) {
    next(err);
  }
});

router.post('/refresh', validate({ body: refreshSchema }), async (req, res, next) => {
  try {
    const tokens = await authService.refreshToken(req.body.refreshToken);
    res.json({ data: tokens });
  } catch (err) {
    next(err);
  }
});

export { router as authRoutes };
