import { Request, Response } from 'express';
import { z } from 'zod';
import { createReportSchema, searchReportsSchema } from './report.validation';
import * as reportService from '../../services/report.service';
import { ReportType } from '@prisma/client';



async function handleCreateReport(req: Request, res: Response, type: ReportType): Promise<void> {
  try {
    const { body } = createReportSchema.parse(req);
    const userId = req.user!.id;

    const report = await reportService.createReport({
      ...body,
      userId,
      type,
    });

     res.status(201).json(report);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
       res.status(400).json({ errors: error.errors });
    }
     res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
}

export const createLostReportHandler = (req: Request, res: Response) : Promise<void> => 
  handleCreateReport(req, res, ReportType.LOST);

export const createFoundReportHandler = (req: Request, res: Response) => 
  handleCreateReport(req, res, ReportType.FOUND);

export async function validateReportHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params; 
    const result = await reportService.validateFoundReport(id);
     res.status(200).json(result);
  } catch (error: any) {
     res.status(400).json({ message: error.message });
  }
}

export async function searchReportsHandler(req: Request, res: Response): Promise<void> {
  try {
    const { query } = searchReportsSchema.parse(req);
    const result = await reportService.searchReports(query);
     res.status(200).json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
       res.status(400).json({ errors: error.errors });
    }
     res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
}