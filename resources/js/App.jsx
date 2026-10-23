import React, { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Plus,
  Search,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
  Eye,
  EyeOff,
  LockKeyhole,
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
      <span className="brand-mark"><Camera size={18} strokeWidth={2.4} /></span>
      <span>
        <strong>Sewa</strong>
        <em>Kamera</em>
      </span>
    </div>
  );
}

function Sidebar({ active, onChange, open, onClose, role, onRoleChange, user }) {
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
      <button className="workspace-switcher" onClick={() => onRoleChange(role === 'admin' ? 'customer' : 'admin')}>
        <span className="workspace-avatar">SK</span>
        <span><b>{role === 'customer' ? 'Akun pelanggan' : 'Studio Kamera'}</b><small>{role === 'customer' ? 'Ruang sewa pribadi' : 'Workspace admin'}</small></span>
        <ChevronDown size={15} />
        <span className="role-switch">Ganti</span>
      </button>
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
        <button className="nav-item" onClick={() => onChange('settings')}><Settings2 size={18} /><span>Pengaturan</span></button>
        <button className="nav-item" onClick={() => onChange('help')}><CircleHelp size={18} /><span>Pusat bantuan</span></button>
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
      <section className="public-quote" id="tentang"><span className="quote-mark">“</span><blockquote>Alat yang tepat tidak membuat cerita menjadi lebih baik. Tapi ia membantu cerita itu sampai kepada orang yang tepat.</blockquote><span className="quote-caption">— Prinsip kami di Sewa Kamera</span></section>
      <footer className="public-footer"><Logo /><span>© 2024 Sewa Kamera. Dibuat untuk para pembuat cerita.</span><div><button onClick={() => router.get('/login')}>Masuk pelanggan</button><button onClick={() => router.get('/login')}>Admin</button></div></footer>
    </div>
  );
}

