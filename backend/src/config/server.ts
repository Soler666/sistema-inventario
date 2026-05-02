import express, { Application, Request, Response, NextFunction } from 'express';
import { ProductController } from '../infrastructure/controllers/ProductController';
import { MovementController } from '../infrastructure/controllers/MovementController';
import { AlertController } from '../infrastructure/controllers/AlertController';
import { PrismaProductRepository } from '../infrastructure/repositories/ProductRepositoryImpl';
import { PrismaMovementRepository } from '../infrastructure/repositories/MovementRepositoryImpl';
import { PrismaAlertRepository } from '../infrastructure/repositories/AlertRepositoryImpl';
import { ProductService } from '../application/use-cases/ProductUseCases';
import { MovementService } from '../application/use-cases/MovementUseCases';
import { AlertService } from '../application/use-cases/AlertUseCases';

const app: Application = express();

const productRepository = new PrismaProductRepository();
const movementRepository = new PrismaMovementRepository();
const alertRepository = new PrismaAlertRepository();

const productService = new ProductService(productRepository);
const movementService = new MovementService(productRepository, movementRepository, alertRepository);
const alertService = new AlertService(alertRepository, productRepository);

const productController = new ProductController(productService);
const movementController = new MovementController(movementService);
const alertController = new AlertController(alertService);

app.use(express.json());

app.use((_req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.options('*', (_req: Request, res: Response) => {
  res.sendStatus(200);
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/products', (req, res) => productController.getAllProducts(req, res));
app.get('/api/productos', (req, res) => productController.getAllProducts(req, res));
app.get('/api/products/low-stock/all', (req, res) => productController.getLowStockProducts(req, res));
app.post('/api/products', (req, res) => productController.createProduct(req, res));
app.post('/api/productos', (req, res) => productController.createProduct(req, res));
app.get('/api/products/:id', (req, res) => productController.getProductById(req, res));
app.get('/api/productos/:id', (req, res) => productController.getProductById(req, res));
app.put('/api/products/:id', (req, res) => productController.updateProduct(req, res));
app.put('/api/productos/:id', (req, res) => productController.updateProduct(req, res));
app.delete('/api/products/:id', (req, res) => productController.deleteProduct(req, res));
app.delete('/api/productos/:id', (req, res) => productController.deleteProduct(req, res));
app.get('/api/products/:id/stock-status', (req, res) => productController.checkStockStatus(req, res));

app.post('/api/movements', (req, res) => movementController.registerMovement(req, res));
app.post('/api/movimientos', (req, res) => movementController.registerMovement(req, res));
app.get('/api/movements', (req, res) => movementController.getAllMovements(req, res));
app.get('/api/movimientos', (req, res) => movementController.getAllMovements(req, res));
app.get('/api/movements/product/:productId', (req, res) => movementController.getMovementsByProduct(req, res));
app.get('/api/movements/:productId/history', (req, res) => movementController.getProductStockHistory(req, res));

app.get('/api/alerts', (req, res) => alertController.getActiveAlerts(req, res));
app.get('/api/alerts/dashboard', (req, res) => alertController.getDashboardAlerts(req, res));
app.get('/api/alerts/product/:productId', (req, res) => alertController.getAlertsByProduct(req, res));
app.put('/api/alerts/:id/resolve', (req, res) => alertController.resolveAlert(req, res));

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'NOT_FOUND' });
});

export default app;
