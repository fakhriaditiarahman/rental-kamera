import React, { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import {
  AlertCircle,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  CircleCheck,
  CircleHelp,
  Clock3,
  FileText,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Menu,
  Package,
  Plus,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Store,
  Users,
  X,
  Eye,
  EyeOff,
  Phone,
  UserRound,
} from 'lucide-react';

const cameras = [
  { id: 1, name: 'Sony α7 IV', type: 'Mirrorless', rate: 275000, stock: 3, status: 'Tersedia', tone: 'sand', tag: 'Paling diminati' },
  { id: 2, name: 'Canon EOS R6 Mark II', type: 'Mirrorless', rate: 300000, stock: 2, status: 'Tersedia', tone: 'clay', tag: 'Baru' },
  { id: 3, name: 'Fujifilm X-T5', type: 'Mirrorless', rate: 225000, stock: 1, status: 'Terbatas', tone: 'sage', tag: 'Compact' },
  { id: 4, name: 'Sony FX3', type: 'Cinema Camera', rate: 450000, stock: 0, status: 'Disewa', tone: 'ink', tag: 'Cinematic' },
];

const rentals = [
  { id: 'SK-240921-018', customer: 'Nadia Putri', product: 'Sony α7 IV', dates: '24 Sep — 27 Sep 2024', total: 1100000, status: 'Menunggu persetujuan', initials: 'NP' },
  { id: 'SK-240920-017', customer: 'Raka Pratama', product: 'Fujifilm X-T5', dates: '22 Sep — 24 Sep 2024', total: 675000, status: 'Sedang disewa', initials: 'RP' },
  { id: 'SK-240918-016', customer: 'Salsa Amalia', product: 'Canon EOS R6 Mark II', dates: '18 Sep — 20 Sep 2024', total: 900000, status: 'Selesai', initials: 'SA' },
];

const customerRentals = [
  { id: 'SK-240921-018', product: 'Sony α7 IV', dates: '24 Sep — 27 Sep 2024', total: 1100000, status: 'Menunggu persetujuan', tone: 'sand' },
  { id: 'SK-240812-011', product: 'Fujifilm X-T5', dates: '12 Agu — 14 Agu 2024', total: 675000, status: 'Selesai', tone: 'sage' },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

function IconButton({ label, children, onClick }) {
  return <button className="icon-button" aria-label={label} onClick={onClick}>{children}</button>;
}

function Logo() {
  return (
    <div className="brand">
      <span className="brand-mark">
        <img src="/image/logo.webp" alt="Kamera Kita" style={{ width: 80, height: 80, objectFit: 'contain' }} />
      </span>
    </div>
  );
}

function Sidebar({ active, onChange, open, onClose, role, user }) {
  const nav = role === 'customer'
    ? [
      { id: 'customer-home', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'customer-catalog', label: 'Cari kamera', icon: Camera },
      { id: 'customer-rentals', label: 'Sewa saya', icon: CalendarDays, count: 1 },
      { id: 'customer-profile', label: 'Profil saya', icon: Users },
    ]
    : [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'catalog', label: 'Katalog kamera', icon: Camera },
      { id: 'rentals', label: 'Penyewaan', icon: CalendarDays, count: 3 },
      { id: 'customers', label: 'Pelanggan', icon: Users },
      { id: 'inventory', label: 'Inventaris', icon: Package },
    ];
  return (
    <aside className={`sidebar ${open ? 'is-open' : ''}`}>
      <div className="sidebar-top">
        <Logo />
        <IconButton label="Tutup navigasi" onClick={onClose}><X size={18} /></IconButton>
      </div>
      <nav className="nav-list" aria-label="Navigasi utama">
        <p className="nav-label">Workspace</p>
        {nav.map(({ id, label, icon: NavIcon, count }) => (
          <button key={id} className={`nav-item ${active === id ? 'active' : ''}`} onClick={() => onChange(id)}>
            <NavIcon size={18} strokeWidth={active === id ? 2.3 : 1.8} />
            <span>{label}</span>
            {count && <b className="nav-count">{count}</b>}
          </button>
        ))}
        <p className="nav-label nav-label-spaced">Pengaturan</p>
        <button className={`nav-item ${active === 'settings' ? 'active' : ''}`} onClick={() => onChange(role === 'customer' ? 'customer-profile' : 'settings')}><Settings2 size={18} /><span>Pengaturan</span></button>
        <button className={`nav-item ${active === 'help' ? 'active' : ''}`} onClick={() => onChange(role === 'customer' ? 'customer-home' : 'help')}><CircleHelp size={18} /><span>Pusat bantuan</span></button>
      </nav>
      <div className="sidebar-foot">
        <div className="profile-row"><span className="profile-avatar">{getInitials(user?.name || (role === 'customer' ? 'Pelanggan' : 'Ardi Rahman'))}</span><span><b>{user?.name || (role === 'customer' ? 'Pelanggan' : 'Ardi Rahman')}</b><small>{role === 'customer' ? 'Pelanggan' : 'Administrator'}</small></span><ChevronDown size={15} /></div>
        <button className="logout-button" onClick={() => router.post('/logout')}><LogOut size={16} /> Keluar</button>
      </div>
    </aside>
  );
}

function getInitials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function CustomerHome({ onSelectCamera, onNavigate, user, rentals = [] }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('Semua');
  const filtered = cameras.filter((camera) => (selected === 'Semua' || camera.status === selected) && camera.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="customer-dashboard">
      <section className="page-heading customer-heading">
        <div><p className="eyebrow">Akun pelanggan</p><h1>Halo, {user?.name?.split(' ')[0] || 'Pelanggan'}.</h1><p className="heading-subtitle">Siap menyiapkan produksi berikutnya?</p></div>
        <button className="primary-button" onClick={() => onNavigate('customer-catalog')}><Search size={17} /> Cari kamera</button>
      </section>
      <section className="customer-stats">
        <article className="customer-stat accent"><span className="customer-stat-icon"><CalendarDays size={18} /></span><span><small>Sewa aktif</small><strong>{rentals.filter((rental) => !['Selesai', 'Ditolak', 'Dibatalkan'].includes(rental.status)).length}</strong></span><b>{rentals[0]?.status || 'Belum ada sewa'}</b></article>
        <article className="customer-stat"><span className="customer-stat-icon"><Clock3 size={18} /></span><span><small>Total penyewaan</small><strong>{rentals.length}</strong></span><b>Sejak bergabung</b></article>
        <article className="customer-stat warm"><span className="customer-stat-icon"><Sparkles size={18} /></span><span><small>Total pengeluaran</small><strong>{formatCurrency(rentals.reduce((total, rental) => total + rental.total, 0))}</strong></span><b>Semua transaksi</b></article>
      </section>
      <section className="customer-dashboard-grid">
        <article className="panel next-rental-panel">
          <div className="panel-heading"><div><p className="eyebrow">Pesanan terbaru</p><h2>Permintaan sedang diproses</h2></div><StatusBadge status="Menunggu persetujuan" /></div>
          {rentals[0] ? <div className="next-rental-body"><div className={`customer-rental-visual ${rentals[0].tone}`}><Camera size={58} strokeWidth={1.1} /><span>PHOTO / DEMO</span></div><div className="next-rental-copy"><h3>{rentals[0].product}</h3><p>{rentals[0].dates}</p><div className="rental-meta"><span><CalendarDays size={14} /> Rental</span><span><b>{formatCurrency(rentals[0].total)}</b></span></div><button className="secondary-button">Lihat detail <ArrowUpRight size={15} /></button></div></div> : <div className="empty-state"><h2>Belum ada penyewaan</h2><p>Jelajahi katalog untuk memulai penyewaan pertamamu.</p></div>}
        </article>
        <aside className="panel customer-tip"><span className="insight-icon"><Sparkles size={19} /></span><p className="eyebrow">Tips untuk kamu</p><h2>Temukan kamera untuk cerita berikutnya.</h2><p>Jelajahi koleksi kamera yang tersedia dan pilih gear yang sesuai kebutuhan produksi kamu.</p><button className="text-button" onClick={() => onNavigate('customer-catalog')}>Jelajahi katalog <ArrowUpRight size={15} /></button></aside>
      </section>
      <section className="panel customer-history"><div className="panel-heading"><div><h2>Riwayat penyewaan</h2><p>Transaksi yang pernah kamu lakukan.</p></div><button className="text-button" onClick={() => onNavigate('customer-rentals')}>Lihat semua <ArrowUpRight size={15} /></button></div><div className="table-wrap"><table><thead><tr><th>Kamera</th><th>Periode</th><th>Total</th><th>Status</th></tr></thead><tbody>{rentals.map((rental) => <tr key={rental.id}><td><div className="customer-cell"><span className={`camera-thumb ${rental.tone}`}><Camera size={17} /></span><span><b>{rental.product}</b><small>{rental.id}</small></span></div></td><td>{rental.dates}</td><td className="money">{formatCurrency(rental.total)}</td><td><StatusBadge status={rental.status} /></td></tr>)}</tbody></table></div></section>
      <div className="customer-catalog-label"><div><p className="eyebrow">Pilihan untukmu</p><h2>Kamera untuk setiap frame.</h2></div><button className="text-button" onClick={() => onNavigate('customer-catalog')}>Lihat katalog <ArrowUpRight size={15} /></button></div>
      <section className="customer-hero">
        <div><p className="eyebrow">Koleksi kamera pilihan</p><h1>Siap untuk cerita<br /><em>berikutnya?</em></h1><p>Temukan kamera yang pas untuk produksi kamu. Pilih tanggal, cek ketersediaan, dan ajukan sewa dalam beberapa langkah.</p></div>
        <div className="hero-camera-mark"><Camera size={96} strokeWidth={1} /><span>CURATED<br />CAMERA KIT</span></div>
      </section>
      <section className="customer-section-head"><div><p className="eyebrow">Jelajahi koleksi</p><h2>Kamera untuk setiap frame.</h2></div><label className="search-field"><Search size={17} /><input placeholder="Cari kamera..." value={query} onChange={(event) => setQuery(event.target.value)} /></label></section>
      <div className="filter-tabs customer-tabs">{['Semua', 'Tersedia', 'Terbatas'].map((item) => <button className={selected === item ? 'active' : ''} key={item} onClick={() => setSelected(item)}>{item}</button>)}</div>
      <section className="camera-grid customer-camera-grid">{filtered.slice(0, 4).map((camera) => <article className="camera-card" key={camera.id} onClick={() => onSelectCamera(camera)}><div className={`camera-image ${camera.tone}`}><span className="camera-tag">{camera.tag}</span><Camera size={76} strokeWidth={1.1} /><span className="camera-image-label">PHOTO / DEMO</span></div><div className="camera-card-body"><div className="camera-title"><div><h3>{camera.name}</h3><p>{camera.type}</p></div></div><div className="camera-card-foot"><span><b>{formatCurrency(camera.rate)}</b> <small>/ hari</small></span><span className="rent-link">Lihat detail <ArrowUpRight size={14} /></span></div></div></article>)}</section>
    </div>
  );
}

function CustomerCatalog({ onSelectCamera }) {
  return <Catalog onSelectCamera={onSelectCamera} />;
}

function PublicHome({ onNavigate, onSelectCamera }) {
  return (
    <div className="public-home">
      <section className="public-hero">
        <nav className="public-nav">
          <Logo />
          <div className="public-nav-links"><a href="#koleksi">Koleksi</a><a href="#cara-sewa">Cara sewa</a><a href="#tentang">Tentang kami</a></div>
          <div className="public-nav-actions"><button className="public-login" onClick={() => router.get('/login')}>Masuk</button><button className="primary-button" onClick={() => router.get('/login')}>Mulai sewa <ArrowUpRight size={15} /></button></div>
        </nav>
        <div className="public-hero-content"><div><p className="eyebrow">Gear untuk cerita yang berarti</p><h1>Buat momen.<br /><em>Kami siapkan</em> kameranya.</h1><p className="public-hero-copy">Sewa kamera pilihan untuk produksi film, konten, dan momen penting kamu—dengan proses yang sederhana dan transparan.</p><button className="primary-button large" onClick={() => onNavigate('customer-catalog')}>Jelajahi koleksi <ArrowUpRight size={17} /></button></div><div className="hero-still-life"><div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" /><Camera size={190} strokeWidth={.65} /><span className="hero-still-label">CURATED<br />CAMERA KIT<br /><b>EST. 2024</b></span></div></div>
        <div className="public-hero-bottom"><span>Dipercaya untuk produksi yang tidak bisa diulang</span><span className="scroll-note">SCROLL TO EXPLORE <ArrowUpRight size={14} /></span></div>
      </section>
      <section className="public-search-strip"><div><p className="eyebrow">Mulai dari kebutuhanmu</p><h2>Kapan kamu butuh kamera?</h2></div><div className="public-search-fields"><label><CalendarDays size={17} /><span><small>Tanggal mulai</small><b>24 September 2024</b></span></label><span className="search-divider" /><label><CalendarDays size={17} /><span><small>Tanggal kembali</small><b>27 September 2024</b></span></label><button className="primary-button" onClick={() => onNavigate('customer-catalog')}><Search size={17} /> Cek ketersediaan</button></div></section>
      <section className="public-section" id="koleksi"><div className="public-section-heading"><div><p className="eyebrow">Pilihan kami</p><h2>Kamera yang siap<br /><em>menemani cerita.</em></h2></div><button className="text-button" onClick={() => onNavigate('customer-catalog')}>Lihat semua kamera <ArrowUpRight size={16} /></button></div><div className="featured-grid">{cameras.slice(0, 3).map((camera, index) => <article className={`featured-card featured-${index}`} key={camera.id} onClick={() => onSelectCamera(camera)}><div className={`featured-image ${camera.tone}`}><span>{camera.tag}</span><Camera size={100} strokeWidth={.85} /></div><div className="featured-card-copy"><div><h3>{camera.name}</h3><p>{camera.type}</p></div><b>{formatCurrency(camera.rate)}<small>/ hari</small></b></div></article>)}</div></section>
      <section className="public-process" id="cara-sewa"><div className="public-process-intro"><p className="eyebrow">Semudah itu</p><h2>Dari ide menjadi<br /><em>kenyataan.</em></h2><p>Tanpa proses yang rumit. Pilih gear, tentukan tanggal, dan biarkan kami menyiapkan sisanya.</p><button className="secondary-button" onClick={() => onNavigate('customer-catalog')}>Mulai eksplorasi <ArrowUpRight size={15} /></button></div><div className="process-steps"><div><span>01</span><CalendarDays size={21} /><h3>Pilih tanggal</h3><p>Tentukan kapan kamu membutuhkan kamera dan berapa lama.</p></div><div><span>02</span><Camera size={21} /><h3>Pilih kamera</h3><p>Temukan gear yang sesuai dengan kebutuhan ceritamu.</p></div><div><span>03</span><Check size={21} /><h3>Siap berkarya</h3><p>Ambil kamera, buat sesuatu yang berarti, dan kembalikan dengan mudah.</p></div></div></section>
      <section className="public-quote" id="tentang"><span className="quote-mark">“</span><blockquote>Alat yang tepat tidak membuat cerita menjadi lebih baik. Tapi ia membantu cerita itu sampai kepada orang yang tepat.</blockquote><span className="quote-caption">— Prinsip kami di Kamera Kita</span></section>
      <footer className="public-footer">
        <div className="public-footer-grid">
          <div className="public-footer-brand">
            <Logo />
            <p>Gear pilihan untuk produksi film, konten kreatif, dan momen berharga. Proses sederhana, transparan, dan siap bantu mewujudkan ceritamu.</p>
          </div>
          <div className="public-footer-col">
            <h4>Eksplorasi</h4>
            <button onClick={() => document.getElementById('koleksi')?.scrollIntoView({ behavior: 'smooth' })}>Koleksi</button>
            <button onClick={() => document.getElementById('cara-sewa')?.scrollIntoView({ behavior: 'smooth' })}>Cara sewa</button>
            <button onClick={() => document.getElementById('tentang')?.scrollIntoView({ behavior: 'smooth' })}>Tentang kami</button>
          </div>
          <div className="public-footer-col">
            <h4>Akun</h4>
            <button onClick={() => router.get('/login')}>Masuk pelanggan</button>
            <button onClick={() => onNavigate('customer-catalog')}>Jelajahi katalog</button>
            <button onClick={() => router.get('/admin/login')}>Halaman admin</button>
          </div>
        </div>
        <div className="public-footer-bar">
          <span>© 2026 Kamera Kita</span>
          <span>Dibuat untuk para pembuat cerita</span>
        </div>
      </footer>
    </div>
  );
}

function Topbar({ onMenu, role, active }) {
  const labels = {
    overview: 'Overview',
    catalog: 'Katalog kamera',
    rentals: 'Penyewaan',
    customers: 'Pelanggan',
    inventory: 'Inventaris',
    settings: 'Pengaturan',
    help: 'Pusat bantuan',
    'customer-home': 'Dashboard',
    'customer-catalog': 'Cari kamera',
    'customer-rentals': 'Sewa saya',
    'customer-profile': 'Profil saya',
  };
  return (
    <header className="topbar">
      <IconButton label="Buka navigasi" onClick={onMenu}><Menu size={20} /></IconButton>
      <div className="breadcrumb"><span>{role === 'customer' ? 'Akun pelanggan' : 'Workspace admin'}</span><b>/</b><strong>{labels[active] || (role === 'customer' ? 'Dashboard' : 'Overview')}</strong></div>
      <div className="topbar-actions">
        <button className="date-chip"><CalendarDays size={16} /> 18 — 24 Sep 2024 <ChevronDown size={14} /></button>
        <IconButton label="Notifikasi"><Bell size={19} /></IconButton>
        <span className="topbar-avatar">{role === 'customer' ? 'NP' : 'AR'}</span>
      </div>
    </header>
  );
}

function StatCard({ label, value, detail, trend, icon: StatIcon, tone }) {
  return (
    <article className={`stat-card ${tone}`}>
      <div className="stat-card-head"><span className="stat-icon"><StatIcon size={18} /></span><span className="stat-period">7 hari terakhir</span></div>
      <p>{label}</p>
      <strong>{value}</strong>
      <div className="stat-detail"><span className="trend"><ArrowUpRight size={14} /> {trend}</span> <span>{detail}</span></div>
    </article>
  );
}

function StatusBadge({ status }) {
  const statusClass = status.toLowerCase().replaceAll(' ', '-');
  return <span className={`status-badge ${statusClass}`}><i />{status}</span>;
}

function Overview({ onNavigate }) {
  return (
    <>
      <section className="page-heading">
        <div><p className="eyebrow">Rabu, 18 September 2024</p><h1>Selamat pagi, Ardi.</h1><p className="heading-subtitle">Berikut ringkasan operasional rental kamu hari ini.</p></div>
        <button className="primary-button" onClick={() => onNavigate('catalog')}><Plus size={17} /> Tambah kamera</button>
      </section>
      <section className="stats-grid">
        <StatCard label="Penyewaan aktif" value="12" trend="+18%" detail="vs minggu lalu" icon={CalendarDays} tone="accent" />
        <StatCard label="Menunggu persetujuan" value="3" trend="+2" detail="sejak kemarin" icon={Clock3} tone="warm" />
        <StatCard label="Total pendapatan" value="Rp 8,4 jt" trend="+12,4%" detail="vs minggu lalu" icon={Sparkles} tone="neutral" />
        <StatCard label="Kamera tersedia" value="24 / 31" trend="77%" detail="dari total unit" icon={Camera} tone="soft" />
      </section>
      <section className="content-grid">
        <article className="panel activity-panel">
          <div className="panel-heading"><div><h2>Aktivitas penyewaan</h2><p>Transaksi terbaru di workspace kamu.</p></div><button className="text-button" onClick={() => onNavigate('rentals')}>Lihat semua <ArrowUpRight size={15} /></button></div>
          <div className="table-wrap">
            <table><thead><tr><th>Pelanggan</th><th>Kamera</th><th>Periode sewa</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>{rentals.map((rental) => <tr key={rental.id}><td><div className="customer-cell"><span className="customer-avatar">{rental.initials}</span><span><b>{rental.customer}</b><small>{rental.id}</small></span></div></td><td>{rental.product}</td><td>{rental.dates}</td><td className="money">{formatCurrency(rental.total)}</td><td><StatusBadge status={rental.status} /></td></tr>)}</tbody>
            </table>
          </div>
        </article>
        <aside className="panel availability-panel">
          <div className="panel-heading"><div><h2>Stok populer</h2><p>Ketersediaan kamera.</p></div><button className="icon-button"><SlidersHorizontal size={17} /></button></div>
          <div className="availability-list">{cameras.slice(0, 4).map((camera) => <div className="availability-row" key={camera.id}><span className={`camera-thumb ${camera.tone}`}><Camera size={21} /></span><span className="availability-info"><b>{camera.name}</b><small>{camera.type}</small></span><span className={`stock-count ${camera.stock === 0 ? 'empty' : ''}`}>{camera.stock === 0 ? 'Habis' : `${camera.stock} unit`}</span></div>)}</div>
          <button className="secondary-button full-width" onClick={() => onNavigate('inventory')}>Kelola inventaris <ArrowUpRight size={15} /></button>
        </aside>
      </section>
      <section className="insight-banner"><span className="insight-icon"><Sparkles size={19} /></span><span><b>Insight minggu ini</b><small>Sony α7 IV paling banyak dilihat. Pertimbangkan menambah 1 unit untuk menangkap permintaan akhir pekan.</small></span><button className="text-button">Lihat detail <ArrowUpRight size={15} /></button></section>
    </>
  );
}

function Catalog({ onSelectCamera, cameras: cameraSource = cameras, canManage = false }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Semua');
  const [items, setItems] = useState(cameraSource);
  const [addOpen, setAddOpen] = useState(false);
  useEffect(() => { setItems(cameraSource); }, [cameraSource]);
  const filtered = useMemo(() => items.filter((camera) => (filter === 'Semua' || camera.status === filter) && camera.name.toLowerCase().includes(query.toLowerCase())), [items, query, filter]);
  return (
    <>
      <section className="page-heading compact"><div><p className="eyebrow">Inventaris produk</p><h1>Katalog kamera</h1><p className="heading-subtitle">Kelola koleksi kamera yang tersedia untuk disewa.</p></div>{canManage && <button className="primary-button" onClick={() => setAddOpen(true)}><Plus size={17} /> Tambah kamera</button>}</section>
      <section className="catalog-toolbar"><label className="search-field"><Search size={17} /><input placeholder="Cari nama kamera..." value={query} onChange={(event) => setQuery(event.target.value)} /></label><div className="filter-tabs">{['Semua', 'Tersedia', 'Terbatas', 'Disewa'].map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div><button className="filter-button"><SlidersHorizontal size={16} /> Filter</button></section>
      <section className="camera-grid">{filtered.map((camera) => <article className="camera-card" key={camera.id} onClick={() => onSelectCamera(camera)}><div className={`camera-image ${camera.tone}`}><span className="camera-tag">{camera.tag}</span><Camera size={76} strokeWidth={1.1} /><span className="camera-image-label">PHOTO / DEMO</span></div><div className="camera-card-body"><div className="camera-title"><div><h3>{camera.name}</h3><p>{camera.type}</p></div><button className="icon-button" aria-label={`Opsi ${camera.name}`}><MoreIcon /></button></div><div className="camera-card-foot"><span><b>{formatCurrency(camera.rate)}</b> <small>/ hari</small></span><StatusBadge status={camera.status} /></div></div></article>)}</section>
      {filtered.length === 0 && <div className="empty-state"><Search size={27} /><h2>Kamera tidak ditemukan</h2><p>Coba gunakan kata kunci atau filter yang berbeda.</p></div>}
      {addOpen && <AddCameraModal onClose={() => setAddOpen(false)} />}
    </>
  );
}

const emptyCameraForm = { name: '', type: 'Mirrorless', rate: '', stock: '1', status: 'Tersedia' };

function AddCameraModal({ onClose }) {
  const [values, setValues] = useState(emptyCameraForm);
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const update = (field) => (event) => setValues((current) => ({ ...current, [field]: event.target.value }));
  const submit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!values.name.trim()) nextErrors.name = 'Nama kamera wajib diisi.';
    if (!values.rate) nextErrors.rate = 'Harga sewa wajib diisi.';
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setProcessing(true);
    const payload = { name: values.name.trim(), type: values.type, rate: Number(values.rate), stock: Number(values.stock || 0), status: values.status };
    router.post('/admin/kamera', payload, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => {
        onClose();
      },
      onError: (serverErrors) => setErrors(serverErrors),
      onFinish: () => setProcessing(false),
    });
  };
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="camera-form-modal" role="dialog" aria-modal="true" aria-labelledby="add-camera-title" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Tutup"><X size={18} /></button>
        <div className="form-modal-head"><p className="eyebrow">Inventaris produk</p><h2 id="add-camera-title">Tambah kamera</h2><p>Lengkapi detail kamera baru untuk koleksi rental.</p></div>
        <form className="camera-form" onSubmit={submit} noValidate>
          <label className={`form-field ${errors.name ? 'has-error' : ''}`}><span>Nama kamera</span><input value={values.name} onChange={update('name')} placeholder="Contoh: Sony α7 IV" autoFocus />{errors.name && <small className="form-error">{errors.name}</small>}</label>
          <div className="camera-form-row">
            <label className="form-field"><span>Jenis kamera</span><select value={values.type} onChange={update('type')}>{['Mirrorless', 'DSLR', 'Cinema Camera', 'Action Camera', 'Lainnya'].map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
            <label className="form-field"><span>Status ketersediaan</span><select value={values.status} onChange={update('status')}>{['Tersedia', 'Terbatas', 'Disewa', 'Tidak tersedia'].map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
          </div>
          <div className="camera-form-row">
            <label className={`form-field ${errors.rate ? 'has-error' : ''}`}><span>Harga sewa / hari</span><input type="number" min="0" step="1000" inputMode="numeric" value={values.rate} onChange={update('rate')} placeholder="275000" />{errors.rate && <small className="form-error">{errors.rate}</small>}</label>
            <label className={`form-field ${errors.stock ? 'has-error' : ''}`}><span>Stok unit</span><input type="number" min="0" step="1" inputMode="numeric" value={values.stock} onChange={update('stock')} />{errors.stock && <small className="form-error">{errors.stock}</small>}</label>
          </div>
          <div className="camera-form-actions"><button type="button" className="secondary-button" onClick={onClose}>Batal</button><button type="submit" className="primary-button" disabled={processing}>{processing ? 'Menyimpan...' : 'Simpan kamera'}</button></div>
        </form>
      </div>
    </div>
  );
}

function MoreIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></svg>;
}

function Rentals() {
  const [active, setActive] = useState('Semua');
  const statuses = ['Semua', 'Menunggu persetujuan', 'Sedang disewa', 'Selesai'];
  const rows = active === 'Semua' ? rentals : rentals.filter((rental) => rental.status === active);
  return (
    <>
      <section className="page-heading compact"><div><p className="eyebrow">Operasional</p><h1>Penyewaan</h1><p className="heading-subtitle">Pantau dan proses seluruh pengajuan penyewaan.</p></div><button className="primary-button"><Plus size={17} /> Buat transaksi</button></section>
      <section className="panel rentals-panel"><div className="panel-heading"><div><h2>Semua transaksi</h2><p>{rentals.length} transaksi tercatat pada periode ini.</p></div><label className="search-field small"><Search size={16} /><input placeholder="Cari transaksi..." /></label></div><div className="filter-tabs table-tabs">{statuses.map((status) => <button key={status} className={active === status ? 'active' : ''} onClick={() => setActive(status)}>{status}</button>)}</div><div className="table-wrap"><table><thead><tr><th>ID transaksi</th><th>Pelanggan</th><th>Kamera</th><th>Periode</th><th>Total</th><th>Status</th><th /></tr></thead><tbody>{rows.map((rental) => <tr key={rental.id}><td className="mono">{rental.id}</td><td><div className="customer-cell"><span className="customer-avatar">{rental.initials}</span><b>{rental.customer}</b></div></td><td>{rental.product}</td><td>{rental.dates}</td><td className="money">{formatCurrency(rental.total)}</td><td><StatusBadge status={rental.status} /></td><td><button className="row-action"><MoreIcon /></button></td></tr>)}</tbody></table></div></section>
    </>
  );
}

