// src/pages/api/pump/config/fuel-types.js
// API for managing fuel types

import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';

async function handler(req, res) {
    const { company_id } = req.query;

    if (!company_id) {
        return res.status(400).json({ success: false, message: 'company_id is required' });
    }

    try {
        // GET - List all fuel types
        if (req.method === 'GET') {
            const fuelTypes = await prisma.fuelType.findMany({
                where: { businessId: company_id },
                orderBy: { name: 'asc' }
            });

            return res.status(200).json({
                success: true,
                data: fuelTypes.map(ft => ({
                    id: ft.id,
                    name: ft.name,
                    code: ft.code,
                    currentPrice: Number(ft.currentPrice),
                    density: ft.density ? Number(ft.density) : null,
                    permissibleLoss: Number(ft.permissibleLoss),
                    isActive: ft.isActive
                }))
            });
        }

        // POST - Create new fuel type
        if (req.method === 'POST') {
            const { name, code, currentPrice, density, permissibleLoss } = req.body;

            if (!name || !code || currentPrice === undefined) {
                return res.status(400).json({ success: false, message: 'name, code, and currentPrice are required' });
            }

            // Check for duplicate code
            const existing = await prisma.fuelType.findFirst({
                where: { businessId: company_id, code }
            });

            if (existing) {
                return res.status(400).json({ success: false, message: `Fuel type with code "${code}" already exists` });
            }

            const fuelType = await prisma.fuelType.create({
                data: {
                    businessId: company_id,
                    name,
                    code,
                    currentPrice,
                    density: density || null,
                    permissibleLoss: permissibleLoss || 0.25
                }
            });

            return res.status(201).json({
                success: true,
                message: 'Fuel type created successfully',
                data: { id: fuelType.id }
            });
        }

        // PUT - Update fuel type
        if (req.method === 'PUT') {
            const { id, name, code, currentPrice, density, permissibleLoss, isActive } = req.body;

            if (!id) {
                return res.status(400).json({ success: false, message: 'id is required' });
            }

            const updateData = {};
            if (name !== undefined) updateData.name = name;
            if (code !== undefined) updateData.code = code;
            if (currentPrice !== undefined) updateData.currentPrice = currentPrice;
            if (density !== undefined) updateData.density = density;
            if (permissibleLoss !== undefined) updateData.permissibleLoss = permissibleLoss;
            if (isActive !== undefined) updateData.isActive = isActive;

            await prisma.fuelType.update({
                where: { id },
                data: updateData
            });

            return res.status(200).json({
                success: true,
                message: 'Fuel type updated successfully'
            });
        }

        // DELETE - Deactivate fuel type
        if (req.method === 'DELETE') {
            const { id } = req.query;

            if (!id) {
                return res.status(400).json({ success: false, message: 'id is required' });
            }

            await prisma.fuelType.update({
                where: { id },
                data: { isActive: false }
            });

            return res.status(200).json({
                success: true,
                message: 'Fuel type deactivated successfully'
            });
        }

        return res.status(405).json({ success: false, message: 'Method not allowed' });

    } catch (error) {
        console.error('Fuel Types API Error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

export default withAuth(handler, ['MANAGER', 'ADMIN']);
