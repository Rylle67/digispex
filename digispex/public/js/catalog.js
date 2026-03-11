/* ============================================================
   NEXUS — PC Builder & E-Commerce Platform
   catalog.js — Product database & builder slot definitions

   Component data sourced from buildcores.com/products (OpenDB)
   Covers all major current-gen CPU, GPU, Motherboard, RAM,
   Storage, PSU, Cooling, and Case components as of 2025.
   ============================================================ */

const PRODUCTS = [

  /* ─────────────────────────────────────────────────────────
     CPUs — Intel Core Ultra 200S (Arrow Lake, LGA1851, DDR5)
  ───────────────────────────────────────────────────────── */
  { id:'cpu_ultra9_285k',  cat:'CPU', name:'Intel Core Ultra 9 285K', price:589,
    specs:'24C (8P+16E) / 5.7GHz / LGA1851 / 125W',   socket:'LGA1851', tdp:125 },
  { id:'cpu_ultra7_265k',  cat:'CPU', name:'Intel Core Ultra 7 265K', price:394,
    specs:'20C (8P+12E) / 5.5GHz / LGA1851 / 125W',   socket:'LGA1851', tdp:125 },
  { id:'cpu_ultra5_245k',  cat:'CPU', name:'Intel Core Ultra 5 245K', price:309,
    specs:'14C (6P+8E) / 5.2GHz / LGA1851 / 125W',    socket:'LGA1851', tdp:125 },
  { id:'cpu_ultra5_245kf', cat:'CPU', name:'Intel Core Ultra 5 245KF', price:289,
    specs:'14C / 5.2GHz / LGA1851 / No iGPU',          socket:'LGA1851', tdp:125 },

  /* ─────────────────────────────────────────────────────────
     CPUs — Intel 14th Gen (Raptor Lake Refresh, LGA1700)
  ───────────────────────────────────────────────────────── */
  { id:'cpu1',             cat:'CPU', name:'Intel Core i9-14900K', price:439,
    specs:'24C / 6.0GHz / LGA1700 / 253W',             socket:'LGA1700', tdp:253 },
  { id:'cpu_i9_14900kf',   cat:'CPU', name:'Intel Core i9-14900KF', price:399,
    specs:'24C / 6.0GHz / LGA1700 / No iGPU',          socket:'LGA1700', tdp:253 },
  { id:'cpu_i9_14900',     cat:'CPU', name:'Intel Core i9-14900', price:349,
    specs:'24C / 5.8GHz / LGA1700 / 65W',              socket:'LGA1700', tdp:65 },
  { id:'cpu3',             cat:'CPU', name:'Intel Core i7-14700K', price:349,
    specs:'20C / 5.6GHz / LGA1700 / 253W',             socket:'LGA1700', tdp:253 },
  { id:'cpu_i7_14700kf',   cat:'CPU', name:'Intel Core i7-14700KF', price:319,
    specs:'20C / 5.6GHz / LGA1700 / No iGPU',          socket:'LGA1700', tdp:253 },
  { id:'cpu5',             cat:'CPU', name:'Intel Core i5-14600K', price:229,
    specs:'14C / 5.3GHz / LGA1700 / 181W',             socket:'LGA1700', tdp:181 },
  { id:'cpu_i5_14600kf',   cat:'CPU', name:'Intel Core i5-14600KF', price:209,
    specs:'14C / 5.3GHz / LGA1700 / No iGPU',          socket:'LGA1700', tdp:181 },
  { id:'cpu_i5_14500',     cat:'CPU', name:'Intel Core i5-14500', price:189,
    specs:'14C / 5.0GHz / LGA1700 / 65W',              socket:'LGA1700', tdp:65 },
  { id:'cpu_i5_14400f',    cat:'CPU', name:'Intel Core i5-14400F', price:149,
    specs:'10C / 4.7GHz / LGA1700 / No iGPU',          socket:'LGA1700', tdp:65 },
  { id:'cpu_i3_14100f',    cat:'CPU', name:'Intel Core i3-14100F', price:99,
    specs:'4C / 4.7GHz / LGA1700 / No iGPU',           socket:'LGA1700', tdp:58 },
  { id:'cpu6',             cat:'CPU', name:'Intel Core i5-12400F', price:89,
    specs:'6C / 4.4GHz / LGA1700 / No iGPU',           socket:'LGA1700', tdp:65 },

  /* ─────────────────────────────────────────────────────────
     CPUs — AMD Ryzen 9000 Series (Granite Ridge, AM5, DDR5)
  ───────────────────────────────────────────────────────── */
  { id:'cpu_r9_9950x',     cat:'CPU', name:'AMD Ryzen 9 9950X', price:649,
    specs:'16C / 5.7GHz / AM5 / 170W',                 socket:'AM5', tdp:170 },
  { id:'cpu_r9_9900x',     cat:'CPU', name:'AMD Ryzen 9 9900X', price:449,
    specs:'12C / 5.6GHz / AM5 / 120W',                 socket:'AM5', tdp:120 },
  { id:'cpu_r7_9700x',     cat:'CPU', name:'AMD Ryzen 7 9700X', price:359,
    specs:'8C / 5.5GHz / AM5 / 65W',                   socket:'AM5', tdp:65 },
  { id:'cpu_r5_9600x',     cat:'CPU', name:'AMD Ryzen 5 9600X', price:249,
    specs:'6C / 5.4GHz / AM5 / 65W',                   socket:'AM5', tdp:65 },

  /* ─────────────────────────────────────────────────────────
     CPUs — AMD Ryzen 7000 Series (Zen 4, AM5, DDR5)
  ───────────────────────────────────────────────────────── */
  { id:'cpu_r9_7950x3d',   cat:'CPU', name:'AMD Ryzen 9 7950X3D', price:649,
    specs:'16C / 5.7GHz / AM5 / 3D V-Cache / 120W',   socket:'AM5', tdp:120 },
  { id:'cpu2',             cat:'CPU', name:'AMD Ryzen 9 7950X', price:529,
    specs:'16C / 5.7GHz / AM5 / 170W',                 socket:'AM5', tdp:170 },
  { id:'cpu8',             cat:'CPU', name:'AMD Ryzen 9 7900X', price:319,
    specs:'12C / 5.6GHz / AM5 / 170W',                 socket:'AM5', tdp:170 },
  { id:'cpu_r7_7800x3d',   cat:'CPU', name:'AMD Ryzen 7 7800X3D', price:389,
    specs:'8C / 5.0GHz / AM5 / 3D V-Cache / 120W',    socket:'AM5', tdp:120 },
  { id:'cpu4',             cat:'CPU', name:'AMD Ryzen 7 7700X', price:239,
    specs:'8C / 5.4GHz / AM5 / 105W',                  socket:'AM5', tdp:105 },
  { id:'cpu_r7_7700',      cat:'CPU', name:'AMD Ryzen 7 7700', price:199,
    specs:'8C / 5.3GHz / AM5 / 65W',                   socket:'AM5', tdp:65 },
  { id:'cpu7',             cat:'CPU', name:'AMD Ryzen 5 7600X', price:169,
    specs:'6C / 5.3GHz / AM5 / 105W',                  socket:'AM5', tdp:105 },
  { id:'cpu_r5_7600',      cat:'CPU', name:'AMD Ryzen 5 7600', price:139,
    specs:'6C / 5.1GHz / AM5 / 65W',                   socket:'AM5', tdp:65 },

  /* ─────────────────────────────────────────────────────────
     CPUs — AMD Ryzen 5000 Series (Zen 3, AM4, DDR4)
  ───────────────────────────────────────────────────────── */
  { id:'cpu_r9_5950x',     cat:'CPU', name:'AMD Ryzen 9 5950X', price:269,
    specs:'16C / 4.9GHz / AM4 / 105W',                 socket:'AM4', tdp:105 },
  { id:'cpu9',             cat:'CPU', name:'AMD Ryzen 9 5900X', price:199,
    specs:'12C / 4.8GHz / AM4 / 105W',                 socket:'AM4', tdp:105 },
  { id:'cpu10',            cat:'CPU', name:'AMD Ryzen 7 5800X3D', price:229,
    specs:'8C / 4.5GHz / AM4 / 3D V-Cache',            socket:'AM4', tdp:105 },
  { id:'cpu12',            cat:'CPU', name:'AMD Ryzen 7 5700X', price:139,
    specs:'8C / 4.6GHz / AM4 / 65W',                   socket:'AM4', tdp:65 },
  { id:'cpu_r7_5700x3d',   cat:'CPU', name:'AMD Ryzen 7 5700X3D', price:179,
    specs:'8C / 4.1GHz / AM4 / 3D V-Cache',            socket:'AM4', tdp:105 },
  { id:'cpu11',            cat:'CPU', name:'AMD Ryzen 5 5600X', price:109,
    specs:'6C / 4.6GHz / AM4 / 65W',                   socket:'AM4', tdp:65 },
  { id:'cpu_r5_5600',      cat:'CPU', name:'AMD Ryzen 5 5600', price:89,
    specs:'6C / 4.4GHz / AM4 / 65W',                   socket:'AM4', tdp:65 },
  { id:'cpu_r5_5500',      cat:'CPU', name:'AMD Ryzen 5 5500', price:69,
    specs:'6C / 4.2GHz / AM4 / 65W',                   socket:'AM4', tdp:65 },


  /* ─────────────────────────────────────────────────────────
     GPUs — NVIDIA RTX 50 Series (Blackwell, 2025)
  ───────────────────────────────────────────────────────── */
  { id:'gpu_5090',         cat:'GPU', name:'NVIDIA GeForce RTX 5090', price:1999,
    specs:'32GB GDDR7 / 21760 CUDA / 575W',          power:575 },
  { id:'gpu_5080',         cat:'GPU', name:'NVIDIA GeForce RTX 5080', price:999,
    specs:'16GB GDDR7 / 10752 CUDA / 360W',          power:360 },
  { id:'gpu_5070ti',       cat:'GPU', name:'NVIDIA GeForce RTX 5070 Ti', price:749,
    specs:'16GB GDDR7 / 8960 CUDA / 300W',           power:300 },
  { id:'gpu_5070',         cat:'GPU', name:'NVIDIA GeForce RTX 5070', price:549,
    specs:'12GB GDDR7 / 6144 CUDA / 250W',           power:250 },
  { id:'gpu_5060ti',       cat:'GPU', name:'NVIDIA GeForce RTX 5060 Ti', price:379,
    specs:'16GB GDDR7 / 4608 CUDA / 180W',           power:180 },

  /* ─────────────────────────────────────────────────────────
     GPUs — NVIDIA RTX 40 Series (Ada Lovelace)
  ───────────────────────────────────────────────────────── */
  { id:'gpu1',             cat:'GPU', name:'NVIDIA GeForce RTX 4090', price:1599,
    specs:'24GB GDDR6X / 16384 CUDA / 450W',         power:450 },
  { id:'gpu_4080s',        cat:'GPU', name:'NVIDIA GeForce RTX 4080 Super', price:999,
    specs:'16GB GDDR6X / 10240 CUDA / 320W',         power:320 },
  { id:'gpu_4080',         cat:'GPU', name:'NVIDIA GeForce RTX 4080', price:849,
    specs:'16GB GDDR6X / 9728 CUDA / 320W',          power:320 },
  { id:'gpu4',             cat:'GPU', name:'NVIDIA GeForce RTX 4070 Ti Super', price:799,
    specs:'16GB GDDR6X / 8448 CUDA / 285W',          power:285 },
  { id:'gpu_4070ti',       cat:'GPU', name:'NVIDIA GeForce RTX 4070 Ti', price:699,
    specs:'12GB GDDR6X / 7680 CUDA / 285W',          power:285 },
  { id:'gpu_4070s',        cat:'GPU', name:'NVIDIA GeForce RTX 4070 Super', price:599,
    specs:'12GB GDDR6X / 7168 CUDA / 220W',          power:220 },
  { id:'gpu_4070',         cat:'GPU', name:'NVIDIA GeForce RTX 4070', price:549,
    specs:'12GB GDDR6X / 5888 CUDA / 200W',          power:200 },
  { id:'gpu_4060ti_16g',   cat:'GPU', name:'NVIDIA GeForce RTX 4060 Ti 16GB', price:449,
    specs:'16GB GDDR6 / 4352 CUDA / 165W',           power:165 },
  { id:'gpu_4060ti',       cat:'GPU', name:'NVIDIA GeForce RTX 4060 Ti', price:369,
    specs:'8GB GDDR6 / 4352 CUDA / 165W',            power:165 },
  { id:'gpu_4060',         cat:'GPU', name:'NVIDIA GeForce RTX 4060', price:289,
    specs:'8GB GDDR6 / 3072 CUDA / 115W',            power:115 },

  /* ─────────────────────────────────────────────────────────
     GPUs — NVIDIA RTX 30 Series (Ampere)
  ───────────────────────────────────────────────────────── */
  { id:'gpu6',             cat:'GPU', name:'NVIDIA GeForce RTX 3080', price:399,
    specs:'10GB GDDR6X / 8704 CUDA / 320W',          power:320 },
  { id:'gpu_3080_12',      cat:'GPU', name:'NVIDIA GeForce RTX 3080 12GB', price:429,
    specs:'12GB GDDR6X / 8960 CUDA / 350W',          power:350 },
  { id:'gpu_3070ti',       cat:'GPU', name:'NVIDIA GeForce RTX 3070 Ti', price:329,
    specs:'8GB GDDR6X / 6144 CUDA / 290W',           power:290 },
  { id:'gpu_3070',         cat:'GPU', name:'NVIDIA GeForce RTX 3070', price:299,
    specs:'8GB GDDR6 / 5888 CUDA / 220W',            power:220 },
  { id:'gpu_3060ti',       cat:'GPU', name:'NVIDIA GeForce RTX 3060 Ti', price:249,
    specs:'8GB GDDR6 / 4864 CUDA / 200W',            power:200 },

  /* ─────────────────────────────────────────────────────────
     GPUs — AMD Radeon RX 9000 Series (RDNA 4, 2025)
  ───────────────────────────────────────────────────────── */
  { id:'gpu_rx9070xt',     cat:'GPU', name:'AMD Radeon RX 9070 XT', price:599,
    specs:'16GB GDDR6 / 4096 SPs / 304W',            power:304 },
  { id:'gpu_rx9070',       cat:'GPU', name:'AMD Radeon RX 9070', price:479,
    specs:'16GB GDDR6 / 3584 SPs / 220W',            power:220 },

  /* ─────────────────────────────────────────────────────────
     GPUs — AMD Radeon RX 7000 Series (RDNA 3)
  ───────────────────────────────────────────────────────── */
  { id:'gpu3',             cat:'GPU', name:'AMD Radeon RX 7900 XTX', price:799,
    specs:'24GB GDDR6 / 12288 SPs / 355W',           power:355 },
  { id:'gpu_rx7900xt',     cat:'GPU', name:'AMD Radeon RX 7900 XT', price:699,
    specs:'20GB GDDR6 / 10752 SPs / 300W',           power:300 },
  { id:'gpu_rx7900gre',    cat:'GPU', name:'AMD Radeon RX 7900 GRE', price:499,
    specs:'16GB GDDR6 / 5120 SPs / 260W',            power:260 },
  { id:'gpu5',             cat:'GPU', name:'AMD Radeon RX 7800 XT', price:419,
    specs:'16GB GDDR6 / 3840 SPs / 263W',            power:263 },
  { id:'gpu_rx7700xt',     cat:'GPU', name:'AMD Radeon RX 7700 XT', price:329,
    specs:'12GB GDDR6 / 3456 SPs / 245W',            power:245 },
  { id:'gpu_rx7600xt',     cat:'GPU', name:'AMD Radeon RX 7600 XT', price:279,
    specs:'16GB GDDR6 / 2048 SPs / 190W',            power:190 },
  { id:'gpu_rx7600',       cat:'GPU', name:'AMD Radeon RX 7600', price:219,
    specs:'8GB GDDR6 / 2048 SPs / 165W',             power:165 },


  /* ─────────────────────────────────────────────────────────
     Motherboards — Intel LGA1851 (Arrow Lake, DDR5 only)
  ───────────────────────────────────────────────────────── */
  { id:'mb_z890_apex',     cat:'Motherboard', name:'ASUS ROG Maximus Z890 Apex', price:699,
    specs:'Z890 / DDR5 / PCIe 5.0 / E-ATX',       socket:'LGA1851', memType:'DDR5' },
  { id:'mb_z890_strix',    cat:'Motherboard', name:'ASUS ROG Strix Z890-E Gaming', price:449,
    specs:'Z890 / DDR5 / PCIe 5.0 / ATX',         socket:'LGA1851', memType:'DDR5' },
  { id:'mb_z890_meg_ace',  cat:'Motherboard', name:'MSI MEG Z890 ACE', price:549,
    specs:'Z890 / DDR5 / PCIe 5.0 / ATX',         socket:'LGA1851', memType:'DDR5' },
  { id:'mb_z890_mag',      cat:'Motherboard', name:'MSI MAG Z890 Tomahawk', price:269,
    specs:'Z890 / DDR5 / PCIe 5.0 / ATX',         socket:'LGA1851', memType:'DDR5' },
  { id:'mb_b860_tomahawk', cat:'Motherboard', name:'MSI MAG B860M Tomahawk', price:199,
    specs:'B860 / DDR5 / PCIe 5.0 / mATX',        socket:'LGA1851', memType:'DDR5' },
  { id:'mb_b860_prime',    cat:'Motherboard', name:'ASUS PRIME B860M-A', price:139,
    specs:'B860 / DDR5 / mATX',                    socket:'LGA1851', memType:'DDR5' },
  { id:'mb_z890_aorus',    cat:'Motherboard', name:'Gigabyte Z890 AORUS Elite', price:299,
    specs:'Z890 / DDR5 / PCIe 5.0 / ATX',         socket:'LGA1851', memType:'DDR5' },

  /* ─────────────────────────────────────────────────────────
     Motherboards — Intel LGA1700 + DDR5 (Z790 / B760)
  ───────────────────────────────────────────────────────── */
  { id:'mb1',              cat:'Motherboard', name:'ASUS ROG Maximus Z790 Apex', price:649,
    specs:'Z790 / DDR5 / PCIe 5.0 / E-ATX',       socket:'LGA1700', memType:'DDR5' },
  { id:'mb_z790_hero',     cat:'Motherboard', name:'ASUS ROG Strix Z790-E DDR5', price:429,
    specs:'Z790 / DDR5 / PCIe 5.0 / ATX',         socket:'LGA1700', memType:'DDR5' },
  { id:'mb3',              cat:'Motherboard', name:'ASUS PRIME Z790-A DDR5', price:279,
    specs:'Z790 / DDR5 / ATX',                     socket:'LGA1700', memType:'DDR5' },
  { id:'mb_z790_aorus',    cat:'Motherboard', name:'Gigabyte Z790 AORUS Master', price:379,
    specs:'Z790 / DDR5 / PCIe 5.0 / E-ATX',       socket:'LGA1700', memType:'DDR5' },
  { id:'mb_b760_tomahawk', cat:'Motherboard', name:'MSI MAG B760 Tomahawk DDR5', price:189,
    specs:'B760 / DDR5 / ATX',                     socket:'LGA1700', memType:'DDR5' },
  { id:'mb9',              cat:'Motherboard', name:'MSI MAG B760M Mortar DDR5', price:159,
    specs:'B760 / DDR5 / mATX',                    socket:'LGA1700', memType:'DDR5' },
  { id:'mb_b760_tuf',      cat:'Motherboard', name:'ASUS TUF Gaming B760-Plus D5', price:149,
    specs:'B760 / DDR5 / ATX',                     socket:'LGA1700', memType:'DDR5' },
  { id:'mb_b760_asrock',   cat:'Motherboard', name:'ASRock B760 Pro RS DDR5', price:129,
    specs:'B760 / DDR5 / ATX',                     socket:'LGA1700', memType:'DDR5' },

  /* ─────────────────────────────────────────────────────────
     Motherboards — Intel LGA1700 + DDR4 (Z790 / B760 / Z690)
  ───────────────────────────────────────────────────────── */
  { id:'mb_z790_ddr4',     cat:'Motherboard', name:'ASUS ROG Strix Z790-A DDR4', price:249,
    specs:'Z790 / DDR4 / ATX',                     socket:'LGA1700', memType:'DDR4' },
  { id:'mb5',              cat:'Motherboard', name:'MSI PRO Z790-A DDR4', price:189,
    specs:'Z790 / DDR4 / ATX',                     socket:'LGA1700', memType:'DDR4' },
  { id:'mb10',             cat:'Motherboard', name:'Gigabyte B760 DS3H DDR4', price:99,
    specs:'B760 / DDR4 / ATX',                     socket:'LGA1700', memType:'DDR4' },
  { id:'mb_b660_ddr4',     cat:'Motherboard', name:'MSI PRO B660M-A DDR4', price:99,
    specs:'B660 / DDR4 / mATX',                    socket:'LGA1700', memType:'DDR4' },

  /* ─────────────────────────────────────────────────────────
     Motherboards — AMD AM5 (X870E / X870 / X670E / B650)
     AM5 = DDR5 ONLY
  ───────────────────────────────────────────────────────── */
  { id:'mb_x870e_hero',    cat:'Motherboard', name:'ASUS ROG Crosshair X870E Hero', price:699,
    specs:'X870E / DDR5 / PCIe 5.0 / ATX',        socket:'AM5', memType:'DDR5' },
  { id:'mb_x870e_aorus',   cat:'Motherboard', name:'Gigabyte X870E AORUS Master', price:499,
    specs:'X870E / DDR5 / PCIe 5.0 / E-ATX',      socket:'AM5', memType:'DDR5' },
  { id:'mb_x870_msi',      cat:'Motherboard', name:'MSI MEG X870E ACE', price:549,
    specs:'X870E / DDR5 / PCIe 5.0 / ATX',        socket:'AM5', memType:'DDR5' },
  { id:'mb11',             cat:'Motherboard', name:'ASUS ROG Crosshair X670E Hero', price:499,
    specs:'X670E / DDR5 / PCIe 5.0 / ATX',        socket:'AM5', memType:'DDR5' },
  { id:'mb2',              cat:'Motherboard', name:'MSI MEG X670E ACE', price:449,
    specs:'X670E / DDR5 / PCIe 5.0 / ATX',        socket:'AM5', memType:'DDR5' },
  { id:'mb4',              cat:'Motherboard', name:'Gigabyte B650 AORUS Pro AX', price:209,
    specs:'B650 / DDR5 / Wi-Fi / ATX',             socket:'AM5', memType:'DDR5' },
  { id:'mb12',             cat:'Motherboard', name:'MSI MAG B650 Tomahawk', price:169,
    specs:'B650 / DDR5 / ATX',                     socket:'AM5', memType:'DDR5' },
  { id:'mb_b650_tuf',      cat:'Motherboard', name:'ASUS TUF Gaming B650-Plus', price:159,
    specs:'B650 / DDR5 / Wi-Fi / ATX',             socket:'AM5', memType:'DDR5' },
  { id:'mb_b650_asrock',   cat:'Motherboard', name:'ASRock B650M Pro RS', price:129,
    specs:'B650 / DDR5 / mATX',                    socket:'AM5', memType:'DDR5' },
  { id:'mb_a620_asrock',   cat:'Motherboard', name:'ASRock A620M Pro RS', price:89,
    specs:'A620 / DDR5 / mATX',                    socket:'AM5', memType:'DDR5' },

  /* ─────────────────────────────────────────────────────────
     Motherboards — AMD AM4 (X570 / B550 / B450)
  ───────────────────────────────────────────────────────── */
  { id:'mb6',              cat:'Motherboard', name:'ASUS ROG Crosshair VIII Dark Hero', price:279,
    specs:'X570 / DDR4 / ATX',                     socket:'AM4', memType:'DDR4' },
  { id:'mb13',             cat:'Motherboard', name:'ASUS TUF Gaming X570-Plus', price:159,
    specs:'X570 / DDR4 / Wi-Fi / ATX',             socket:'AM4', memType:'DDR4' },
  { id:'mb_x570_gigabyte', cat:'Motherboard', name:'Gigabyte X570 AORUS Elite', price:169,
    specs:'X570 / DDR4 / ATX',                     socket:'AM4', memType:'DDR4' },
  { id:'mb7',              cat:'Motherboard', name:'MSI MAG B550 Tomahawk', price:129,
    specs:'B550 / DDR4 / ATX',                     socket:'AM4', memType:'DDR4' },
  { id:'mb_b550_aorus',    cat:'Motherboard', name:'Gigabyte B550 AORUS Pro AX', price:139,
    specs:'B550 / DDR4 / Wi-Fi / ATX',             socket:'AM4', memType:'DDR4' },
  { id:'mb_b550m_asrock',  cat:'Motherboard', name:'ASRock B550M Pro4', price:79,
    specs:'B550 / DDR4 / mATX',                    socket:'AM4', memType:'DDR4' },
  { id:'mb8',              cat:'Motherboard', name:'Gigabyte B450 AORUS M', price:69,
    specs:'B450 / DDR4 / mATX',                    socket:'AM4', memType:'DDR4' },


  /* ─────────────────────────────────────────────────────────
     RAM — DDR5
  ───────────────────────────────────────────────────────── */
  { id:'ram_gz5_64_6400',  cat:'RAM', name:'G.Skill Trident Z5 RGB 64GB DDR5-6400', price:319,
    specs:'64GB DDR5-6400 / CL32 / 2×32GB', memType:'DDR5', capacity:64 },
  { id:'ram1',             cat:'RAM', name:'G.Skill Trident Z5 RGB 64GB DDR5-6000', price:249,
    specs:'64GB DDR5-6000 / CL30 / 2×32GB', memType:'DDR5', capacity:64 },
  { id:'ram_corsair_dom64', cat:'RAM', name:'Corsair Dominator Titanium 64GB DDR5', price:289,
    specs:'64GB DDR5-6000 / CL30 / 2×32GB', memType:'DDR5', capacity:64 },
  { id:'ram6',             cat:'RAM', name:'G.Skill Ripjaws S5 32GB DDR5-6000', price:94,
    specs:'32GB DDR5-6000 / CL32 / 2×16GB', memType:'DDR5', capacity:32 },
  { id:'ram2',             cat:'RAM', name:'Corsair Vengeance RGB 32GB DDR5-5600', price:99,
    specs:'32GB DDR5-5600 / CL36 / 2×16GB', memType:'DDR5', capacity:32 },
  { id:'ram_kingston_d5_32',cat:'RAM', name:'Kingston Fury Beast 32GB DDR5-5200', price:79,
    specs:'32GB DDR5-5200 / CL40 / 2×16GB', memType:'DDR5', capacity:32 },
  { id:'ram_crucial_d5_32', cat:'RAM', name:'Crucial Pro 32GB DDR5-5600', price:74,
    specs:'32GB DDR5-5600 / CL46 / 2×16GB', memType:'DDR5', capacity:32 },
  { id:'ram_teamgroup_d5',  cat:'RAM', name:'TeamGroup T-Force Delta 32GB DDR5-6000', price:89,
    specs:'32GB DDR5-6000 / CL38 / 2×16GB', memType:'DDR5', capacity:32 },
  { id:'ram5',             cat:'RAM', name:'Kingston Fury Beast 16GB DDR5-5200', price:49,
    specs:'16GB DDR5-5200 / CL40 / 2×8GB',  memType:'DDR5', capacity:16 },
  { id:'ram_crucial_d5_16', cat:'RAM', name:'Crucial Pro 16GB DDR5-5600', price:44,
    specs:'16GB DDR5-5600 / CL46 / 2×8GB',  memType:'DDR5', capacity:16 },

  /* ─────────────────────────────────────────────────────────
     RAM — DDR4
  ───────────────────────────────────────────────────────── */
  { id:'ram8',             cat:'RAM', name:'G.Skill Trident Z Neo 64GB DDR4-3600', price:129,
    specs:'64GB DDR4-3600 / CL18 / 2×32GB', memType:'DDR4', capacity:64 },
  { id:'ram_gskill_d4_32', cat:'RAM', name:'G.Skill Trident Z Neo 32GB DDR4-3600', price:69,
    specs:'32GB DDR4-3600 / CL16 / 2×16GB', memType:'DDR4', capacity:32 },
  { id:'ram3',             cat:'RAM', name:'Kingston Fury Beast 32GB DDR4-3600', price:64,
    specs:'32GB DDR4-3600 / CL18 / 2×16GB', memType:'DDR4', capacity:32 },
  { id:'ram7',             cat:'RAM', name:'Corsair Vengeance LPX 32GB DDR4-3200', price:54,
    specs:'32GB DDR4-3200 / CL16 / 2×16GB', memType:'DDR4', capacity:32 },
  { id:'ram_crucial_d4_16',cat:'RAM', name:'Crucial Ballistix 16GB DDR4-3600', price:39,
    specs:'16GB DDR4-3600 / CL16 / 2×8GB',  memType:'DDR4', capacity:16 },
  { id:'ram4',             cat:'RAM', name:'G.Skill Ripjaws V 16GB DDR4-3200', price:34,
    specs:'16GB DDR4-3200 / CL16 / 2×8GB',  memType:'DDR4', capacity:16 },
  { id:'ram_corsair_d4_16', cat:'RAM', name:'Corsair Vengeance LPX 16GB DDR4-3000', price:29,
    specs:'16GB DDR4-3000 / CL15 / 2×8GB',  memType:'DDR4', capacity:16 },


  /* ─────────────────────────────────────────────────────────
     Storage — PCIe Gen 5 NVMe (newest, fastest)
  ───────────────────────────────────────────────────────── */
  { id:'ssd_t705_2tb',     cat:'Storage', name:'Crucial T705 2TB Gen5 NVMe', price:229,
    specs:'2TB PCIe 5.0 NVMe / 14500 MB/s Read' },
  { id:'ssd_mp700pro_2tb', cat:'Storage', name:'Corsair MP700 Pro 2TB Gen5 NVMe', price:219,
    specs:'2TB PCIe 5.0 NVMe / 12400 MB/s Read' },
  { id:'ssd_t705_1tb',     cat:'Storage', name:'Crucial T705 1TB Gen5 NVMe', price:129,
    specs:'1TB PCIe 5.0 NVMe / 14100 MB/s Read' },

  /* ─────────────────────────────────────────────────────────
     Storage — PCIe Gen 4 NVMe
  ───────────────────────────────────────────────────────── */
  { id:'ssd_990pro_4tb',   cat:'Storage', name:'Samsung 990 Pro 4TB Gen4 NVMe', price:269,
    specs:'4TB PCIe 4.0 NVMe / 7450 MB/s Read' },
  { id:'ssd1',             cat:'Storage', name:'Samsung 990 Pro 2TB Gen4 NVMe', price:139,
    specs:'2TB PCIe 4.0 NVMe / 7450 MB/s Read' },
  { id:'ssd_990pro_1tb',   cat:'Storage', name:'Samsung 990 Pro 1TB Gen4 NVMe', price:89,
    specs:'1TB PCIe 4.0 NVMe / 7450 MB/s Read' },
  { id:'ssd_sn850x_2tb',   cat:'Storage', name:'WD Black SN850X 2TB Gen4 NVMe', price:149,
    specs:'2TB PCIe 4.0 NVMe / 7300 MB/s Read' },
  { id:'ssd2',             cat:'Storage', name:'WD Black SN850X 1TB Gen4 NVMe', price:84,
    specs:'1TB PCIe 4.0 NVMe / 7300 MB/s Read' },
  { id:'ssd_firecuda_2tb', cat:'Storage', name:'Seagate FireCuda 530 2TB Gen4 NVMe', price:159,
    specs:'2TB PCIe 4.0 NVMe / 7300 MB/s Read' },
  { id:'ssd4',             cat:'Storage', name:'Crucial P5 Plus 2TB Gen4 NVMe', price:99,
    specs:'2TB PCIe 4.0 NVMe / 6600 MB/s Read' },
  { id:'ssd_p41_1tb',      cat:'Storage', name:'SK Hynix Platinum P41 1TB NVMe', price:74,
    specs:'1TB PCIe 4.0 NVMe / 7000 MB/s Read' },
  { id:'ssd_t500_1tb',     cat:'Storage', name:'Crucial T500 1TB Gen4 NVMe', price:79,
    specs:'1TB PCIe 4.0 NVMe / 7400 MB/s Read' },

  /* ─────────────────────────────────────────────────────────
     Storage — SATA SSD / HDD
  ───────────────────────────────────────────────────────── */
  { id:'ssd_870evo_2tb',   cat:'Storage', name:'Samsung 870 EVO 2TB SATA SSD', price:99,
    specs:'2TB SATA SSD / 560 MB/s Read' },
  { id:'ssd_mx500_2tb',    cat:'Storage', name:'Crucial MX500 2TB SATA SSD', price:84,
    specs:'2TB SATA SSD / 560 MB/s Read' },
  { id:'ssd3',             cat:'Storage', name:'Seagate Barracuda 4TB HDD', price:59,
    specs:'4TB HDD / 7200 RPM / SATA' },
  { id:'ssd_wd_6tb',       cat:'Storage', name:'WD Red Plus 6TB HDD', price:109,
    specs:'6TB HDD / 5400 RPM / NAS-ready' },


  /* ─────────────────────────────────────────────────────────
     PSU — 1600W+
  ───────────────────────────────────────────────────────── */
  { id:'psu_be_1600',      cat:'PSU', name:"be quiet! Dark Power 13 1600W", price:379,
    specs:'1600W / 80+ Titanium / Fully Modular',       wattage:1600 },
  { id:'psu_seasonic_1600',cat:'PSU', name:'Seasonic Prime TX-1600', price:449,
    specs:'1600W / 80+ Titanium / Fully Modular',       wattage:1600 },

  /* ─────────────────────────────────────────────────────────
     PSU — 1200W–1300W
  ───────────────────────────────────────────────────────── */
  { id:'psu1',             cat:'PSU', name:'Corsair HX1200i Platinum', price:279,
    specs:'1200W / 80+ Platinum / Fully Modular',       wattage:1200 },
  { id:'psu_tx1300',       cat:'PSU', name:'Seasonic Prime TX-1300', price:329,
    specs:'1300W / 80+ Titanium / Fully Modular',       wattage:1300 },
  { id:'psu_rm1200x',      cat:'PSU', name:'Corsair RM1200x Shift', price:229,
    specs:'1200W / 80+ Gold / Fully Modular / ATX 3.0', wattage:1200 },

  /* ─────────────────────────────────────────────────────────
     PSU — 1000W
  ───────────────────────────────────────────────────────── */
  { id:'psu2',             cat:'PSU', name:'Seasonic Prime TX-1000', price:219,
    specs:'1000W / 80+ Titanium / Fully Modular',       wattage:1000 },
  { id:'psu_rm1000x',      cat:'PSU', name:'Corsair RM1000x Shift', price:189,
    specs:'1000W / 80+ Gold / Fully Modular / ATX 3.0', wattage:1000 },
  { id:'psu_evga_1000',    cat:'PSU', name:'EVGA SuperNOVA 1000 G6', price:169,
    specs:'1000W / 80+ Gold / Fully Modular',           wattage:1000 },
  { id:'psu_be_1000',      cat:'PSU', name:"be quiet! Straight Power 12 1000W", price:199,
    specs:'1000W / 80+ Platinum / Fully Modular',       wattage:1000 },

  /* ─────────────────────────────────────────────────────────
     PSU — 850W
  ───────────────────────────────────────────────────────── */
  { id:'psu3',             cat:'PSU', name:'EVGA SuperNOVA 850 G6', price:119,
    specs:'850W / 80+ Gold / Fully Modular',            wattage:850 },
  { id:'psu_rm850x',       cat:'PSU', name:'Corsair RM850x Shift', price:139,
    specs:'850W / 80+ Gold / Fully Modular / ATX 3.0',  wattage:850 },
  { id:'psu_gx850',        cat:'PSU', name:'Seasonic Focus GX-850', price:129,
    specs:'850W / 80+ Gold / Fully Modular',            wattage:850 },
  { id:'psu_be_850',       cat:'PSU', name:"be quiet! Dark Power Pro 12 850W", price:179,
    specs:'850W / 80+ Titanium / Fully Modular',        wattage:850 },
  { id:'psu_toughpower_850',cat:'PSU', name:'Thermaltake Toughpower GF3 850W', price:109,
    specs:'850W / 80+ Gold / Fully Modular / ATX 3.0',  wattage:850 },

  /* ─────────────────────────────────────────────────────────
     PSU — 750W
  ───────────────────────────────────────────────────────── */
  { id:'psu_rm750x',       cat:'PSU', name:'Corsair RM750x', price:99,
    specs:'750W / 80+ Gold / Fully Modular',            wattage:750 },
  { id:'psu_gx750',        cat:'PSU', name:'Seasonic Focus GX-750', price:109,
    specs:'750W / 80+ Gold / Fully Modular',            wattage:750 },
  { id:'psu_be_750',       cat:'PSU', name:"be quiet! Straight Power 12 750W", price:119,
    specs:'750W / 80+ Platinum / Fully Modular',        wattage:750 },
  { id:'psu_toughpower_750',cat:'PSU', name:'Thermaltake Toughpower GF3 750W', price:99,
    specs:'750W / 80+ Gold / Fully Modular / ATX 3.0',  wattage:750 },

  /* ─────────────────────────────────────────────────────────
     PSU — 650W and below
  ───────────────────────────────────────────────────────── */
  { id:'psu_rm650x',       cat:'PSU', name:'Corsair RM650x', price:89,
    specs:'650W / 80+ Gold / Fully Modular',            wattage:650 },
  { id:'psu_gx650',        cat:'PSU', name:'Seasonic Focus GX-650', price:99,
    specs:'650W / 80+ Gold / Fully Modular',            wattage:650 },
  { id:'psu4',             cat:'PSU', name:'Corsair CV650 Bronze', price:54,
    specs:'650W / 80+ Bronze / Non-Modular',            wattage:650 },
  { id:'psu_nzxt_c600',    cat:'PSU', name:'NZXT C600 Gold', price:74,
    specs:'600W / 80+ Gold / Fully Modular',            wattage:600 },
  { id:'psu_rm550x',       cat:'PSU', name:'Corsair RM550x', price:79,
    specs:'550W / 80+ Gold / Fully Modular',            wattage:550 },

  /* ─────────────────────────────────────────────────────────
     PSU — SFX (compact builds)
  ───────────────────────────────────────────────────────── */
  { id:'psu_sfx_750',      cat:'PSU', name:'Lian Li SP750 SFX Gold', price:119,
    specs:'750W / 80+ Gold / SFX / Fully Modular',     wattage:750 },
  { id:'psu_sfx_850',      cat:'PSU', name:'Corsair SF850L SFX Platinum', price:149,
    specs:'850W / 80+ Platinum / SFX / Fully Modular', wattage:850 },


  /* ─────────────────────────────────────────────────────────
     Cooling — 360mm AIO Liquid Coolers
  ───────────────────────────────────────────────────────── */
  { id:'cool1',            cat:'Cooling', name:'NZXT Kraken Elite 360 RGB', price:249,
    specs:'360mm AIO / 2.36" LCD / AM5 + LGA1700' },
  { id:'cool3',            cat:'Cooling', name:'Corsair iCUE H150i Elite LCD', price:229,
    specs:'360mm AIO / 2.1" LCD Head / AM5 + LGA1700' },
  { id:'cool_ek_360',      cat:'Cooling', name:'EK AIO Elite 360 D-RGB', price:179,
    specs:'360mm AIO / D-RGB / AM5 + LGA1700 + AM4' },
  { id:'cool_arctic_360',  cat:'Cooling', name:'Arctic Liquid Freezer III 360', price:109,
    specs:'360mm AIO / All Sockets' },
  { id:'cool_lian_360',    cat:'Cooling', name:'Lian Li Galahad II LCD 360', price:199,
    specs:'360mm AIO / 2.88" LCD / AM5 + LGA1700' },
  { id:'cool_be_360',      cat:'Cooling', name:"be quiet! Silent Loop 3 360", price:169,
    specs:'360mm AIO / ARGB / AM5 + LGA1700 + AM4' },
  { id:'cool_rog_360',     cat:'Cooling', name:'ASUS ROG Ryujin III 360 ARGB', price:269,
    specs:'360mm AIO / 3.5" LCD / AM5 + LGA1700' },
  { id:'cool_deepcool_360',cat:'Cooling', name:'DeepCool LT720 360mm', price:119,
    specs:'360mm AIO / ARGB / AM5 + LGA1700' },

  /* ─────────────────────────────────────────────────────────
     Cooling — 280mm AIO
  ───────────────────────────────────────────────────────── */
  { id:'cool_h115i',       cat:'Cooling', name:'Corsair iCUE H115i Elite LCD', price:179,
    specs:'280mm AIO / LCD Display / AM5 + LGA1700' },
  { id:'cool_kraken_280',  cat:'Cooling', name:'NZXT Kraken 280 RGB', price:139,
    specs:'280mm AIO / RGB Pump / AM5 + LGA1700' },
  { id:'cool_arctic_280',  cat:'Cooling', name:'Arctic Liquid Freezer III 280', price:99,
    specs:'280mm AIO / All Sockets' },

  /* ─────────────────────────────────────────────────────────
     Cooling — 240mm AIO
  ───────────────────────────────────────────────────────── */
  { id:'cool_h100i',       cat:'Cooling', name:'Corsair iCUE H100i RGB Elite', price:129,
    specs:'240mm AIO / RGB / AM5 + LGA1700' },
  { id:'cool_kraken_240',  cat:'Cooling', name:'NZXT Kraken 240 RGB', price:109,
    specs:'240mm AIO / RGB Pump / AM5 + LGA1700' },
  { id:'cool_arctic_240',  cat:'Cooling', name:'Arctic Liquid Freezer III 240', price:79,
    specs:'240mm AIO / All Sockets' },
  { id:'cool_deepcool_240',cat:'Cooling', name:'DeepCool LT520 ARGB 240mm', price:79,
    specs:'240mm AIO / ARGB / AM5 + LGA1700' },

  /* ─────────────────────────────────────────────────────────
     Cooling — Air Coolers (Dual Tower)
  ───────────────────────────────────────────────────────── */
  { id:'cool4',            cat:'Cooling', name:'Noctua NH-D15 G2', price:119,
    specs:'Dual Tower / 300W TDP / All Sockets' },
  { id:'cool2',            cat:'Cooling', name:"be quiet! Dark Rock Pro 5", price:99,
    specs:'Dual Tower / 250W TDP / All Sockets' },
  { id:'cool_ak620',       cat:'Cooling', name:'DeepCool AK620', price:54,
    specs:'Dual Tower / 260W TDP / All Sockets' },
  { id:'cool_scythe_fuma', cat:'Cooling', name:'Scythe Fuma 3', price:64,
    specs:'Dual Tower / 250W TDP / LGA1700 + AM5' },

  /* ─────────────────────────────────────────────────────────
     Cooling — Air Coolers (Single Tower)
  ───────────────────────────────────────────────────────── */
  { id:'cool_noctua_u12a', cat:'Cooling', name:'Noctua NH-U12A', price:99,
    specs:'Single Tower / 250W TDP / All Sockets' },
  { id:'cool_be_dr4',      cat:'Cooling', name:"be quiet! Dark Rock 4", price:64,
    specs:'Single Tower / 200W TDP / All Sockets' },
  { id:'cool_thermalright',cat:'Cooling', name:'Thermalright Peerless Assassin 120 SE', price:35,
    specs:'Dual Tower / 260W TDP / All Sockets' },
  { id:'cool_id_cooling',  cat:'Cooling', name:'ID-Cooling SE-226-XT', price:39,
    specs:'Dual Tower / 250W TDP / All Sockets' },
  { id:'cool_lian_galahad',cat:'Cooling', name:'Lian Li Galahad II SL-INF 120', price:44,
    specs:'Single Tower / 200W TDP / All Sockets' },


  /* ─────────────────────────────────────────────────────────
     Cases — Full Tower / E-ATX
  ───────────────────────────────────────────────────────── */
  { id:'case_lian_o11xe',  cat:'Case', name:'Lian Li O11 XL Evo RGB', price:219,
    specs:'Full Tower / Dual Chamber / Tri-TG' },
  { id:'case_fractal_torrent',cat:'Case', name:'Fractal Design Torrent', price:189,
    specs:'Full Tower / Mesh / E-ATX / High Airflow' },
  { id:'case_corsair_7000d', cat:'Case', name:'Corsair 7000D Airflow', price:189,
    specs:'Full Tower / Mesh / E-ATX / 3x 120mm Fans' },
  { id:'case_be_900',      cat:'Case', name:"be quiet! Pure Base 900 FX", price:179,
    specs:'Full Tower / Mesh / ARGB / E-ATX' },

  /* ─────────────────────────────────────────────────────────
     Cases — Mid Tower ATX
  ───────────────────────────────────────────────────────── */
  { id:'case1',            cat:'Case', name:'Lian Li O11 Dynamic EVO RGB', price:149,
    specs:'ATX Mid Tower / Dual Chamber / Tri-TG' },
  { id:'case2',            cat:'Case', name:'NZXT H9 Flow', price:149,
    specs:'ATX Mid Tower / Panoramic TG / Mesh' },
  { id:'case3',            cat:'Case', name:'Fractal Design Meshify 2', price:129,
    specs:'ATX Mid Tower / Mesh Front / High Airflow' },
  { id:'case4',            cat:'Case', name:'Corsair 4000D Airflow', price:89,
    specs:'ATX Mid Tower / Steel Mesh Front' },
  { id:'case_hyte_y70',    cat:'Case', name:'HYTE Y70 Panoramic', price:189,
    specs:'ATX Mid Tower / Panoramic TG / PCIe Riser' },
  { id:'case_corsair_5000d',cat:'Case', name:'Corsair 5000D Airflow', price:139,
    specs:'ATX Mid Tower / High Airflow / 3x 120mm Fans' },
  { id:'case_phanteks_g360',cat:'Case', name:'Phanteks Eclipse G360A', price:99,
    specs:'ATX Mid Tower / Mesh / 3x ARGB Fans' },
  { id:'case_be_500dx',    cat:'Case', name:"be quiet! Pure Base 500DX", price:99,
    specs:'ATX Mid Tower / Mesh / ARGB Top Strip' },
  { id:'case_lancool216',  cat:'Case', name:'Lian Li Lancool 216', price:79,
    specs:'ATX Mid Tower / Mesh / ARGB Fans' },
  { id:'case_nzxt_h5',     cat:'Case', name:'NZXT H5 Flow', price:84,
    specs:'ATX Mid Tower / Mesh Front / Minimalist' },
  { id:'case_darkflash',   cat:'Case', name:'darkFlash DLM21 Mesh', price:44,
    specs:'ATX Mid Tower / Mesh / Budget' },
  { id:'case_antec_df700', cat:'Case', name:'Antec DF700 Flux', price:74,
    specs:'ATX Mid Tower / Mesh + TG' },
  { id:'case_coolermaster_td500',cat:'Case', name:'Cooler Master TD500 Mesh V2', price:99,
    specs:'ATX Mid Tower / Mesh / ARGB / Modular' },

  /* ─────────────────────────────────────────────────────────
     Cases — Compact (mATX / Mini-ITX)
  ───────────────────────────────────────────────────────── */
  { id:'case_nzxt_h1',     cat:'Case', name:'NZXT H1 v2 Mini-ITX', price:299,
    specs:'Mini-ITX / 120mm AIO Included / SFX PSU' },
  { id:'case_lian_mini',   cat:'Case', name:'Lian Li O11 Air Mini', price:89,
    specs:'mATX / Mesh All-Around / Dual Chamber' },
  { id:'case_fractal_pop', cat:'Case', name:'Fractal Design Pop Air', price:74,
    specs:'ATX Mid Tower / Mesh / Minimalist' },
  { id:'case_jonsbo_u4',   cat:'Case', name:'Jonsbo U4 Plus', price:79,
    specs:'ATX Mid Tower / Full TG / ARGB' },
  // ─── Laptops — Gaming ──────────────────────────────────────
  { id:'lap_asus_rog_g16',     cat:'Laptop', name:'ASUS ROG Strix G16', price:1799,
    specs:'RTX 4080 / i9-14900HX / 32GB DDR5 / 1TB NVMe / 16" 240Hz' },
  { id:'lap_asus_rog_z13',     cat:'Laptop', name:'ASUS ROG Zephyrus G14', price:1499,
    specs:'RTX 4060 / Ryzen 9 7940HS / 32GB / 1TB / 14" 165Hz OLED' },
  { id:'lap_msi_titan_gt77',   cat:'Laptop', name:'MSI Titan GT77', price:3299,
    specs:'RTX 4090 / i9-13980HX / 64GB DDR5 / 2TB / 17.3" 4K 144Hz' },
  { id:'lap_msi_raider_ge78',  cat:'Laptop', name:'MSI Raider GE78 HX', price:2499,
    specs:'RTX 4080 / i9-14900HX / 32GB DDR5 / 2TB / 17" QHD 240Hz' },
  { id:'lap_asus_tuf_f15',     cat:'Laptop', name:'ASUS TUF Gaming F15', price:899,
    specs:'RTX 4060 / i7-13620H / 16GB / 512GB / 15.6" FHD 144Hz' },
  { id:'lap_lenovo_legion_7',  cat:'Laptop', name:'Lenovo Legion 7i Gen 9', price:1699,
    specs:'RTX 4070 / i9-14900HX / 32GB DDR5 / 1TB / 16" QHD 165Hz' },
  { id:'lap_lenovo_legion_5',  cat:'Laptop', name:'Lenovo Legion 5 Pro', price:1199,
    specs:'RTX 4060 / Ryzen 7 7745HX / 16GB / 512GB / 16" QHD 165Hz' },
  { id:'lap_razer_blade_16',   cat:'Laptop', name:'Razer Blade 16', price:2799,
    specs:'RTX 4090 / i9-14900HX / 32GB / 2TB / 16" UHD+ 120Hz OLED' },
  { id:'lap_razer_blade_15',   cat:'Laptop', name:'Razer Blade 15', price:1999,
    specs:'RTX 4070 / i7-13800H / 16GB DDR5 / 1TB / 15.6" QHD 240Hz' },
  { id:'lap_acer_predator_18', cat:'Laptop', name:'Acer Predator Helios 18', price:1999,
    specs:'RTX 4080 / i9-14900HX / 32GB DDR5 / 1TB / 18" QHD 250Hz' },
  { id:'lap_acer_nitro_v15',   cat:'Laptop', name:'Acer Nitro V 15', price:699,
    specs:'RTX 4050 / i5-13420H / 8GB / 512GB / 15.6" FHD 144Hz' },
  { id:'lap_hp_omen_16',       cat:'Laptop', name:'HP OMEN 16', price:1299,
    specs:'RTX 4070 / i7-13700HX / 16GB DDR5 / 1TB / 16" QHD 165Hz' },
  { id:'lap_dell_g16',         cat:'Laptop', name:'Dell G16 Gaming', price:999,
    specs:'RTX 4060 / i7-13650HX / 16GB / 512GB / 16" QHD 165Hz' },
  { id:'lap_gigabyte_aorus_17',cat:'Laptop', name:'Gigabyte AORUS 17X', price:2199,
    specs:'RTX 4080 / i9-13980HX / 32GB DDR5 / 2TB / 17.3" FHD 360Hz' },

  // ─── Laptops — Ultrabooks / Office ─────────────────────────
  { id:'lap_apple_mbp_m3pro',  cat:'Laptop', name:'Apple MacBook Pro 14" M3 Pro', price:1999,
    specs:'M3 Pro 12-core / 18GB Unified / 512GB SSD / 120Hz ProMotion' },
  { id:'lap_apple_mbp_m3max',  cat:'Laptop', name:'Apple MacBook Pro 16" M3 Max', price:3499,
    specs:'M3 Max 16-core / 48GB Unified / 1TB SSD / 120Hz ProMotion' },
  { id:'lap_apple_mba_m3',     cat:'Laptop', name:'Apple MacBook Air 15" M3', price:1299,
    specs:'M3 8-core / 16GB Unified / 512GB SSD / 15.3" Liquid Retina' },
  { id:'lap_dell_xps_15',      cat:'Laptop', name:'Dell XPS 15', price:1799,
    specs:'RTX 4060 / i7-13700H / 16GB / 512GB / 15.6" 3.5K 60Hz OLED' },
  { id:'lap_dell_xps_13',      cat:'Laptop', name:'Dell XPS 13 Plus', price:1199,
    specs:'i7-1360P / 16GB LPDDR5 / 512GB / 13.4" FHD+ touch' },
  { id:'lap_lenovo_x1_carbon', cat:'Laptop', name:'Lenovo ThinkPad X1 Carbon Gen 12', price:1649,
    specs:'i7-1365U / 16GB / 512GB / 14" IPS 2.8K / 1.12kg' },
  { id:'lap_lenovo_slim5',     cat:'Laptop', name:'Lenovo IdeaPad Slim 5', price:649,
    specs:'Ryzen 5 7530U / 16GB / 512GB / 14" FHD IPS' },
  { id:'lap_hp_spectre_14',    cat:'Laptop', name:'HP Spectre x360 14', price:1499,
    specs:'i7-1355U / 16GB / 1TB / 13.5" 3K2K OLED Touch 2-in-1' },
  { id:'lap_hp_elitebook_840', cat:'Laptop', name:'HP EliteBook 840 G10', price:1349,
    specs:'i7-1355U / 16GB DDR5 / 512GB / 14" 2.8K OLED' },
  { id:'lap_asus_zenbook_14',  cat:'Laptop', name:'ASUS Zenbook 14 OLED', price:899,
    specs:'Ryzen 7 7745H / 16GB / 1TB / 14" 2.8K OLED 120Hz' },
  { id:'lap_asus_vivobook_16', cat:'Laptop', name:'ASUS Vivobook 16', price:499,
    specs:'Ryzen 5 7530U / 8GB / 512GB / 16" FHD' },
  { id:'lap_microsoft_surface',cat:'Laptop', name:'Microsoft Surface Laptop 5', price:1299,
    specs:'i7-1265U / 16GB / 512GB / 13.5" PixelSense Touch' },
  { id:'lap_samsung_galaxy_4', cat:'Laptop', name:'Samsung Galaxy Book4 Pro', price:1449,
    specs:'i7-150U / 16GB / 512GB / 16" AMOLED 120Hz 3K' },
  { id:'lap_acer_swift_go',    cat:'Laptop', name:'Acer Swift Go 14', price:749,
    specs:'Ryzen 5 7540U / 16GB / 512GB / 14" 2.8K OLED' },

  // ─── Laptops — Budget / Student ────────────────────────────
  { id:'lap_acer_aspire_3',    cat:'Laptop', name:'Acer Aspire 3', price:349,
    specs:'Ryzen 3 7320U / 8GB / 256GB / 15.6" FHD' },
  { id:'lap_lenovo_ideapad_1', cat:'Laptop', name:'Lenovo IdeaPad 1', price:299,
    specs:'Celeron N4500 / 4GB / 128GB eMMC / 14" HD' },
  { id:'lap_hp_15',            cat:'Laptop', name:'HP 15-dw3033dx', price:379,
    specs:'i3-1115G4 / 8GB / 256GB / 15.6" FHD' },
  { id:'lap_dell_inspiron_15', cat:'Laptop', name:'Dell Inspiron 15', price:449,
    specs:'i5-1335U / 8GB / 256GB / 15.6" FHD IPS' },
  { id:'lap_chromebook_plus',  cat:'Laptop', name:'ASUS Chromebook Plus', price:399,
    specs:'i3-1215U / 8GB / 256GB / 14" FHD IPS / ChromeOS' },
];

