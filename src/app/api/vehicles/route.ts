import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createDatabaseErrorResponse } from '@/lib/dbErrorHandler';
import { withDatabaseFallback, withAuthAndDatabaseFallback, vehicleHandlers } from '@/lib/apiWrapper';
import { verifyToken } from '@/lib/auth';

export const GET = withDatabaseFallback(async (request: NextRequest) => {
  try {
    // Get user from token if available
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    let user = null
    if (token) {
      user = verifyToken(token)
      if (user) {
        console.log('🔐 Authenticated request from:', user.name, 'Role:', user.role)
      }
    }
    
    // Try to use the mock handler first
    return await vehicleHandlers.getVehicles(request, user || undefined)
  } catch (error: any) {
    console.error('Error in vehicles handler:', error)
    return createDatabaseErrorResponse(error)
  }
})

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Map form data to database fields
    const vehicleData = {
      reg_number: body.reg_number,
      vin_number: body.vin_number,
      trim: body.trim,
      year: body.year ? parseInt(body.year) : null,
      status: body.status,
      color: body.color,
      engine_number: body.engine_number,
      chassis_number: body.chassis_number,
      current_region: body.current_region,
      current_district: body.current_district,
      current_mileage: body.current_mileage ? parseFloat(body.current_mileage) : null,
      last_service_date: body.last_service_date ? new Date(body.last_service_date) : null,
      next_service_km: body.next_service_km ? parseFloat(body.next_service_km) : null,
      type_id: body.type_id ? BigInt(body.type_id) : null,
      make_id: body.make_id ? BigInt(body.make_id) : null,
      notes: body.notes,
      spcode: body.spcode ? BigInt(body.spcode) : null,
      company_name: body.company_name,
      uid: body.uid
    };

    const vehicle = await prisma.vehicles.create({
      data: vehicleData
    });

    return NextResponse.json({
      message: 'Vehicle created successfully',
      vehicle: {
        ...vehicle,
        id: vehicle.id.toString(),
        type_id: vehicle.type_id?.toString(),
        make_id: vehicle.make_id?.toString(),
        spcode: vehicle.spcode?.toString()
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating vehicle:', error);
    return createDatabaseErrorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Vehicle ID is required' },
        { status: 400 }
      );
    }

    // Convert string IDs to BigInt
    const processedData: any = { ...updateData };
    if (processedData.type_id) processedData.type_id = BigInt(processedData.type_id);
    if (processedData.make_id) processedData.make_id = BigInt(processedData.make_id);
    if (processedData.spcode) processedData.spcode = BigInt(processedData.spcode);
    if (processedData.year) processedData.year = parseInt(processedData.year);
    if (processedData.current_mileage) processedData.current_mileage = parseFloat(processedData.current_mileage);
    if (processedData.next_service_km) processedData.next_service_km = parseFloat(processedData.next_service_km);
    if (processedData.last_service_date) processedData.last_service_date = new Date(processedData.last_service_date);

    const vehicle = await prisma.vehicles.update({
      where: { id: BigInt(id) },
      data: processedData
    });
      
      return NextResponse.json({ 
      message: 'Vehicle updated successfully',
      vehicle: {
        ...vehicle,
        id: vehicle.id.toString(),
        type_id: vehicle.type_id?.toString(),
        make_id: vehicle.make_id?.toString(),
        spcode: vehicle.spcode?.toString()
      }
    });
  } catch (error: any) {
    console.error('Error updating vehicle:', error);
    return createDatabaseErrorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Vehicle ID is required' },
        { status: 400 }
      );
    }

    await prisma.vehicles.delete({
      where: { id: BigInt(id) }
    });

    return NextResponse.json({ 
      message: 'Vehicle deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting vehicle:', error);
    return createDatabaseErrorResponse(error);
  }
}