import { Alert, CreateAlertDTO } from '../entities/Alert';

export interface AlertRepository {
  findById(id: string): Promise<Alert | null>;
  findByProductId(productId: string): Promise<Alert[]>;
  findActive(): Promise<Alert[]>;
  create(data: CreateAlertDTO): Promise<Alert>;
  resolve(id: string): Promise<Alert | null>;
}
