import { Request, Response } from 'express';
import { AlertService } from '../../application/use-cases/AlertUseCases';

export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  async getActiveAlerts(_req: Request, res: Response): Promise<void> {
    try {
      const alerts = await this.alertService.getActiveAlerts();
      res.json({ success: true, data: alerts });
    } catch (error) {
      res.status(500).json({ success: false, error: 'FETCH_FAILED' });
    }
  }

  async getAlertsByProduct(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      const alerts = await this.alertService.getAlertsByProduct(productId);
      res.json({ success: true, data: alerts });
    } catch (error) {
      res.status(500).json({ success: false, error: 'FETCH_FAILED' });
    }
  }

  async resolveAlert(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const alert = await this.alertService.resolveAlert(id);
      res.json({ success: true, data: alert });
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'ALERT_NOT_FOUND') {
        res.status(404).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'RESOLVE_FAILED' });
    }
  }

  async getDashboardAlerts(_req: Request, res: Response): Promise<void> {
    try {
      const dashboard = await this.alertService.getAllAlertsForDashboard();
      res.json({ success: true, data: dashboard });
    } catch (error) {
      res.status(500).json({ success: false, error: 'FETCH_FAILED' });
    }
  }
}
