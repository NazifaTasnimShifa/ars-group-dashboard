// src/pages/api/process-loss/[id].js
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';

async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  try {
    switch (method) {
      case 'PUT':
        try {
          const updatedLoss = await prisma.processLoss.update({
            where: { id: id },
            data: {
              notes: req.body.notes,
              lossQuantity: req.body.quantity ? parseFloat(req.body.quantity) : undefined,
            },
          });
          res.status(200).json({ success: true, data: updatedLoss });
        } catch (updateError) {
          console.error('Update error:', updateError.message);
          res.status(400).json({ success: false, message: 'Update failed - record may not exist' });
        }
        break;

      case 'DELETE':
        try {
          await prisma.processLoss.delete({ where: { id: id } });
          res.status(200).json({ success: true, message: 'Deleted' });
        } catch (deleteError) {
          console.error('Delete error:', deleteError.message);
          res.status(400).json({ success: false, message: 'Delete failed - record may not exist' });
        }
        break;

      default:
        res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Process loss [id] API error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export default withAuth(handler, ['ADMIN', 'MANAGER', 'SUPER_OWNER']);