const DEFAULT_SETTINGS = {
  nama_usaha: 'Kamera Kita',
  email: '',
  no_telepon: '',
  alamat: '',
  jam_buka: '09:00',
  jam_tutup: '20:00',
  durasi_minimum: 1,
  deposit: 0,
  denda_per_hari: 0,
  notifikasi_email: true,
  notifikasi_whatsapp: false,
  pengingat_pengembalian: true,
};

const SETTINGS_TABS = [
  { id: 'profil', label: 'Profil admin', icon: UserRound },
  { id: 'usaha', label: 'Informasi usaha', icon: Store },
  { id: 'kebijakan', label: 'Kebijakan sewa', icon: SlidersHorizontal },
  { id: 'notifikasi', label: 'Notifikasi', icon: Bell },
  { id: 'keamanan', label: 'Keamanan', icon: LockKeyhole },
];

const SETTINGS_FIELD_TAB = {
  nama_usaha: 'usaha',
  email: 'usaha',
  no_telepon: 'usaha',
  alamat: 'usaha',
  jam_buka: 'usaha',
  jam_tutup: 'usaha',
  durasi_minimum: 'kebijakan',
  deposit: 'kebijakan',
  denda_per_hari: 'kebijakan',
  notifikasi_email: 'notifikasi',
  notifikasi_whatsapp: 'notifikasi',
  pengingat_pengembalian: 'notifikasi',
};

