// src/api/reports/report.controller.ts
import { Request, Response } from 'express';
import { z } from 'zod';
import { createReportSchema } from './report.validation';
import * as reportService from '../../services/report.service';
import type { ReportType as ReportTypeEnum } from '@prisma/client';

async function handleCreateReport(req: Request, res: Response, type: ReportType) {
  try {
    const { body } = createReportSchema.parse(req);
    const userId = req.user!.id;

    const report = await reportService.createReport({
      ...body,
      userId,
      type,
    });

    return res.status(201).json(report);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    return res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
}

export const createLostReportHandler = (req: Request, res: Response) => 
  handleCreateReport(req, res, ReportTypeEnum.LOST);

export const createFoundReportHandler = (req: Request, res: Response) => 
  handleCreateReport(req, res, ReportTypeEnum.FOUND);