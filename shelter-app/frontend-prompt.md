const BASE_URL = "https://08lg17qkg8.execute-api.us-east-1.amazonaws.com/default";
# Role & Goal
คุณคือ Frontend Developer ระดับ Senior หน้าที่ของคุณคือการสร้างหน้าเว็บแอปพลิเคชันสำหรับ "ระบบลงทะเบียนศูนย์พักพิงผู้ประสบภัย (Shelter Check-in App)" สำหรับเจ้าหน้าที่กู้ภัยหน้างาน 
เครื่องมือที่ใช้: React (TypeScript .tsx) + Tailwind CSS + Lucide React (สำหรับไอคอน)

# Backend API Reference
1. GET /nearby?lat={lat}&lng={lng}
- คืนค่าเป็น Array ของศูนย์พักพิงที่ใกล้ที่สุด 3 แห่ง
- Example Data: [{ shelter_id: "SH-001", name: "ศูนย์พักพิงยิมเนเซียม 1", capacity: 100, current_occupancy: 20, distance: "0.45 km" }]

2. POST /check-in
- รับ Body: { shelterId: "SH-001", citizenId: "1100000000005", fullName: "สมิธ ทดสอบระบบ" }
- คืนค่า: { message: "Check-in successful", rosterId: "uuid", alertMissingPerson: true, preArrivalInfo: { criticalLevel: "Red" } }

# User Story & Application Flow
แอปพลิเคชันมี 3 หน้าจอหลัก (ทำเป็น Single Page Application มี State จัดการหน้าจอ):

1. Login Screen (Mockup)
- มีช่องกรอก Username, Password และปุ่ม "เข้าสู่ระบบ (Staff Login)"
- ไม่ต้องต่อ API จริง ให้กดแล้วข้ามไปหน้า Search ได้เลย

2. Search & Select Shelter Screen
- มีปุ่ม "ค้นหาศูนย์พักพิงใกล้ฉัน" (จำลองการดึงพิกัด GPS)
- เมื่อกดค้นหา ให้แสดงผลเป็นรูปแบบ Card ของศูนย์พักพิง 3 แห่ง
- ข้อมูลบน Card ต้องมี: ชื่อศูนย์, จำนวนที่รับได้อีก (capacity - current_occupancy), ระยะทาง, และระดับความยากง่ายในการเข้าถึง (Mock ข้อมูลฝั่ง Frontend เช่น Easy, Medium, Hard)
- บน Card แต่ละใบมีปุ่ม "เลือกศูนย์นี้"

3. Registration Form Screen
- เมื่อเลือกศูนย์แล้ว จะแสดงฟอร์มลงทะเบียนผู้ประสบภัย
- ช่องกรอกข้อมูล: ชื่อ (First Name), นามสกุล (Last Name), เลขบัตรประชาชน 13 หลัก (Citizen ID)
- เมื่อกดปุ่ม "Check-in" ให้เอาชื่อ+นามสกุลมารวมกันเป็น fullName แล้วยิง API POST /check-in
- มี Loading State หมุนๆ ตอนรอ API
- เมื่อสำเร็จ ให้แสดง Modal หรือ Alert สรุปผล (Success) และถ้า alertMissingPerson เป็น true ให้ไฮไลท์แจ้งเตือนสีแดงว่า "พบประวัติการแจ้งความคนหาย" รวมแสดง preArrivalInfo ด้วย

# Task
ช่วยเขียนโค้ด React (App.tsx) โดยแบ่ง Component ให้สวยงาม พร้อมใช้งานได้ทันที