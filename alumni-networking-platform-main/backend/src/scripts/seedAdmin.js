import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/db.js';

dotenv.config();

/**
 * Seed initial platform Administrator account
 */
const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@alumniconnect.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
    const adminName = process.env.ADMIN_NAME || 'AlumniConnect Administrator';

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`[SeedAdmin] Administrator account already exists for ${adminEmail}.`);
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        existingAdmin.isActive = true;
        existingAdmin.isVerified = true;
        await existingAdmin.save();
        console.log(`[SeedAdmin] Updated role to 'admin' for ${adminEmail}.`);
      }
      process.exit(0);
    }

    // Create new administrator account
    const admin = await User.create({
      fullName: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      isVerified: true,
      isActive: true,
    });

    console.log('====================================================');
    console.log('[SeedAdmin] SUCCESS! Administrator Account Created:');
    console.log(`Name:     ${admin.fullName}`);
    console.log(`Email:    ${admin.email}`);
    console.log(`Role:     ${admin.role}`);
    console.log(`ID:       ${admin._id}`);
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error(`[SeedAdmin] Error seeding administrator: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
