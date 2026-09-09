import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  Sparkles, 
  Camera, 
  ArrowRight, 
  Tag, 
  Info, 
  X, 
  Compass, 
  Star,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { locationGuideApi } from '../../api/locationGuideApi';

const REGION_TABS = [
  { id: 'all', label: 'Toàn Quốc' },
  { id: 'north', label: 'Miền Bắc' },
  { id: 'central', label: 'Miền Trung' },
  { id: 'highlands', label: 'Tây Nguyên' },
  { id: 'south', label: 'Miền Nam' }
];

export const LocationGuidesSection = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [activeRegion, setActiveRegion] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const res = await locationGuideApi.getAll();
      setLocations(res.data || []);
    } catch (err) {
      console.warn('Lỗi tải địa điểm chụp ảnh:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredLocations = locations.filter((loc) => {
    if (activeRegion === 'all') return true;
    return loc.region === activeRegion;
  });

  const handleFindPhotographer = (city) => {
    // Tự động điều hướng đến trang danh sách Nhiếp Ảnh Gia và lọc theo thành phố
    navigate(`/photographers?search=${encodeURIComponent(city || '')}`);
  };

  return (
    <section id="location-guides-section" className="py-12 sm:py-16 space-y-8 scroll-mt-24">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2.5 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wide uppercase">
            <Compass className="w-3.5 h-3.5" />
            <span>Cẩm Nang Địa Điểm Chụp (Location Guides)</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Tọa Độ Chụp Ảnh Đẹp <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">Trên Mọi Miền</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
            Tuyển tập các góc máy đắt giá, thời điểm săn ánh sáng lý tưởng và concept chụp ăn ảnh nhất từ Bắc chí Nam cùng mạng lưới Nhiếp ảnh gia chuyên nghiệp tại chỗ.
          </p>
        </div>

        {/* Region Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-[#141720] border border-[#242938] rounded-2xl overflow-x-auto shrink-0 scrollbar-none">
          {REGION_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveRegion(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeRegion === tab.id
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-amber-950 shadow-md shadow-amber-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Locations */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-96 rounded-3xl bg-[#141720] border border-[#242938] animate-pulse" />
          ))}
        </div>
      ) : filteredLocations.length === 0 ? (
        <div className="p-12 text-center bg-[#141720] border border-[#242938] rounded-3xl space-y-3">
          <MapPin className="w-10 h-10 text-amber-400/50 mx-auto" />
          <h3 className="text-base font-bold text-white">Chưa có địa điểm nào trong khu vực này</h3>
          <p className="text-xs text-gray-400">Danh sách địa điểm sẽ được Ban Quản Trị cập nhật liên tục.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredLocations.map((loc) => (
            <div
              key={loc._id || loc.id}
              className="group bg-[#12151e] border border-[#222736] hover:border-amber-500/50 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col hover:-translate-y-1"
            >
              {/* Cover Image */}
              <div className="relative h-56 overflow-hidden bg-gray-900 shrink-0">
                <img
                  src={loc.image}
                  alt={loc.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#12151e] via-[#12151e]/20 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[11px] font-semibold">
                    <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>{loc.city}</span>
                  </span>

                  {loc.isFeatured && (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500 text-amber-950 text-[10px] font-extrabold uppercase shadow-md">
                      <Star className="w-3 h-3 fill-amber-950" />
                      <span>Điểm Hot</span>
                    </span>
                  )}
                </div>

                {/* Region Tag bottom right on image */}
                <div className="absolute bottom-3 left-3">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-sm">
                    {loc.regionName || 'Việt Nam'}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col flex-grow justify-between space-y-4">
                <div className="space-y-2.5">
                  <h3 className="font-extrabold text-base sm:text-lg text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                    {loc.name}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {loc.description}
                  </p>

                  {/* Highlights info */}
                  <div className="pt-2 space-y-1.5 border-t border-white/5 text-[11px] text-gray-300">
                    {loc.bestTime && (
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="line-clamp-1 text-gray-300 font-medium">Giờ vàng: {loc.bestTime}</span>
                      </div>
                    )}
                    {loc.ticketPrice && (
                      <div className="flex items-center space-x-2">
                        <Tag className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="line-clamp-1 text-gray-300 font-medium">Vé: {loc.ticketPrice}</span>
                      </div>
                    )}
                  </div>

                  {/* Concept Tags */}
                  {Array.isArray(loc.suitableConcepts) && loc.suitableConcepts.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {loc.suitableConcepts.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/5 text-[10px] text-gray-300 font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                      {loc.suitableConcepts.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded-lg bg-white/5 text-[10px] text-gray-400">
                          +{loc.suitableConcepts.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-[#222736] flex items-center gap-2">
                  <button
                    onClick={() => setSelectedLocation(loc)}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#1c2230] hover:bg-[#252c3f] border border-[#2e374d] text-gray-200 text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <Info className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mẹo Chụp</span>
                  </button>
                  <button
                    onClick={() => handleFindPhotographer(loc.city)}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-1"
                    title={`Tìm nhiếp ảnh gia chụp tại ${loc.city}`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Thuê NAG</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Chi Tiết Địa Điểm & Mẹo Chụp */}
      {selectedLocation && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#141721] border border-[#232938] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative p-6 sm:p-8 space-y-6">
            <button
              onClick={() => setSelectedLocation(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header info */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-extrabold uppercase">
                  {selectedLocation.regionName}
                </span>
                <span className="text-xs text-gray-400 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{selectedLocation.city}</span>
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                {selectedLocation.name}
              </h3>
            </div>

            {/* Cover Image in modal */}
            <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden bg-black/50">
              <img
                src={selectedLocation.image}
                alt={selectedLocation.name}
                className="w-full h-full object-cover"
              />
              {selectedLocation.ticketPrice && (
                <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-white text-xs font-semibold flex items-center space-x-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Giá vé: {selectedLocation.ticketPrice}</span>
                </div>
              )}
            </div>

            {/* Content Details */}
            <div className="space-y-4 text-sm">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Mô tả vẻ đẹp</h4>
                <p className="text-gray-300 leading-relaxed">{selectedLocation.description}</p>
              </div>

              {selectedLocation.bestTime && (
                <div className="p-3.5 rounded-xl bg-[#1a1f2c] border border-[#283145] flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs font-bold text-white">Thời điểm chụp đẹp nhất:</span>
                    <span className="text-xs text-gray-300">{selectedLocation.bestTime}</span>
                  </div>
                </div>
              )}

              {selectedLocation.tips && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start space-x-3">
                  <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs font-bold text-amber-300">Mẹo trang phục & góc máy:</span>
                    <span className="text-xs text-amber-100/90 leading-relaxed">{selectedLocation.tips}</span>
                  </div>
                </div>
              )}

              {Array.isArray(selectedLocation.suitableConcepts) && selectedLocation.suitableConcepts.length > 0 && (
                <div className="space-y-1.5">
                  <span className="block text-xs font-bold text-gray-400 uppercase">Concept chụp gợi ý:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedLocation.suitableConcepts.map((concept, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-xl bg-[#1c2230] border border-[#2b354c] text-xs font-medium text-gray-200 flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>{concept}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-4 border-t border-[#232938] flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setSelectedLocation(null)}
                className="px-4 py-2.5 rounded-xl border border-[#232938] text-gray-300 hover:text-white hover:bg-white/5 text-xs font-semibold"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedLocation(null);
                  handleFindPhotographer(selectedLocation.city);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/15"
              >
                <Camera className="w-4 h-4" />
                <span>Tìm Nhiếp Ảnh Gia Tại {selectedLocation.city}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default LocationGuidesSection;
