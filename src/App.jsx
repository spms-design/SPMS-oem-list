import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, ArrowLeft, Check, Layers, Package, Sliders, ChevronDown, ChevronUp, X } from 'lucide-react';

// --- 模拟数据 (Mock Data) ---
const THEME_COLOR = "#EE1144";
// 您的固定 Logo 图片路径 (请确保文件名为 "图片.png" 且与代码在同一目录下)
const LOGO_SRC = "./图片.png"; 

// 树状品类结构 (支持折叠)
const categoryGroups = [
  {
    id: 'g1',
    name: '智能设备',
    items: ['智能穿戴', '智能家居', 'VR/AR设备']
  },
  {
    id: 'g2',
    name: '生活电器',
    items: ['个护健康', '生活家电', '厨房电器']
  },
  {
    id: 'g3',
    name: '数码配件',
    items: ['音频设备', '充电储能', '电脑周边']
  }
];

const products = [
  {
    id: 'P001',
    name: 'Aura 智能降噪耳机 Pro',
    category: '音频设备',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
    shortDesc: '支持主动降噪，40小时超长续航，高保真音质。',
    moq: '1000 pcs',
    leadTime: '25-30 天',
    price: '₩ 28,500',
    features: ['ANC主动降噪', '蓝牙 5.3', 'IPX4 防水', '无线充电'],
    oemOptions: ['Logo 丝印/镭雕', '定制包装盒', '专属APP UI定制', '机身颜色定制'],
    specs: {
      '蓝牙版本': 'V 5.3',
      '电池容量': '500mAh (充电仓) / 45mAh (单耳)',
      '工作时间': '约 6-8 小时 (关闭ANC)',
      '材质': 'ABS + PC 环保材质'
    },
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800'
    ],
    detailImages: [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=1200'
    ]
  },
  {
    id: 'P002',
    name: 'Nova 极简负离子吹风机',
    category: '个护健康',
    image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800',
    shortDesc: '11万转高速马达，两亿级负离子，速干不伤发。',
    moq: '500 pcs',
    leadTime: '20-25 天',
    price: '₩ 45,000',
    features: ['高速无刷马达', '智能温控', '磁吸风嘴', '超轻量机身'],
    oemOptions: ['外观喷漆/手感油定制', 'Logo 烫金/镭雕', '礼盒定制', '电源线插头多国标准'],
    specs: {
      '额定功率': '1600W',
      '马达转速': '110,000 RPM',
      '负离子浓度': '200,000,000 ions/cm³',
      '重量': '395g'
    },
    images: [
      'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800'
    ],
    detailImages: [
      'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=1200'
    ]
  },
  {
    id: 'P004',
    name: 'Zenith 钛合金智能手表',
    category: '智能穿戴',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
    shortDesc: 'AMOLED高清屏，全天候心率血氧监测，百种运动模式。',
    moq: '2000 pcs',
    leadTime: '35-40 天',
    price: '₩ 32,000',
    features: ['AMOLED 视网膜屏', '5ATM 防水', '健康数据监测', '蓝牙通话'],
    oemOptions: ['开机画面定制', '表盘市场专属设计', '表带材质/颜色定制', '包装定制'],
    specs: {
      '屏幕尺寸': '1.43 英寸',
      '分辨率': '466 x 466',
      '电池续航': '典型使用 14 天',
      '兼容系统': 'Android 6.0+ / iOS 12.0+'
    },
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'
    ],
    detailImages: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1200'
    ]
  }
];

