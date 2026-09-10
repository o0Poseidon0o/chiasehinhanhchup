import React, { useState, useEffect } from 'react';
import { MapPin, Building2, Home, CheckCircle2 } from 'lucide-react';
import { addressApi } from '../../api/addressApi';

export const AddressSelector = ({ 
  value = '', 
  onChange,
  required = false,
  className = ''
}) => {
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  
  const [selectedProvinceId, setSelectedProvinceId] = useState('');
  const [selectedProvinceName, setSelectedProvinceName] = useState('');
  const [selectedWardId, setSelectedWardId] = useState('');
  const [selectedWardName, setSelectedWardName] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Tải danh sách Tỉnh/Thành từ database nội bộ khi mount
  useEffect(() => {
    let isMounted = true;
    setLoadingProvinces(true);
    addressApi.getProvinces()
      .then(res => {
        if (isMounted && res.data) {
          setProvinces(res.data);
        }
      })
      .finally(() => {
        if (isMounted) setLoadingProvinces(false);
      });
    return () => { isMounted = false; };
  }, []);

  // Tải danh sách Phường/Xã khi đổi Tỉnh
  useEffect(() => {
    if (!selectedProvinceId) {
      setWards([]);
      setSelectedWardId('');
      setSelectedWardName('');
      return;
    }

    let isMounted = true;
    setLoadingWards(true);
    addressApi.getWards(selectedProvinceId)
      .then(res => {
        if (isMounted && res.data) {
          setWards(res.data);
        }
      })
      .finally(() => {
        if (isMounted) setLoadingWards(false);
      });

    return () => { isMounted = false; };
  }, [selectedProvinceId]);

  // Thông báo địa chỉ hoàn chỉnh lên form cha
  const emitChange = (provName, wName, street) => {
    const parts = [
      street.trim(),
      wName.trim(),
      provName.trim()
    ].filter(Boolean);

    const fullAddress = parts.join(', ');
    if (typeof onChange === 'function') {
      onChange({
        provinceId: selectedProvinceId,
        provinceName: provName,
        wardId: selectedWardId,
        wardName: wName,
        streetAddress: street,
        fullAddress
      });
    }
  };

  const handleProvinceChange = (e) => {
    const provId = e.target.value;
    const found = provinces.find(p => String(p.provinceId) === String(provId));
    const provName = found ? found.name : '';

    setSelectedProvinceId(provId);
    setSelectedProvinceName(provName);
    setSelectedWardId('');
    setSelectedWardName('');

    emitChange(provName, '', streetAddress);
  };

  const handleWardChange = (e) => {
    const wId = e.target.value;
    const found = wards.find(w => String(w.wardId) === String(wId));
    const wName = found ? found.name : '';

    setSelectedWardId(wId);
    setSelectedWardName(wName);

    emitChange(selectedProvinceName, wName, streetAddress);
  };

  const handleStreetChange = (e) => {
    const text = e.target.value;
    setStreetAddress(text);
    emitChange(selectedProvinceName, selectedWardName, text);
  };

  const fullPreview = [
    streetAddress.trim(),
    selectedWardName.trim(),
    selectedProvinceName.trim()
  ].filter(Boolean).join(', ');

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 2 Dropdown Tỉnh/Thành & Phường/Xã */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Tỉnh / Thành phố */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-300 flex items-center space-x-1">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Tỉnh / Thành phố {required && <span className="text-rose-400">*</span>}</span>
          </label>
          <div className="relative">
            <select
              value={selectedProvinceId}
              onChange={handleProvinceChange}
              disabled={loadingProvinces}
              className="w-full bg-[#141210] border border-[#2d2720] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-colors appearance-none cursor-pointer disabled:opacity-50"
            >
              <option value="">
                {loadingProvinces ? 'Đang tải tỉnh thành...' : '-- Chọn Tỉnh / Thành phố --'}
              </option>
              {provinces.map((prov) => (
                <option key={prov.provinceId} value={prov.provinceId}>
                  {prov.name}
                </option>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* Phường / Xã */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-300 flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>Phường / Xã {required && <span className="text-rose-400">*</span>}</span>
          </label>
          <div className="relative">
            <select
              value={selectedWardId}
              onChange={handleWardChange}
              disabled={!selectedProvinceId || loadingWards}
              className="w-full bg-[#141210] border border-[#2d2720] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-colors appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <option value="">
                {!selectedProvinceId 
                  ? '-- Vui lòng chọn Tỉnh trước --' 
                  : loadingWards 
                    ? 'Đang tải phường/xã...' 
                    : '-- Chọn Phường / Xã --'}
              </option>
              {wards.map((ward) => (
                <option key={ward.wardId} value={ward.wardId}>
                  {ward.name}
                </option>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
              ▼
            </div>
          </div>
        </div>
      </div>

      {/* Ô nhập Số nhà, Tên đường */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-gray-300 flex items-center space-x-1">
          <Home className="w-3.5 h-3.5 text-amber-400" />
          <span>Số nhà, Tên đường, Ngõ hẻm {required && <span className="text-rose-400">*</span>}</span>
        </label>
        <input
          type="text"
          value={streetAddress}
          onChange={handleStreetChange}
          placeholder="Ví dụ: Số 123 Lê Duẩn, Tòa nhà Bitexco lầu 8..."
          className="w-full bg-[#141210] border border-[#2d2720] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 outline-none transition-colors"
        />
      </div>

      {/* Xem trước địa chỉ hoàn chỉnh */}
      {fullPreview && (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start space-x-2 text-xs text-amber-200/90 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-300">Địa chỉ đầy đủ: </span>
            <span>{fullPreview}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressSelector;
