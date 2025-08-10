import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { saveGameRoute } from './routes/save-game.route';
import { loadGameRoute } from './routes/load-game.route';

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Otherworld God-Farmer Backend Server' });
});

app.use('/api/game', saveGameRoute);
app.use('/api/game', loadGameRoute);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});