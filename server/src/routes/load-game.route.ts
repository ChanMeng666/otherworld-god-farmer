import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

router.get('/load', (req: Request, res: Response) => {
  const userId = req.query.userId as string;

  if (!userId) {
    return res.status(400).json({ 
      success: false, 
      message: 'userId is required' 
    });
  }

  const savesDir = path.join(__dirname, '../../saves');
  const saveFilePath = path.join(savesDir, `${userId}.json`);

  if (!fs.existsSync(saveFilePath)) {
    return res.status(404).json({ 
      success: false, 
      message: 'Save file not found' 
    });
  }

  try {
    const saveData = JSON.parse(fs.readFileSync(saveFilePath, 'utf-8'));
    res.json({ 
      success: true, 
      saveData 
    });
  } catch (error) {
    console.error('Error loading game:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to load game' 
    });
  }
});

export { router as loadGameRoute };