import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function limpiar() {
  console.log('🔄 Limpiando base de datos...');
  
  try {
    await prisma.movement.deleteMany();
    console.log('✓ Movimientos eliminados');
    
    await prisma.alert.deleteMany();
    console.log('✓ Alertas eliminadas');
    
    await prisma.product.deleteMany();
    console.log('✓ Productos eliminados');
    
    console.log('✅ Base de datos vacía');
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

limpiar();
