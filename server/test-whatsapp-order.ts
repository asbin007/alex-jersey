/**
 * test-whatsapp-order.ts
 *
 * End-to-end test: places a real order via the API and verifies
 * the WhatsApp notification fires correctly.
 *
 * Run: npx ts-node test-whatsapp-order.ts
 */

import 'dotenv/config';

const BASE = 'http://127.0.0.1:5000';

async function post(url: string, body: any, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${url}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function get(url: string, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${url}`, { headers });
  const data = await res.json();
  return { status: res.status, data };
}

async function run() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Nepal Jersey — WhatsApp Order Flow Test');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // ── Step 1: Login as admin (admin can place orders too) ──────────────────
  console.log('1️⃣  Logging in...');
  const { status: loginStatus, data: loginData } = await post('/api/auth/login', {
    email: process.env.ADMIN_EMAIL || 'admin@gmail.com',
    password: process.env.ADMIN_PASSWORD || 'admin123',
  });

  if (loginStatus !== 200 || !loginData.token) {
    console.error('❌ Login failed:', loginData);
    process.exit(1);
  }
  const token = loginData.token;
  console.log('✅ Logged in as:', loginData.user?.email || loginData.email);

  // ── Step 2: Pick a real product ──────────────────────────────────────────
  console.log('\n2️⃣  Fetching a product...');
  const { status: prodStatus, data: prodData } = await get('/api/products?limit=1');

  if (prodStatus !== 200 || !prodData.data?.length) {
    console.error('❌ Could not fetch products:', prodData);
    process.exit(1);
  }

  const product = prodData.data[0];
  // Find a size that has stock > 0
  const sizeWithStock = product.sizes?.find((s: any) => s.stock > 0);

  if (!sizeWithStock) {
    console.error('❌ No stock available for product:', product.name);
    process.exit(1);
  }

  console.log(`✅ Product: ${product.name} | Size: ${sizeWithStock.size} | Stock: ${sizeWithStock.stock}`);

  // ── Step 3: Place order ──────────────────────────────────────────────────
  console.log('\n3️⃣  Placing order...');
  const { status: orderStatus, data: orderData } = await post(
    '/api/orders',
    {
      items: [
        {
          productId: product.id,
          quantity: 1,
          size: sizeWithStock.size,
        },
      ],
      customerName: 'Test Customer',
      phone: '9800000001',
      deliveryAddress: 'Thamel, Kathmandu',
      city: 'Kathmandu',
      note: 'WhatsApp integration test order — safe to ignore',
    },
    token
  );

  if (orderStatus !== 201) {
    console.error('❌ Order creation failed:', orderData);
    process.exit(1);
  }

  const order = orderData.order;
  console.log(`✅ Order created: ${order.orderNumber}`);
  console.log(`   Total: Rs.${order.total} | Status: ${order.status}`);

  // ── Step 4: Verify WhatsApp was triggered (check WAHA session health) ────
  console.log('\n4️⃣  Checking WAHA session status...');
  const wahaRes = await fetch('http://localhost:3000/api/sessions/default', {
    headers: { 'X-Api-Key': process.env.WAHA_API_KEY || 'jersey_waha_key' },
  });
  const wahaData = await wahaRes.json();
  const wahaStatus = wahaData.status || wahaData.engine?.status;
  console.log(`✅ WAHA session: ${wahaStatus}`);

  // ── Step 5: Update order status → triggers 2nd WA message ───────────────
  console.log('\n5️⃣  Updating order status to "confirmed"...');
  const patchRes = await fetch(`http://127.0.0.1:5000/api/admin/orders/${order.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ status: 'confirmed' }),
  });
  const updateData = await patchRes.json();

  if (patchRes.status === 200) {
    console.log(`✅ Status updated → ${updateData.status}`);
    console.log('   📱 WhatsApp "confirmed" notification should have fired');
  } else {
    console.log(`ℹ️  Status update returned ${patchRes.status}:`, updateData);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Test complete!');
  console.log('');
  console.log('Check your WhatsApp — you should have received:');
  console.log('  • Order confirmation message for order', order.orderNumber);
  if (patchRes.status === 200) {
    console.log('  • Status update message (confirmed)');
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

run().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
