import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Clock, CheckCircle, Calendar, Search } from 'lucide-react';
import { categoryApi } from '../../api/categoryApi';
import { BookingModal } from '../booking/BookingModal';

const DEFAULT_CATEGORIES = [
  {
    id: 'personal',
    title: 'Chụp Cá Nhân / Chân Dung',
    subtitle: 'Nổi bật phong cách riêng, ảnh profile & nghệ thuật',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
    price: 'Từ 890.000đ',
    badge: 'Phổ biến nhất',
    tags: ['Street Style', 'Nghệ Thuật', 'Profile CV', 'Film Tone'],
    duration: '1 - 2 giờ',
    deliverables: 'Toàn bộ file gốc + 15 ảnh chỉnh sửa'
  },
  {
    id: 'couple',
    title: 'Cặp Đôi & Pre-Wedding',
    subtitle: 'Ghi lại câu chuyện tình yêu lãng mạn và ngọt ngào',
    image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=800&auto=format&fit=crop',
    price: 'Từ 1.800.000đ',
    badge: 'Được yêu thích',
    tags: ['Ngoại cảnh', 'Studio Hàn Quốc', 'Pre-Wedding', 'Vintage'],
    duration: '2 - 3 giờ',
    deliverables: 'Toàn bộ file gốc + 25 ảnh chỉnh sửa'
  },
  {
    id: 'family',
    title: 'Ảnh Gia Đình & Bé Yêu',
    subtitle: 'Lưu giữ những khoảnh khắc gắn kết thiêng liêng',
    image: 'https://images.unsplash.com/photo-1581952977263-df621a28a387?q=80&w=800&auto=format&fit=crop',
    price: 'Từ 1.500.000đ',
    badge: 'Ấm cúng',
    tags: ['Studio gia đình', 'Kỷ niệm ngày cưới', 'Bé sơ sinh', 'Tại gia'],
    duration: '1.5 - 2.5 giờ',
    deliverables: 'Toàn bộ file gốc + 20 ảnh chỉnh sửa'
  },
  {
    id: 'graduation',
    title: 'Kỷ Yếu / Học Sinh - Sinh Viên',
    subtitle: 'Đóng băng thanh xuân rực rỡ cùng bạn bè, lớp học',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop',
    price: 'Từ 450.000đ / người',
    badge: 'Ưu đãi nhóm',
    tags: ['Kỷ yếu lớp', 'Áo dài', 'Concept sáng tạo', 'Flycam'],
    duration: 'Nửa ngày / Cả ngày',
    deliverables: 'Trả ảnh trong 48h + Photobook'
  },
  {
    id: 'event',
    title: 'Sự Kiện & Doanh Nghiệp',
    subtitle: 'Ghi lại hình ảnh chuyên nghiệp cho hội thảo, tiệc, workshop',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop',
    price: 'Từ 2.200.000đ',
    badge: 'Chuyên nghiệp',
    tags: ['Hội thảo', 'Khai trương', 'Teambuilding', 'Gala Dinner'],
    duration: 'Theo sự kiện',
    deliverables: 'Giao ảnh nhanh trong 24h để làm PR'
  },
  {
    id: 'fashion',
    title: 'Lookbook & Thời Trang',
    subtitle: 'Tôn vinh sản phẩm thời trang và thương hiệu cá nhân',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
    price: 'Từ 2.500.000đ',
    badge: 'High Fashion',
    tags: ['Lookbook', 'E-commerce', 'Editorial', 'Thương mại'],
    duration: '3 - 5 giờ',
    deliverables: 'Hậu kỳ tỉ mỉ theo concept'
  }
];

export const CategoriesSection = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedCategoryTitle, setSelectedCategoryTitle] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadCategories = async () => {
      try {
        const res = await categoryApi.getAll();
        if (isMounted && res.success && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      } catch (_) {
        // Chỉ fallback về DEFAULT_CATEGORIES khi server ngắt kết nối
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadCategories();
    return () => { isMounted = false; };
  }, []);

  const handleOpenBooking = (catTitle) => {
    setSelectedCategoryTitle(catTitle);
    setIsBookingOpen(true);
  };

  return (
    <section id="categories-section" className="py-16 sm:py-24 border-t border-[#242938]">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dịch Vụ Chụp Ảnh Đa Dạng</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Các Thể Loại Chụp Ảnh Nổi Bật
            </h2>
            <p className="text-sm sm:text-base text-gray-400 max-w-xl">
              Chọn ngay phong cách bạn muốn, Photodate sẽ kết nối bạn với những Nhiếp ảnh gia chuyên nghiệp phù hợp nhất.
            </p>
          </div>

          <a 
            href="#photographers-section" 
            className="inline-flex items-center space-x-2 text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors group self-start md:self-auto"
          >
            <span>Xem tất cả nhiếp ảnh gia</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {categories.map((item, idx) => {
            const tagList = Array.isArray(item.tags)
              ? item.tags
              : (typeof item.tags === 'string' ? item.tags.split(',').map(s => s.trim()).filter(Boolean) : []);

            return (
              <div
                key={item._id || item.id || idx}
                className="group relative bg-[#141720] border border-[#242938] hover:border-amber-500/50 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image Preview Container */}
                <div className="relative h-60 w-full overflow-hidden bg-[#0c0d12]">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141720] via-transparent to-black/30" />

                  {/* Top Badge */}
                  {item.badge && (
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-300 border border-amber-500/30 text-xs font-bold shadow-md">
                        {item.badge}
                      </span>
                    </div>
                  )}

                  {/* Price Tag */}
                  {item.price && (
                    <div className="absolute bottom-4 right-4">
                      <span className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-amber-950 text-xs font-extrabold shadow-lg">
                        {item.price}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                      {item.title}
                    </h3>
                    {item.subtitle && (
                      <p className="text-xs sm:text-sm text-gray-400 line-clamp-2">
                        {item.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Tags */}
                  {tagList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {tagList.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2.5 py-1 rounded-lg bg-[#0c0d12] border border-[#242938] text-[11px] font-medium text-gray-300"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer specs */}
                  <div className="pt-4 border-t border-[#242938] flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{item.duration || 'Thỏa thuận'}</span>
                    </div>
                    <button
                      onClick={() => navigate(`/photographers`)}
                      className="inline-flex items-center space-x-1 font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-500/30 transition-all text-xs"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Xem Studio Chuyên Gói Này</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Modal */}
      {isBookingOpen && (
        <BookingModal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          initialCategory={selectedCategoryTitle}
        />
      )}
    </section>
  );
};

export default CategoriesSection;
