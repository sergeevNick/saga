import * as express from 'express';
import { AppController } from '../controllers/app.controller';

export const AppRouter = express.Router();

const appController = new AppController();

AppRouter.post('', appController.update.bind(appController));
