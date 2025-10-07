import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const vehicles = await prisma.vehicles.findMany({
      orderBy: {
        created_at: 'desc'
      }
    });
    
    // Convert BigInt values to strings for JSON serialization
    const serializedVehicles = vehicles.map(vehicle => ({
      ...vehicle,
      id: vehicle.id.toString(),
      type_id: vehicle.type_id?.toString() || null,
      make_id: vehicle.make_id?.toString() || null,
      created_by: vehicle.created_by?.toString() || null,
      updated_by: vehicle.updated_by?.toString() || null,
      spcode: vehicle.spcode?.toString() || null
    }));
    
    return NextResponse.json(serializedVehicles);
  } catch (error: any) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json({ error: 'Error fetching vehicles', details: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Map form data to database fields
    const vehicleData = {
      reg_number: body.registrationNumber,
      vin_number: body.vin,
      trim: body.model,
      year: parseInt(body.year) || null,
      status: 'active', // Default status
      color: body.color,
      engine_number: '', // Default empty
      chassis_number: '', // Default empty
      current_region: body.location,
      current_district: body.location, // Use location for both
      current_mileage: parseFloat(body.currentMileage) || 0,
      last_service_date: body.purchaseDate ? new Date(body.purchaseDate) : null,
      next_service_km: parseInt(body.nextServiceKm) || 0,
      type_id: 1, // Default type ID
      make_id: 1, // Default make ID
      notes: body.additionalNotes,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: 1, // Default user ID (integer)
      updated_by: 1, // Default user ID (integer)
      deleted_at: null,
      deleted_by: null,
      spcode: 1 // Default SP code (integer)
    };

    const newVehicle = await prisma.vehicles.create({
      data: vehicleData
    });

    // Convert BigInt values to strings for JSON serialization
    const serializedVehicle = {
      ...newVehicle,
      id: newVehicle.id.toString(),
      type_id: newVehicle.type_id?.toString() || null,
      make_id: newVehicle.make_id?.toString() || null,
      created_by: newVehicle.created_by?.toString() || null,
      updated_by: newVehicle.updated_by?.toString() || null,
      spcode: newVehicle.spcode?.toString() || null
    };

    return NextResponse.json({ 
      success: true, 
      message: 'Vehicle added successfully!',
      vehicle: serializedVehicle 
    });
  } catch (error: any) {
    console.error('Error creating vehicle:', error);
    return NextResponse.json({ 
      error: 'Error creating vehicle', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Vehicle ID is required' }, { status: 400 });
    }

    // Map form data to database fields
    const vehicleData = {
      reg_number: updateData.registrationNumber,
      vin_number: updateData.vin,
      trim: updateData.model,
      year: parseInt(updateData.year) || null,
      status: updateData.status || 'active', // Use provided status or default to active
      color: updateData.color,
      engine_number: '', // Default empty
      chassis_number: '', // Default empty
      current_region: updateData.location,
      current_district: updateData.location, // Use location for both
      current_mileage: parseFloat(updateData.currentMileage) || 0,
      last_service_date: updateData.purchaseDate ? new Date(updateData.purchaseDate) : null,
      next_service_km: parseInt(updateData.nextServiceKm) || 0,
      type_id: 1, // Default type ID
      make_id: 1, // Default make ID
      notes: updateData.additionalNotes,
      updated_at: new Date(),
      updated_by: 1, // Default user ID (integer)
    };

    const updatedVehicle = await prisma.vehicles.update({
      where: { id: BigInt(id) },
      data: vehicleData
    });

    // Convert BigInt values to strings for JSON serialization
    const serializedVehicle = {
      ...updatedVehicle,
      id: updatedVehicle.id.toString(),
      type_id: updatedVehicle.type_id?.toString() || null,
      make_id: updatedVehicle.make_id?.toString() || null,
      created_by: updatedVehicle.created_by?.toString() || null,
      updated_by: updatedVehicle.updated_by?.toString() || null,
      spcode: updatedVehicle.spcode?.toString() || null
    };

    return NextResponse.json({ 
      success: true, 
      message: 'Vehicle updated successfully!',
      vehicle: serializedVehicle 
    });
  } catch (error: any) {
    console.error('Error updating vehicle:', error);
    return NextResponse.json({ 
      error: 'Error updating vehicle', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Vehicle ID is required' }, { status: 400 });
    }

    // First delete all related records that reference this vehicle
    await prisma.fuel_request.deleteMany({
      where: { vehicle_id: BigInt(id) }
    });
    
    await prisma.maintenance_history.deleteMany({
      where: { vehicle_id: BigInt(id) }
    });
    
    await prisma.maintenance_schedule.deleteMany({
      where: { vehicle_id: BigInt(id) }
    });
    
    await prisma.repair_history.deleteMany({
      where: { vehicle_id: BigInt(id) }
    });
    
    // Delete repair schedules and repair requests
    const repairRequests = await prisma.repair_request.findMany({
      where: { vehicle_id: BigInt(id) },
      select: { id: true }
    });
    
    if (repairRequests.length > 0) {
      const repairRequestIds = repairRequests.map(req => req.id);
      await prisma.repair_schedule.deleteMany({
        where: { repair_request_id: { in: repairRequestIds } }
      });
      await prisma.repair_request.deleteMany({
        where: { vehicle_id: BigInt(id) }
      });
    }
    
    await prisma.insurance.deleteMany({
      where: { vehicle_id: BigInt(id) }
    });
    
    // Note: roadworthy table uses vehicle_number, not vehicle_id
    // We'll need to get the vehicle's reg_number first to delete roadworthy records
    const vehicle = await prisma.vehicles.findUnique({
      where: { id: BigInt(id) },
      select: { reg_number: true }
    });
    
    if (vehicle) {
      await prisma.roadworthy.deleteMany({
        where: { vehicle_number: vehicle.reg_number }
      });
    }
    
    // Delete spare_part_dispatch and spare_part_request
    const sparePartRequests = await prisma.spare_part_request.findMany({
      where: { vehicle_id: BigInt(id) },
      select: { id: true }
    });
    
    if (sparePartRequests.length > 0) {
      const sparePartRequestIds = sparePartRequests.map(req => req.id);
      await prisma.spare_part_dispatch.deleteMany({
        where: { spare_part_request_id: { in: sparePartRequestIds } }
      });
      await prisma.spare_part_request.deleteMany({
        where: { vehicle_id: BigInt(id) }
      });
    }
    
    await prisma.spare_part_receipt.deleteMany({
      where: { vehicle_id: BigInt(id) }
    });
    
    await prisma.spare_part_request.deleteMany({
      where: { vehicle_id: BigInt(id) }
    });
    
    await prisma.vehicle_dispatch.deleteMany({
      where: { vehicle_id: BigInt(id) }
    });
    
    await prisma.vehicle_reservation.deleteMany({
      where: { vehicle_id: BigInt(id) }
    });
    
    // Get driver_operators that reference this vehicle before deleting them
    const driversToDelete = await prisma.driver_operators.findMany({
      where: { vehicle_id: BigInt(id) },
      select: { id: true }
    });
    
    if (driversToDelete.length > 0) {
      const driverIds = driversToDelete.map(driver => driver.id);
      
      // Delete fuel_logs that reference these drivers
      await prisma.fuel_logs.deleteMany({
        where: { driver_id: { in: driverIds } }
      });
      
      // Delete incident_reports that reference these drivers
      await prisma.incident_reports.deleteMany({
        where: { driver_id: { in: driverIds } }
      });
      
      // Now delete the driver_operators
      await prisma.driver_operators.deleteMany({
        where: { vehicle_id: BigInt(id) }
      });
    }

    // Finally delete the vehicle
    await prisma.vehicles.delete({
      where: { id: BigInt(id) }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Vehicle deleted successfully!'
    });
  } catch (error: any) {
    console.error('Error deleting vehicle:', error);
    return NextResponse.json({ 
      error: 'Error deleting vehicle', 
      details: error.message 
    }, { status: 500 });
  }
}