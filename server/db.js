const path = require('node:path');
const fs = require('node:fs');
const { DatabaseSync } = require('node:sqlite');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'vrudhseva.sqlite');
const db = new DatabaseSync(dbPath);

// Enable WAL mode & foreign keys for performance and data safety
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS unidentified_registry (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_number TEXT UNIQUE NOT NULL,
      approx_age TEXT NOT NULL,
      gender TEXT NOT NULL,
      clothing_desc TEXT,
      physical_marks TEXT,
      language_dialect TEXT,
      discovery_location TEXT,
      police_station_ref TEXT,
      medical_observations TEXT,
      status TEXT DEFAULT 'Searching',
      photo_url TEXT,
      arrival_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS emergency_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      need_type TEXT NOT NULL,
      resident_name TEXT DEFAULT 'Resident / Bedside Switch',
      location_room TEXT DEFAULT 'Ward B (Bed 4)',
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      acknowledged_at DATETIME,
      acknowledged_by TEXT
    );

    CREATE TABLE IF NOT EXISTS medications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resident_name TEXT NOT NULL,
      drug_name TEXT NOT NULL,
      dosage TEXT NOT NULL,
      scheduled_time TEXT NOT NULL,
      shift TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      notes TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS staff_handovers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shift TEXT NOT NULL,
      caregiver_name TEXT NOT NULL,
      mood_behavior TEXT,
      diet_meals TEXT,
      incidents TEXT,
      sleep_pattern TEXT,
      pending_tasks TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS volunteers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      interest_area TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS donations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      target_amount INTEGER NOT NULL,
      fulfilled_amount INTEGER NOT NULL,
      percentage INTEGER NOT NULL,
      unit TEXT,
      is_urgent INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS memory_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resident_name TEXT NOT NULL,
      preferred_name TEXT,
      hometown TEXT,
      favorite_songs TEXT,
      calming_cues TEXT,
      hobbies TEXT,
      routine_anchor TEXT
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed initial data if tables are empty
  seedInitialData();
}

