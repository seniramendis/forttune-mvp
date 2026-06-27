import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  // ── Seed default admin account ─────────────────────────────────────────
  // Credentials: admin@forttune.com / Admin@123!
  // FIX: Password MUST be a bcrypt hash — login uses bcrypt.compare().
  // The old seed stored a raw SHA-256 hex string which bcrypt.compare() always rejects,
  // making it impossible to ever log in. Hash below = bcrypt('Admin@123!', rounds=12).
  await prisma.user.upsert({
    where:  { email: 'admin@forttune.com' },
    update: {},
    create: {
      email:    'admin@forttune.com',
      name:     'Forttune Admin',
      role:     'ADMIN',
      password: '$2b$12$ywAqIzQ7OnvdFlLAQFREH.6.8k4BPr7k5PhdCRJ3rhVWKl5zz0KBW',
    },
  })
  console.log('  ✓ Admin seeded: admin@forttune.com / Admin@123!')
  console.log()
  console.log('🌱 Seeding Forttune product database...')

  const products = [
    // ── LAPTOPS ──
    {
      name: 'HP Pavilion 15-eh3006AU',
      brand: 'HP',
      category: 'Laptops',
      price: 189900,
      stock: 12,
      sku: 'HP-PAV-15EH3',
      spec: 'AMD Ryzen 5 7530U, 8GB RAM, 512GB SSD, 15.6" FHD',
      badge: 'hot',
    },
    {
      name: 'Lenovo IdeaPad Slim 3 15AMN8',
      brand: 'Lenovo',
      category: 'Laptops',
      price: 164900,
      stock: 8,
      sku: 'LEN-IPS3-15AMN',
      spec: 'AMD Ryzen 5 7520U, 8GB RAM, 512GB SSD, 15.6" FHD',
      badge: 'new',
    },
    {
      name: 'Asus VivoBook 16X K3605ZC',
      brand: 'Asus',
      category: 'Laptops',
      price: 229900,
      stock: 6,
      sku: 'ASUS-VBK-3605ZC',
      spec: 'Intel Core i5-12500H, 16GB RAM, 512GB SSD, RTX 3050',
      badge: 'hot',
    },
    {
      name: 'Dell Inspiron 15 3530',
      brand: 'Dell',
      category: 'Laptops',
      price: 199900,
      stock: 5,
      sku: 'DELL-INS-3530',
      spec: 'Intel Core i5-1334U, 8GB RAM, 512GB SSD, 15.6" FHD',
      badge: '',
    },
    {
      name: 'HP EliteBook 840 G10',
      brand: 'HP',
      category: 'Laptops',
      price: 389900,
      stock: 3,
      sku: 'HP-ELB-840G10',
      spec: 'Intel Core i7-1355U, 16GB RAM, 512GB SSD, 14" FHD IPS',
      badge: '',
    },
    {
      name: 'Lenovo ThinkPad E14 Gen 5',
      brand: 'Lenovo',
      category: 'Laptops',
      price: 299900,
      stock: 4,
      sku: 'LEN-TPE14-G5',
      spec: 'AMD Ryzen 7 7730U, 16GB RAM, 512GB SSD, 14" FHD IPS',
      badge: '',
    },

    // ── DESKTOPS ──
    {
      name: 'HP ProDesk 400 G9 SFF',
      brand: 'HP',
      category: 'Desktops',
      price: 249900,
      stock: 7,
      sku: 'HP-PD400-G9',
      spec: 'Intel Core i5-13500, 8GB RAM, 512GB SSD, Win 11 Pro',
      badge: '',
    },
    {
      name: 'Dell OptiPlex 3000 Micro',
      brand: 'Dell',
      category: 'Desktops',
      price: 219900,
      stock: 5,
      sku: 'DELL-OPT3000-MC',
      spec: 'Intel Core i3-12100T, 8GB RAM, 256GB SSD, Win 11 Pro',
      badge: '',
    },
    {
      name: 'Lenovo ThinkCentre M70q Gen 4',
      brand: 'Lenovo',
      category: 'Desktops',
      price: 279900,
      stock: 3,
      sku: 'LEN-TCM70Q-G4',
      spec: 'Intel Core i5-13400T, 16GB RAM, 512GB SSD, Tiny Form Factor',
      badge: 'new',
    },

    // ── MONITORS ──
    {
      name: 'HP V24i FHD Monitor',
      brand: 'HP',
      category: 'Monitors',
      price: 49900,
      stock: 20,
      sku: 'HP-V24I-FHD',
      spec: '23.8" IPS, 1920x1080, 75Hz, HDMI + VGA',
      badge: 'hot',
    },
    {
      name: 'Dell E2423H 24" Monitor',
      brand: 'Dell',
      category: 'Monitors',
      price: 59900,
      stock: 15,
      sku: 'DELL-E2423H',
      spec: '24" IPS, 1920x1080, 60Hz, DisplayPort + VGA',
      badge: '',
    },
    {
      name: 'LG 27MK430H-B 27" Monitor',
      brand: 'LG',
      category: 'Monitors',
      price: 74900,
      stock: 10,
      sku: 'LG-27MK430H',
      spec: '27" IPS, 1920x1080, 75Hz, AMD FreeSync, HDMI',
      badge: '',
    },
    {
      name: 'Asus ProArt PA278CV 27" 4K',
      brand: 'Asus',
      category: 'Monitors',
      price: 149900,
      stock: 4,
      sku: 'ASUS-PA278CV',
      spec: '27" IPS, 2560x1440, 75Hz, USB-C, Color Accurate',
      badge: 'new',
    },

    // ── NETWORKING ──
    {
      name: 'TP-Link Archer AX23 WiFi 6 Router',
      brand: 'TP-Link',
      category: 'Networking',
      price: 19900,
      stock: 25,
      sku: 'TPL-AX23-R',
      spec: 'AX1800 Dual Band, WiFi 6, 4x LAN Ports, MU-MIMO',
      badge: 'hot',
    },
    {
      name: 'TP-Link TL-SG108 8-Port Switch',
      brand: 'TP-Link',
      category: 'Networking',
      price: 8900,
      stock: 30,
      sku: 'TPL-SG108-SW',
      spec: '8-Port Gigabit Unmanaged Switch, Plug & Play',
      badge: '',
    },
    {
      name: 'Cisco SG110-16 16-Port Switch',
      brand: 'Cisco',
      category: 'Networking',
      price: 34900,
      stock: 8,
      sku: 'CSC-SG110-16',
      spec: '16-Port Gigabit Desktop Switch, Green Ethernet',
      badge: '',
    },
    {
      name: 'TP-Link EAP670 WiFi 6 Access Point',
      brand: 'TP-Link',
      category: 'Networking',
      price: 29900,
      stock: 12,
      sku: 'TPL-EAP670-AP',
      spec: 'AX3600 Ceiling Mount, PoE+, Omada SDN Compatible',
      badge: 'new',
    },

    // ── PRINTERS ──
    {
      name: 'HP LaserJet Pro M404dn',
      brand: 'HP',
      category: 'Printers',
      price: 89900,
      stock: 6,
      sku: 'HP-LJP-M404DN',
      spec: 'Mono Laser, 40ppm, Duplex, Network Ready',
      badge: '',
    },
    {
      name: 'Epson L3250 EcoTank Printer',
      brand: 'Epson',
      category: 'Printers',
      price: 49900,
      stock: 14,
      sku: 'EPS-L3250-ET',
      spec: 'Color Inkjet, Print/Scan/Copy, WiFi, USB',
      badge: 'hot',
    },
    {
      name: 'Canon PIXMA G3020 MegaTank',
      brand: 'Canon',
      category: 'Printers',
      price: 54900,
      stock: 9,
      sku: 'CAN-G3020-MT',
      spec: 'Color Inkjet, Print/Scan/Copy, WiFi, High Yield Tank',
      badge: '',
    },

    // ── STORAGE ──
    {
      name: 'Seagate Barracuda 2TB HDD',
      brand: 'Seagate',
      category: 'Storage',
      price: 14900,
      stock: 35,
      sku: 'SEA-BRCDA-2TB',
      spec: '2TB 3.5" SATA, 7200RPM, 256MB Cache',
      badge: '',
    },
    {
      name: 'Samsung 870 EVO 1TB SSD',
      brand: 'Samsung',
      category: 'Storage',
      price: 29900,
      stock: 20,
      sku: 'SAM-870EVO-1TB',
      spec: '1TB 2.5" SATA SSD, 560MB/s Read, MLC V-NAND',
      badge: 'hot',
    },
    {
      name: 'WD Blue SN580 1TB NVMe SSD',
      brand: 'Western Digital',
      category: 'Storage',
      price: 24900,
      stock: 18,
      sku: 'WD-SN580-1TB',
      spec: '1TB M.2 NVMe PCIe 4.0, 4150MB/s Read',
      badge: 'new',
    },
    {
      name: 'Transcend 32GB USB 3.1 Flash Drive',
      brand: 'Transcend',
      category: 'Storage',
      price: 2490,
      stock: 50,
      sku: 'TRN-USB31-32GB',
      spec: '32GB USB 3.1 Gen 1, 100MB/s Read, Compact Design',
      badge: '',
    },

    // ── ACCESSORIES ──
    {
      name: 'Logitech MK235 Wireless Keyboard & Mouse',
      brand: 'Logitech',
      category: 'Accessories',
      price: 7900,
      stock: 40,
      sku: 'LOG-MK235-WL',
      spec: 'Wireless Combo, 2.4GHz, Spill Resistant, 12-month battery',
      badge: 'hot',
    },
    {
      name: 'Logitech M705 Marathon Wireless Mouse',
      brand: 'Logitech',
      category: 'Accessories',
      price: 5900,
      stock: 28,
      sku: 'LOG-M705-WL',
      spec: 'Wireless, 1000DPI, 3yr Battery Life, USB Unifying',
      badge: '',
    },
    {
      name: 'Dell WM126 Wireless Mouse',
      brand: 'Dell',
      category: 'Accessories',
      price: 2990,
      stock: 45,
      sku: 'DELL-WM126-WL',
      spec: '1000DPI Optical, 2.4GHz, 12-month battery, Plug & Play',
      badge: '',
    },
    {
      name: 'Belkin 6-Outlet Surge Protector',
      brand: 'Belkin',
      category: 'Accessories',
      price: 5490,
      stock: 22,
      sku: 'BLK-6OUT-SP',
      spec: '6 Outlets, 2m Cord, 900 Joules, Tel/Coax Protection',
      badge: '',
    },
    {
      name: 'APC Back-UPS 650VA UPS',
      brand: 'APC',
      category: 'Accessories',
      price: 24900,
      stock: 10,
      sku: 'APC-BX650-UPS',
      spec: '650VA/360W, 6 Outlets, AVR, USB Charging Port',
      badge: 'new',
    },
  ]

  let created = 0
  // Delete all existing products first to avoid conflicts
  await prisma.product.deleteMany({})
  console.log('  🗑️  Cleared existing products')

  for (const product of products) {
    await prisma.product.create({
      data: product,
    })
    created++
    console.log(`  ✓ ${product.name}`)
  }

  console.log(`\n✅ Done! ${created} products seeded successfully.`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
