import bcrypt from 'bcrypt';
import { sequelize } from './db';
import {
  User,
  Product,
  SizeStock,
  Review,
  Order,
  OrderItem,
  StatusHistoryEntry,
} from '../models/associations';

const SALT_ROUNDS = 12;

export async function seedDatabase() {
  const transaction = await sequelize.transaction();
  try {
    // 1. Check if products already exist
    const productCount = await Product.count({ transaction });
    if (productCount > 0) {
      console.log('Database already populated. Skipping seeding.');
      await transaction.commit();
      return;
    }

    console.log('Seeding database with mock data...');

    // 2. Create Default Users
    const hashedPassword = await bcrypt.hash('password123', SALT_ROUNDS);

    // Default Customer 1
    const customerUser = await User.create(
      {
        name: 'Aarav Sharma',
        email: 'aarav@example.com',
        phone: '9841234567',
        passwordHash: hashedPassword,
        role: 'customer',
        street: 'Thamel, Ward 26',
        city: 'Kathmandu',
        district: 'Kathmandu',
        isActive: true,
      },
      { transaction }
    );

    // Default Customer 2
    const customerUser2 = await User.create(
      {
        name: 'Bibek Basnet',
        email: 'bibek@example.com',
        phone: '9842234567',
        passwordHash: hashedPassword,
        role: 'customer',
        street: 'Baneshwor',
        city: 'Kathmandu',
        district: 'Kathmandu',
        isActive: true,
      },
      { transaction }
    );

    // Default Customer 3
    const customerUser3 = await User.create(
      {
        name: 'Sujata Thapa',
        email: 'sujata@example.com',
        phone: '9843234567',
        passwordHash: hashedPassword,
        role: 'customer',
        street: 'Lalitpur Ward 4',
        city: 'Lalitpur',
        district: 'Lalitpur',
        isActive: true,
      },
      { transaction }
    );

    // Default Admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@jerseystore.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'password123';
    const adminUsername = process.env.ADMIN_USERNAME || 'Admin User';
    
    const hashedAdminPassword = await bcrypt.hash(adminPassword, SALT_ROUNDS);

    await User.create(
      {
        name: adminUsername,
        email: adminEmail,
        phone: '9800000000',
        passwordHash: hashedAdminPassword,
        role: 'admin',
        street: 'Main Street',
        city: 'Kathmandu',
        district: 'Kathmandu',
        isActive: true,
      },
      { transaction }
    );

    // 3. Mock Products Data
    const mockProductsRaw = [
      {
        tempId: 'arg-home-26',
        name: 'Argentina 2026 Home Jersey',
        slug: 'argentina-2026-home',
        description: 'The eternal light blue and white. Defending champions step onto the 2026 stage with this stunning home kit. Messi leads the Albiceleste once more. Premium breathable mesh, sweat-wicking — wear it like a champion.',
        price: 2999,
        compareAtPrice: 3800,
        images: [
          'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=700&q=80',
          'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=700&q=80',
        ],
        category: 'worldcup',
        team: 'Argentina',
        player: 'Messi',
        jerseyType: 'home',
        sizes: [
          { size: 'S', stock: 4 },
          { size: 'M', stock: 11 },
          { size: 'L', stock: 7 },
          { size: 'XL', stock: 3 },
          { size: 'XXL', stock: 1 },
        ],
        tags: ['argentina', 'worldcup2026', 'messi', 'champions', 'albiceleste'],
        isFeatured: true,
        isLimitedDrop: false,
        allowCustomization: true,
        rating: 4.9,
        reviewCount: 214,
        isActive: true,
      },
      {
        tempId: 'arg-away-26',
        name: 'Argentina 2026 Away Jersey',
        slug: 'argentina-2026-away',
        description: 'Bold purple away kit for Argentina at World Cup 2026. A statement jersey that turned heads across the globe. Limited stock — claim yours before it sells out.',
        price: 2800,
        compareAtPrice: null,
        images: [
          'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=700&q=80',
        ],
        category: 'worldcup',
        team: 'Argentina',
        player: null,
        jerseyType: 'away',
        sizes: [
          { size: 'S', stock: 2 },
          { size: 'M', stock: 5 },
          { size: 'L', stock: 4 },
          { size: 'XL', stock: 1 },
          { size: 'XXL', stock: 0 },
        ],
        tags: ['argentina', 'worldcup2026', 'away', 'purple'],
        isFeatured: false,
        isLimitedDrop: true,
        allowCustomization: true,
        rating: 4.7,
        reviewCount: 58,
        isActive: true,
      },
      {
        tempId: 'bra-home-26',
        name: 'Brazil 2026 Home Jersey',
        slug: 'brazil-2026-home',
        description: 'Canary yellow. The color that has defined football glory for decades. Brazil returns to the World Cup hungry for a 6th star. Vinicius Jr., Rodrygo and the Seleção in iconic gold and green.',
        price: 2999,
        compareAtPrice: 3600,
        images: [
          'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=700&q=80',
          'https://images.unsplash.com/photo-1565019011521-b0575e1a5a96?w=700&q=80',
        ],
        category: 'worldcup',
        team: 'Brazil',
        player: 'Vinicius Jr',
        jerseyType: 'home',
        sizes: [
          { size: 'S', stock: 6 },
          { size: 'M', stock: 14 },
          { size: 'L', stock: 9 },
          { size: 'XL', stock: 4 },
          { size: 'XXL', stock: 2 },
        ],
        tags: ['brazil', 'worldcup2026', 'seleção', 'yellow', 'vinicius'],
        isFeatured: true,
        isLimitedDrop: false,
        allowCustomization: true,
        rating: 4.8,
        reviewCount: 176,
        isActive: true,
      },
      {
        tempId: 'bra-away-26',
        name: 'Brazil 2026 Away Jersey',
        slug: 'brazil-2026-away',
        description: "Sleek dark blue. Brazil's away shirt for the 2026 World Cup carries the weight of history in every thread. A stunning contrast to the famous yellow.",
        price: 2700,
        compareAtPrice: null,
        images: [
          'https://images.unsplash.com/photo-1607215438697-6cda0e0b04cc?w=700&q=80',
        ],
        category: 'worldcup',
        team: 'Brazil',
        player: null,
        jerseyType: 'away',
        sizes: [
          { size: 'S', stock: 3 },
          { size: 'M', stock: 8 },
          { size: 'L', stock: 5 },
          { size: 'XL', stock: 2 },
          { size: 'XXL', stock: 1 },
        ],
        tags: ['brazil', 'worldcup2026', 'away', 'blue'],
        isFeatured: false,
        isLimitedDrop: false,
        allowCustomization: true,
        rating: 4.6,
        reviewCount: 42,
        isActive: true,
      },
      {
        tempId: 'por-home-26',
        name: 'Portugal 2026 Home Jersey',
        slug: 'portugal-2026-home',
        description: "Blood red with the crest of Seleção das Quinas. Ronaldo's final World Cup chase for glory. This jersey tells the story of a nation's dream. Own a piece of football history.",
        price: 2799,
        compareAtPrice: 3400,
        images: [
          'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=700&q=80',
        ],
        category: 'worldcup',
        team: 'Portugal',
        player: 'Ronaldo',
        jerseyType: 'home',
        sizes: [
          { size: 'S', stock: 5 },
          { size: 'M', stock: 13 },
          { size: 'L', stock: 8 },
          { size: 'XL', stock: 4 },
          { size: 'XXL', stock: 1 },
        ],
        tags: ['portugal', 'worldcup2026', 'ronaldo', 'cr7', 'selecao'],
        isFeatured: true,
        isLimitedDrop: false,
        allowCustomization: true,
        rating: 4.8,
        reviewCount: 139,
        isActive: true,
      },
      {
        tempId: 'fra-home-26',
        name: 'France 2026 Home Jersey',
        slug: 'france-2026-home',
        description: "Bleu, Blanc, Rouge. Les Bleus carry the expectations of a nation. Mbappé-led France is the bookmakers' favourite for 2026. Deep navy blue with gold trim — the most beautiful national kit in world football.",
        price: 2999,
        compareAtPrice: 3700,
        images: [
          'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=700&q=80',
        ],
        category: 'worldcup',
        team: 'France',
        player: 'Mbappe',
        jerseyType: 'home',
        sizes: [
          { size: 'S', stock: 3 },
          { size: 'M', stock: 9 },
          { size: 'L', stock: 6 },
          { size: 'XL', stock: 2 },
          { size: 'XXL', stock: 0 },
        ],
        tags: ['france', 'worldcup2026', 'mbappe', 'les bleus', 'navy'],
        isFeatured: true,
        isLimitedDrop: true,
        allowCustomization: true,
        rating: 4.9,
        reviewCount: 98,
        isActive: true,
      },
      {
        tempId: 'eng-home-26',
        name: 'England 2026 Home Jersey',
        slug: 'england-2026-home',
        description: "It's finally coming home? Classic white with three lions. Bellingham, Saka, Kane — England's golden generation goes for glory on home continent soil at the 2026 World Cup.",
        price: 2700,
        compareAtPrice: null,
        images: [
          'https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?w=700&q=80',
        ],
        category: 'worldcup',
        team: 'England',
        player: 'Bellingham',
        jerseyType: 'home',
        sizes: [
          { size: 'S', stock: 4 },
          { size: 'M', stock: 10 },
          { size: 'L', stock: 7 },
          { size: 'XL', stock: 3 },
          { size: 'XXL', stock: 1 },
        ],
        tags: ['england', 'worldcup2026', 'three lions', 'bellingham', 'white'],
        isFeatured: false,
        isLimitedDrop: false,
        allowCustomization: true,
        rating: 4.7,
        reviewCount: 67,
        isActive: true,
      },
      {
        tempId: 'ger-home-26',
        name: 'Germany 2026 Home Jersey',
        slug: 'germany-2026-home',
        description: 'Die Mannschaft. Clean white with black shoulders. Germany rebuilds and hunts a 5th star. Clinical, efficient, ruthless — just like the jersey itself.',
        price: 2699,
        compareAtPrice: null,
        images: [
          'https://images.unsplash.com/photo-1623492701902-47dc5a4a8e09?w=700&q=80',
        ],
        category: 'worldcup',
        team: 'Germany',
        player: null,
        jerseyType: 'home',
        sizes: [
          { size: 'S', stock: 5 },
          { size: 'M', stock: 11 },
          { size: 'L', stock: 8 },
          { size: 'XL', stock: 3 },
          { size: 'XXL', stock: 2 },
        ],
        tags: ['germany', 'worldcup2026', 'die mannschaft', 'white'],
        isFeatured: false,
        isLimitedDrop: false,
        allowCustomization: true,
        rating: 4.6,
        reviewCount: 53,
        isActive: true,
      },
      {
        tempId: 'esp-home-26',
        name: 'Spain 2026 Home Jersey',
        slug: 'spain-2026-home',
        description: 'La Roja. Euro 2024 winners arriving at the 2026 World Cup as one of the most feared teams. Yamal, Pedri, Morata — tiki-taka reborn in this iconic deep red shirt.',
        price: 2850,
        compareAtPrice: 3400,
        images: [
          'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=700&q=80',
        ],
        category: 'worldcup',
        team: 'Spain',
        player: 'Yamal',
        jerseyType: 'home',
        sizes: [
          { size: 'S', stock: 4 },
          { size: 'M', stock: 10 },
          { size: 'L', stock: 7 },
          { size: 'XL', stock: 3 },
          { size: 'XXL', stock: 1 },
        ],
        tags: ['spain', 'worldcup2026', 'la roja', 'yamal', 'euro champions'],
        isFeatured: true,
        isLimitedDrop: false,
        allowCustomization: true,
        rating: 4.8,
        reviewCount: 91,
        isActive: true,
      },
      {
        tempId: 'mor-home-26',
        name: 'Morocco 2026 Home Jersey',
        slug: 'morocco-2026-home',
        description: "The Atlas Lions roar again. Africa's pride, 2022 semi-finalists. Morocco plays at home in 2026 — the pressure, the passion, the electricity. This jersey represents a continent's dream.",
        price: 2500,
        compareAtPrice: null,
        images: [
          'https://images.unsplash.com/photo-1565019011521-b0575e1a5a96?w=700&q=80',
        ],
        category: 'worldcup',
        team: 'Morocco',
        player: null,
        jerseyType: 'home',
        sizes: [
          { size: 'S', stock: 5 },
          { size: 'M', stock: 12 },
          { size: 'L', stock: 9 },
          { size: 'XL', stock: 4 },
          { size: 'XXL', stock: 2 },
        ],
        tags: ['morocco', 'worldcup2026', 'atlas lions', 'africa', 'host'],
        isFeatured: false,
        isLimitedDrop: true,
        allowCustomization: true,
        rating: 4.7,
        reviewCount: 44,
        isActive: true,
      },
      {
        tempId: 'usa-home-26',
        name: 'USA 2026 Home Jersey',
        slug: 'usa-2026-home',
        description: 'Stars and Stripes. The host nation plays in front of 80,000+ fans. Pulisic, McKennie and the USMNT carry the weight of a nation. A must-have collectible from the first North American World Cup.',
        price: 2699,
        compareAtPrice: null,
        images: [
          'https://images.unsplash.com/photo-1607215438697-6cda0e0b04cc?w=700&q=80',
        ],
        category: 'worldcup',
        team: 'USA',
        player: 'Pulisic',
        jerseyType: 'home',
        sizes: [
          { size: 'S', stock: 6 },
          { size: 'M', stock: 14 },
          { size: 'L', stock: 10 },
          { size: 'XL', stock: 5 },
          { size: 'XXL', stock: 2 },
        ],
        tags: ['usa', 'worldcup2026', 'host nation', 'pulisic', 'usmnt'],
        isFeatured: false,
        isLimitedDrop: false,
        allowCustomization: true,
        rating: 4.5,
        reviewCount: 38,
        isActive: true,
      },
      {
        tempId: 'ned-home-26',
        name: 'Netherlands 2026 Home Jersey',
        slug: 'netherlands-2026-home',
        description: 'Oranje will never stop. The most iconic orange in world football. Van Dijk and De Jong lead a new generation of Dutch masters. Total Football lives on in this electric shirt.',
        price: 2750,
        compareAtPrice: 3300,
        images: [
          'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=700&q=80',
        ],
        category: 'worldcup',
        team: 'Netherlands',
        player: 'Van Dijk',
        jerseyType: 'home',
        sizes: [
          { size: 'S', stock: 3 },
          { size: 'M', stock: 8 },
          { size: 'L', stock: 6 },
          { size: 'XL', stock: 2 },
          { size: 'XXL', stock: 1 },
        ],
        tags: ['netherlands', 'worldcup2026', 'oranje', 'orange', 'van dijk'],
        isFeatured: false,
        isLimitedDrop: true,
        allowCustomization: true,
        rating: 4.7,
        reviewCount: 61,
        isActive: true,
      },
      {
        tempId: 'col-home-26',
        name: 'Colombia 2026 Home Jersey',
        slug: 'colombia-2026-home',
        description: 'Vibrant yellow of Los Cafeteros. James Rodriguez, Díaz and Quintero bring South American flair to 2026. Colombia\'s bright yellow jersey is one of the most eye-catching in this edition.',
        price: 2400,
        compareAtPrice: null,
        images: [
          'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=700&q=80',
        ],
        category: 'worldcup',
        team: 'Colombia',
        player: null,
        jerseyType: 'home',
        sizes: [
          { size: 'S', stock: 4 },
          { size: 'M', stock: 9 },
          { size: 'L', stock: 7 },
          { size: 'XL', stock: 3 },
          { size: 'XXL', stock: 1 },
        ],
        tags: ['colombia', 'worldcup2026', 'los cafeteros', 'yellow', 'james'],
        isFeatured: false,
        isLimitedDrop: false,
        allowCustomization: true,
        rating: 4.5,
        reviewCount: 29,
        isActive: true,
      },
    ];

    const productIdMap = new Map<string, string>();

    // 4. Save Products and SizeStocks
    for (const p of mockProductsRaw) {
      const product = await Product.create(
        {
          name: p.name,
          slug: p.slug,
          description: p.description,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          images: p.images,
          category: p.category,
          team: p.team,
          player: p.player,
          jerseyType: p.jerseyType,
          tags: p.tags,
          isFeatured: p.isFeatured,
          isLimitedDrop: p.isLimitedDrop,
          allowCustomization: p.allowCustomization,
          rating: p.rating,
          reviewCount: p.reviewCount,
          isActive: p.isActive,
        },
        { transaction }
      );

      productIdMap.set(p.tempId, product.id);

      // Create sizes
      for (const s of p.sizes) {
        await SizeStock.create(
          {
            productId: product.id,
            size: s.size,
            stock: s.stock,
          },
          { transaction }
        );
      }
    }

    // 5. Seed Mock Reviews
    const mockReviewsRaw = [
      {
        tempProductId: 'arg-home-26',
        tempUserId: 'u1',
        rating: 5,
        comment: "Ekdam ramro jersey bhai! Delivered to Kathmandu in 2 days. The fabric quality is exactly like the ones I've seen online. Worth every paisa.",
        isVerifiedPurchase: true,
        isApproved: true,
      },
      {
        tempProductId: 'arg-home-26',
        tempUserId: 'u2',
        rating: 5,
        comment: 'Got the Messi customization done. Looks absolutely professional. Wearing it every time I watch the World Cup replays. 10/10!',
        isVerifiedPurchase: true,
        isApproved: true,
      },
      {
        tempProductId: 'arg-home-26',
        tempUserId: 'u3',
        rating: 4,
        comment: 'Size M fits perfect for my 5\'9" frame. Color is vibrant. Delivery to Pokhara took 3 days. Very happy with the purchase.',
        isVerifiedPurchase: false,
        isApproved: true,
      },
      {
        tempProductId: 'bra-home-26',
        tempUserId: 'u1',
        rating: 5,
        comment: 'Brazil jersey ko quality khoi bhanney! The yellow is so bright and vivid. WhatsApp confirmation was super quick.',
        isVerifiedPurchase: true,
        isApproved: true,
      },
    ];

    // Map tempUserId to real userId
    const userIdMap = new Map<string, string>([
      ['u1', customerUser.id],
      ['u2', customerUser2.id],
      ['u3', customerUser3.id],
    ]);

    for (const r of mockReviewsRaw) {
      const realProductId = productIdMap.get(r.tempProductId);
      const realUserId = userIdMap.get(r.tempUserId);
      if (realProductId && realUserId) {
        await Review.create(
          {
            userId: realUserId,
            productId: realProductId,
            rating: r.rating,
            comment: r.comment,
            images: [],
            isVerifiedPurchase: r.isVerifiedPurchase,
            isApproved: r.isApproved,
          },
          { transaction }
        );
      }
    }

    // 6. Seed Mock Orders
    const mockOrdersRaw = [
      {
        orderNumber: 'NJ-20251110-A3K9',
        subtotal: 2999,
        deliveryCharge: 100,
        total: 3099,
        status: 'delivered',
        paymentMethod: 'cod',
        customerName: 'Aarav Sharma',
        customerPhone: '9841234567',
        deliveryAddress: 'Thamel, Ward 26',
        customerCity: 'Kathmandu',
        customerNote: 'Please call before delivery',
        whatsappConfirmed: true,
        items: [
          {
            tempProductId: 'arg-home-26',
            productName: 'Argentina 2026 Home Jersey',
            quantity: 1,
            size: 'M',
            price: 2999,
            customName: 'SHARMA',
            customNumber: '10',
          },
        ],
        statusHistory: [
          { status: 'pending', timestamp: '2025-11-10T10:00:00Z' },
          { status: 'confirmed', timestamp: '2025-11-10T11:30:00Z' },
          { status: 'processing', timestamp: '2025-11-10T14:00:00Z' },
          { status: 'shipped', timestamp: '2025-11-11T09:00:00Z' },
          { status: 'delivered', timestamp: '2025-11-12T14:30:00Z' },
        ],
      },
      {
        orderNumber: 'NJ-20251115-B7M2',
        subtotal: 5798,
        deliveryCharge: 100,
        total: 5898,
        status: 'shipped',
        paymentMethod: 'cod',
        customerName: 'Aarav Sharma',
        customerPhone: '9841234567',
        deliveryAddress: 'Thamel, Ward 26',
        customerCity: 'Kathmandu',
        customerNote: null,
        whatsappConfirmed: true,
        items: [
          {
            tempProductId: 'por-home-26',
            productName: 'Portugal 2026 Home Jersey',
            quantity: 1,
            size: 'L',
            price: 2799,
          },
          {
            tempProductId: 'bra-home-26',
            productName: 'Brazil 2026 Home Jersey',
            quantity: 1,
            size: 'M',
            price: 2999,
          },
        ],
        statusHistory: [
          { status: 'pending', timestamp: '2025-11-15T09:00:00Z' },
          { status: 'confirmed', timestamp: '2025-11-15T10:00:00Z' },
          { status: 'processing', timestamp: '2025-11-15T15:00:00Z' },
          { status: 'shipped', timestamp: '2025-11-16T08:00:00Z' },
        ],
      },
    ];

    for (const o of mockOrdersRaw) {
      const order = await Order.create(
        {
          orderNumber: o.orderNumber,
          userId: customerUser.id,
          subtotal: o.subtotal,
          deliveryCharge: o.deliveryCharge,
          total: o.total,
          status: o.status,
          paymentMethod: o.paymentMethod,
          customerName: o.customerName,
          customerPhone: o.customerPhone,
          deliveryAddress: o.deliveryAddress,
          customerCity: o.customerCity,
          customerNote: o.customerNote,
          whatsappConfirmed: o.whatsappConfirmed,
        },
        { transaction }
      );

      // Create Order Items
      for (const item of o.items) {
        const itemAny = item as any;
        const realProductId = productIdMap.get(itemAny.tempProductId);
        if (realProductId) {
          await OrderItem.create(
            {
              orderId: order.id,
              productId: realProductId,
              productName: itemAny.productName,
              quantity: itemAny.quantity,
              size: itemAny.size,
              price: itemAny.price,
              customName: itemAny.customName || null,
              customNumber: itemAny.customNumber || null,
            },
            { transaction }
          );
        }
      }

      // Create Status History
      for (const sh of o.statusHistory) {
        await StatusHistoryEntry.create(
          {
            orderId: order.id,
            status: sh.status,
            timestamp: new Date(sh.timestamp),
            note: null,
          },
          { transaction }
        );
      }
    }

    await transaction.commit();
    console.log('Database seeded successfully!');
  } catch (error) {
    await transaction.rollback();
    console.error('Error seeding database:', error);
    throw error;
  }
}
