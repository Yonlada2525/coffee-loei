
const pool = require('../config/db');

const selectSql = `
SELECT
  f.*,
  CASE
    WHEN f.deleted_at IS NULL THEN NULL
    ELSE GREATEST(
      0,
      30 - DATEDIFF(CURDATE(), DATE(f.deleted_at))
    )
  END AS restore_days_left,
  o.fullname,
  ft.farm_type_name,
  ct.coffee_name,
  st.soil_type_name,
  m.file_path
FROM coffee_farm f
LEFT JOIN farm_owner o
  ON f.owner_id = o.owner_id
LEFT JOIN farm_type ft
  ON f.farm_type_id = ft.farm_type_id
LEFT JOIN coffee_type ct
  ON f.coffee_id = ct.coffee_id
LEFT JOIN soil_type st
  ON f.soil_type_id = st.soil_type_id
LEFT JOIN (
  SELECT farm_id, MIN(file_path) AS file_path
  FROM media
  WHERE deleted_at IS NULL
  GROUP BY farm_id
) m ON m.farm_id = f.farm_id
`;

exports.list = async (req, res) => {
  const { district, coffee, deleted } = req.query;
  const where = [deleted === '1' ? 'f.deleted_at IS NOT NULL AND f.deleted_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)' : 'f.deleted_at IS NULL'];
  const params = [];
  if (district) { where.push('f.district LIKE ?'); params.push(`%${district}%`); }
  if (coffee) { where.push('ct.coffee_name LIKE ?'); params.push(`%${coffee}%`); }
  const [rows] = await pool.query(`${selectSql} WHERE ${where.join(' AND ')} ORDER BY f.farm_id DESC`, params);
  res.json(rows);
};

exports.myFarms = async (req, res) => {
  const deleted = req.query.deleted === '1';
  const [rows] = await pool.query(`${selectSql} WHERE f.owner_id=? AND f.deleted_at ${deleted ? 'IS NOT NULL AND f.deleted_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)' : 'IS NULL'} ORDER BY f.farm_id DESC`, [req.user.id]);
  res.json(rows);
};


exports.detail = async (req, res) => {
  const farmId = req.params.id;
  const [farms] = await pool.query(`${selectSql} WHERE f.farm_id=? LIMIT 1`, [farmId]);
  const [media] = await pool.query(
    `SELECT media_id, farm_id, file_path, upload_date
     FROM media
     WHERE farm_id=? AND deleted_at IS NULL
     ORDER BY media_id DESC`,
    [farmId]
  );

  // กรณีมีรูปที่เคยผูกกับสวน แต่ข้อมูลสวนถูกลบถาวร/ไม่มีในฐานข้อมูล
  // ให้ส่งข้อมูลกลับแบบปลอดภัย เพื่อไม่ให้หน้าเว็บเกิด 404 และยังดูรูปที่อัปโหลดได้
  if (!farms.length) {
    return res.json({
      farm_id: Number(farmId),
      farm_name: 'ไม่พบข้อมูลสวนกาแฟเดิม',
      fullname: '-',
      village: '-',
      sub_district: '-',
      district: '-',
      postal_code: '',
      latitude: null,
      longitude: null,
      area_size: 0,
      water_system: 0,
      altitude: null,
      description: 'ข้อมูลสวนนี้อาจถูกลบถาวร หรือไม่มีอยู่ในฐานข้อมูลปัจจุบัน',
      media
    });
  }

  res.json({ ...farms[0], media });
};

// exports.create = async (req, res) => {
//   const b = req.body;
//   const ownerId = req.user.role === 'owner' ? req.user.id : b.owner_id;
// //   await pool.query(`INSERT INTO coffee_farm(owner_id,farm_type_id,coffee_id,soil_type_id,farm_name,house_no,village,sub_district,district,postal_code,area_size,latitude,longitude,water_system,description,altitude,planting_year,created_at,updated_at)
// //   VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW())`, [ownerId,b.farm_type_id,b.coffee_id,b.soil_type_id,b.farm_name,b.house_no,b.village,b.sub_district,b.district,b.postal_code,b.area_size,b.latitude,b.longitude,b.water_system?1:0,b.description,b.altitude,b.planting_year]);
// //   res.status(201).json({ message: 'เพิ่มสวนกาแฟสำเร็จ' });
// // };

//    const [result] = await pool.query(
//     `INSERT INTO coffee_farm(
//       owner_id,
//       farm_type_id,
//       coffee_id,
//       soil_type_id,
//       farm_name,
//       house_no,
//       village,
//       sub_district,
//       district,
//       postal_code,
//       area_size,
//       latitude,
//       longitude,
//       water_system,
//       description,
//       altitude,
//       planting_year,
//       created_at,
//       updated_at
//     )
//     VALUES(
//       ?,?,?,?,?,?,?,?,?,?,
//       ?,?,?,?,?,?,?,NOW(),NOW()
//     )`,
//     [
//       ownerId,
//       b.farm_type_id,
//       b.coffee_id,
//       b.soil_type_id,
//       b.farm_name,
//       b.house_no,
//       b.village,
//       b.sub_district,
//       b.district,
//       b.postal_code,
//       b.area_size,
//       b.latitude,
//       b.longitude,
//       b.water_system ? 1 : 0,
//       b.description,
//       b.altitude,
//       b.planting_year,
//     ]
//   );

//   const farmId = result.insertId;

//   // มีรูปภาพหรือไม่
//   if (req.file) {
//     await pool.query(
//       `INSERT INTO media(
//         farm_id,
//         file_path,
//         upload_date
//       )
//       VALUES(?,?,NOW())`,
//       [
//         farmId,
//         req.file.filename,
//       ]
//     );
//   }