function Topbar({ onMenu, role }) {
  return (
    <header className="topbar">
      <IconButton label="Buka navigasi" onClick={onMenu}><Menu size={20} /></IconButton>
      <div className="breadcrumb"><span>{role === 'customer' ? 'Akun pelanggan' : 'Workspace admin'}</span><b>/</b><strong>{role === 'customer' ? 'Dashboard' : 'Overview'}</strong></div>
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

function Catalog({ onSelectCamera }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Semua');
  const filtered = useMemo(() => cameras.filter((camera) => (filter === 'Semua' || camera.status === filter) && camera.name.toLowerCase().includes(query.toLowerCase())), [query, filter]);
  return (
    <>
      <section className="page-heading compact"><div><p className="eyebrow">Inventaris produk</p><h1>Katalog kamera</h1><p className="heading-subtitle">Kelola koleksi kamera yang tersedia untuk disewa.</p></div><button className="primary-button"><Plus size={17} /> Tambah kamera</button></section>
      <section className="catalog-toolbar"><label className="search-field"><Search size={17} /><input placeholder="Cari nama kamera..." value={query} onChange={(event) => setQuery(event.target.value)} /></label><div className="filter-tabs">{['Semua', 'Tersedia', 'Terbatas', 'Disewa'].map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div><button className="filter-button"><SlidersHorizontal size={16} /> Filter</button></section>
      <section className="camera-grid">{filtered.map((camera) => <article className="camera-card" key={camera.id} onClick={() => onSelectCamera(camera)}><div className={`camera-image ${camera.tone}`}><span className="camera-tag">{camera.tag}</span><Camera size={76} strokeWidth={1.1} /><span className="camera-image-label">PHOTO / DEMO</span></div><div className="camera-card-body"><div className="camera-title"><div><h3>{camera.name}</h3><p>{camera.type}</p></div><button className="icon-button" aria-label={`Opsi ${camera.name}`}><MoreIcon /></button></div><div className="camera-card-foot"><span><b>{formatCurrency(camera.rate)}</b> <small>/ hari</small></span><StatusBadge status={camera.status} /></div></div></article>)}</section>
      {filtered.length === 0 && <div className="empty-state"><Search size={27} /><h2>Kamera tidak ditemukan</h2><p>Coba gunakan kata kunci atau filter yang berbeda.</p></div>}
    </>
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

function AuthAside() {
  return (
    <aside className="auth-aside">
      <div className="auth-aside-orbit orbit-one" />
      <div className="auth-aside-orbit orbit-two" />
      <div className="auth-aside-copy">
        <p className="eyebrow">Koleksi yang siap dipakai</p>
        <h2>Setiap cerita<br /><em>punya momennya.</em></h2>
        <p>Pilih kamera yang tepat untuk menjadikan ide kamu sesuatu yang bisa dilihat, dirasakan, dan diingat.</p>
      </div>
      <div className="auth-camera-art"><Camera size={166} strokeWidth={.65} /><span>CURATED<br />CAMERA KIT<br /><b>EST. 2024</b></span></div>
    </aside>
  );
}

function AuthPage({ mode, errors = {} }) {
  const isRegister = mode === 'register';
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
    else if (!phonePattern.test(values.phone.replace(/[\s-]/g, ''))) next.phone = 'Masukkan nomor telepon yang valid.';
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
    router.post(isRegister ? '/register' : '/login', payload, {
      preserveScroll: true,
      onFinish: () => setProcessing(false),
      onError: (serverErrors) => setClientErrors(serverErrors),
    });
  };

  return (
    <div className="auth-page">
      <AuthAside />
      <main className="auth-main">
        <div className="auth-panel">
          <AuthBrand />
          <div className="auth-heading">
            <p className="eyebrow">{isRegister ? 'Mulai perjalananmu' : 'Selamat datang kembali'}</p>
            <h1>{isRegister ? 'Buat Akun KameraKita' : 'Selamat Datang Kembali'}</h1>
            <p>{isRegister ? 'Daftar untuk menemukan dan menyewa kamera sesuai kebutuhanmu.' : 'Masuk ke akunmu untuk mengelola penyewaan kamera.'}</p>
          </div>
          <form className="auth-form" onSubmit={submit} noValidate>
            {isRegister && <AuthInput id="name" label="Nama Lengkap" icon={UserRound} value={values.name} onChange={update('name')} error={errorFor('name')} placeholder="Masukkan nama lengkap" autoComplete="name" />}
            <AuthInput id="phone" label="Nomor Telepon" icon={Phone} value={values.phone} onChange={update('phone')} error={errorFor('phone')} placeholder="Contoh: 081234567890" inputMode="tel" autoComplete="tel" />
            {isRegister && <AuthInput id="address" label="Alamat" value={values.address} onChange={update('address')} error={errorFor('address')} placeholder="Masukkan alamat lengkap" />}
            <PasswordInput id="password" label="Password" value={values.password} onChange={update('password')} error={errorFor('password')} autoComplete={isRegister ? 'new-password' : 'current-password'} />
            {isRegister && <PasswordInput id="password_confirmation" label="Konfirmasi Password" value={values.password_confirmation} onChange={update('password_confirmation')} error={errorFor('password_confirmation')} autoComplete="new-password" />}
            {!isRegister && <label className="remember-field"><input type="checkbox" checked={values.remember} onChange={update('remember')} /> <span>Ingat saya</span></label>}
            {errors.message && <p className="auth-form-error">{errors.message}</p>}
            <button className="primary-button auth-submit" type="submit" disabled={processing}>{processing ? 'Memproses...' : isRegister ? 'Buat Akun' : 'Masuk'} <ArrowUpRight size={16} /></button>
          </form>
          <p className="auth-switch">{isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'} <button type="button" onClick={() => router.get(isRegister ? '/login' : '/register')}>{isRegister ? 'Masuk' : 'Daftar sekarang'}</button></p>
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
      settings: role === 'customer' ? '/pelanggan/profil' : '/admin',
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
  if (role === 'admin' && active === 'catalog') content = <Catalog onSelectCamera={setSelectedCamera} />;
  if (active === 'rentals') content = <Rentals />;
  if (['customers', 'inventory', 'settings', 'help'].includes(active)) content = <Placeholder title={active === 'customers' ? 'Pelanggan' : active === 'inventory' ? 'Inventaris' : active === 'help' ? 'Pusat bantuan' : 'Pengaturan'} />;
  return (
    <div className="app-shell">
      {active !== 'public-home' && <Sidebar user={currentUser} active={active} onChange={navigate} open={sidebarOpen} onClose={() => setSidebarOpen(false)} role={role} onRoleChange={() => navigate(role === 'admin' ? 'customer-home' : 'overview')} />}
      {sidebarOpen && <button className="sidebar-scrim" aria-label="Tutup navigasi" onClick={() => setSidebarOpen(false)} />}
      <main className={active === 'public-home' ? 'public-main' : 'main-content'}>{active !== 'public-home' && <Topbar role={role} onMenu={() => setSidebarOpen(true)} />}<div className={active === 'public-home' ? '' : 'page-content'}>{content}</div>{active !== 'public-home' && <footer>© 2024 Sewa Kamera <span>•</span> Data di halaman ini adalah demonstrasi frontend.</footer>}</main>
      {selectedCamera && <div className="modal-scrim" onClick={() => setSelectedCamera(null)}><div className="camera-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setSelectedCamera(null)}><X size={18} /></button><div className={`modal-visual ${selectedCamera.tone}`}><Camera size={92} strokeWidth={1.05} /><span>PHOTO / DEMO</span></div><div className="modal-copy"><p className="eyebrow">{selectedCamera.type}</p><h2>{selectedCamera.name}</h2><p className="heading-subtitle">Kamera ini siap dipesan untuk kebutuhan produksi dan konten kamu.</p><div className="modal-rate"><b>{formatCurrency(selectedCamera.rate)}</b><span>/ hari</span></div><button className="primary-button full-width" onClick={() => setSelectedCamera(null)}><CalendarDays size={17} /> Pilih tanggal sewa</button></div></div></div>}
    </div>
  );
}

export default App;
