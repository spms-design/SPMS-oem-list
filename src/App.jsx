import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronRight, ArrowLeft, Check, Layers, Package, Sliders, ChevronDown, ChevronUp, X, Globe, Loader2 } from 'lucide-react';

// --- 配置区域 ---
const THEME_COLOR = "#EE1144";
const LOGO_SRC = "./图片.png"; 
// 您的 Google Drive CSV 链接
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSZDcOAJJhH6IvV-_wClkrQmAtqhkcu7aUJ5KBFCYnPvE_TFamUfo0jt5Yugf9yxQ/pub?output=csv";

// --- 双语字典 ---
const DICT = {
  ko: {
    catalog: '제품 카탈로그',
    process: '맞춤 제작 절차',
    contact: '문의하기',
    heroTitle: '맞춤형 제품 라인업 탐색',
    heroSub: '브랜드 가치를 높여보세요. 산업 디자인부터 대량 생산까지, 원스톱 프리미엄 하드웨어 OEM/ODM 솔루션을 제공합니다.',
    searchPlaceholder: '제품 또는 기능 검색...',
    catSearchPlaceholder: '카테고리 검색...',
    allCat: '전체 카테고리',
    noProduct: '관련 제품을 찾을 수 없습니다',
    tryChange: '검색어 또는 카테고리를 변경해 보세요.',
    back: '카탈로그로 돌아가기',
    oemTag: 'OEM 맞춤 제작',
    moq: '최소 주문 수량(MOQ)',
    leadTime: '납품 기간',
    coreFeatures: '핵심 특징',
    oemScope: 'OEM 맞춤 범위',
    techSpecs: '기술 사양',
    factoryPrice: '공장 출고가',
    perPiece: '/ 개 (EXW)',
    detailTitle: '제품 상세 정보',
    langSwitch: '中文', 
    processTitle: 'OEM 맞춤 제작 절차',
    contactTitle: '문의하기',
    contactSub: '자세한 제품 카탈로그 및 최신 견적을 원하시면 언제든지 문의해 주세요.',
    loading: '데이터 불러오는 중...'
  },
  zh: {
    catalog: '产品目录',
    process: '定制流程',
    contact: '联系我们',
    heroTitle: '探索我们的可定制产品线',
    heroSub: '为您的品牌赋能。从工业设计到批量生产，我们提供一站式的优质硬件 OEM/ODM 解决方案。',
    searchPlaceholder: '搜索产品或功能...',
    catSearchPlaceholder: '查找品类...',
    allCat: '全部品类',
    noProduct: '未找到相关产品',
    tryChange: '请尝试更换搜索词或分类。',
    back: '返回产品目录',
    oemTag: 'OEM 可定制',
    moq: '起订量 (MOQ)',
    leadTime: '交货周期',
    coreFeatures: '核心亮点',
    oemScope: 'OEM 定制范围',
    techSpecs: '技术规格',
    factoryPrice: '出厂价',
    perPiece: '/ 件 (EXW)',
    detailTitle: '产品图文详情',
    langSwitch: '한국어', 
    processTitle: 'OEM 定制流程',
    contactTitle: '联系我们',
    contactSub: '获取详细产品目录及最新报价，请随时与我们联络。',
    loading: '正在加载数据...'
  }
};

// 极简 CSV 解析器 (处理带有换行和引号的单元格)
function parseCSV(str) {
  const arr = [];
  let quote = false;
  let row = 0, col = 0;
  for (let c = 0; c < str.length; c++) {
    let cc = str[c], nc = str[c+1];
    arr[row] = arr[row] || [];
    arr[row][col] = arr[row][col] || '';
    if (cc === '"' && quote && nc === '"') { arr[row][col] += cc; ++c; continue; }
    if (cc === '"') { quote = !quote; continue; }
    if (cc === ',' && !quote) { ++col; continue; }
    if (cc === '\r' && nc === '\n' && !quote) { ++row; col = 0; ++c; continue; }
    if (cc === '\n' && !quote) { ++row; col = 0; continue; }
    if (cc === '\r' && !quote) { ++row; col = 0; continue; }
    arr[row][col] += cc;
  }
  return arr;
}

