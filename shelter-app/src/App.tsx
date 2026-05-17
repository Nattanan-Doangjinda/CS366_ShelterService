import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  User, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  ChevronLeft,
  ShieldCheck,
  Lock,
  LogOut,
  Users
} from 'lucide-react';

// --- Types ---
type Shelter = {
  shelter_id: string;
  name: string;
  capacity: number;
  current_occupancy: number;
  distance: string;
  accessibility: string;
};

type CheckInResponse = {
  message: string;
  rosterId: string;
  alertMissingPerson: boolean;
  preArrivalInfo?: {
    criticalLevel: string;
  };
};

type AppState = 'login' | 'search' | 'register';

const BASE_URL = "https://08lg17qkg8.execute-api.us-east-1.amazonaws.com/default";

// --- Components ---

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center p-8">
    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
    <p className="text-gray-600 font-medium">กำลังดำเนินการ...</p>
  </div>
);

const App: React.FC = () => {
  const [view, setView] = useState<AppState>('login');
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkInResult, setCheckInResult] = useState<CheckInResponse | null>(null);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [citizenId, setCitizenId] = useState('');

  // Login State (Mock)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login success
    setView('search');
  };

  const fetchNearbyShelters = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Mock coordinates as requested (14.07, 100.60)
      const lat = 14.07;
      const lng = 100.60;
      const response = await fetch(`${BASE_URL}/nearby?lat=${lat}&lng=${lng}`);
      
      if (!response.ok) throw new Error('Failed to fetch shelters');
      
      const data = await response.json();
      
      // Mock accessibility data as it's not in the API
      const levels = ['Easy', 'Medium', 'Hard'];
      const mappedData = data.map((s: any, index: number) => ({
        ...s,
        accessibility: levels[index % levels.length]
      }));
      
      setShelters(mappedData);
    } catch (err) {
      setError('ไม่สามารถดึงข้อมูลศูนย์พักพิงได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectShelter = (shelter: Shelter) => {
    setSelectedShelter(shelter);
    setView('register');
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShelter) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shelterId: selectedShelter.shelter_id,
          citizenId,
          fullName: `${firstName} ${lastName}`
        })
      });

      if (!response.ok) throw new Error('Check-in failed');

      const data = await response.json();
      setCheckInResult(data);
    } catch (err) {
      setError('การลงทะเบียนล้มเหลว กรุณาตรวจสอบข้อมูลและลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setCitizenId('');
    setCheckInResult(null);
    setView('search');
  };

  // --- Render Functions ---

  const renderLogin = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Shelter Portal</h2>
          <p className="mt-2 text-sm text-gray-600">สำหรับเจ้าหน้าที่กู้ภัยและอาสาสมัคร</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="ชื่อผู้ใช้งาน (Username)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="รหัสผ่าน (Password)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <button
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            เข้าสู่ระบบ (Staff Login)
          </button>
        </form>
      </div>
    </div>
  );

  const renderSearch = () => (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <header className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-6 h-6 text-blue-600" />
          <span className="font-bold text-xl">Shelter App</span>
        </div>
        <button 
          onClick={() => setView('login')}
          className="text-gray-500 hover:text-red-500 flex items-center text-sm font-medium"
        >
          <LogOut className="w-4 h-4 mr-1" /> ออกจากระบบ
        </button>
      </header>

      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">ค้นหาศูนย์พักพิง</h1>
        <p className="text-gray-600">ระบบจะแสดงผลศูนย์พักพิงที่อยู่ใกล้พิกัดปัจจุบันของคุณมากที่สุด</p>
        <button
          onClick={fetchNearbyShelters}
          disabled={isLoading}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all active:scale-95"
        >
          {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Search className="w-5 h-5 mr-2" />}
          ค้นหาศูนย์พักพิงใกล้ฉัน
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="ml-3 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {shelters.map((shelter) => {
          const remaining = shelter.capacity - shelter.current_occupancy;
          const occupancyRate = (shelter.current_occupancy / shelter.capacity) * 100;
          
          return (
            <div key={shelter.shelter_id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 flex flex-col transition-transform hover:scale-[1.02]">
              <div className="p-6 flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">{shelter.name}</h3>
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                    shelter.accessibility === 'Easy' ? 'bg-green-100 text-green-700' :
                    shelter.accessibility === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {shelter.accessibility} Access
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mr-1 text-blue-500" /> {shelter.distance}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-1 text-blue-500" /> ว่าง {remaining} จาก {shelter.capacity} ที่
                  </div>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${occupancyRate > 90 ? 'bg-red-500' : occupancyRate > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <button
                onClick={() => handleSelectShelter(shelter)}
                className="w-full py-4 bg-gray-50 hover:bg-blue-50 text-blue-600 font-bold text-sm border-t border-gray-100 flex items-center justify-center transition-colors"
              >
                เลือกศูนย์นี้ <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderRegister = () => (
    <div className="max-w-2xl mx-auto p-6">
      <button 
        onClick={() => setView('search')}
        className="mb-6 flex items-center text-gray-600 hover:text-blue-600 font-medium transition-colors"
      >
        <ChevronLeft className="w-5 h-5 mr-1" /> ย้อนกลับ
      </button>

      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="bg-blue-600 p-8 text-white">
          <h2 className="text-2xl font-bold">แบบฟอร์มลงทะเบียน</h2>
          <p className="text-blue-100 opacity-90 mt-1">
            ศูนย์พักพิง: <span className="font-semibold">{selectedShelter?.name}</span>
          </p>
        </div>

        <form onSubmit={handleCheckIn} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">ชื่อ (First Name)</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">นามสกุล (Last Name)</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700">เลขบัตรประชาชน 13 หลัก (Citizen ID)</label>
            <input
              type="text"
              required
              maxLength={13}
              pattern="\d{13}"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="x-xxxx-xxxxx-xx-x"
              value={citizenId}
              onChange={(e) => setCitizenId(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <button
              type="submit"
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
            >
              Check-in เข้าศูนย์พักพิง
            </button>
          )}

          {error && (
            <p className="text-red-500 text-sm text-center font-medium">{error}</p>
          )}
        </form>
      </div>

      {/* Success Modal */}
      {checkInResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center p-4 bg-green-100 rounded-full">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">เช็คอินสำเร็จ!</h3>
              <p className="text-gray-600">ลงทะเบียนข้อมูลเข้าสู่ระบบเรียบร้อยแล้ว</p>
              
              <div className="bg-gray-50 p-4 rounded-2xl text-left space-y-2 border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Registration ID</p>
                <p className="text-sm font-mono text-gray-700 break-all">{checkInResult.rosterId}</p>
              </div>

              {checkInResult.alertMissingPerson && (
                <div className="bg-red-50 border-2 border-red-200 p-4 rounded-2xl text-left space-y-2 animate-pulse">
                  <div className="flex items-center text-red-700 font-bold">
                    <AlertCircle className="w-5 h-5 mr-2" /> แจ้งเตือน: พบประวัติคนหาย
                  </div>
                  <p className="text-sm text-red-600">กรุณาประสานงานเจ้าหน้าที่ตำรวจในพื้นที่เพื่อตรวจสอบข้อมูลเพิ่มเติม</p>
                  {checkInResult.preArrivalInfo && (
                    <div className="mt-2 pt-2 border-t border-red-100">
                      <p className="text-xs font-bold text-red-500">CRITICAL LEVEL: {checkInResult.preArrivalInfo.criticalLevel}</p>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={resetForm}
                className="w-full py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-colors"
              >
                เสร็จสิ้น
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      {view === 'login' && renderLogin()}
      {view === 'search' && renderSearch()}
      {view === 'register' && renderRegister()}
    </div>
  );
};

export default App;
