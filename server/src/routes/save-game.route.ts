import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

interface SaveGameRequest {
  userId: string;
  saveData: any;
}

router.post('/save', (req: Request<{}, {}, SaveGameRequest>, res: Response) => {
  const { userId, saveData } = req.body;

  if (!userId || !saveData) {
    return res.status(400).json({ 
      success: false, 
      message: 'userId and saveData are required' 
    });
  }

  const savesDir = path.join(__dirname, '../../saves');
  
  if (!fs.existsSync(savesDir)) {
    fs.mkdirSync(savesDir, { recursive: true });
  }

  const saveFilePath = path.join(savesDir, `${userId}.json`);

  try {
    fs.writeFileSync(saveFilePath, JSON.stringify(saveData, null, 2));
    res.json({ 
      success: true, 
      message: 'Game saved successfully' 
    });
  } catch (error) {
    console.error('Error saving game:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save game' 
    });
  }
});

export { router as saveGameRoute };