export default function App() {
  // 状态管理
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [isSplashFading, setIsSplashFading] = useState(false);
  
  const [activeCategory, setActiveCategory] = useState('全部');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  
  // 侧边栏手风琴展开状态
  const [expandedGroups, setExpandedGroups] = useState(categoryGroups.map(g => g.id));
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'process' | 'contact' | null

  // 开场动画逻辑
  useEffect(() => {
    const fadeTimer = setTimeout(() => setIsSplashFading(true), 1200);
    const removeTimer = setTimeout(() => setIsSplashVisible(false), 2000);
    return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer); };
  }, []);

  // 当进入详情页时，滚动到顶部
  useEffect(() => {
    if (selectedProduct) window.scrollTo(0, 0);
  }, [selectedProduct]);

  // 侧边栏折叠切换
  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
  };

  // 过滤产品列表
  const filteredProducts = products.filter(product => {
    const matchCategory = activeCategory === '全部' || product.category === activeCategory;
    const matchSearch = product.name.toLowerCase().includes(productSearchQuery.toLowerCase()) || 
                        product.shortDesc.toLowerCase().includes(productSearchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // 开场动画组件
  if (isSplashVisible) {
    return (
      <div className={`fixed inset-0 z-[9999] bg-white flex items-center justify-center transition-opacity duration-700 ease-in-out ${isSplashFading ? 'opacity-0' : 'opacity-100'}`}>
        <img 
          src={LOGO_SRC} 
          alt="SPMS Logo" 
          className="h-16 animate-pulse object-contain" 
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextElementSibling.style.display = 'block';
          }}
        />
        {/* 如果图片加载失败（如在云端预览环境中），将显示极简的文字Logo作为替代方案 */}
        <div className="hidden text-6xl font-black tracking-tighter animate-pulse" style={{ color: THEME_COLOR }}>
          SPMS
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] text-gray-900 font-sans selection:bg-[#EE1144] selection:text-white">
      
      {/* 顶部导航 */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center cursor-pointer" onClick={() => setSelectedProduct(null)}>
              {/* Logo 区域 - 优先使用图片 */}
              <div className="flex items-center gap-3">
                <img 
                  src={LOGO_SRC} 
                  alt="SPMS Logo" 
                  className="h-8 object-contain" 
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'block';
                  }}
                />
                <div className="hidden text-3xl font-black tracking-tighter" style={{ color: THEME_COLOR }}>
                  SPMS
                </div>
                <div className="h-6 w-px bg-gray-300 mx-1"></div>
                <div className="text-sm font-medium text-gray-500 tracking-widest uppercase mt-1">
                  OEM / ODM Center
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex space-x-8 items-center">
              <button onClick={() => setSelectedProduct(null)} className="text-sm font-medium text-gray-900 hover:text-[#EE1144] transition-colors">产品目录</button>
              <button onClick={() => setActiveModal('process')} className="text-sm font-medium text-gray-500 hover:text-[#EE1144] transition-colors">定制流程</button>
              <button onClick={() => setActiveModal('contact')} className="text-sm font-medium text-gray-500 hover:text-[#EE1144] transition-colors">联系我们</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* --- 视图切换 --- */}
        {!selectedProduct ? (
          
          /* =========================================
             1. 产品目录视图 (Catalog View)
             ========================================= */
          <div className="animate-in fade-in duration-500">
            
            {/* 页面标题 & 搜索 */}
            <div className="mb-12">
              <h1 className="text-4xl font-light tracking-tight text-gray-900 mb-4">
                探索我们的<span className="font-semibold">可定制产品线</span>
              </h1>
              <p className="text-lg text-gray-500 mb-8 max-w-2xl">
                为您的品牌赋能。从工业设计到批量生产，我们提供一站式的优质硬件 OEM/ODM 解决方案。
              </p>
              
              <div className="relative max-w-md">
                <input 
                  type="text" 
                  placeholder="搜索产品或功能..." 
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#EE1144]/20 focus:border-[#EE1144] shadow-sm transition-all"
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              
              {/* 侧边分类栏 (带搜索和折叠) */}
              <div className="lg:w-64 flex-shrink-0">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm sticky top-28">
                  
                  {/* 品类搜索 */}
                  <div className="relative mb-6">
                    <input 
                      type="text" 
                      placeholder="查找品类..." 
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-transparent rounded-lg text-sm focus:outline-none focus:bg-white focus:border-gray-200 transition-colors"
                      value={categorySearchQuery}
                      onChange={(e) => setCategorySearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                  </div>

                  <button
                    onClick={() => setActiveCategory('全部')}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-bold transition-all mb-4 ${
                      activeCategory === '全部' 
                        ? 'bg-[#EE1144]/10 text-[#EE1144]' 
                        : 'text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    全部品类
                  </button>

                  <div className="space-y-4">
                    {categoryGroups.map((group) => {
                      // 过滤子分类
                      const filteredItems = group.items.filter(item => 
                        item.toLowerCase().includes(categorySearchQuery.toLowerCase())
                      );
                      
                      // 如果搜索了且该大类下没有符合条件的子类，则隐藏该大类
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
                          
                          {/* 展开的子分类列表 */}
                          <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 mt-1' : 'max-h-0'}`}>
                            <ul className="space-y-1">
                              {filteredItems.map((item) => (
                                <li key={item}>
                                  <button
                                    onClick={() => setActiveCategory(item)}
                                    className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                      activeCategory === item 
                                        ? 'bg-[#EE1144]/10 text-[#EE1144]' 
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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

              {/* 产品网格 */}
              <div className="flex-1">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
                    <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">未找到相关产品</h3>
                    <p className="text-gray-500 mt-1">请尝试更换搜索词或分类。</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <div 
                        key={product.id} 
                        className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-transparent transition-all duration-300 cursor-pointer flex flex-col"
                        onClick={() => setSelectedProduct(product)}
                      >
                        {/* 图像区域 */}
                        <div className="aspect-[4/3] bg-gray-50 overflow-hidden relative">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                          />
                          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                            <span className="text-xs font-bold tracking-wide" style={{ color: THEME_COLOR }}>OEM/ODM</span>
                          </div>
                        </div>
                        
                        {/* 文本区域 */}
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
             2. 产品详情页视图 (Product Detail Page)
             ========================================= */
          <div className="animate-in slide-in-from-bottom-4 duration-500 fade-in">
            {/* 返回按钮 */}
            <button 
              onClick={() => setSelectedProduct(null)}
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-8 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              返回产品目录
            </button>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-12">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                
                {/* 左侧：大图展示 */}
                <div className="p-8 lg:p-12 bg-gray-50 flex flex-col">
                  <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-6">
                    <img 
                      src={selectedProduct.image} 
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {selectedProduct.images.map((img, idx) => (
                      <div key={idx} className="aspect-square bg-white rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:border-[#EE1144] transition-colors">
                        <img src={img} className="w-full h-full object-cover opacity-80 hover:opacity-100" alt={`Thumbnail ${idx}`} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 右侧：产品信息 & 定制说明 */}
                <div className="p-8 lg:p-12 flex flex-col">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">{selectedProduct.category}</span>
                    <span className="px-2.5 py-1 rounded bg-[#EE1144]/10 text-[#EE1144] text-xs font-bold tracking-wider">OEM 可定制</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{selectedProduct.name}</h1>
                  <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                    {selectedProduct.shortDesc}
                  </p>

                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">起订量 (MOQ)</p>
                      <p className="text-xl font-semibold text-gray-900">{selectedProduct.moq}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">交货周期</p>
                      <p className="text-xl font-semibold text-gray-900">{selectedProduct.leadTime}</p>
                    </div>
                  </div>

                  {/* 核心卖点 */}
                  <div className="mb-8">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center">
                      <Layers className="w-4 h-4 mr-2 text-[#EE1144]" />
                      核心亮点
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

                  {/* 定制选项 */}
                  <div className="mb-8 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center">
                      <Sliders className="w-4 h-4 mr-2 text-[#EE1144]" />
                      OEM 定制范围
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.oemOptions.map((opt, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700">
                          {opt}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 规格参数 */}
                  <div className="mb-8">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">技术规格</h3>
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

                  {/* 出厂价显示区 (替代原按钮) */}
                  <div className="mt-auto pt-8 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-2">Factory Price / 出厂价</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-[#EE1144] tracking-tight">{selectedProduct.price}</span>
                      <span className="text-base text-gray-500 font-medium">/ 件 (EXW)</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* 新增：长图文详情区域 */}
            {selectedProduct.detailImages && selectedProduct.detailImages.length > 0 && (
              <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mt-8 p-8 md:p-12">
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">产品图文详情</h2>
                  <div className="w-12 h-1 bg-[#EE1144] mx-auto mt-4 rounded-full"></div>
                </div>
                
                <div className="flex flex-col w-full bg-gray-50 rounded-2xl overflow-hidden">
                  {selectedProduct.detailImages.map((img, idx) => (
                    <img 
                      key={idx} 
                      src={img} 
                      alt={`Detail ${idx + 1}`} 
                      className="w-full h-auto object-cover block border-b border-gray-200 last:border-0"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* --- 极简弹窗组件 (Modal) --- */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {activeModal === 'process' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">OEM 定制流程</h3>
                <div className="space-y-6">
                  {[
                    { step: '01', title: '需求沟通', desc: '确认产品选型、外观定制要求及核心参数。' },
                    { step: '02', title: '样品打样', desc: '根据需求制作实物样品，确认细节。' },
                    { step: '03', title: '签订合同', desc: '确认最终价格、起订量(MOQ)及交期。' },
                    { step: '04', title: '批量生产', desc: '严格把控生产品质，高效制造。' },
                    { step: '05', title: '验货交付', desc: '完成品控检验，安排全球物流发货。' }
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
                <h3 className="text-2xl font-bold text-gray-900 mb-2">联系我们</h3>
                <p className="text-gray-500 text-sm mb-8">获取详细产品目录及最新报价，请随时与我们联络。</p>
                <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Customer Service</p>
                    <p className="text-xl font-semibold text-gray-900">070-7178-8181</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email</p>
                    <p className="text-base text-[#EE1144] font-medium">market@spms.kr</p>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 leading-relaxed">
                      평일 : 09:00 ~ 17:30<br/>
                      점심시간 : 12:00 ~ 13:00<br/>
                      주말 및 공휴일은 휴무입니다.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 底部信息 (完全替换为您提供的韩文版本) */}
      <footer className="bg-white border-t border-gray-100 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* 顶部链接 */}
          <div className="flex flex-wrap gap-6 text-sm font-medium text-gray-800 mb-8 pb-8 border-b border-gray-100">
            <a href="#" className="hover:text-[#EE1144] transition-colors">회사소개</a>
            <a href="#" className="hover:text-[#EE1144] transition-colors">이용약관</a>
            <a href="#" className="hover:text-[#EE1144] transition-colors">개인정보 취급방침</a>
            <a href="#" className="hover:text-[#EE1144] transition-colors">이용안내</a>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
            {/* 公司信息 */}
            <div className="text-xs text-gray-500 leading-loose space-y-1 flex-1">
              <p>법인명(상호) : 주식회사에스피엠에스 | 주소 : 04784 서울 성동구 성수이로10길 14 에이스 하이엔드 성수타워 512호</p>
              <p>대표자 : 엄재진 | 전화 : 070-7178-8181 | 개인정보관리책임자 : 주식회사에스피엠에스(market@spms.kr)</p>
              <p>사업자등록번호 343-81-01638 | 통신판매업신고 제2021-서울성동-00527호 [사업자정보확인]</p>
              <p className="mt-6 text-gray-400">Copyright © 르플렉스. All rights reserved.</p>
            </div>

            {/* 客服信息 */}
            <div className="lg:text-right">
              <h4 className="text-sm font-bold text-gray-900 mb-2">고객센터</h4>
              <p className="text-2xl font-black text-gray-900 mb-2 tracking-tight">070-7178-8181</p>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                평일 : 09:00 ~ 17:30<br/>
                점심시간 : 12:00 ~ 13:00<br/>
                주말 및 공휴일은 휴무입니다.
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