//   res.status(201).json({
//     message: "เพิ่มสวนกาแฟสำเร็จ",
//   });
// };
exports.create = async (req, res) => {
  const b = req.body;

  const ownerId =
    req.user.role === "owner"
      ? req.user.id
      : b.owner_id;

  const [result] = await pool.query(
    `INSERT INTO coffee_farm(
      owner_id,
      farm_type_id,
      coffee_id,
      soil_type_id,
      farm_name,
      house_no,
      village,
      sub_district,
      district,
      postal_code,
      area_size,
      latitude,
      longitude,
      water_system,
      description,
      altitude,
      planting_year,
      created_at,
      updated_at
    )
    VALUES(
      ?,?,?,?,?,?,?,?,?,?,
      ?,?,?,?,?,?,?,NOW(),NOW()
    )`,
    [
      ownerId,
      b.farm_type_id,
      b.coffee_id,
      b.soil_type_id,
      b.farm_name,
      b.house_no,
      b.village,
      b.sub_district,
      b.district,
      b.postal_code,
      b.area_size,
      b.latitude,
      b.longitude,
      b.water_system ? 1 : 0,
      b.description,
      b.altitude,
      b.planting_year,
    ]
  );

  const farmId = result.insertId;

  if (req.file) {
    await pool.query(
      `INSERT INTO media (
        farm_id,
        file_path,
        upload_date
      )
      VALUES (?, ?, NOW())`,
      [
        farmId,
        "/uploads/" + req.file.filename
      ]
    );
  }

  res.status(201).json({
    message: "เพิ่มสวนกาแฟสำเร็จ",
    farm_id: farmId
  });
};


// exports.update = async (req, res) => {
//   const b = req.body;
//   let where = 'farm_id=?';
//   const params = [b.farm_type_id,b.coffee_id,b.soil_type_id,b.farm_name,b.house_no,b.village,b.sub_district,b.district,b.postal_code,b.area_size,b.latitude,b.longitude,b.water_system?1:0,b.description,b.altitude,b.planting_year,req.params.id];
//   if (req.user.role === 'owner') { where += ' AND owner_id=?'; params.push(req.user.id); }
//   await pool.query(`UPDATE coffee_farm SET farm_type_id=?,coffee_id=?,soil_type_id=?,farm_name=?,house_no=?,village=?,sub_district=?,district=?,postal_code=?,area_size=?,latitude=?,longitude=?,water_system=?,description=?,altitude=?,planting_year=?,updated_at=NOW() WHERE ${where}`, params);
//   res.json({ message: 'แก้ไขสวนกาแฟสำเร็จ' });
// };
exports.update = async (req, res) => {
  const b = req.body;

  // ✅ แปลง null/undefined/"" → null จริงๆ ให้ MySQL รับได้
  const nullify = (v) => (v === '' || v === undefined || v === 'null') ? null : v;

  let where = 'farm_id=?';
  const params = [
    nullify(b.farm_type_id),
    nullify(b.coffee_id),
    nullify(b.soil_type_id),
    b.farm_name,
    b.house_no,
    b.village,
    b.sub_district,
    b.district,
    b.postal_code,
    nullify(b.area_size),
    nullify(b.latitude),
    nullify(b.longitude),
    b.water_system ? 1 : 0,
    b.description,
    nullify(b.altitude),
    nullify(b.planting_year) ,
    req.params.id,
  ];

  if (req.user.role === 'owner') {
    where += ' AND owner_id=?';
    params.push(req.user.id);
  }

  const [result] = await pool.query(
    `UPDATE coffee_farm SET
      farm_type_id=?, coffee_id=?, soil_type_id=?,
      farm_name=?, house_no=?, village=?,
      sub_district=?, district=?, postal_code=?,
      area_size=?, latitude=?, longitude=?,
      water_system=?, description=?, altitude=?,
      planting_year=?, updated_at=NOW()
    WHERE ${where}`,
    params
  );

  // ✅ อัปเดตรูปภาพถ้ามีไฟล์ใหม่
  if (req.file) {
    // ลบรูปเก่าก่อน (soft delete)
    await pool.query(
      `UPDATE media SET deleted_at=NOW() WHERE farm_id=?`,
      [req.params.id]
    );
    // เพิ่มรูปใหม่
    await pool.query(
      `INSERT INTO media(farm_id, file_path, upload_date) VALUES(?, ?, NOW())`,
      [req.params.id, '/uploads/' + req.file.filename]
    );
  }

  // ✅ ตรวจสอบว่า update สำเร็จจริงไหม
  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'ไม่พบสวนหรือไม่มีสิทธิ์แก้ไข' });
  }

  res.json({ message: 'แก้ไขสวนกาแฟสำเร็จ' });
};

exports.remove = async (req, res) => {
  let sql = 'UPDATE coffee_farm SET deleted_at=NOW() WHERE farm_id=?';
  const params = [req.params.id];
  if (req.user.role === 'owner') { sql += ' AND owner_id=?'; params.push(req.user.id); }
  await pool.query(sql, params);
  res.json({ message: 'ย้ายสวนไปถังขยะแล้ว' });
};

exports.restore = async (req, res) => {
  let sql = 'UPDATE coffee_farm SET deleted_at=NULL WHERE farm_id=?';
  const params = [req.params.id];
  if (req.user.role === 'owner') { sql += ' AND owner_id=?'; params.push(req.user.id); }
  await pool.query(sql, params);
  res.json({ message: 'กู้คืนสวนสำเร็จ' });
};