const SETTINGS_CONTRACT = [
  {
    title: 'GET /admin/pengaturan',
    description: 'Props Inertia yang dipakai halaman. `settings` juga dibagikan lewat shared props untuk role admin.',
    code: `{
  "component": "App",
  "props": {
    "auth": { "user": { "id": 1, "name": "Admin Sewa Kamera", "phone": "081234567890", "address": "Kantor Sewa Kamera", "role": "admin" } },
    "settings": {
      "nama_usaha": "Kamera Kita",
      "email": "halo@kamerakita.id",
      "no_telepon": "081234567890",
      "alamat": "Jl. Contoh No. 1",
      "jam_buka": "09:00",
      "jam_tutup": "20:00",
      "durasi_minimum": 1,
      "deposit": 0,
      "denda_per_hari": 0,
      "notifikasi_email": true,
      "notifikasi_whatsapp": false,
      "pengingat_pengembalian": true
    },
    "flash": { "success": "Pengaturan workspace berhasil disimpan.", "error": null }
  }
}`,
  },
  {
    title: 'PATCH /admin/pengaturan',
    description: 'Menyimpan informasi usaha, kebijakan sewa, dan preferensi notifikasi. Respons sukses berupa redirect ke halaman Pengaturan dengan flash message.',
    code: `{
  "nama_usaha": "Kamera Kita",
  "email": "halo@kamerakita.id",
  "no_telepon": "081234567890",
  "alamat": "Jl. Contoh No. 1",
  "jam_buka": "09:00",
  "jam_tutup": "20:00",
  "durasi_minimum": 1,
  "deposit": 0,
  "denda_per_hari": 0,
  "notifikasi_email": true,
  "notifikasi_whatsapp": false,
  "pengingat_pengembalian": true
}`,
  },
  {
    title: 'PATCH /admin/pengaturan/profil',
    description: 'Memperbarui identitas admin yang sedang masuk. Nomor telepon harus unik dan mengikuti format nomor Indonesia.',
    code: `{
  "name": "Admin Sewa Kamera",
  "phone": "081234567890",
  "address": "Kantor Sewa Kamera"
}`,
  },
  {
    title: 'PUT /admin/pengaturan/password',
    description: 'Mengganti password admin. Password saat ini diverifikasi terhadap hash di tabel `pelanggan`.',
    code: `{
  "current_password": "password-lama",
  "password": "password-baru",
  "password_confirmation": "password-baru"
}`,
  },
];

function normalizeSettings(settings) {
  const merged = { ...DEFAULT_SETTINGS, ...(settings || {}) };
  return {
    ...merged,
    nama_usaha: merged.nama_usaha || 'Kamera Kita',
    email: merged.email || '',
    no_telepon: merged.no_telepon || '',
    alamat: merged.alamat || '',
    jam_buka: merged.jam_buka || '09:00',
    jam_tutup: merged.jam_tutup || '20:00',
    durasi_minimum: merged.durasi_minimum ?? 1,
    deposit: merged.deposit ?? 0,
    denda_per_hari: merged.denda_per_hari ?? 0,
  };
}

