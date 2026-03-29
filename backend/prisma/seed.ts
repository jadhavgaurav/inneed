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
    // Rent + Buy (both available)
    { title: 'Sony Alpha A7 III Camera', desc: 'Full-frame mirrorless camera. Excellent for portraits and events.', cat: 'cameras', vendor: 0, dailyRate: 1500, deposit: 15000, buyPrice: 145000, forRent: true, forSale: true, condition: 'LIKE_NEW', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=400&fit=crop' },
    { title: 'Canon EOS 5D Mark IV', desc: 'Professional DSLR with 30.4MP sensor. Perfect for weddings and commercial shoots.', cat: 'cameras', vendor: 0, dailyRate: 1200, deposit: 12000, buyPrice: 120000, forRent: true, forSale: true, condition: 'GOOD', image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&h=400&fit=crop' },
    { title: 'Trek Mountain Bike 29"', desc: 'High-performance mountain bike for trail rides. Disc brakes, 21 speeds.', cat: 'bikes', vendor: 1, dailyRate: 300, deposit: 2000, buyPrice: 28000, forRent: true, forSale: true, condition: 'LIKE_NEW', image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=600&h=400&fit=crop' },
    { title: 'Sony 65" 4K Smart TV', desc: 'Crystal clear 4K display with Android TV. Perfect for events or temporary use.', cat: 'electronics', vendor: 1, dailyRate: 600, deposit: 5000, buyPrice: 55000, forRent: true, forSale: true, condition: 'LIKE_NEW', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&h=400&fit=crop' },
    { title: 'Fender Stratocaster Electric Guitar', desc: 'Classic American Strat in sunburst finish. Includes cable and picks.', cat: 'instruments', vendor: 4, dailyRate: 400, deposit: 3000, buyPrice: 35000, forRent: true, forSale: true, condition: 'GOOD', image: 'https://images.unsplash.com/photo-1550291652-6ea9114a47b1?w=600&h=400&fit=crop' },
    // Rent only
    { title: 'Royal Enfield Classic 350', desc: 'Iconic motorcycle for weekend rides and adventures. Helmet included.', cat: 'bikes', vendor: 1, dailyRate: 800, deposit: 5000, forRent: true, forSale: false, condition: 'GOOD', image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&h=400&fit=crop' },
    { title: 'Bosch Power Drill Set', desc: '18V cordless drill with complete bit set. For home renovation projects.', cat: 'tools', vendor: 2, dailyRate: 250, deposit: 1500, forRent: true, forSale: false, condition: 'GOOD', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&h=400&fit=crop' },
    { title: 'Circular Saw Professional', desc: 'Heavy-duty circular saw for woodworking. Safety goggles included.', cat: 'tools', vendor: 2, dailyRate: 350, deposit: 2000, forRent: true, forSale: false, condition: 'GOOD', image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&h=400&fit=crop' },
    { title: 'Wooden Dining Table 6-seater', desc: 'Solid wood dining table, perfect for events and gatherings.', cat: 'furniture', vendor: 3, dailyRate: 500, deposit: 3000, forRent: true, forSale: false, condition: 'GOOD', image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&h=400&fit=crop' },
    { title: 'DJI Mavic Air 2 Drone', desc: 'Professional drone with 4K camera and 3-axis gimbal. 34min flight time.', cat: 'cameras', vendor: 0, dailyRate: 2000, deposit: 20000, forRent: true, forSale: false, condition: 'LIKE_NEW', image: 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=600&h=400&fit=crop' },
    { title: 'Badminton Set Complete', desc: 'Professional rackets, shuttlecocks, and net. For indoor/outdoor play.', cat: 'sports', vendor: 4, dailyRate: 150, deposit: 800, forRent: true, forSale: false, condition: 'GOOD', image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&h=400&fit=crop' },
    { title: 'Cricket Kit Full', desc: 'Complete cricket kit with bat, pads, gloves, helmet, and ball. MRF brand.', cat: 'sports', vendor: 4, dailyRate: 500, deposit: 3000, forRent: true, forSale: false, condition: 'GOOD', image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&h=400&fit=crop' },
    { title: 'GoPro Hero 11 Action Camera', desc: 'Waterproof action camera with HyperSmooth 5.0 stabilization. Accessories included.', cat: 'cameras', vendor: 0, dailyRate: 700, deposit: 5000, forRent: true, forSale: false, condition: 'LIKE_NEW', image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=400&fit=crop' },
    // Buy only
    { title: 'Foldable Chairs Set (10)', desc: 'Premium plastic chairs with cushioning. Ideal for events. Selling due to upgrade.', cat: 'furniture', vendor: 3, dailyRate: 0, deposit: 0, buyPrice: 8000, forRent: false, forSale: true, condition: 'LIKE_NEW', image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=600&h=400&fit=crop' },
    { title: 'Yamaha Keyboard 61-key', desc: 'Touch-sensitive keys with 500+ voices. Selling — moving abroad.', cat: 'instruments', vendor: 4, dailyRate: 0, deposit: 0, buyPrice: 18000, forRent: false, forSale: true, condition: 'LIKE_NEW', image: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600&h=400&fit=crop' },
  ]

  for (const item of listingData) {
    const vendorProfile = await prisma.vendorProfile.findUnique({ where: { userId: vendorIds[item.vendor] } })
    if (!vendorProfile) continue

    // Check if listing already exists for this vendor with same title
    const existing = await prisma.listing.findFirst({
      where: { vendorId: vendorIds[item.vendor], title: item.title },
    })

    if (existing) {
      // Update availability and pricing for existing listings
      await prisma.listing.update({
        where: { id: existing.id },
        data: {
          availableForRent: item.forRent,
          availableForSale: item.forSale,
        },
      })
      // Update pricing (add buyPrice if applicable)
      if (existing.id) {
        await prisma.listingPricing.update({
          where: { listingId: existing.id },
          data: {
            rentPriceDaily: item.dailyRate || null,
            rentPriceWeekly: item.dailyRate ? item.dailyRate * 5.5 : null,
            rentPriceMonthly: item.dailyRate ? item.dailyRate * 18 : null,
            buyPrice: item.buyPrice || null,
            securityDeposit: item.deposit || 0,
          },
        })
      }
      // Add image if listing exists but has no media
      const mediaCount = await prisma.listingMedia.count({ where: { listingId: existing.id } })
      if (mediaCount === 0) {
        await prisma.listingMedia.create({
          data: {
            listingId: existing.id,
            r2Key: `seed/${item.cat}/${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.jpg`,
            url: item.image,
            isPrimary: true,
            sortOrder: 0,
          },
        })
      }
      continue
    }

    await prisma.listing.create({
      data: {
        vendorId: vendorIds[item.vendor],
        categoryId: categories[item.cat],
        title: item.title,
        description: item.desc,
        condition: item.condition as any,
        availableForRent: item.forRent,
        availableForSale: item.forSale,
        status: 'ACTIVE',
        isFeatured: Math.random() > 0.6,
        pricing: {
          create: {
            rentPriceDaily: item.dailyRate || null,
            rentPriceWeekly: item.dailyRate ? item.dailyRate * 5.5 : null,
            rentPriceMonthly: item.dailyRate ? item.dailyRate * 18 : null,
            buyPrice: item.buyPrice || null,
            securityDeposit: item.deposit || 0,
          },
        },
        media: {
          create: {
            r2Key: `seed/${item.cat}/${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.jpg`,
            url: item.image,
            isPrimary: true,
            sortOrder: 0,
          },
        },
      },
    })
  }
  console.log('  ✓ Listings created with images:', listingData.length)

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
