import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Trash2, 
  MapPin, 
  Phone, 
  FileText, 
  ClipboardList,
  Send, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Truck
} from 'lucide-react';

// --- Types Based on OpenAPI Spec ---
interface ResourceItem {
  id: string;
  amount: number;
}

interface ExtraItem {
  name: string;
  amount: number;
}

interface RequestPayload {
  incidentId: string;
  description: string;
  requestFor: string;
  items: ResourceItem[];
  extraItems: ExtraItem[];
  from: {
    name: string;
    location: {
      address: string;
      description: string;
      latitude: number;
      longitude: number;
    };
    contact: {
      phone: string;
    };
  };
}

const BASE_URL = "https://re-fed69572302e455c92292715abb32750.ecs.ap-southeast-7.on.aws";

const CreateResourceRequest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string, requestId?: string } | null>(null);

  // --- Initial State ---
  const [formData, setFormData] = useState<RequestPayload>({
    incidentId: crypto.randomUUID(), // Default for incident
    description: '',
    requestFor: '',
    items: [{ id: '', amount: 1 }],
    extraItems: [],
    from: {
      name: '',
      location: {
        address: '',
        description: '',
        latitude: 13.736717,
        longitude: 100.523186
      },
      contact: {
        phone: ''
      }
    }
  });

  // --- Handlers for Items ---
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { id: '', amount: 1 }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: keyof ResourceItem, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  // --- Handlers for Extra Items ---
  const addExtraItem = () => {
    setFormData(prev => ({
      ...prev,
      extraItems: [...prev.extraItems, { name: '', amount: 1 }]
    }));
  };

  const removeExtraItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      extraItems: prev.extraItems.filter((_, i) => i !== index)
    }));
  };

  const updateExtraItem = (index: number, field: keyof ExtraItem, value: string | number) => {
    const newExtraItems = [...formData.extraItems];
    newExtraItems[index] = { ...newExtraItems[index], [field]: value };
    setFormData(prev => ({ ...prev, extraItems: newExtraItems }));
  };

  // --- General Change Handlers ---
  const handleLocationChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      from: {
        ...prev.from,
        location: { ...prev.from.location, [field]: value }
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);

    // Prepare numerical coordinates
    const payload = {
      ...formData,
      from: {
        ...formData.from,
        location: {
          ...formData.from.location,
          latitude: Number(formData.from.location.latitude),
          longitude: Number(formData.from.location.longitude)
        }
      }
    };

    try {
      const response = await fetch(`${BASE_URL}/v1/resource`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'idempotency-key': crypto.randomUUID(),
          'x-trace-id': crypto.randomUUID()
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'เกิดข้อผิดพลาดในการส่งคำขอ');
      }

      setStatus({ 
        type: 'success', 
        message: `ส่งคำขอสำเร็จ! สถานะ: ${result.status}`,
        requestId: result.id 
      });
      
    } catch (err: any) {
      console.error('Submit Error:', err);
      setStatus({ 
        type: 'error', 
        message: err.message || 'ไม่สามารถส่งคำขอได้ กรุณาตรวจสอบการเชื่อมต่อและ CORS' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-12 p-4">
      <div className="bg-white shadow-2xl rounded-[2rem] overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-700 to-indigo-800 p-10 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                <Truck className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tighter">Resource Request</h1>
            </div>
            <p className="text-blue-100 mt-2 font-medium opacity-80">ระบบส่งคำร้องขอสิ่งของสนับสนุนสำหรับศูนย์พักพิง</p>
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-10">
            <Package className="w-64 h-64" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-12">
          
          {/* Section 1: Basic Info */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                <FileText className="w-4 h-4 mr-2" /> Request For (เพื่ออะไร/ใคร)
              </label>
              <input 
                type="text" required placeholder="เช่น ผู้ประสบภัยศูนย์ยิมเนเซียม"
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none transition-all font-medium text-slate-700 bg-slate-50/50"
                value={formData.requestFor}
                onChange={e => setFormData({...formData, requestFor: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                <ClipboardList className="w-4 h-4 mr-2" /> Description (รายละเอียด)
              </label>
              <input 
                type="text" placeholder="ระบุเหตุผลหรือความเร่งด่วน"
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none transition-all font-medium text-slate-700 bg-slate-50/50"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>

          {/* Section 2: Items List */}
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <Package className="w-5 h-5 mr-2 text-blue-600" /> รายการสิ่งของมาตรฐาน
              </h3>
              <button 
                type="button" onClick={addItem}
                className="text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-bold flex items-center transition-all"
              >
                <Plus className="w-4 h-4 mr-1" /> เพิ่มรายการ
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.items.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-end animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Item ID / SKU</label>
                    <input 
                      type="text" required placeholder="เช่น WATER-500ML"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      value={item.id}
                      onChange={e => updateItem(idx, 'id', e.target.value)}
                    />
                  </div>
                  <div className="w-32 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Amount</label>
                    <input 
                      type="number" min="1" required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-center"
                      value={item.amount}
                      onChange={e => updateItem(idx, 'amount', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  {formData.items.length > 1 && (
                    <button 
                      type="button" onClick={() => removeItem(idx)}
                      className="p-3.5 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Extra Items */}
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <Plus className="w-5 h-5 mr-2 text-indigo-600" /> ของเพิ่มเติมอื่น ๆ
              </h3>
              <button 
                type="button" onClick={addExtraItem}
                className="text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-xl text-sm font-bold flex items-center transition-all"
              >
                <Plus className="w-4 h-4 mr-1" /> เพิ่มของพิเศษ
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.extraItems.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-end animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Item Name</label>
                    <input 
                      type="text" required placeholder="เช่น ยากันยุงชนิดทา"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={item.name}
                      onChange={e => updateExtraItem(idx, 'name', e.target.value)}
                    />
                  </div>
                  <div className="w-32 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Amount</label>
                    <input 
                      type="number" min="1" required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-center"
                      value={item.amount}
                      onChange={e => updateExtraItem(idx, 'amount', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <button 
                    type="button" onClick={() => removeExtraItem(idx)}
                    className="p-3.5 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {formData.extraItems.length === 0 && (
                <p className="text-sm text-slate-400 italic text-center py-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">ไม่มีรายการของเพิ่มเติม</p>
              )}
            </div>
          </div>

          {/* Section 4: Requester Info */}
          <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-8">
            <h3 className="text-lg font-bold text-slate-800 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-emerald-600" /> ข้อมูลผู้ร้องขอและสถานที่
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">ชื่อหน่วยงาน/ศูนย์</label>
                <input 
                  type="text" required placeholder="ระบุชื่อศูนย์พักพิง"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  value={formData.from.name}
                  onChange={e => setFormData({...formData, from: {...formData.from, name: e.target.value}})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center">
                  <Phone className="w-3 h-3 mr-1" /> เบอร์โทรศัพท์ติดต่อ
                </label>
                <input 
                  type="text" required placeholder="08x-xxx-xxxx"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  value={formData.from.contact.phone}
                  onChange={e => setFormData({...formData, from: {...formData.from, contact: {phone: e.target.value}}})}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">ที่อยู่รับของ</label>
                <input 
                  type="text" required placeholder="ระบุที่อยู่ที่ต้องการให้ไปส่ง"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  value={formData.from.location.address}
                  onChange={e => handleLocationChange('address', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Latitude</label>
                  <input 
                    type="number" step="any" required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                    value={formData.from.location.latitude}
                    onChange={e => handleLocationChange('latitude', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Longitude</label>
                  <input 
                    type="number" step="any" required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                    value={formData.from.location.longitude}
                    onChange={e => handleLocationChange('longitude', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Status Notifications */}
          {status && (
            <div className={`p-6 rounded-3xl flex items-start space-x-4 animate-in zoom-in-95 duration-300 ${
              status.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {status.type === 'success' ? <CheckCircle2 className="w-6 h-6 shrink-0" /> : <AlertCircle className="w-6 h-6 shrink-0" />}
              <div>
                <p className="font-bold">{status.message}</p>
                {status.requestId && <p className="text-xs font-mono mt-1 opacity-70">Request ID: {status.requestId}</p>}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-black text-xl uppercase tracking-widest rounded-[2rem] shadow-2xl shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center space-x-3"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-7 h-7 animate-spin" />
                <span>กำลังส่งคำขอ...</span>
              </>
            ) : (
              <>
                <Send className="w-7 h-7" />
                <span>Submit Resource Request</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateResourceRequest;
