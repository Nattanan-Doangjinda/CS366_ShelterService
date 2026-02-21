🛡️ Shelter Management Microservice (AWS Serverless)

Project Owner: นายณัฐนนท์ ดวงจินดา (Student ID: 6609611923) 
🌊 Overview

Shelter Service เป็นระบบบริหารจัดการศูนย์พักพิงอัจฉริยะที่ออกแบบมาเพื่อรองรับสถานการณ์ภัยพิบัติ ทำหน้าที่เป็นหัวใจหลักในการคำนวณพิกัดเพื่อหาที่พักที่ใกล้ที่สุด และจัดการการจองพื้นที่แบบเรียลไทม์เพื่อป้องกันปัญหาความแออัด  โดยใช้สถาปัตยกรรมแบบ Event-Driven Microservices บนระบบ Cloud ของ AWS ทั้งหมด
🚀 Key Features

    Real-time GIS Query: ค้นหาศูนย์พักพิงที่เปิดทำการ (OPEN) โดยคำนวณจากพิกัดละติจูด/ลองจิจูดของผู้ประสบภัย.

    Race Condition Prevention: ระบบจองที่พักใช้กลไก Asynchronous Queue ร่วมกับ Row-level Locking ใน Database เพื่อให้มั่นใจว่าการตัดโควตาความจุจะถูกต้อง 100% แม้มีการจองเข้ามาพร้อมกันจำนวนมาก.

    Operational Awareness: เจ้าหน้าที่หน้างานสามารถอัปเดตสถานะสภาพเส้นทาง (Access Level) เช่น ทางขาด หรือ น้ำท่วมรถเล็กผ่านไม่ได้ เพื่อความปลอดภัยในการอพยพ.

🏗️ Service Architecture

ระบบถูกออกแบบให้รองรับทั้งแบบ Synchronous (API) และ Asynchronous (Event) 

    Computing: AWS Lambda (Serverless)

    API Management: Amazon API Gateway

    Messaging: Amazon SQS (Command Queue) & Amazon SNS (Event Notification)

    Database: Amazon RDS (PostgreSQL) - ใช้สำหรับจัดการ Transaction และ Spatial Data.

📡 API Contracts & Messaging

1. Find Available Shelters (Sync) 

    Endpoint: GET /v1/shelters 

    Purpose: ค้นหาที่พักที่อยู่ใกล้ที่สุดจากพิกัดผู้ใช้.

    Query Params: user_lat, user_long, radius_km.

2. Update Shelter Condition (Sync) 

    Endpoint: PATCH /v1/shelters/{shelterId} 

    Purpose: อัปเดตสถานะเปิด/ปิด หรือระดับความปลอดภัยของเส้นทาง.

3. Request Shelter Reservation (Async) 

    Channel: shelter.reservation.commands.v1 (Amazon SQS) 

    Message: ShelterReservationRequested 

    Reliability: มีการใช้ messageId เป็น Idempotency Key เพื่อป้องกันการประมวลผลคำสั่งจองซ้ำ.

🛠️ Data Model & Concurrency

ระบบแยกการจัดเก็บข้อมูลออกเป็น 3 ส่วนหลักเพื่อความเป็นอิสระ (Autonomy):

    Shelter Master Data: ข้อมูลพิกัดและข้อมูลพื้นฐาน.

    Operational State: สถานะความจุที่เปลี่ยนแปลงตลอดเวลา (ใช้ Row-locking ในการอัปเดต).

    Reservation Data: ประวัติการจัดสรรพื้นที่อ้างอิงกับ Central Incident Schema.

🛡️ Reliability & Failure Handling

    Timeout: API กำหนดค่า Timeout ไว้ที่ 30 วินาทีเพื่อความเสถียร.

    Retry Policy: รองรับการทำงานซ้ำในกรณี Network ขัดข้อง และมีการใช้ Dead Letter Queue (DLQ) หากคำสั่งจองล้มเหลวเกินกำหนด.

    Rollback: ใช้ Database Transaction เพื่อรักษาความถูกต้องของข้อมูลความจุในกรณีที่ระบบประมวลผลไม่สำเร็จ.
