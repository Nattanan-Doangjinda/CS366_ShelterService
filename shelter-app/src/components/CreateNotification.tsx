import React, { useState } from 'react';
import { 
  Stethoscope, 
  Ambulance, 
  User, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Send,
  MapPin,
  ClipboardList
} from 'lucide-react';

// --- Types Based on API Contract ---
interface Vitals {
  bp: string;
  hr: number;
  spo2: number;
}

interface PatientInfo {
  first_name: string;
  last_name: string;
  gender: 'MALE' | 'FEMALE' | 'OTHERS';
  job: string;
  found_location: string;
  age_category: 'ADULT' | 'TEEN' | 'INFANTS';
  physical_desc: string;
  physical_remark: string;
  clothes_desc: string;
  life_status: 'ALIVE' | 'DECEASED' | 'UNKNOWN';
  triage_level: 'RED' | 'YELLOW' | 'GREEN' | 'BLACK';
  symptom: string;
  vitals: Vitals;
  attachment_urls: string[];
}

interface NotificationPayload {
  hospital_id: string;
  ambulance_id: string;
  patient_info: PatientInfo;
}

const CreateNotification: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Initial State
  const [formData, setFormData] = useState<NotificationPayload>({
    hospital_id: '',
    ambulance_id: '',
    patient_info: {
      first_name: 'UNKNOWN',
      last_name: 'UNKNOWN',
      gender: 'MALE',
      job: '',
      found_location: '',
      age_category: 'ADULT',
      physical_desc: '',
      physical_remark: '',
      clothes_desc: '',
      life_status: 'ALIVE',
      triage_level: 'GREEN',
      symptom: '',
      vitals: {
        bp: '',
        hr: 0,
        spo2: 0
      },
      attachment_urls: ['https://example.png']
    }
  });

  // --- Handlers ---

  const handleTopLevelChange = (field: 'hospital_id' | 'ambulance_id', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePatientInfoChange = (field: keyof Omit<PatientInfo, 'vitals' | 'attachment_urls'>, value: string) => {
    setFormData(prev => ({
      ...prev,
      patient_info: { ...prev.patient_info, [field]: value }
    }));
  };

  const handleVitalsChange = (field: keyof Vitals, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      patient_info: {
        ...prev.patient_info,
        vitals: { ...prev.patient_info.vitals, [field]: value }
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);

    try {
      const response = await fetch('https://x5gagalda5.execute-api.us-east-1.amazonaws.com/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_TOKEN_HERE', // ใส่ Token ถ้ามี
          'Idempotency-Key': crypto.randomUUID()
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      setStatus({ type: 'success', message: 'ส่งข้อมูลแจ้งเตือนไปยังโรงพยาบาลสำเร็จแล้ว' });
      // Reset Form can be added here if needed
    } catch (err: any) {
      console.error('Submit Error:', err);
      setStatus({ 
        type: 'error', 
        message: 'ไม่สามารถส่งข้อมูลได้ (อาจติดปัญหา CORS หรือ Server ปลายทางปิดอยู่)' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-8 p-4">
      <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-8 text-white">
          <div className="flex items-center space-x-3">
            <Stethoscope className="w-8 h-8" />
            <h1 className="text-2xl font-bold uppercase tracking-tight">Pre-Arrival Notification</h1>
          </div>
          <p className="text-red-100 mt-2">ระบบส่งข้อมูลแจ้งเตือนล่วงหน้าสำหรับหน่วยกู้ชีพ</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-10">
          
          {/* Section 1: Logistics */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2 text-red-600 border-b pb-2">
              <Ambulance className="w-5 h-5" />
              <h2 className="font-bold uppercase text-sm">Logistics Information (ข้อมูลนำส่ง)</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Hospital ID</label>
                <input 
                  type="text" required placeholder="เช่น HOS-001"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  value={formData.hospital_id}
                  onChange={e => handleTopLevelChange('hospital_id', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Ambulance ID</label>
                <input 
                  type="text" required placeholder="เช่น AMB-BKK-01"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  value={formData.ambulance_id}
                  onChange={e => handleTopLevelChange('ambulance_id', e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Section 2: Patient Info */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2 text-red-600 border-b pb-2">
              <User className="w-5 h-5" />
              <h2 className="font-bold uppercase text-sm">Patient Identification (ข้อมูลผู้ป่วย)</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">First Name</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  value={formData.patient_info.first_name}
                  onChange={e => handlePatientInfoChange('first_name', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Last Name</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  value={formData.patient_info.last_name}
                  onChange={e => handlePatientInfoChange('last_name', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Gender</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  value={formData.patient_info.gender}
                  onChange={e => handlePatientInfoChange('gender', e.target.value as any)}
                >
                  <option value="MALE">MALE</option>
                  <option value="FEMALE">FEMALE</option>
                  <option value="OTHERS">OTHERS</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Found Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" placeholder="ระบุสถานที่พบผู้ป่วย"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                    value={formData.patient_info.found_location}
                    onChange={e => handlePatientInfoChange('found_location', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Age Category</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  value={formData.patient_info.age_category}
                  onChange={e => handlePatientInfoChange('age_category', e.target.value as any)}
                >
                  <option value="ADULT">ADULT</option>
                  <option value="TEEN">TEEN</option>
                  <option value="INFANTS">INFANTS</option>
                </select>
              </div>
            </div>
          </section>

          {/* Section 3: Medical Condition */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2 text-red-600 border-b pb-2">
              <Activity className="w-5 h-5" />
              <h2 className="font-bold uppercase text-sm">Medical Status (อาการและสัญญาณชีพ)</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Triage Level (คัดกรอง)</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['RED', 'YELLOW', 'GREEN', 'BLACK'] as const).map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => handlePatientInfoChange('triage_level', level)}
                      className={`py-2 rounded-lg text-[10px] font-bold border-2 transition-all ${
                        formData.patient_info.triage_level === level
                        ? (level === 'RED' ? 'bg-red-600 border-red-600 text-white shadow-lg' : 
                           level === 'YELLOW' ? 'bg-yellow-400 border-yellow-400 text-white shadow-lg' :
                           level === 'GREEN' ? 'bg-green-600 border-green-600 text-white shadow-lg' :
                           'bg-black border-black text-white shadow-lg')
                        : 'border-gray-100 text-gray-400 hover:border-gray-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Primary Symptom</label>
                <input 
                  type="text" required placeholder="ระบุอาการสำคัญ"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  value={formData.patient_info.symptom}
                  onChange={e => handlePatientInfoChange('symptom', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div className="space-y-1 text-center">
                <label className="text-[10px] font-bold text-gray-400 uppercase">BP (ความดัน)</label>
                <input 
                  type="text" placeholder="120/80"
                  className="w-full text-center px-2 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none"
                  value={formData.patient_info.vitals.bp}
                  onChange={e => handleVitalsChange('bp', e.target.value)}
                />
              </div>
              <div className="space-y-1 text-center">
                <label className="text-[10px] font-bold text-gray-400 uppercase">HR (ชีพจร)</label>
                <input 
                  type="number"
                  className="w-full text-center px-2 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none"
                  value={formData.patient_info.vitals.hr}
                  onChange={e => handleVitalsChange('hr', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-1 text-center">
                <label className="text-[10px] font-bold text-gray-400 uppercase">SpO2 (%)</label>
                <input 
                  type="number"
                  className="w-full text-center px-2 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none"
                  value={formData.patient_info.vitals.spo2}
                  onChange={e => handleVitalsChange('spo2', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </section>

          {/* Section 4: Physical Description */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2 text-red-600 border-b pb-2">
              <ClipboardList className="w-5 h-5" />
              <h2 className="font-bold uppercase text-sm">Physical Description (ลักษณะเด่น)</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Physical Desc (รูปร่าง - Required)</label>
                <textarea 
                  required placeholder="เช่น ผิวขาว สูงประมาณ 175 ซม."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none h-20 transition-all"
                  value={formData.patient_info.physical_desc}
                  onChange={e => handlePatientInfoChange('physical_desc', e.target.value)}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Clothes Desc</label>
                  <input 
                    type="text" placeholder="เสื้อยืดสีดำ กางเกงยีนส์"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                    value={formData.patient_info.clothes_desc}
                    onChange={e => handlePatientInfoChange('clothes_desc', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Life Status</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                    value={formData.patient_info.life_status}
                    onChange={e => handlePatientInfoChange('life_status', e.target.value as any)}
                  >
                    <option value="ALIVE">ALIVE</option>
                    <option value="DECEASED">DECEASED</option>
                    <option value="UNKNOWN">UNKNOWN</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Notifications */}
          {status && (
            <div className={`p-4 rounded-2xl flex items-center space-x-3 animate-in fade-in slide-in-from-top-4 ${
              status.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <p className="text-sm font-medium">{status.message}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-5 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-black text-lg uppercase tracking-widest rounded-2xl shadow-xl shadow-red-200 transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>กำลังส่งข้อมูล...</span>
              </>
            ) : (
              <>
                <Send className="w-6 h-6" />
                <span>Submit Notification</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateNotification;
