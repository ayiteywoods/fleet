import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const simple = searchParams.get('simple');
    
    if (simple === 'true') {
      // Simple list for dropdowns
      const vehicles = await prisma.vehicles.findMany({
        select: {
          id: true,
          reg_number: true,
          trim: true,
          year: true,
          status: true,
          color: true
        },
        orderBy: {
          reg_number: 'asc'
        }
      });
      
      const serializedVehicles = vehicles.map(vehicle => ({
        id: vehicle.id.toString(),
        reg_number: vehicle.reg_number,
        trim: vehicle.trim,
        year: vehicle.year,
        status: vehicle.status,
        color: vehicle.color,
        name: `${vehicle.reg_number} - ${vehicle.trim} (${vehicle.year})`
      }));
      
      return NextResponse.json(serializedVehicles);
    }
    
    // Full list with relations
    const vehicles = await prisma.vehicles.findMany({
      include: {
        subsidiary: {
          select: {
            id: true,
            name: true
          }
        },
        driver_operators: {
          where: {
            vehicle_id: {
              not: null
            }
          },
          select: {
            id: true,
            name: true,
            phone: true,
            license_number: true
          }
        },
        vehicle_types: {
          select: {
            id: true,
            type: true
          }
        },
        vehicle_makes: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    
    // Convert BigInt values to strings for JSON serialization and add subsidiary name
    const serializedVehicles = vehicles.map(vehicle => ({
      id: vehicle.id.toString(),
      reg_number: vehicle.reg_number,
      vin_number: vehicle.vin_number,
      trim: vehicle.trim,
      year: vehicle.year,
      status: vehicle.status,
      color: vehicle.color,
      engine_number: vehicle.engine_number,
      chassis_number: vehicle.chassis_number,
      current_region: vehicle.current_region,
      current_district: vehicle.current_district,
      current_mileage: vehicle.current_mileage,
      last_service_date: vehicle.last_service_date,
      next_service_km: vehicle.next_service_km,
      type_id: vehicle.type_id?.toString() || null,
      make_id: vehicle.make_id?.toString() || null,
      notes: vehicle.notes,
      created_at: vehicle.created_at,
      updated_at: vehicle.updated_at,
      created_by: vehicle.created_by?.toString() || null,
      updated_by: vehicle.updated_by?.toString() || null,
      spcode: vehicle.spcode?.toString() || null,
      subsidiary_name: vehicle.subsidiary?.name || null,
      vehicle_type_name: vehicle.vehicle_types?.type || null,
      vehicle_make_name: vehicle.vehicle_makes?.name || null,
      assigned_driver: vehicle.driver_operators.length > 0 ? {
        id: vehicle.driver_operators[0].id.toString(),
        name: vehicle.driver_operators[0].name,
        phone: vehicle.driver_operators[0].phone,
        license_number: vehicle.driver_operators[0].license_number
      } : null,
      subsidiary: vehicle.subsidiary ? {
        id: vehicle.subsidiary.id.toString(),
        name: vehicle.subsidiary.name
      } : null
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
      type_id: body.vehicleType ? BigInt(body.vehicleType) : null,
      make_id: body.make ? BigInt(body.make) : null,
      notes: body.additionalNotes,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: 1, // Default user ID (integer)
      updated_by: 1, // Default user ID (integer)
      deleted_at: null,
      deleted_by: null,
      spcode: body.subsidiary ? parseInt(body.subsidiary) : 1 // Use selected subsidiary as spcode
    };

    const newVehicle = await prisma.vehicles.create({
      data: vehicleData
    });

    // If a driver is assigned, update the driver_operator record to link to this vehicle
    if (body.assignedTo) {
      try {
        await prisma.driver_operators.update({
          where: { id: BigInt(body.assignedTo) },
          data: {
            vehicle_id: newVehicle.id,
            updated_at: new Date(),
            updated_by: 1
          }
        });
      } catch (driverError) {
        console.warn('Could not assign driver to vehicle:', driverError);
        // Continue with vehicle creation even if driver assignment fails
      }
    }

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

    // Get the current vehicle data to compare
    const currentVehicle = await prisma.vehicles.findUnique({
      where: { id: BigInt(id) },
      select: {
        reg_number: true,
        vin_number: true,
        trim: true,
        year: true,
        status: true,
        color: true,
        engine_number: true,
        chassis_number: true,
        current_region: true,
        current_district: true,
        current_mileage: true,
        last_service_date: true,
        next_service_km: true,
        type_id: true,
        make_id: true,
        notes: true,
        spcode: true
      }
    });

    if (!currentVehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Map form data to database fields - only include fields that have changed
    const vehicleData: any = {
      updated_at: new Date(),
      updated_by: 1, // Default user ID (integer)
    };

    // Only update fields that have actually changed
    if (updateData.registrationNumber && updateData.registrationNumber !== currentVehicle.reg_number) {
      vehicleData.reg_number = updateData.registrationNumber;
    }
    if (updateData.vin && updateData.vin !== currentVehicle.vin_number) {
      vehicleData.vin_number = updateData.vin;
    }
    if (updateData.model && updateData.model !== currentVehicle.trim) {
      vehicleData.trim = updateData.model;
    }
    if (updateData.year && parseInt(updateData.year) !== currentVehicle.year) {
      vehicleData.year = parseInt(updateData.year);
    }
    if (updateData.status && updateData.status !== currentVehicle.status) {
      vehicleData.status = updateData.status;
    }
    if (updateData.color && updateData.color !== currentVehicle.color) {
      vehicleData.color = updateData.color;
    }
    if (updateData.engineNumber && updateData.engineNumber !== currentVehicle.engine_number) {
      vehicleData.engine_number = updateData.engineNumber;
    }
    if (updateData.chassisNumber && updateData.chassisNumber !== currentVehicle.chassis_number) {
      vehicleData.chassis_number = updateData.chassisNumber;
    }
    if (updateData.location && updateData.location !== currentVehicle.current_region) {
      vehicleData.current_region = updateData.location;
      vehicleData.current_district = updateData.location;
    }
    if (updateData.currentMileage && parseFloat(updateData.currentMileage) !== Number(currentVehicle.current_mileage)) {
      vehicleData.current_mileage = parseFloat(updateData.currentMileage);
    }
    if (updateData.purchaseDate) {
      const newDate = new Date(updateData.purchaseDate);
      if (newDate.getTime() !== currentVehicle.last_service_date?.getTime()) {
        vehicleData.last_service_date = newDate;
      }
    }
    if (updateData.nextServiceKm && parseInt(updateData.nextServiceKm) !== currentVehicle.next_service_km) {
      vehicleData.next_service_km = parseInt(updateData.nextServiceKm);
    }
    if (updateData.vehicleType && BigInt(updateData.vehicleType) !== currentVehicle.type_id) {
      vehicleData.type_id = BigInt(updateData.vehicleType);
    }
    if (updateData.make && BigInt(updateData.make) !== currentVehicle.make_id) {
      vehicleData.make_id = BigInt(updateData.make);
    }
    if (updateData.additionalNotes && updateData.additionalNotes !== currentVehicle.notes) {
      vehicleData.notes = updateData.additionalNotes;
    }
    if (updateData.subsidiary && BigInt(updateData.subsidiary) !== currentVehicle.spcode) {
      vehicleData.spcode = BigInt(updateData.subsidiary);
    }

    // If no fields have changed, return success without updating
    if (Object.keys(vehicleData).length === 2) { // Only updated_at and updated_by
      // Serialize the current vehicle data properly
      const serializedCurrentVehicle = {
        ...currentVehicle,
        id: BigInt(id).toString(),
        type_id: currentVehicle.type_id?.toString() || null,
        make_id: currentVehicle.make_id?.toString() || null,
        spcode: currentVehicle.spcode?.toString() || null,
        current_mileage: currentVehicle.current_mileage?.toString() || null,
        last_service_date: currentVehicle.last_service_date?.toISOString() || null
      };
      
      return NextResponse.json({ 
        success: true, 
        message: 'No changes detected - vehicle data is already up to date',
        vehicle: serializedCurrentVehicle 
      });
    }

    const updatedVehicle = await prisma.vehicles.update({
      where: { id: BigInt(id) },
      data: vehicleData,
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
        },
        vehicle_makes: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Convert BigInt values to strings for JSON serialization and add related data
    const serializedVehicle = {
      id: updatedVehicle.id.toString(),
      reg_number: updatedVehicle.reg_number,
      vin_number: updatedVehicle.vin_number,
      trim: updatedVehicle.trim,
      year: updatedVehicle.year,
      status: updatedVehicle.status,
      color: updatedVehicle.color,
      engine_number: updatedVehicle.engine_number,
      chassis_number: updatedVehicle.chassis_number,
      current_region: updatedVehicle.current_region,
      current_district: updatedVehicle.current_district,
      current_mileage: updatedVehicle.current_mileage?.toString() || null,
      last_service_date: updatedVehicle.last_service_date?.toISOString() || null,
      next_service_km: updatedVehicle.next_service_km,
      notes: updatedVehicle.notes,
      created_at: updatedVehicle.created_at?.toISOString() || null,
      updated_at: updatedVehicle.updated_at?.toISOString() || null,
      type_id: updatedVehicle.type_id?.toString() || null,
      make_id: updatedVehicle.make_id?.toString() || null,
      created_by: updatedVehicle.created_by?.toString() || null,
      updated_by: updatedVehicle.updated_by?.toString() || null,
      spcode: updatedVehicle.spcode?.toString() || null,
      subsidiary_name: updatedVehicle.subsidiary?.name || null,
      vehicle_type_name: updatedVehicle.vehicle_types?.type || null,
      vehicle_make_name: updatedVehicle.vehicle_makes?.name || null,
      subsidiary: updatedVehicle.subsidiary ? {
        id: updatedVehicle.subsidiary.id.toString(),
        name: updatedVehicle.subsidiary.name
      } : null
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