function seedInitialData() {
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM donations');
  const countResult = countStmt.get();

  if (countResult && countResult.count === 0) {
    console.log('[DB] Seeding initial data for Madhurangan Old Age Home...');

    // 1. Seed Donation Needs
    const insertDonation = db.prepare(`
      INSERT INTO donations (category, title, target_amount, fulfilled_amount, percentage, unit, is_urgent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const initialDonations = [
      ['meds', 'Medicines & First Aid Kits', 100, 70, 70, 'Monthly supply', 1],
      ['hygiene', 'Adult Diapers & Hygiene Kits', 100, 45, 45, 'Units', 1],
      ['clothes', 'Cotton Kurta/Sarees & Winter Blankets', 50, 30, 60, 'Sets', 0],
      ['food', 'Nutritious Grains, Milk & Fruits', 100, 80, 80, 'Monthly stock', 0],
      ['furn', 'Orthopedic Mattresses & Recliners', 10, 3, 30, 'Items', 0],
      ['games', 'Large-Print Puzzles & Memory Games', 20, 10, 50, 'Sets', 0],
      ['tech', 'Switch-Assist Tablets & Emergency Buzzers', 8, 2, 25, 'Devices', 1]
    ];
    for (const d of initialDonations) {
      insertDonation.run(...d);
    }

    // 2. Seed Medication Schedules
    const insertMed = db.prepare(`
      INSERT INTO medications (resident_name, drug_name, dosage, scheduled_time, shift, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const initialMeds = [
      ['Narayanswamy (Resident #1)', 'Amlodipine', '5 mg', '08:00', 'Morning', 'given', 'Taken with warm water after breakfast'],
      ['Shakuntala Devi (Resident #2)', 'Metformin', '500 mg', '13:00', 'Afternoon', 'given', 'Post-lunch dosage administered'],
      ['Gangadhar Rao (Resident #3)', 'Donepezil', '10 mg', '20:30', 'Night', 'pending', 'Dementia cognitive routine stabilizer'],
      ['Kusum Tai (Resident #4)', 'Levothyroxine', '50 mcg', '07:00', 'Morning', 'given', 'Fasting thyroid medication'],
      ['Devendra Ji (Resident #5)', 'Calcium & Vitamin D3', '500 mg', '19:00', 'Evening', 'delayed', 'Waiting for evening snack']
    ];
    for (const m of initialMeds) {
      insertMed.run(...m);
    }

    // 3. Seed Unidentified Registry Cases (Found wandering / Police rescue)
    const insertRegistry = db.prepare(`
      INSERT INTO unidentified_registry (case_number, approx_age, gender, clothing_desc, physical_marks, language_dialect, discovery_location, police_station_ref, medical_observations, status, photo_url, arrival_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const initialCases = [
      [
        'VRU-NGP-2026-001',
        '68 - 72 years',
        'Male',
        'White cotton Kurta, blue printed Gamcha around neck, brown sandals',
        'Small dark mole on right cheek, faint surgical scar on left knee',
        'Speaks Marathi (Nagpuri dialect), occasionally Hindi',
        'Found wandering near Khapri Railway Crossing, Wardha Road, Nagpur',
        'Sonegaon Police Station DD No. 42/2026',
        'Mild disorientation, high blood pressure (145/90), responding to name "Bhaskar" or "Bapu"',
        'Searching',
        'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80',
        '2026-10-24'
      ],
      [
        'VRU-NGP-2026-002',
        '75 - 78 years',
        'Female',
        'Traditional green Navvari cotton Saree with yellow border, silver anklet on left foot',
        'Old burn scar on right forearm, silver Tulsi bead neck chain',
        'Marathi (Vidarbha region tone), very soft voice, limited verbal output',
        'Brought by citizen patrol from Shankar Nagar Garden, Nagpur',
        'Ambazari Police Station Ref: GD 19/2026',
        'Advanced memory loss, mild aphasia, walks with slow rhythmic gait, asks about "vitthal temple"',
        'Under Verification',
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
        '2026-10-26'
      ]
    ];
    for (const c of initialCases) {
      insertRegistry.run(...c);
    }

    // 4. Seed Memory Aid Profiles
    const insertMemory = db.prepare(`
      INSERT INTO memory_profiles (resident_name, preferred_name, hometown, favorite_songs, calming_cues, hobbies, routine_anchor)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const initialProfiles = [
      [
        'Gangadhar Rao',
        'Gangadhar Kakaji',
        'Wardha / Sewagram',
        'Bhajan "Majhe Maher Pandhari", Natyasangeet classics',
        'Offer cup of warm tea with cardamom; mention temple courtyard',
        'Listening to All India Radio Marathi news at 7 PM',
        'Morning prayer chants at 6:30 AM before light courtyard stroll'
      ],
      [
        'Shakuntala Devi',
        'Shaku Aaji',
        'Amravati',
        'Lata Mangeshkar old Marathi bhavgeet',
        'Showing her family photo album with soft gentle tone',
        'Folding cotton napkins, singing lullabies softly',
        'Evening Tulsi plant water offering at 5:15 PM'
      ]
    ];
    for (const p of initialProfiles) {
      insertMemory.run(...p);
    }

    // 5. Seed Staff Handover Log
    const insertHandover = db.prepare(`
      INSERT INTO staff_handovers (shift, caregiver_name, mood_behavior, diet_meals, incidents, sleep_pattern, pending_tasks)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const initialHandovers = [
      [
        'Night (12 AM - 8 AM)',
        'Sister Sunita Patil',
        'All 20 residents rested calmly. Resident Gangadhar woke up once at 3:15 AM asking for water; settled comfortably after reassurance.',
        'Early morning warm turmeric milk distributed at 6:00 AM.',
        'No injuries, falls, or wandering agitation reported.',
        'Average 6.5 hours uninterrupted restful sleep across wards.',
        'Morning BP check for Resident #1 Narayanswamy scheduled for 9:30 AM.'
      ],
      [
        'Evening (4 PM - 12 AM)',
        'Caregiver Rajesh Kulkarni',
        'Active participation during 5 PM music session in the veranda. 3 residents sang along.',
        'Dinner completed by 8:15 PM. Soft khichdi and steamed vegetables well accepted.',
        'Resident #4 complained of mild joint stiffness; warm compress applied.',
        'Residents escorted to beds by 9:45 PM.',
        'Keep water flask refilled in Ward B bedside table.'
      ]
    ];
    for (const h of initialHandovers) {
      insertHandover.run(...h);
    }

    // 6. Seed Recent Emergency Alerts
    const insertAlert = db.prepare(`
      INSERT INTO emergency_alerts (need_type, resident_name, location_room, status, created_at, acknowledged_at, acknowledged_by)
      VALUES (?, ?, ?, ?, datetime('now', '-35 minutes'), datetime('now', '-30 minutes'), 'Caregiver Rajesh')
    `);
    insertAlert.run('water', 'Resident Gangadhar Rao', 'Ward B (Bed 3)', 'acknowledged');

    console.log('[DB] Seeding completed successfully.');
  }
}

initSchema();

module.exports = {
  db
};

