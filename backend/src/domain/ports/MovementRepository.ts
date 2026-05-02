import { Movement, CreateMovementDTO } from '../entities/Movement';

export interface MovementWithProduct extends Movement {
  product?: {
    name: string;
    sku: string;
  };
}

export interface MovementRepository {
  findById(id: string): Promise<Movement | null>;
  findByProductId(productId: string): Promise<Movement[]>;
  findAll(): Promise<MovementWithProduct[]>;
  create(data: CreateMovementDTO): Promise<Movement>;
}