function ToggleField({ id, title, description, checked, onChange }) {
  return (
    <label className={`toggle-field ${checked ? 'is-on' : ''}`} htmlFor={id}>
      <span className="toggle-copy"><b>{title}</b><small>{description}</small></span>
      <span className="toggle-control">
        <input id={id} type="checkbox" checked={checked} onChange={onChange} />
        <span className="toggle-track" aria-hidden="true"><span /></span>
      </span>
    </label>
  );
}

function SettingsPasswordField({ id, label, value, onChange, error, hint, autoComplete }) {
  const [visible, setVisible] = useState(false);
  return (
    <label className={`form-field ${error ? 'has-error' : ''}`} htmlFor={id}>
      <span>{label}</span>
      <div className="settings-password-wrap">
        <input id={id} type={visible ? 'text' : 'password'} value={value} onChange={onChange} autoComplete={autoComplete} />
        <button type="button" className="settings-password-toggle" onClick={() => setVisible((current) => !current)} aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'}>
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <small className="form-error">{error}</small>}
      {!error && hint && <small className="settings-field-hint">{hint}</small>}
    </label>
  );
}

function ContractDocsModal({ onClose }) {
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="settings-docs" role="dialog" aria-modal="true" aria-labelledby="settings-docs-title" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Tutup dokumentasi"><X size={18} /></button>
        <div className="form-modal-head settings-docs-head">
          <p className="eyebrow">Kontrak data</p>
          <h2 id="settings-docs-title">Dokumentasi modul Pengaturan</h2>
          <p>Bentuk data dan endpoint yang dipakai halaman ini. Pertahankan kontrak ini saat memindahkan logika ke action Laravel lain.</p>
        </div>
        <div className="settings-docs-body">
          {SETTINGS_CONTRACT.map((section) => (
            <section className="settings-docs-section" key={section.title}>
              <h3>{section.title}</h3>
              <p>{section.description}</p>
              <pre><code>{section.code}</code></pre>
            </section>
          ))}
          <p className="settings-docs-note">Validasi gagal mengembalikan status 422 dengan key error sesuai nama field, sehingga form dapat menampilkan pesan di tab yang tepat.</p>
        </div>
      </div>
    </div>
  );
}

