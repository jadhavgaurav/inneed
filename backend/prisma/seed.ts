import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Platform config
  await prisma.platformConfig.upsert({
    where: { key: 'commission_rate' },
    update: {},
    create: { key: 'commission_rate', value: '0.10', description: 'Platform commission rate (10%)' },
  })
  await prisma.platformConfig.upsert({
    where: { key: 'max_rental_days' },
    update: {},
    create: { key: 'max_rental_days', value: '30', description: 'Maximum rental duration in days' },
  })

  // Admin user
  const adminHash = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@inneed.in' },
    update: {},
    create: {
      email: 'admin@inneed.in',
      name: 'Admin',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  })
  console.log('  ✓ Admin user created:', admin.email)

  // Categories
  const categoryData = [
    { name: 'Cameras & Photography', icon: '📷', slug: 'cameras' },
    { name: 'Bikes & Cycles', icon: '🚲', slug: 'bikes' },
    { name: 'Tools & Equipment', icon: '🔧', slug: 'tools' },
    { name: 'Furniture', icon: '🪑', slug: 'furniture' },
    { name: 'Electronics', icon: '💻', slug: 'electronics' },
    { name: 'Musical Instruments', icon: '🎸', slug: 'instruments' },
    { name: 'Sports & Fitness', icon: '⚽', slug: 'sports' },
    { name: 'Clothing & Costumes', icon: '👗', slug: 'clothing' },
  ]

  const categories: Record<string, string> = {}
  for (const cat of categoryData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { name: cat.name, icon: cat.icon, slug: cat.slug, isActive: true },
    })
    categories[cat.slug] = created.id
  }
  console.log('  ✓ Categories created:', Object.keys(categories).length)

  // Vendors — UserRole enum only has CUSTOMER and ADMIN.
  // Vendors are CUSTOMER users with isVendorApproved=true + a VendorProfile.
  const vendorData = [
    { name: 'Rahul Sharma', email: 'rahul@example.com', phone: '9876543210', business: 'Rahul Camera Rentals', businessType: 'Individual', city: 'Mumbai', state: 'Maharashtra', lat: 19.076, lng: 72.877 },
    { name: 'Priya Patel', email: 'priya@example.com', phone: '9876543211', business: 'Priya Electronics', businessType: 'Individual', city: 'Bangalore', state: 'Karnataka', lat: 12.972, lng: 77.594 },
    { name: 'Amit Singh', email: 'amit@example.com', phone: '9876543212', business: 'Amit Tools Hub', businessType: 'Sole Proprietorship', city: 'Delhi', state: 'Delhi', lat: 28.614, lng: 77.209 },
    { name: 'Sneha Iyer', email: 'sneha@example.com', phone: '9876543213', business: 'Sneha Furniture Rentals', businessType: 'Individual', city: 'Chennai', state: 'Tamil Nadu', lat: 13.083, lng: 80.271 },
    { name: 'Vikram Gupta', email: 'vikram@example.com', phone: '9876543214', business: 'Vikram Sports World', businessType: 'Sole Proprietorship', city: 'Hyderabad', state: 'Telangana', lat: 17.386, lng: 78.486 },
  ]

  const vendorHash = await bcrypt.hash('vendor123', 10)
  const vendorIds: string[] = []

  for (const v of vendorData) {
    const user = await prisma.user.upsert({
      where: { email: v.email },
      update: {},
      create: {
        email: v.email,
        name: v.name,
        passwordHash: vendorHash,
        role: 'CUSTOMER',
        isVendorApproved: true,
      },
    })

    await prisma.vendorProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        businessName: v.business,
        businessType: v.businessType,
        phone: v.phone,
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: admin.id,
        location: {
          create: {
            address: `${v.city} Main Street`,
            city: v.city,
            state: v.state,
            pincode: '400001',
            latitude: v.lat,
            longitude: v.lng,
          },
        },
        metrics: {
          create: {
            totalListings: 0,
            totalOrders: 0,
            averageRating: 0,
            totalReviews: 0,
            totalEarnings: 0,
          },
        },
      },
    })

    vendorIds.push(user.id)
  }
  console.log('  ✓ Vendors created:', vendorIds.length)

  // Listings — Listing model has no slug field, use create (not upsert)
  const listingData = [
    { title: 'Sony Alpha A7 III Camera', desc: 'Full-frame mirrorless camera. Excellent for portraits and events.', cat: 'cameras', vendor: 0, dailyRate: 1500, deposit: 15000, condition: 'LIKE_NEW' },
    { title: 'Canon EOS 5D Mark IV', desc: 'Professional DSLR with 30.4MP sensor. Perfect for weddings and commercial shoots.', cat: 'cameras', vendor: 0, dailyRate: 1200, deposit: 12000, condition: 'GOOD' },
    { title: 'Royal Enfield Classic 350', desc: 'Iconic motorcycle for weekend rides and adventures. Helmet included.', cat: 'bikes', vendor: 1, dailyRate: 800, deposit: 5000, condition: 'GOOD' },
    { title: 'Trek Mountain Bike 29"', desc: 'High-performance mountain bike for trail rides. Disc brakes, 21 speeds.', cat: 'bikes', vendor: 1, dailyRate: 300, deposit: 2000, condition: 'LIKE_NEW' },
    { title: 'Bosch Power Drill Set', desc: '18V cordless drill with complete bit set. For home renovation projects.', cat: 'tools', vendor: 2, dailyRate: 250, deposit: 1500, condition: 'GOOD' },
    { title: 'Circular Saw Professional', desc: 'Heavy-duty circular saw for woodworking. Safety goggles included.', cat: 'tools', vendor: 2, dailyRate: 350, deposit: 2000, condition: 'GOOD' },
    { title: 'Wooden Dining Table 6-seater', desc: 'Solid wood dining table, perfect for events and gatherings.', cat: 'furniture', vendor: 3, dailyRate: 500, deposit: 3000, condition: 'GOOD' },
    { title: 'Foldable Chairs Set (10)', desc: 'Premium plastic chairs with cushioning. Ideal for events.', cat: 'furniture', vendor: 3, dailyRate: 200, deposit: 1000, condition: 'LIKE_NEW' },
    { title: 'Sony 65" 4K Smart TV', desc: 'Crystal clear 4K display with Android TV. Perfect for events or temporary use.', cat: 'electronics', vendor: 1, dailyRate: 600, deposit: 5000, condition: 'LIKE_NEW' },
    { title: 'DJI Mavic Air 2 Drone', desc: 'Professional drone with 4K camera and 3-axis gimbal. 34min flight time.', cat: 'cameras', vendor: 0, dailyRate: 2000, deposit: 20000, condition: 'LIKE_NEW' },
    { title: 'Fender Stratocaster Electric Guitar', desc: 'Classic American Strat in sunburst finish. Includes cable and picks.', cat: 'instruments', vendor: 4, dailyRate: 400, deposit: 3000, condition: 'GOOD' },
    { title: 'Yamaha Keyboard 61-key', desc: 'Touch-sensitive keys with 500+ voices. Great for practice and performances.', cat: 'instruments', vendor: 4, dailyRate: 300, deposit: 2000, condition: 'LIKE_NEW' },
    { title: 'Badminton Set Complete', desc: 'Professional rackets, shuttlecocks, and net. For indoor/outdoor play.', cat: 'sports', vendor: 4, dailyRate: 150, deposit: 800, condition: 'GOOD' },
    { title: 'Cricket Kit Full', desc: 'Complete cricket kit with bat, pads, gloves, helmet, and ball. MRF brand.', cat: 'sports', vendor: 4, dailyRate: 500, deposit: 3000, condition: 'GOOD' },
    { title: 'GoPro Hero 11 Action Camera', desc: 'Waterproof action camera with HyperSmooth 5.0 stabilization. Accessories included.', cat: 'cameras', vendor: 0, dailyRate: 700, deposit: 5000, condition: 'LIKE_NEW' },
  ]

  for (const item of listingData) {
    const vendorProfile = await prisma.vendorProfile.findUnique({ where: { userId: vendorIds[item.vendor] } })
    if (!vendorProfile) continue

    // Skip if listing already exists for this vendor with same title
    const existing = await prisma.listing.findFirst({
      where: { vendorId: vendorIds[item.vendor], title: item.title },
    })
    if (existing) continue

    await prisma.listing.create({
      data: {
        vendorId: vendorIds[item.vendor],
        categoryId: categories[item.cat],
        title: item.title,
        description: item.desc,
        condition: item.condition as any,
        availableForRent: true,
        availableForSale: false,
        status: 'ACTIVE',
        isFeatured: Math.random() > 0.6,
        pricing: {
          create: {
            rentPriceDaily: item.dailyRate,
            rentPriceWeekly: item.dailyRate * 5.5,
            rentPriceMonthly: item.dailyRate * 18,
            securityDeposit: item.deposit,
          },
        },
      },
    })
  }
  console.log('  ✓ Listings created:', listingData.length)

  // Customer user
  const customerHash = await bcrypt.hash('customer123', 10)
  await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      name: 'Test Customer',
      passwordHash: customerHash,
      role: 'CUSTOMER',
    },
  })
  console.log('  ✓ Test customer created: customer@example.com / customer123')

  console.log('\n🎉 Seeding complete!')
  console.log('\nTest accounts:')
  console.log('  Admin:    admin@inneed.in / admin123')
  console.log('  Vendor:   rahul@example.com / vendor123')
  console.log('  Customer: customer@example.com / customer123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