/* ============================================================
   CATEGORIES
============================================================ */
const CATEGORIES = [
  'All', 'CPU', 'GPU', 'Motherboard', 'RAM',
  'Storage', 'PSU', 'Cooling', 'Case', 'Laptop'
];

/* ============================================================
   BUILDER SLOTS
============================================================ */
const BUILDER_SLOTS = [
  { key: 'CPU',         label: 'Processor',    cat: 'CPU',  required: true  },
  { key: 'GPU',         label: 'Graphics Card', cat: 'GPU',  required: true  },
  { key: 'Motherboard', label: 'Motherboard',   cat: 'MB',   required: true  },
  { key: 'RAM',         label: 'Memory',        cat: 'RAM',  required: true  },
  { key: 'Storage',     label: 'Storage',       cat: 'SSD',  required: true  },
  { key: 'PSU',         label: 'Power Supply',  cat: 'PSU',  required: true  },
  { key: 'Cooling',     label: 'CPU Cooler',    cat: 'CLR',  required: false },
  { key: 'Case',        label: 'Case',          cat: 'CASE', required: false },
];

/* ============================================================
   CATALOG HELPERS
============================================================ */

function _getCustomProducts() {
  try { return JSON.parse(localStorage.getItem('ds_custom_products') || '[]'); } catch(e) { return []; }
}

function _getAllProducts() {
  const hidden = (function(){ try{ return JSON.parse(localStorage.getItem('ds_hidden_products')||'[]'); }catch(e){ return []; }})();
  const base = hidden.length ? PRODUCTS.filter(p => !hidden.includes(p.id)) : PRODUCTS;
  return [...base, ..._getCustomProducts()];
}

function getProduct(id) {
  return _getAllProducts().find(p => p.id === id);
}

function getProductsByCategory(cat) {
  return _getAllProducts().filter(p => p.cat === cat);
}

/**
 * Derive the memory type constraint from a socket.
 * AM5 / LGA1851 → DDR5 only, AM4 → DDR4 only, LGA1700 → null (board decides).
 */
function getSocketMemType(socket) {
  if (socket === 'AM5')     return 'DDR5';
  if (socket === 'LGA1851') return 'DDR5';
  if (socket === 'AM4')     return 'DDR4';
  return null; // LGA1700: board-level choice (DDR4 or DDR5 depending on the motherboard)
}