export default function App() {
  const [lang, setLang] = useState('ko'); // 默认韩文
  const t = (key) => DICT[lang][key];

  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [isSplashFading, setIsSplashFading] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [productsRaw, setProductsRaw] = useState([]); // 原始抓取数据
  
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState([]);
  
  // 【关键修复】：只存 ID，而不是存整个产品对象
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [activeModal, setActiveModal] = useState(null); 

  // 获取 Google Sheets 数据
  useEffect(() => {
    fetch(CSV_URL)
      .then(res => res.text())
      .then(csvText => {
        const rows = parseCSV(csvText);
        
        // 【从第5行开始读取表头】 (数组索引从0开始，所以第5行是索引4)
        const HEADER_ROW_INDEX = 4; 
        
        if (rows.length > HEADER_ROW_INDEX) {
          const headers = rows[HEADER_ROW_INDEX].map(h => h ? h.trim() : '');
          const data = rows.slice(HEADER_ROW_INDEX + 1).filter(r => r.length > 0 && r[0]).map(row => {
            const obj = {};
            headers.forEach((h, i) => { 
              if (h) obj[h] = row[i] ? row[i].trim() : ''; 
            });
            return obj;
          });
          setProductsRaw(data);
        } else {
          setProductsRaw([]);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch Google Sheets CSV:", err);
        setIsLoading(false);
      });
  }, []);

  // 开场动画
  useEffect(() => {
    const fadeTimer = setTimeout(() => setIsSplashFading(true), 1200);
    const removeTimer = setTimeout(() => setIsSplashVisible(false), 2000);
    return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer); };
  }, []);

  // 滚动到顶部
  useEffect(() => {
    if (selectedProductId) window.scrollTo(0, 0);
  }, [selectedProductId]);

  const parseList = (str) => str ? str.split('\n').map(s => s.trim()).filter(Boolean) : [];
  const parseSpecs = (str) => {
    if (!str) return {};
    const specs = {};
    str.split('\n').forEach(line => {
      const idx = line.indexOf(':');
      if (idx > -1) {
        specs[line.substring(0, idx).trim()] = line.substring(idx + 1).trim();
      } else if (line.indexOf('：') > -1) { 
        const parts = line.split('：');
        specs[parts[0].trim()] = parts.slice(1).join('：').trim();
      }
    });
    return specs;
  };

  // 动态生成基于当前语言的产品列表
  const products = useMemo(() => {
    return productsRaw.map(p => ({
      id: p.id,
      image: p.image,
      images: parseList(p.images),
      detailImages: parseList(p.detailImages),
      moq: p.moq,
      price: p.price,
      group: lang === 'ko' ? p.group_ko : p.group_zh,
      category: lang === 'ko' ? p.category_ko : p.category_zh,
      name: lang === 'ko' ? p.name_ko : p.name_zh,
      shortDesc: lang === 'ko' ? p.shortDesc_ko : p.shortDesc_zh,
      leadTime: lang === 'ko' ? p.leadTime_ko : p.leadTime_zh,
      features: parseList(lang === 'ko' ? p.features_ko : p.features_zh),
      oemOptions: parseList(lang === 'ko' ? p.oemOptions_ko : p.oemOptions_zh),
      specs: parseSpecs(lang === 'ko' ? p.specs_ko : p.specs_zh),
    }));
  }, [productsRaw, lang]);

  // 【关键修复】：根据 ID 动态获取当前选中的产品信息，语言切换时它会自动更新
  const selectedProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId) || null;
  }, [products, selectedProductId]);

  const categoryGroups = useMemo(() => {
    const map = {};
    products.forEach(p => {
      if (!p.group || !p.category) return;
      if (!map[p.group]) map[p.group] = new Set();
      map[p.group].add(p.category);
    });
    const groups = Object.keys(map).map(gName => ({
      id: gName,
      name: gName,
      items: Array.from(map[gName])
    }));
    if (expandedGroups.length === 0 && groups.length > 0) {
      setExpandedGroups(groups.map(g => g.id));
    }
    return groups;
  }, [products]);

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
  };

  const filteredProducts = products.filter(product => {
    const matchCategory = activeCategory === 'ALL' || product.category === activeCategory;
    const matchSearch = product.name?.toLowerCase().includes(productSearchQuery.toLowerCase()) || 
                        product.shortDesc?.toLowerCase().includes(productSearchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleLangSwitch = () => {
    setLang(prev => prev === 'ko' ? 'zh' : 'ko');
  };

  if (isSplashVisible) {
    return (
      <div className={`fixed inset-0 z-[9999] bg-white flex items-center justify-center transition-opacity duration-700 ease-in-out ${isSplashFading ? 'opacity-0' : 'opacity-100'}`}>
        <img src={LOGO_SRC} alt="SPMS Logo" className="h-16 animate-pulse object-contain" onError={(e)=>{e.target.style.display='none';e.target.nextElementSibling.style.display='block';}} />
        <div className="hidden text-6xl font-black tracking-tighter animate-pulse" style={{ color: THEME_COLOR }}>SPMS</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] text-gray-900 font-sans selection:bg-[#EE1144] selection:text-white pb-20">
      
      {/* 顶部导航 */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* 点击返回列表：将选中的 ID 设为 null */}
            <div className="flex items-center cursor-pointer" onClick={() => setSelectedProductId(null)}>
              <div className="flex items-center gap-3">
                <img src={LOGO_SRC} alt="SPMS Logo" className="h-8 object-contain" onError={(e)=>{e.target.style.display='none';e.target.nextElementSibling.style.display='block';}} />
                <div className="hidden text-3xl font-black tracking-tighter" style={{ color: THEME_COLOR }}>SPMS</div>
                <div className="h-6 w-px bg-gray-300 mx-1 hidden sm:block"></div>
                <div className="text-sm font-medium text-gray-500 tracking-widest uppercase mt-1 hidden sm:block">
                  OEM / ODM Center
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4 md:space-x-8 items-center">
              <button onClick={() => setSelectedProductId(null)} className="hidden md:block text-sm font-medium text-gray-900 hover:text-[#EE1144] transition-colors">{t('catalog')}</button>
              <button onClick={() => setActiveModal('process')} className="hidden md:block text-sm font-medium text-gray-500 hover:text-[#EE1144] transition-colors">{t('process')}</button>
              <button onClick={() => setActiveModal('contact')} className="hidden md:block text-sm font-medium text-gray-500 hover:text-[#EE1144] transition-colors">{t('contact')}</button>
              
              <div className="h-4 w-px bg-gray-200 mx-2 hidden md:block"></div>
              
              {/* 语言切换器 */}
              <button 
                onClick={handleLangSwitch}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:border-[#EE1144] hover:text-[#EE1144] transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                {t('langSwitch')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#EE1144]" />
            <p className="text-sm font-medium">{t('loading')}</p>
          </div>
        ) : !selectedProduct ? (
          
          /* =========================================
             1. 产品目录视图
             ========================================= */
          <div className="animate-in fade-in duration-500">
            <div className="mb-12">
              <h1 className="text-3xl md:text-4xl font-light tracking-tight text-gray-900 mb-4">
                {lang === 'ko' ? (
                  <>맞춤형 <span className="font-semibold">제품 라인업</span> 탐색</>
                ) : (
                  <>探索我们的<span className="font-semibold">可定制产品线</span></>
                )}
              </h1>
              <p className="text-lg text-gray-500 mb-8 max-w-2xl">{t('heroSub')}</p>
              
              <div className="relative max-w-md">
                <input 
                  type="text" 
                  placeholder={t('searchPlaceholder')}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#EE1144]/20 focus:border-[#EE1144] shadow-sm transition-all"
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              
              <div className="lg:w-64 flex-shrink-0">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm sticky top-28">
                  <div className="relative mb-6">
                    <input 
                      type="text" 
                      placeholder={t('catSearchPlaceholder')} 
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-transparent rounded-lg text-sm focus:outline-none focus:bg-white focus:border-gray-200 transition-colors"
                      value={categorySearchQuery}
                      onChange={(e) => setCategorySearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                  </div>

                  <button
                    onClick={() => setActiveCategory('ALL')}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-bold transition-all mb-4 ${
                      activeCategory === 'ALL' ? 'bg-[#EE1144]/10 text-[#EE1144]' : 'text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {t('allCat')}
                  </button>

                  <div className="space-y-4">
                    {categoryGroups.map((group) => {
                      const filteredItems = group.items.filter(item => item?.toLowerCase().includes(categorySearchQuery.toLowerCase()));
                      if (categorySearchQuery && filteredItems.length === 0) return null;
                      const isExpanded = expandedGroups.includes(group.id) || categorySearchQuery;

                      return (
                        <div key={group.id} className="border-b border-gray-50 pb-2 last:border-0">
                          <button 
                            onClick={() => toggleGroup(group.id)}
                            className="w-full flex items-center justify-between px-2 py-2 text-sm font-bold text-gray-400 hover:text-gray-700 transition-colors"
                          >
                            <span>{group.name}</span>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          
                          <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 mt-1' : 'max-h-0'}`}>
                            <ul className="space-y-1">
                              {filteredItems.map((item) => (
                                <li key={item}>
                                  <button
                                    onClick={() => setActiveCategory(item)}
                                    className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                      activeCategory === item ? 'bg-[#EE1144]/10 text-[#EE1144]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                  >
                                    {item}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex-1">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
                    <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">{t('noProduct')}</h3>
                    <p className="text-gray-500 mt-1">{t('tryChange')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <div 
                        key={product.id} 
                        className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-transparent transition-all duration-300 cursor-pointer flex flex-col"
                        // 【点击产品时，保存 ID】
                        onClick={() => setSelectedProductId(product.id)}
                      >
                        <div className="aspect-[4/3] bg-gray-50 overflow-hidden relative">
                          <img 
                            src={product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'} 
                            alt={product.name}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                          />
                          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                            <span className="text-xs font-bold tracking-wide" style={{ color: THEME_COLOR }}>{t('oemTag')}</span>
                          </div>
                        </div>
                        
                        <div className="p-6 flex flex-col flex-1">
                          <div className="text-xs font-medium text-gray-400 mb-2">{product.category}</div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
                          <p className="text-sm text-gray-500 line-clamp-2 mb-6 flex-1">{product.shortDesc}</p>
                          
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                            <div className="text-xs text-gray-500">
                              <span className="block font-medium text-gray-900">MOQ: {product.moq}</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#EE1144] transition-colors">
                              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          
          /* =========================================
             2. 产品详情页视图
             ========================================= */
          <div className="animate-in slide-in-from-bottom-4 duration-500 fade-in">
            <button 
              onClick={() => setSelectedProductId(null)}
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-8 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              {t('back')}
            </button>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-12">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                
                <div className="p-8 lg:p-12 bg-gray-50 flex flex-col">
                  <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-6">
                    <img 
                      src={selectedProduct.image} 
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  {selectedProduct.images && selectedProduct.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-4">
                      {selectedProduct.images.map((img, idx) => (
                        <div key={idx} className="aspect-square bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-[#EE1144] transition-colors">
                          <img src={img} className="w-full h-full object-cover" alt={`Thumb ${idx}`} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-8 lg:p-12 flex flex-col">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">{selectedProduct.category}</span>
                    <span className="px-2.5 py-1 rounded bg-[#EE1144]/10 text-[#EE1144] text-xs font-bold tracking-wider">{t('oemTag')}</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{selectedProduct.name}</h1>
                  <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                    {selectedProduct.shortDesc}
                  </p>

                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{t('moq')}</p>
                      <p className="text-xl font-semibold text-gray-900">{selectedProduct.moq}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{t('leadTime')}</p>
                      <p className="text-xl font-semibold text-gray-900">{selectedProduct.leadTime}</p>
                    </div>
                  </div>

                  {selectedProduct.features && selectedProduct.features.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center">
                        <Layers className="w-4 h-4 mr-2 text-[#EE1144]" />
                        {t('coreFeatures')}
                      </h3>
                      <ul className="grid grid-cols-2 gap-y-3 gap-x-4">
                        {selectedProduct.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-sm text-gray-600">
                            <Check className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedProduct.oemOptions && selectedProduct.oemOptions.length > 0 && (
                    <div className="mb-8 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center">
                        <Sliders className="w-4 h-4 mr-2 text-[#EE1144]" />
                        {t('oemScope')}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.oemOptions.map((opt, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700">
                            {opt}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {Object.keys(selectedProduct.specs).length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">{t('techSpecs')}</h3>
                      <div className="border border-gray-100 rounded-xl overflow-hidden">
                        <table className="w-full text-sm text-left">
                          <tbody>
                            {Object.entries(selectedProduct.specs).map(([key, value], idx) => (
                              <tr key={key} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                <th className="px-4 py-3 font-medium text-gray-500 w-1/3">{key}</th>
                                <td className="px-4 py-3 text-gray-900">{value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="mt-auto pt-8 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-2">{t('factoryPrice')}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-[#EE1144] tracking-tight">{selectedProduct.price}</span>
                      <span className="text-base text-gray-500 font-medium">{t('perPiece')}</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {selectedProduct.detailImages && selectedProduct.detailImages.length > 0 && (
              <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mt-8 p-8 md:p-12">
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{t('detailTitle')}</h2>
                  <div className="w-12 h-1 bg-[#EE1144] mx-auto mt-4 rounded-full"></div>
                </div>
                
                <div className="flex flex-col w-full bg-gray-50 rounded-2xl overflow-hidden">
                  {selectedProduct.detailImages.map((img, idx) => (
                    <img key={idx} src={img} alt={`Detail ${idx + 1}`} className="w-full h-auto block" />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* --- 弹窗组件 --- */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {activeModal === 'process' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">{t('processTitle')}</h3>
                <div className="space-y-6">
                  {[
                    lang === 'ko' ? { step: '01', title: '요구사항 확인', desc: '제품 선택, 디자인 요구사항 및 핵심 매개변수 확인.' } : { step: '01', title: '需求沟通', desc: '确认产品选型、外观定制要求及核心参数。' },
                    lang === 'ko' ? { step: '02', title: '샘플 제작', desc: '요구사항에 따른 실물 샘플 제작 및 세부 확인.' } : { step: '02', title: '样品打样', desc: '根据需求制作实物样品，确认细节。' },
                    lang === 'ko' ? { step: '03', title: '계약 체결', desc: '최종 가격, MOQ 및 납기일 확인.' } : { step: '03', title: '签订合同', desc: '确认最终价格、起订量(MOQ)及交期。' },
                    lang === 'ko' ? { step: '04', title: '대량 생산', desc: '엄격한 품질 관리 및 효율적인 생산.' } : { step: '04', title: '批量生产', desc: '严格把控生产品质，高效制造。' },
                    lang === 'ko' ? { step: '05', title: '검수 및 배송', desc: '품질 검사 완료 및 글로벌 물류 배송 준비.' } : { step: '05', title: '验货交付', desc: '完成品控检验，安排全球物流发货。' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="text-xl font-black text-gray-200">{item.step}</div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h4>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeModal === 'contact' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('contactTitle')}</h3>
                <p className="text-gray-500 text-sm mb-8">{t('contactSub')}</p>
                <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Customer Service</p>
                    <p className="text-xl font-semibold text-gray-900">070-7178-8181</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email</p>
                    <p className="text-base text-[#EE1144] font-medium">market@spms.kr</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 底部信息 (固定的韩文公司信息) */}
      <footer className="bg-white border-t border-gray-100 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-wrap gap-6 text-sm font-medium text-gray-800 mb-8 pb-8 border-b border-gray-100">
            <a href="#" className="hover:text-[#EE1144] transition-colors">회사소개</a>
            <a href="#" className="hover:text-[#EE1144] transition-colors">이용약관</a>
            <a href="#" className="hover:text-[#EE1144] transition-colors">개인정보 취급방침</a>
            <a href="#" className="hover:text-[#EE1144] transition-colors">이용안내</a>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
            <div className="text-xs text-gray-500 leading-loose space-y-1 flex-1">
              <p>법인명(상호) : 주식회사에스피엠에스 | 주소 : 04784 서울 성동구 성수이로10길 14 에이스 하이엔드 성수타워 512호</p>
              <p>대표자 : 엄재진 | 전화 : 070-7178-8181 | 개인정보관리책임자 : 주식회사에스피엠에스(market@spms.kr)</p>
              <p>사업자등록번호 343-81-01638 | 통신판매업신고 제2021-서울성동-00527호 [사업자정보확인]</p>
              <p className="mt-6 text-gray-400">Copyright © 르플렉스. All rights reserved.</p>
            </div>
            <div className="lg:text-right">
              <h4 className="text-sm font-bold text-gray-900 mb-2">고객센터</h4>
              <p className="text-2xl font-black text-gray-900 mb-2 tracking-tight">070-7178-8181</p>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                평일 : 09:00 ~ 17:30<br/>점심시간 : 12:00 ~ 13:00<br/>주말 및 공휴일은 휴무입니다.
              </p>
              <p className="text-sm font-medium text-gray-700 bg-gray-50 inline-block px-4 py-2 rounded-lg border border-gray-100">
                상품 견적 문의: <span className="text-[#EE1144]">market@spms.kr</span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
