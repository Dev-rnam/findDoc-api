import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import authRouter from './api/auth/auth.routes';
import userRouter from './api/users/user.routes'; 
import reportRouter from './api/reports/report.routes';
import pointsRouter from './api/points/point.routes';


// Configure les variables d'environnement
dotenv.config();
 
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware pour parser le JSON des requêtes
app.use(express.json());


app.get('/', (req: Request, res: Response) => {
  res.send('API is running... 🚀');
});

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/reports', reportRouter);
app.use('/api/points', pointsRouter);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
}

export default app;