function Settings({ user, settings, flash }) {
  const [activeTab, setActiveTab] = useState('profil');
  const [values, setValues] = useState(() => normalizeSettings(settings));
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
  const [passwords, setPasswords] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [settingErrors, setSettingErrors] = useState({});
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [notice, setNotice] = useState(flash?.success || '');
  const [errorNotice, setErrorNotice] = useState(flash?.error || '');
  const [docsOpen, setDocsOpen] = useState(false);

  useEffect(() => {
    setValues(normalizeSettings(settings));
  }, [settings]);

  useEffect(() => {
    setProfile({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
  }, [user]);

  useEffect(() => {
    if (flash?.success) setNotice(flash.success);
    if (flash?.error) setErrorNotice(flash.error);
  }, [flash?.success, flash?.error]);

  const updateSetting = (field) => (event) => {
    const { type, checked, value } = event.target;
    setValues((current) => ({ ...current, [field]: type === 'checkbox' ? checked : value }));
  };

  const updateProfile = (field) => (event) => {
    setProfile((current) => ({ ...current, [field]: event.target.value }));
  };

  const updatePassword = (field) => (event) => {
    setPasswords((current) => ({ ...current, [field]: event.target.value }));
  };

  const showResponseNotice = (message) => {
    setNotice(message);
    setErrorNotice('');
  };

  const handleSettingsErrors = (serverErrors) => {
    setSettingErrors(serverErrors);
    const firstKey = Object.keys(serverErrors)[0];
    if (firstKey && SETTINGS_FIELD_TAB[firstKey]) setActiveTab(SETTINGS_FIELD_TAB[firstKey]);
  };

  const saveSettings = (event) => {
    event.preventDefault();
    setSettingErrors({});
    setNotice('');
    setErrorNotice('');
    setSavingSettings(true);
    router.patch('/admin/pengaturan', {
      nama_usaha: values.nama_usaha.trim(),
      email: values.email.trim() || null,
      no_telepon: values.no_telepon.trim() || null,
      alamat: values.alamat.trim() || null,
      jam_buka: values.jam_buka,
      jam_tutup: values.jam_tutup,
      durasi_minimum: Number(values.durasi_minimum),
      deposit: Number(values.deposit),
      denda_per_hari: Number(values.denda_per_hari),
      notifikasi_email: Boolean(values.notifikasi_email),
      notifikasi_whatsapp: Boolean(values.notifikasi_whatsapp),
      pengingat_pengembalian: Boolean(values.pengingat_pengembalian),
    }, {
      preserveScroll: true,
      onSuccess: () => showResponseNotice('Pengaturan workspace berhasil disimpan.'),
      onError: handleSettingsErrors,
      onFinish: () => setSavingSettings(false),
    });
  };

  const saveProfile = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!profile.name.trim()) nextErrors.name = 'Nama lengkap wajib diisi.';
    if (!profile.phone.trim()) nextErrors.phone = 'Nomor telepon wajib diisi.';
    if (!profile.address.trim()) nextErrors.address = 'Alamat wajib diisi.';
    setProfileErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setNotice('');
    setErrorNotice('');
    setSavingProfile(true);
    router.patch('/admin/pengaturan/profil', profile, {
      preserveScroll: true,
      onSuccess: () => showResponseNotice('Profil admin berhasil diperbarui.'),
      onError: (serverErrors) => setProfileErrors(serverErrors),
      onFinish: () => setSavingProfile(false),
    });
  };

  const savePassword = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!passwords.current_password) nextErrors.current_password = 'Password saat ini wajib diisi.';
    if (!passwords.password) nextErrors.password = 'Password baru wajib diisi.';
    else if (passwords.password.length < 8) nextErrors.password = 'Password baru minimal 8 karakter.';
    if (passwords.password !== passwords.password_confirmation) nextErrors.password_confirmation = 'Konfirmasi password baru harus sama.';
    setPasswordErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setNotice('');
    setErrorNotice('');
    setSavingPassword(true);
    router.put('/admin/pengaturan/password', passwords, {
      preserveScroll: true,
      onSuccess: () => {
        setPasswords({ current_password: '', password: '', password_confirmation: '' });
        showResponseNotice('Password berhasil diperbarui.');
      },
      onError: (serverErrors) => setPasswordErrors(serverErrors),
      onFinish: () => setSavingPassword(false),
    });
  };

  const handleTabKeyDown = (event) => {
    const tabs = Array.from(event.currentTarget.querySelectorAll('[role="tab"]'));
    const currentIndex = tabs.indexOf(document.activeElement);
    if (currentIndex === -1) return;
    let nextIndex = currentIndex;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = tabs.length - 1;
    else return;
    event.preventDefault();
    tabs[nextIndex].focus();
    setActiveTab(SETTINGS_TABS[nextIndex].id);
  };

  const fieldError = (field) => settingErrors[field];

  return (
    <>
      <section className="page-heading compact settings-heading">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>Pengaturan</h1>
          <p className="heading-subtitle">Kelola profil admin, informasi usaha, kebijakan sewa, dan preferensi operasional.</p>
        </div>
        <button className="secondary-button" onClick={() => setDocsOpen(true)}><FileText size={16} /> Dokumentasi kontrak</button>
      </section>

      {notice && <div className="settings-alert" role="status"><CircleCheck size={17} /><span>{notice}</span><button type="button" onClick={() => setNotice('')} aria-label="Tutup notifikasi"><X size={15} /></button></div>}
      {errorNotice && <div className="settings-alert is-error" role="alert"><AlertCircle size={17} /><span>{errorNotice}</span><button type="button" onClick={() => setErrorNotice('')} aria-label="Tutup notifikasi"><X size={15} /></button></div>}

      <section className="settings-shell">
        <nav className="settings-nav" role="tablist" aria-label="Bagian pengaturan" aria-orientation="vertical" onKeyDown={handleTabKeyDown}>
          {SETTINGS_TABS.map(({ id, label, icon: TabIcon }) => (
            <button
              key={id}
              role="tab"
              id={`settings-tab-${id}`}
              aria-selected={activeTab === id}
              aria-controls={`settings-panel-${id}`}
              tabIndex={activeTab === id ? 0 : -1}
              className={`settings-nav-item ${activeTab === id ? 'active' : ''}`}
              onClick={() => setActiveTab(id)}
            >
              <TabIcon size={17} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="settings-panel panel" role="tabpanel" id={`settings-panel-${activeTab}`} aria-labelledby={`settings-tab-${activeTab}`}>
          {activeTab === 'profil' && (
            <>
              <div className="settings-panel-head">
                <div><p className="eyebrow">Akun</p><h2>Profil admin</h2><p>Identitas yang dipakai untuk masuk dan berkomunikasi di workspace.</p></div>
                <span className="settings-badge"><ShieldCheck size={15} /> Administrator</span>
              </div>
              <form className="settings-form" onSubmit={saveProfile} noValidate>
                <div className="settings-form-grid">
                  <label className={`form-field ${profileErrors.name ? 'has-error' : ''}`}>
                    <span>Nama lengkap</span>
                    <input value={profile.name} onChange={updateProfile('name')} placeholder="Nama administrator" autoComplete="name" />
                    {profileErrors.name && <small className="form-error">{profileErrors.name}</small>}
                  </label>
                  <label className={`form-field ${profileErrors.phone ? 'has-error' : ''}`}>
                    <span>Nomor telepon</span>
                    <input value={profile.phone} onChange={updateProfile('phone')} placeholder="Contoh: 081234567890" inputMode="tel" autoComplete="tel" />
                    {profileErrors.phone && <small className="form-error">{profileErrors.phone}</small>}
                  </label>
                  <label className={`form-field settings-field-full ${profileErrors.address ? 'has-error' : ''}`}>
                    <span>Alamat</span>
                    <textarea rows="3" value={profile.address} onChange={updateProfile('address')} placeholder="Alamat lengkap admin" autoComplete="street-address" />
                    {profileErrors.address && <small className="form-error">{profileErrors.address}</small>}
                  </label>
                </div>
                <div className="settings-form-actions">
                  <span className="settings-hint">Nomor telepon dipakai untuk login ke area admin.</span>
                  <button type="submit" className="primary-button" disabled={savingProfile}><Save size={16} /> {savingProfile ? 'Menyimpan...' : 'Simpan profil'}</button>
                </div>
              </form>
            </>
          )}

          {activeTab === 'usaha' && (
            <>
              <div className="settings-panel-head">
                <div><p className="eyebrow">Identitas</p><h2>Informasi usaha</h2><p>Data ini menjadi acuan informasi rental yang ditampilkan ke pelanggan.</p></div>
                <span className="settings-badge"><Store size={15} /> Workspace</span>
              </div>
              <form className="settings-form" onSubmit={saveSettings} noValidate>
                <div className="settings-form-grid">
                  <label className={`form-field ${fieldError('nama_usaha') ? 'has-error' : ''}`}>
                    <span>Nama usaha</span>
                    <input value={values.nama_usaha} onChange={updateSetting('nama_usaha')} placeholder="Nama rental kamera" />
                    {fieldError('nama_usaha') && <small className="form-error">{fieldError('nama_usaha')}</small>}
                  </label>
                  <label className={`form-field ${fieldError('email') ? 'has-error' : ''}`}>
                    <span>Email operasional</span>
                    <input type="email" value={values.email} onChange={updateSetting('email')} placeholder="halo@kamerakita.id" autoComplete="email" />
                    {fieldError('email') && <small className="form-error">{fieldError('email')}</small>}
                  </label>
                  <label className={`form-field ${fieldError('no_telepon') ? 'has-error' : ''}`}>
                    <span>Nomor telepon usaha</span>
                    <input value={values.no_telepon} onChange={updateSetting('no_telepon')} placeholder="Contoh: 081234567890" inputMode="tel" autoComplete="tel" />
                    {fieldError('no_telepon') && <small className="form-error">{fieldError('no_telepon')}</small>}
                  </label>
                  <label className={`form-field ${fieldError('jam_buka') ? 'has-error' : ''}`}>
                    <span>Jam buka</span>
                    <input type="time" value={values.jam_buka} onChange={updateSetting('jam_buka')} />
                    {fieldError('jam_buka') && <small className="form-error">{fieldError('jam_buka')}</small>}
                  </label>
                  <label className={`form-field settings-field-full ${fieldError('alamat') ? 'has-error' : ''}`}>
                    <span>Alamat usaha</span>
                    <textarea rows="3" value={values.alamat} onChange={updateSetting('alamat')} placeholder="Alamat lengkap tempat pengambilan kamera" />
                    {fieldError('alamat') && <small className="form-error">{fieldError('alamat')}</small>}
                  </label>
                  <label className={`form-field ${fieldError('jam_tutup') ? 'has-error' : ''}`}>
                    <span>Jam tutup</span>
                    <input type="time" value={values.jam_tutup} onChange={updateSetting('jam_tutup')} />
                    {fieldError('jam_tutup') && <small className="form-error">{fieldError('jam_tutup')}</small>}
                  </label>
                  <div className="settings-note settings-field-full"><b>Catatan</b><span>Informasi ini belum otomatis tampil di halaman publik. Integrasikan ke komponen publik saat kontrak ditetapkan.</span></div>
                </div>
                <div className="settings-form-actions">
                  <span className="settings-hint">Perubahan berlaku untuk workspace ini.</span>
                  <button type="submit" className="primary-button" disabled={savingSettings}><Save size={16} /> {savingSettings ? 'Menyimpan...' : 'Simpan informasi'}</button>
                </div>
              </form>
            </>
          )}

          {activeTab === 'kebijakan' && (
            <>
              <div className="settings-panel-head">
                <div><p className="eyebrow">Operasional</p><h2>Kebijakan sewa</h2><p>Atur batas minimum dan komponen biaya tambahan untuk transaksi baru.</p></div>
                <span className="settings-badge"><SlidersHorizontal size={15} /> Rental</span>
              </div>
              <form className="settings-form" onSubmit={saveSettings} noValidate>
                <div className="settings-form-grid">
                  <label className={`form-field ${fieldError('durasi_minimum') ? 'has-error' : ''}`}>
                    <span>Durasi minimum (hari)</span>
                    <input type="number" min="1" max="365" step="1" inputMode="numeric" value={values.durasi_minimum} onChange={updateSetting('durasi_minimum')} />
                    {fieldError('durasi_minimum') && <small className="form-error">{fieldError('durasi_minimum')}</small>}
                  </label>
                  <label className={`form-field ${fieldError('deposit') ? 'has-error' : ''}`}>
                    <span>Deposit (Rp)</span>
                    <input type="number" min="0" step="1000" inputMode="numeric" value={values.deposit} onChange={updateSetting('deposit')} />
                    {fieldError('deposit') && <small className="form-error">{fieldError('deposit')}</small>}
                  </label>
                  <label className={`form-field ${fieldError('denda_per_hari') ? 'has-error' : ''}`}>
                    <span>Denda keterlambatan / hari (Rp)</span>
                    <input type="number" min="0" step="1000" inputMode="numeric" value={values.denda_per_hari} onChange={updateSetting('denda_per_hari')} />
                    {fieldError('denda_per_hari') && <small className="form-error">{fieldError('denda_per_hari')}</small>}
                  </label>
                  <div className="settings-note settings-field-full"><b>Catatan</b><span>Nilai ini menjadi acuan untuk transaksi baru. Tarif dan total pada transaksi yang sudah tercatat tidak berubah.</span></div>
                </div>
                <div className="settings-form-actions">
                  <span className="settings-hint">Pastikan kebijakan sudah disepakati sebelum disimpan.</span>
                  <button type="submit" className="primary-button" disabled={savingSettings}><Save size={16} /> {savingSettings ? 'Menyimpan...' : 'Simpan kebijakan'}</button>
                </div>
              </form>
            </>
          )}

          {activeTab === 'notifikasi' && (
            <>
              <div className="settings-panel-head">
                <div><p className="eyebrow">Preferensi</p><h2>Notifikasi</h2><p>Pilih kanal pengingat yang relevan untuk operasional rental.</p></div>
                <span className="settings-badge"><Bell size={15} /> Preferensi</span>
              </div>
              <form className="settings-form" onSubmit={saveSettings} noValidate>
                <div className="toggle-list">
                  <ToggleField id="notifikasi_email" title="Notifikasi email" description="Kirim ringkasan pengajuan dan perubahan status ke email operasional." checked={Boolean(values.notifikasi_email)} onChange={updateSetting('notifikasi_email')} />
                  <ToggleField id="notifikasi_whatsapp" title="Notifikasi WhatsApp" description="Aktifkan pengingat melalui WhatsApp bila integrasi kanal tersedia." checked={Boolean(values.notifikasi_whatsapp)} onChange={updateSetting('notifikasi_whatsapp')} />
                  <ToggleField id="pengingat_pengembalian" title="Pengingat pengembalian" description="Tampilkan pengingat untuk transaksi yang mendekati tanggal kembali." checked={Boolean(values.pengingat_pengembalian)} onChange={updateSetting('pengingat_pengembalian')} />
                </div>
                <div className="settings-note"><b>Catatan integrasi</b><span>Preferensi ini tersimpan di workspace. Pengiriman email atau WhatsApp aktual memerlukan konfigurasi layanan di backend.</span></div>
                <div className="settings-form-actions">
                  <span className="settings-hint">Preferensi dapat diubah kapan saja.</span>
                  <button type="submit" className="primary-button" disabled={savingSettings}><Save size={16} /> {savingSettings ? 'Menyimpan...' : 'Simpan notifikasi'}</button>
                </div>
              </form>
            </>
          )}

          {activeTab === 'keamanan' && (
            <>
              <div className="settings-panel-head">
                <div><p className="eyebrow">Akun</p><h2>Keamanan</h2><p>Ganti password administrator secara berkala untuk menjaga akses workspace.</p></div>
                <span className="settings-badge"><LockKeyhole size={15} /> Password</span>
              </div>
              <form className="settings-form" onSubmit={savePassword} noValidate>
                <div className="settings-form-grid">
                  <div className="settings-field-full">
                    <SettingsPasswordField id="current_password" label="Password saat ini" value={passwords.current_password} onChange={updatePassword('current_password')} error={passwordErrors.current_password} autoComplete="current-password" />
                  </div>
                  <SettingsPasswordField id="password" label="Password baru" value={passwords.password} onChange={updatePassword('password')} error={passwordErrors.password} hint="Minimal 8 karakter." autoComplete="new-password" />
                  <SettingsPasswordField id="password_confirmation" label="Konfirmasi password baru" value={passwords.password_confirmation} onChange={updatePassword('password_confirmation')} error={passwordErrors.password_confirmation} autoComplete="new-password" />
                </div>
                <div className="settings-note"><b>Tips keamanan</b><span>Gunakan kombinasi huruf, angka, dan simbol. Jangan bagikan password admin kepada pengguna lain.</span></div>
                <div className="settings-form-actions">
                  <span className="settings-hint">Sesi saat ini akan tetap aktif setelah password diperbarui.</span>
                  <button type="submit" className="primary-button" disabled={savingPassword}><Save size={16} /> {savingPassword ? 'Menyimpan...' : 'Perbarui password'}</button>
                </div>
              </form>
            </>
          )}
        </div>
      </section>

      {docsOpen && <ContractDocsModal onClose={() => setDocsOpen(false)} />}
    </>
  );
}

function Placeholder({ title }) {
  return <div className="placeholder panel"><span className="placeholder-icon"><Settings2 size={22} /></span><h1>{title}</h1><p>Modul ini disiapkan dalam struktur frontend MVP dan menunggu integrasi data Laravel.</p><button className="secondary-button">Lihat dokumentasi kontrak <ArrowUpRight size={15} /></button></div>;
}

function AuthBrand() {
  return <div className="auth-brand"><Logo /><span className="auth-brand-note">Gear untuk cerita yang berarti</span></div>;
}

function AuthInput({ id, label, icon: InputIcon, error, ...props }) {
  return (
    <label className={`auth-field ${error ? 'has-error' : ''}`} htmlFor={id}>
      <span>{label}</span>
      <div className="auth-input-wrap">
        {InputIcon && <InputIcon size={17} aria-hidden="true" />}
        <input id={id} {...props} />
      </div>
      {error && <small className="auth-error">{error}</small>}
    </label>
  );
}

function PasswordInput({ id, label, error, value, onChange, autoComplete }) {
  const [visible, setVisible] = useState(false);
  return (
    <label className={`auth-field ${error ? 'has-error' : ''}`} htmlFor={id}>
      <span>{label}</span>
      <div className="auth-input-wrap">
        <LockKeyhole size={17} aria-hidden="true" />
        <input id={id} type={visible ? 'text' : 'password'} value={value} onChange={onChange} autoComplete={autoComplete} placeholder="Masukkan password" />
        <button type="button" className="password-toggle" onClick={() => setVisible((current) => !current)} aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'}>
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      {error && <small className="auth-error">{error}</small>}
    </label>
  );
}

function AuthAside({ admin = false }) {
  return (
    <aside className="auth-aside">
      <div className="auth-aside-orbit orbit-one" />
      <div className="auth-aside-orbit orbit-two" />
      <div className="auth-aside-copy">
        <p className="eyebrow">{admin ? 'Area administrasi' : 'Koleksi yang siap dipakai'}</p>
        <h2>{admin ? <>Kelola operasional<br /><em>rental kamu.</em></> : <>Setiap cerita<br /><em>punya momennya.</em></>}</h2>
        <p>{admin ? 'Masuk untuk memantau penyewaan, mengelola katalog kamera, dan meninjau performa bisnis.' : 'Pilih kamera yang tepat untuk menjadikan ide kamu sesuatu yang bisa dilihat, dirasakan, dan diingat.'}</p>
      </div>
      <div className="auth-camera-art"><Camera size={166} strokeWidth={.65} /><span>CURATED<br />CAMERA KIT<br /><b>EST. 2024</b></span></div>
    </aside>
  );
}

function AuthPage({ mode, errors = {} }) {
  const isRegister = mode === 'register';
  const isAdmin = mode === 'admin-login';
  const [values, setValues] = useState({ name: '', phone: '', address: '', password: '', password_confirmation: '', remember: false });
  const [clientErrors, setClientErrors] = useState({});
  const [processing, setProcessing] = useState(false);

  const update = (field) => (event) => setValues((current) => ({ ...current, [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));
  const errorFor = (field) => clientErrors[field] || errors[field];
  const validate = () => {
    const next = {};
    const phonePattern = /^(?:\+62|62|0)8[1-9][0-9]{7,11}$/;
    if (isRegister && !values.name.trim()) next.name = 'Nama lengkap wajib diisi.';
    if (!values.phone.trim()) next.phone = 'Nomor telepon wajib diisi.';
    else if (!isAdmin && !phonePattern.test(values.phone.replace(/[\s-]/g, ''))) next.phone = 'Masukkan nomor telepon yang valid.';
    if (isRegister && !values.address.trim()) next.address = 'Alamat wajib diisi.';
    if (!values.password) next.password = 'Password wajib diisi.';
    else if (values.password.length < 8) next.password = 'Password minimal 8 karakter.';
    if (isRegister && values.password !== values.password_confirmation) next.password_confirmation = 'Konfirmasi password harus sama.';
    setClientErrors(next);
    return Object.keys(next).length === 0;
  };
  const submit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    setProcessing(true);
    const payload = { ...values, name: values.name.trim(), phone: values.phone.replace(/[\s-]/g, ''), address: values.address.trim() };
    router.post(isRegister ? '/register' : isAdmin ? '/admin/login' : '/login', payload, {
      preserveScroll: true,
      onFinish: () => setProcessing(false),
      onError: (serverErrors) => setClientErrors(serverErrors),
    });
  };

  return (
    <div className={`auth-page ${isAdmin ? 'admin-auth' : ''}`}>
      <AuthAside admin={isAdmin} />
      <main className="auth-main">
        <div className="auth-panel">
          <AuthBrand />
          <div className="auth-heading">
            <p className="eyebrow">{isRegister ? 'Mulai perjalananmu' : isAdmin ? 'Area administrasi' : 'Selamat datang kembali'}</p>
            <h1>{isRegister ? 'Buat Akun KameraKita' : isAdmin ? 'Masuk Admin' : 'Selamat Datang Kembali'}</h1>
            <p>{isRegister ? 'Daftar untuk menemukan dan menyewa kamera sesuai kebutuhanmu.' : isAdmin ? 'Masuk dengan akun administrator untuk mengelola workspace rental.' : 'Masuk ke akunmu untuk mengelola penyewaan kamera.'}</p>
          </div>
          <form className="auth-form" onSubmit={submit} noValidate>
            {isRegister && <AuthInput id="name" label="Nama Lengkap" icon={UserRound} value={values.name} onChange={update('name')} error={errorFor('name')} placeholder="Masukkan nama lengkap" autoComplete="name" />}
            <AuthInput id="phone" label="Nomor Telepon" icon={Phone} value={values.phone} onChange={update('phone')} error={errorFor('phone')} placeholder="Contoh: 081234567890" inputMode="tel" autoComplete="tel" />
            {isRegister && <AuthInput id="address" label="Alamat" value={values.address} onChange={update('address')} error={errorFor('address')} placeholder="Masukkan alamat lengkap" />}
            <PasswordInput id="password" label="Password" value={values.password} onChange={update('password')} error={errorFor('password')} autoComplete={isRegister ? 'new-password' : 'current-password'} />
            {isRegister && <PasswordInput id="password_confirmation" label="Konfirmasi Password" value={values.password_confirmation} onChange={update('password_confirmation')} error={errorFor('password_confirmation')} autoComplete="new-password" />}
            {!isRegister && <label className="remember-field"><input type="checkbox" checked={values.remember} onChange={update('remember')} /> <span>Ingat saya</span></label>}
            {errors.message && <p className="auth-form-error">{errors.message}</p>}
            <button className="primary-button auth-submit" type="submit" disabled={processing}>{processing ? 'Memproses...' : isRegister ? 'Buat Akun' : isAdmin ? 'Masuk sebagai admin' : 'Masuk'} <ArrowUpRight size={16} /></button>
          </form>
          {isRegister ? (
            <p className="auth-switch">Sudah punya akun? <button type="button" onClick={() => router.get('/login')}>Masuk</button></p>
          ) : isAdmin ? (
            <p className="auth-switch">Bukan admin? <button type="button" onClick={() => router.get('/login')}>Masuk sebagai pelanggan</button></p>
          ) : (
            <p className="auth-switch">Belum punya akun? <button type="button" onClick={() => router.get('/register')}>Daftar sekarang</button></p>
          )}
          {!isRegister && !isAdmin && (
            <p className="auth-admin-link">Administrator? <button type="button" onClick={() => router.get('/admin/login')}>Masuk admin</button></p>
          )}
          <button type="button" className="auth-back" onClick={() => router.get('/')}><ArrowUpRight size={15} /> Kembali ke halaman utama</button>
        </div>
      </main>
    </div>
  );
}

function App(props) {
  if (props.authPage) return <AuthPage mode={props.authPage} errors={props.errors} />;
  const currentUser = props.customer || props.auth?.user;
  const getRoute = () => window.location.pathname.replace(/\/+$/, '') || '/';
  const getRole = () => getRoute().startsWith('/pelanggan') ? 'customer' : 'admin';
  const getPage = (role) => {
    const route = getRoute();
    if (role === 'customer') {
      if (route === '/pelanggan/katalog') return 'customer-catalog';
      if (route === '/pelanggan/sewa') return 'customer-rentals';
      if (route === '/pelanggan/profil') return 'customer-profile';
      return 'customer-home';
    }
    if (route === '/admin/katalog') return 'catalog';
    if (route === '/admin/penyewaan') return 'rentals';
    if (route === '/admin/pelanggan') return 'customers';
    if (route === '/admin/inventaris') return 'inventory';
    if (route === '/admin/pengaturan') return 'settings';
    return 'overview';
  };
  const [active, setActive] = useState(() => getRoute() === '/' ? 'public-home' : getPage(getRole()));
  const [role, setRole] = useState(() => getRole());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const routeForPage = (page) => {
    const routes = {
      overview: '/admin',
      catalog: '/admin/katalog',
      rentals: '/admin/penyewaan',
      customers: '/admin/pelanggan',
      inventory: '/admin/inventaris',
      'customer-home': '/pelanggan',
      'customer-catalog': '/pelanggan/katalog',
      'customer-rentals': '/pelanggan/sewa',
      'customer-profile': '/pelanggan/profil',
      settings: '/admin/pengaturan',
      help: role === 'customer' ? '/pelanggan' : '/admin',
    };
    return routes[page] || (role === 'customer' ? '/pelanggan' : '/admin');
  };
  const navigate = (page) => {
    if (page === 'public-home') {
      window.history.pushState({ page }, '', '/');
      setActive(page);
      setSidebarOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const nextRole = page.startsWith('customer-') ? 'customer' : 'admin';
    const nextPage = nextRole === 'customer' && page === 'customer-catalog' ? 'customer-catalog' : page;
    window.history.pushState({ page: nextPage }, '', routeForPage(page));
    setRole(nextRole);
    setActive(nextPage);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  useEffect(() => {
    const handlePopState = () => {
      const nextRole = getRole();
      setRole(nextRole);
      setActive(getRoute() === '/' ? 'public-home' : getPage(nextRole));
      setSelectedCamera(null);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  let content = active === 'public-home' ? <PublicHome onNavigate={navigate} onSelectCamera={setSelectedCamera} /> : role === 'customer' ? <CustomerHome user={currentUser} rentals={props.rentals} onSelectCamera={setSelectedCamera} onNavigate={navigate} /> : <Overview onNavigate={navigate} />;
  if (role === 'customer' && active === 'customer-catalog') content = <CustomerCatalog onSelectCamera={setSelectedCamera} />;
  if (role === 'customer' && active === 'customer-rentals') content = <Placeholder title="Sewa saya" />;
  if (role === 'customer' && active === 'customer-profile') content = <Placeholder title="Profil saya" />;
  if (role === 'admin' && active === 'catalog') content = <Catalog onSelectCamera={setSelectedCamera} cameras={props.cameras} canManage />;
  if (active === 'rentals') content = <Rentals />;
  if (role === 'admin' && active === 'settings') content = <Settings user={currentUser} settings={props.settings} flash={props.flash} />;
  if (['customers', 'inventory', 'help'].includes(active)) content = <Placeholder title={active === 'customers' ? 'Pelanggan' : active === 'inventory' ? 'Inventaris' : 'Pusat bantuan'} />;
  return (
    <div className="app-shell">
      {active !== 'public-home' && <Sidebar user={currentUser} active={active} onChange={navigate} open={sidebarOpen} onClose={() => setSidebarOpen(false)} role={role} />}
      {sidebarOpen && <button className="sidebar-scrim" aria-label="Tutup navigasi" onClick={() => setSidebarOpen(false)} />}
      <main className={active === 'public-home' ? 'public-main' : 'main-content'}>{active !== 'public-home' && <Topbar role={role} active={active} onMenu={() => setSidebarOpen(true)} />}<div className={active === 'public-home' ? '' : 'page-content'}>{content}</div>{active !== 'public-home' && <footer className="app-footer">© 2026 Kamera Kita <span>•</span> Workspace operasional</footer>}</main>
      {selectedCamera && <div className="modal-scrim" onClick={() => setSelectedCamera(null)}><div className="camera-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setSelectedCamera(null)}><X size={18} /></button><div className={`modal-visual ${selectedCamera.tone}`}><Camera size={92} strokeWidth={1.05} /><span>PHOTO / DEMO</span></div><div className="modal-copy"><p className="eyebrow">{selectedCamera.type}</p><h2>{selectedCamera.name}</h2><p className="heading-subtitle">Kamera ini siap dipesan untuk kebutuhan produksi dan konten kamu.</p><div className="modal-rate"><b>{formatCurrency(selectedCamera.rate)}</b><span>/ hari</span></div><button className="primary-button full-width" onClick={() => setSelectedCamera(null)}><CalendarDays size={17} /> Pilih tanggal sewa</button></div></div></div>}
    </div>
  );
}

export default App;
