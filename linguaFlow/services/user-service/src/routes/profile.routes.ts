import { Router } from 'express';
import {
  updateProfileSchema,
  addLanguageSchema,
  updatePreferencesSchema,
} from '@linguaflow/shared';
import { z } from 'zod';
import { extractUser } from '../middleware/extract-user.js';
import { validate } from '../middleware/validate.js';
import * as userService from '../services/user.service.js';

const router = Router();

const langParamSchema = z.object({
  lang: z.string().min(2).max(10),
});

// All profile routes require an authenticated user
router.use(extractUser);

router.get('/me', async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.userId!);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
});

router.patch('/me', validate({ body: updateProfileSchema }), async (req, res, next) => {
  try {
    const user = await userService.updateProfile(req.userId!, req.body);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/me/languages',
  validate({ body: addLanguageSchema }),
  async (req, res, next) => {
    try {
      const profile = await userService.addLanguageProfile(req.userId!, req.body);
      res.status(201).json({ data: profile });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/me/languages/:lang',
  validate({ params: langParamSchema }),
  async (req, res, next) => {
    try {
      const profiles = await userService.getUserLanguageProfiles(req.userId!);
      const profile = profiles.find((p) => p.targetLanguage === req.params.lang);
      if (!profile) {
        return res.status(404).json({
          error: { code: 'USER_002', message: 'Language profile not found' },
        });
      }
      res.json({ data: profile });
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  '/me/languages/:lang',
  validate({ params: langParamSchema }),
  async (req, res, next) => {
    try {
      const profile = await userService.updateLanguageProfile(
        req.userId!,
        req.params.lang,
        req.body,
      );
      res.json({ data: profile });
    } catch (err) {
      next(err);
    }
  },
);

router.get('/me/preferences', async (req, res, next) => {
  try {
    const prefs = await userService.getPreferences(req.userId!);
    res.json({ data: prefs });
  } catch (err) {
    next(err);
  }
});

router.patch(
  '/me/preferences',
  validate({ body: updatePreferencesSchema }),
  async (req, res, next) => {
    try {
      const prefs = await userService.updatePreferences(req.userId!, req.body);
      res.json({ data: prefs });
    } catch (err) {
      next(err);
    }
  },
);

export { router as profileRoutes };
