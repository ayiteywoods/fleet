import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('id');
    
    if (!vehicleId) {
      return NextResponse.json({ error: 'Vehicle ID is required' }, { status: 400 });
    }

    const vehicle = await prisma.vehicles.findUnique({
      where: { id: BigInt(vehicleId) },
      include: {
        subsidiary: {
          select: {
            id: true,
            name: true
          }
        },
        vehicle_types: {
          select: {
            id: true,
            type: true
          }
        }
      }
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Serialize BigInt values and return vehicle details
    const serializedVehicle = {
      id: vehicle.id.toString(),
      reg_number: vehicle.reg_number,
      subsidiary_name: vehicle.subsidiary?.name || null,
      vehicle_type: vehicle.vehicle_types?.type || null
    };

    return NextResponse.json(serializedVehicle);
  } catch (error: any) {
    console.error('Error fetching vehicle details:', error);
    return NextResponse.json({ 
      error: 'Error fetching vehicle details', 
      details: error.message 
    }, { status: 500 });
  }
}
