import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  RefreshCw,
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

const formatLongDate = (date = new Date()) =>
  new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);

const greetingForTime = (date = new Date()) => {
  const hour = date.getHours();
  if (hour < 11) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 19) return 'Selamat sore';
  return 'Selamat malam';
};

const formatDateRange = (date = new Date()) => {
  const start = new Date(date);
  start.setDate(date.getDate() - 6);
  const sameMonth = start.getMonth() === date.getMonth() && start.getFullYear() === date.getFullYear();
  const startLabel = new Intl.DateTimeFormat('id-ID', sameMonth ? { day: 'numeric' } : { day: 'numeric', month: 'short' }).format(start);
  const endLabel = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
  return `${startLabel} — ${endLabel}`;
};

const toDateInputValue = (date = new Date()) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const parseDateInput = (value) => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDateInput = (value) => {
  const date = parseDateInput(value);
  return date ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(date) : '';
};

const rentalDuration = (start, end) => {
  const startDate = parseDateInput(start);
  const endDate = parseDateInput(end);
  if (!startDate || !endDate || endDate < startDate) return 0;
  return Math.round((endDate - startDate) / 86400000) + 1;
};

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

function Sidebar({ active, onChange, open, onClose, role, user, rentalCount = 0, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const displayName = user?.name || (role === 'customer' ? 'Pelanggan' : 'Ardi Rahman');
  useEffect(() => {
    if (!menuOpen) return undefined;
    const handlePointer = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
    };
    const handleKey = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [menuOpen]);
  useEffect(() => {
    setMenuOpen(false);
  }, [active]);
  const menuLogout = () => {
    setMenuOpen(false);
    onLogout();
  };
  const nav = role === 'customer'
    ? [
      { id: 'customer-home', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'customer-catalog', label: 'Cari kamera', icon: Camera },
      { id: 'customer-rentals', label: 'Sewa saya', icon: CalendarDays, count: rentalCount },
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
        <div className="profile-menu" ref={menuRef}>
          <button type="button" className="profile-row" aria-haspopup="menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>
            <span className="profile-avatar">{getInitials(displayName)}</span>
            <span><b>{displayName}</b><small>{role === 'customer' ? 'Pelanggan' : 'Administrator'}</small></span>
            <ChevronDown size={15} />
          </button>
          {menuOpen && (
            <div className="profile-menu-panel" role="menu" aria-label="Menu akun">
              <button type="button" className="profile-menu-item danger" role="menuitem" onClick={menuLogout}><LogOut size={15} /> Keluar</button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function getInitials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function LogoutConfirmModal({ role, processing, onClose, onConfirm }) {
  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape' && !processing) onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [processing, onClose]);

  return (
    <div className="modal-scrim" onClick={processing ? undefined : onClose}>
      <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="logout-confirm-title" aria-describedby="logout-confirm-desc" onClick={(event) => event.stopPropagation()}>
        <span className="confirm-icon"><LogOut size={22} /></span>
        <p className="eyebrow">Konfirmasi keluar</p>
        <h2 id="logout-confirm-title">Keluar dari akun?</h2>
        <p id="logout-confirm-desc">
          {role === 'customer'
            ? 'Kamu akan keluar dari akun pelanggan. Pengajuan sewa yang sudah dikirim tetap tersimpan dan bisa kamu pantau setelah masuk kembali.'
            : 'Kamu akan keluar dari workspace admin. Pastikan semua perubahan sudah tersimpan sebelum meninggalkan halaman ini.'}
        </p>
        <div className="confirm-dialog-actions">
          <button type="button" className="secondary-button" onClick={onClose} disabled={processing} autoFocus>Tetap di sini</button>
          <button type="button" className="primary-button danger-button" onClick={onConfirm} disabled={processing}>{processing ? 'Keluar...' : 'Ya, keluar'}</button>
        </div>
      </div>
    </div>
  );
}

function CustomerHome({ onSelectCamera, onNavigate, user, rentals = [], cameras: cameraSource = cameras }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('Semua');
  const filtered = cameraSource.filter((camera) => (selected === 'Semua' || camera.status === selected) && camera.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="customer-dashboard">
      <section className="page-heading customer-heading">
        <div><p className="eyebrow">Akun pelanggan</p><h1>Halo, {user?.name?.split(' ')[0] || 'Pelanggan'}.</h1><p className="heading-subtitle">Siap menyiapkan produksi berikutnya?</p></div>
        <button className="primary-button" onClick={() => onNavigate('customer-catalog')}><Search size={17} /> Cari kamera</button>
      </section>
      <section className="customer-stats">
        <article className="customer-stat accent"><span className="customer-stat-icon"><CalendarDays size={18} /></span><span><small>Sewa aktif</small><strong>{rentals.filter((rental) => !['Selesai', 'Ditolak', 'Dibatalkan'].includes(rental.status)).length}</strong></span><b>{rentals[0]?.status || 'Belum ada sewa'}</b></article>
        <article className="customer-stat"><span className="customer-stat-icon"><Clock3 size={18} /></span><span><small>Total penyewaan</small><strong>{rentals.length}</strong></span><b>Sejak bergabung</b></article>
        <article className="customer-stat warm"><span className="customer-stat-icon"><Sparkles size={18} /></span><span><small>Total pengeluaran</small><strong>{formatCurrency(rentals.filter((rental) => rental.status === 'Selesai').reduce((total, rental) => total + rental.total, 0))}</strong></span><b>Transaksi selesai</b></article>
      </section>
      <section className="customer-dashboard-grid">
        <article className="panel next-rental-panel">
          <div className="panel-heading"><div><p className="eyebrow">Pesanan terbaru</p><h2>Permintaan sedang diproses</h2></div><StatusBadge status={rentals[0]?.status || 'Menunggu persetujuan'} /></div>
          {rentals[0] ? <div className="next-rental-body"><div className={`customer-rental-visual ${rentals[0].tone}`}><Camera size={58} strokeWidth={1.1} /><span>PHOTO / DEMO</span></div><div className="next-rental-copy"><h3>{rentals[0].product}</h3><p>{rentals[0].dates}</p><div className="rental-meta"><span><CalendarDays size={14} /> Rental</span><span><b>{formatCurrency(rentals[0].total)}</b></span></div><button className="secondary-button" onClick={() => onNavigate('customer-rentals')}>Lihat detail <ArrowUpRight size={15} /></button></div></div> : <div className="empty-state"><h2>Belum ada penyewaan</h2><p>Jelajahi katalog untuk memulai penyewaan pertamamu.</p></div>}
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

function CustomerCatalog({ onSelectCamera, cameras: cameraSource = cameras, availability, onClearAvailability }) {
  return <Catalog onSelectCamera={onSelectCamera} cameras={availability ? availability.cameras : cameraSource} availability={availability} onClearAvailability={onClearAvailability} />;
}

const ACTIVE_RENTAL_STATUSES = ['Menunggu persetujuan', 'Disetujui', 'Sedang disewa'];
const CUSTOMER_RENTAL_FILTERS = ['Semua', 'Menunggu persetujuan', 'Disetujui', 'Sedang disewa', 'Selesai', 'Ditolak', 'Dibatalkan'];
const RENTAL_TIMELINE = ['Menunggu persetujuan', 'Disetujui', 'Sedang disewa', 'Selesai'];

const CUSTOMER_RENTAL_CONTRACT = [
  {
    title: 'GET /pelanggan/sewa',
    description: 'Props Inertia untuk halaman Sewa saya. `rentals` hanya berisi transaksi milik pelanggan yang sedang login, diurutkan dari tanggal sewa terbaru.',
    code: `{
  "component": "App",
  "props": {
    "auth": { "user": { "id": 2, "name": "Nadia Putri", "role": "customer" } },
    "customer": {
      "id": 2,
      "name": "Nadia Putri",
      "phone": "081298765432",
      "address": "Jl. Melati No. 10"
    },
    "rentals": [
      {
        "id": "SK-261024120000-ABCD",
        "product": "Sony α7 IV",
        "type": "Mirrorless",
        "startDate": "2026-10-24",
        "endDate": "2026-10-27",
        "dates": "24 Oct 2026 — 27 Oct 2026",
        "duration": 4,
        "rate": 275000,
        "total": 1100000,
        "status": "Sedang disewa",
        "statusCode": "sedang_disewa",
        "tone": "sand",
        "pickedUpAt": "24 Oct 2026 10:15",
        "returnedAt": null
      }
    ],
    "customerRentalSummary": {
      "total": 3,
      "active": 1,
      "pending": 0,
      "completed": 2,
      "total_spent": 1650000,
      "next_return_at": "27 Oct 2026"
    },
    "cameras": []
  }
}`,
  },
  {
    title: 'Aturan data',
    description: 'Halaman hanya membaca transaksi pelanggan sendiri. Ringkasan dihitung dari transaksi tersebut, bukan dari data demo frontend.',
    code: `rentals              = transaksi WHERE id_pelanggan = auth.user.id
urutan               = tanggal_sewa DESC, id_transaksi DESC
active               = menunggu_persetujuan | disetujui | sedang_disewa
pending              = menunggu_persetujuan
completed            = selesai
total_spent          = SUM(total_biaya) WHERE status_sewa = selesai
next_return_at       = tanggal_kembali terdekat pada status disetujui | sedang_disewa
rate                 = harga_sewa_saat_transaksi (tarif historis, bukan tarif produk saat ini)`,
  },
  {
    title: 'Status transaksi',
    description: 'Status disimpan pada kolom `status_sewa` dan ditampilkan dengan label Indonesia. Hanya admin yang mengubah persetujuan dan mencatat pengembalian.',
    code: `menunggu_persetujuan → Menunggu persetujuan
disetujui             → Disetujui
sedang_disewa         → Sedang disewa
selesai               → Selesai
ditolak               → Ditolak
dibatalkan            → Dibatalkan

Timeline pelanggan: Menunggu persetujuan → Disetujui → Sedang disewa → Selesai`,
  },
  {
    title: 'Batasan MVP',
    description: 'Modul ini hanya membaca riwayat. Pembatalan oleh pelanggan, unggah bukti pembayaran, dan pengingat pengembalian belum termasuk kontrak MVP.',
    code: `Tersedia:
GET   /pelanggan/sewa
POST  /sewa
PATCH /sewa/{id}/status   (khusus admin)

Belum tersedia:
PATCH /sewa/{id}/batal    (pelanggan)
POST  /sewa/{id}/bukti    (unggah bukti)`,
  },
];

function rentalStage(status) {
  return RENTAL_TIMELINE.indexOf(status);
}

function CustomerRentalDetailModal({ rental, onClose }) {
  const stage = rentalStage(rental.status);
  const cancelled = stage === -1;

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="customer-detail rental-detail" role="dialog" aria-modal="true" aria-labelledby="rental-detail-title" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Tutup detail penyewaan"><X size={18} /></button>
        <div className="customer-detail-head">
          <span className={`camera-thumb large ${rental.tone}`}><Camera size={24} /></span>
          <div><p className="eyebrow">Detail penyewaan</p><h2 id="rental-detail-title">{rental.product}</h2><StatusBadge status={rental.status} /></div>
        </div>
        <div className="customer-detail-meta">
          <div><span>Kode transaksi</span><b className="mono">{rental.id}</b></div>
          <div><span>Jenis kamera</span><b>{rental.type}</b></div>
          <div><span>Periode sewa</span><b>{rental.dates}</b></div>
          <div><span>Durasi</span><b>{rental.duration} hari</b></div>
          <div><span>Tarif harian saat transaksi</span><b>{formatCurrency(rental.rate)}</b></div>
          <div><span>Total biaya</span><b>{formatCurrency(rental.total)}</b></div>
          {rental.pickedUpAt && <div><span>Kamera diambil</span><b>{rental.pickedUpAt}</b></div>}
          {rental.returnedAt && <div><span>Kamera dikembalikan</span><b>{rental.returnedAt}</b></div>}
        </div>
        {cancelled ? (
          <div className="rental-timeline-cancelled"><AlertCircle size={17} /><span>Pengajuan ini {rental.status === 'Ditolak' ? 'ditolak oleh admin' : 'dibatalkan'}. Kamu tetap bisa mengajukan sewa baru dari katalog.</span></div>
        ) : (
          <ol className="rental-timeline">
            {RENTAL_TIMELINE.map((step, index) => (
              <li key={step} className={index < stage ? 'is-done' : index === stage ? 'is-current' : ''}>
                <span className="rental-timeline-dot">{index < stage ? <Check size={11} /> : index + 1}</span>
                <small>{step}</small>
              </li>
            ))}
          </ol>
        )}
        <p className="rental-detail-note">Total biaya dihitung dari durasi inklusif (tanggal sewa sampai tanggal kembali) dikali tarif harian yang tersimpan saat transaksi dibuat.</p>
      </div>
    </div>
  );
}

function CustomerRentals({ rentals = [], summary = {}, onNavigate }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Semua');
  const [selected, setSelected] = useState(null);
  const [docsOpen, setDocsOpen] = useState(false);

  const stats = useMemo(() => {
    const completed = rentals.filter((rental) => rental.status === 'Selesai');
    return {
      total: summary.total ?? rentals.length,
      active: summary.active ?? rentals.filter((rental) => ACTIVE_RENTAL_STATUSES.includes(rental.status)).length,
      pending: summary.pending ?? rentals.filter((rental) => rental.status === 'Menunggu persetujuan').length,
      completed: summary.completed ?? completed.length,
      totalSpent: summary.total_spent ?? completed.reduce((total, rental) => total + (rental.total || 0), 0),
      nextReturnAt: summary.next_return_at ?? null,
    };
  }, [rentals, summary]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rentals.filter((rental) => {
      const matchesFilter = filter === 'Semua' || rental.status === filter;
      const haystack = `${rental.id} ${rental.product} ${rental.type} ${rental.dates}`.toLowerCase();
      return matchesFilter && haystack.includes(needle);
    });
  }, [filter, query, rentals]);

  const metrics = [
    { label: 'Total penyewaan', value: stats.total, detail: 'Seluruh transaksi kamu', period: 'Sepanjang waktu', icon: FileText, tone: 'accent' },
    { label: 'Menunggu persetujuan', value: stats.pending, detail: 'Menunggu konfirmasi admin', period: 'Status pengajuan', icon: Clock3, tone: 'warm' },
    { label: 'Sedang berjalan', value: stats.active, detail: stats.nextReturnAt ? `Kembali ${stats.nextReturnAt}` : 'Pengajuan & sewa aktif', period: 'Status aktif', icon: CalendarDays, tone: 'neutral' },
    { label: 'Total pengeluaran', value: formatCurrency(stats.totalSpent), detail: `${stats.completed} transaksi selesai`, period: 'Sepanjang waktu', icon: Store, tone: 'soft' },
  ];

  return (
    <>
      <section className="page-heading compact customers-heading">
        <div><p className="eyebrow">Akun pelanggan</p><h1>Sewa saya</h1><p className="heading-subtitle">Pantau status pengajuan, jadwal, dan riwayat penyewaanmu di satu tempat.</p></div>
        <button className="secondary-button" onClick={() => setDocsOpen(true)}><FileText size={16} /> Dokumentasi kontrak</button>
      </section>

      <section className="stats-grid customer-metrics">
        {metrics.map(({ label, value, detail, period, icon: MetricIcon, tone }) => (
          <article className={`stat-card ${tone}`} key={label}>
            <div className="stat-card-head"><span className="stat-icon"><MetricIcon size={18} /></span><span className="stat-period">{period}</span></div>
            <p>{label}</p>
            <strong>{value}</strong>
            <div className="stat-detail"><span>{detail}</span></div>
          </article>
        ))}
      </section>

      <section className="catalog-toolbar customers-toolbar">
        <label className="search-field"><Search size={17} /><input placeholder="Cari kode, kamera, atau periode..." value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <div className="filter-tabs customers-tabs customer-rentals-tabs">{CUSTOMER_RENTAL_FILTERS.map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div>
      </section>

      <section className="panel customers-panel">
        <div className="panel-heading"><div><h2>Daftar penyewaan</h2><p>{filtered.length} dari {rentals.length} transaksi ditampilkan.</p></div><span className="settings-badge"><CalendarDays size={15} /> {stats.active} aktif</span></div>
        {filtered.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Kamera</th><th>Kode transaksi</th><th>Periode sewa</th><th>Durasi</th><th>Total</th><th>Status</th><th /></tr></thead>
              <tbody>
                {filtered.map((rental) => (
                  <tr key={rental.id}>
                    <td><div className="customer-cell"><span className={`camera-thumb ${rental.tone}`}><Camera size={17} /></span><span><b>{rental.product}</b><small>{rental.type}</small></span></div></td>
                    <td className="mono">{rental.id}</td>
                    <td>{rental.dates}</td>
                    <td>{rental.duration} hari</td>
                    <td className="money">{formatCurrency(rental.total)}</td>
                    <td><StatusBadge status={rental.status} /></td>
                    <td><button className="text-button" onClick={() => setSelected(rental)}>Detail <ArrowUpRight size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state customers-empty">
            <CalendarDays size={27} />
            <h2>{rentals.length === 0 ? 'Belum ada penyewaan' : 'Transaksi tidak ditemukan'}</h2>
            <p>{rentals.length === 0 ? 'Jelajahi katalog dan ajukan sewa pertamamu.' : 'Coba gunakan kata kunci atau filter status yang berbeda.'}</p>
            {rentals.length === 0 && <button className="primary-button" onClick={() => onNavigate('customer-catalog')}>Cari kamera <ArrowUpRight size={15} /></button>}
          </div>
        )}
      </section>

      {selected && <CustomerRentalDetailModal rental={selected} onClose={() => setSelected(null)} />}

      {docsOpen && (
        <ContractDocsModal
          onClose={() => setDocsOpen(false)}
          title="Dokumentasi modul Sewa saya"
          description="Bentuk data dan endpoint yang dipakai halaman ini. Semua transaksi difilter berdasarkan pelanggan yang sedang login."
          sections={CUSTOMER_RENTAL_CONTRACT}
          note="Halaman ini hanya membaca transaksi. Perubahan status persetujuan dan pencatatan pengembalian tetap dilakukan admin lewat PATCH /sewa/{id}/status."
        />
      )}
    </>
  );
}

function PublicHome({ onNavigate, onSelectCamera, onCheckAvailability, cameras: cameraSource = cameras }) {
  const today = toDateInputValue();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return toDateInputValue(date);
  });
  const [searchError, setSearchError] = useState('');
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const updateStartDate = (event) => {
    const value = event.target.value;
    setStartDate(value);
    setSearchError('');
    if (endDate && value && endDate < value) setEndDate(value);
  };

  const updateEndDate = (event) => {
    setEndDate(event.target.value);
    setSearchError('');
  };

  const submitAvailability = (event) => {
    event.preventDefault();

    if (!startDate) {
      setSearchError('Pilih tanggal mulai sewa terlebih dahulu.');
      return;
    }
    if (!endDate) {
      setSearchError('Pilih tanggal kembali terlebih dahulu.');
      return;
    }
    if (endDate < startDate) {
      setSearchError('Tanggal kembali tidak boleh sebelum tanggal mulai.');
      return;
    }

    setCheckingAvailability(true);
    setSearchError('');
    onCheckAvailability({ startDate, endDate });
  };

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
      <section className="public-search-strip">
        <div><p className="eyebrow">Mulai dari kebutuhanmu</p><h2>Kapan kamu butuh kamera?</h2></div>
        <div className="public-search-side">
          <form className="public-search-fields" onSubmit={submitAvailability} noValidate>
            <label>
              <CalendarDays size={17} />
              <span>
                <small>Tanggal mulai</small>
                <input type="date" min={today} value={startDate} onChange={updateStartDate} aria-label="Tanggal mulai" />
              </span>
            </label>
            <span className="search-divider" />
            <label>
              <CalendarDays size={17} />
              <span>
                <small>Tanggal kembali</small>
                <input type="date" min={startDate || today} value={endDate} onChange={updateEndDate} aria-label="Tanggal kembali" />
              </span>
            </label>
            <button type="submit" className="primary-button" disabled={checkingAvailability}>{checkingAvailability ? 'Memeriksa...' : <><Search size={17} /> Cek ketersediaan</>}</button>
          </form>
          {searchError && <p className="public-search-error" role="alert">{searchError}</p>}
        </div>
      </section>
      <section className="public-section" id="koleksi"><div className="public-section-heading"><div><p className="eyebrow">Pilihan kami</p><h2>Kamera yang siap<br /><em>menemani cerita.</em></h2></div><button className="text-button" onClick={() => onNavigate('customer-catalog')}>Lihat semua kamera <ArrowUpRight size={16} /></button></div><div className="featured-grid">{cameraSource.slice(0, 3).map((camera, index) => <article className={`featured-card featured-${index}`} key={camera.id} onClick={() => onSelectCamera(camera)}><div className={`featured-image ${camera.tone}`}><span>{camera.tag}</span><Camera size={100} strokeWidth={.85} /></div><div className="featured-card-copy"><div><h3>{camera.name}</h3><p>{camera.type}</p></div><b>{formatCurrency(camera.rate)}<small>/ hari</small></b></div></article>)}</div></section>
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

function AvailabilityResults({ availability, onSelectCamera, onNavigate }) {
  const [query, setQuery] = useState('');
  const cameras = availability?.cameras ?? [];
  const availableCameras = cameras.filter((camera) => camera.available !== false);
  const filtered = availableCameras.filter((camera) => camera.name.toLowerCase().includes(query.toLowerCase()));
  const period = availability ? `${formatDateInput(availability.startDate)} — ${formatDateInput(availability.endDate)}` : '';
  const duration = availability?.duration ?? 0;

  return (
    <div className="availability-page">
      <header className="availability-topbar">
        <Logo />
        <button className="text-button" onClick={() => onNavigate('public-home')}>Kembali ke beranda <ArrowUpRight size={15} /></button>
      </header>

      <section className="availability-hero">
        <p className="eyebrow">Hasil pengecekan ketersediaan</p>
        <h1>Kamera yang siap<br /><em>untuk tanggalmu.</em></h1>
        <p>{availableCameras.length > 0 ? `${availableCameras.length} kamera tidak sedang dibooking orang lain pada periode ini.` : 'Belum ada kamera yang bisa disewa pada periode ini.'}</p>
        <div className="availability-hero-meta">
          <span><CalendarDays size={15} /> {period}</span>
          <span><Clock3 size={15} /> {duration} hari sewa</span>
        </div>
      </section>

      <section className="availability-results-head">
        <div><h2>Daftar kamera tersedia</h2><p>Hanya kamera dengan sisa unit pada periode ini yang ditampilkan.</p></div>
        <div className="availability-results-actions">
          <label className="search-field"><Search size={17} /><input placeholder="Cari nama kamera..." value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <button className="secondary-button" onClick={() => onNavigate('public-home')}><CalendarDays size={16} /> Ubah tanggal</button>
        </div>
      </section>

      {filtered.length > 0 ? (
        <section className="camera-grid availability-grid">
          {filtered.map((camera) => (
            <article className="camera-card" key={camera.id} onClick={() => onSelectCamera(camera)}>
              <div className={`camera-image ${camera.tone}`}>
                <span className="camera-tag">Sisa {camera.availableStock} unit</span>
                <Camera size={76} strokeWidth={1.1} />
                <span className="camera-image-label">SIAP DISEWA</span>
              </div>
              <div className="camera-card-body">
                <div className="camera-title"><div><h3>{camera.name}</h3><p>{camera.type}</p></div></div>
                <div className="camera-card-foot">
                  <span><b>{formatCurrency(camera.rate)}</b> <small>/ hari</small></span>
                  <StatusBadge status={camera.status} />
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <div className="empty-state availability-empty">
          <CalendarDays size={27} />
          <h2>{availableCameras.length > 0 ? 'Kamera tidak ditemukan' : 'Belum ada kamera tersedia'}</h2>
          <p>{availableCameras.length > 0 ? 'Coba gunakan kata kunci lain.' : 'Semua kamera sudah dibooking pada periode ini. Coba pilih tanggal lain.'}</p>
          <button className="primary-button" onClick={() => onNavigate('public-home')}>Pilih tanggal lain</button>
        </div>
      )}
    </div>
  );
}

function Topbar({ onMenu, role, active, user, onLogout }) {
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);
  const displayName = user?.name || (role === 'customer' ? 'Pelanggan' : 'Admin');
  useEffect(() => {
    if (!accountOpen) return undefined;
    const handlePointer = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) setAccountOpen(false);
    };
    const handleKey = (event) => {
      if (event.key === 'Escape') setAccountOpen(false);
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [accountOpen]);
  useEffect(() => {
    setAccountOpen(false);
  }, [active]);
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
        <button className="date-chip"><CalendarDays size={16} /> {formatDateRange()} <ChevronDown size={14} /></button>
        <IconButton label="Notifikasi"><Bell size={19} /></IconButton>
        <div className="topbar-account" ref={accountRef}>
          <button type="button" className="topbar-avatar" aria-haspopup="menu" aria-expanded={accountOpen} aria-label={`Menu akun ${displayName}`} onClick={() => setAccountOpen((value) => !value)}>{getInitials(displayName)}</button>
          {accountOpen && (
            <div className="topbar-account-menu" role="menu" aria-label="Menu akun">
              <button type="button" className="topbar-account-item" role="menuitem" onClick={() => { setAccountOpen(false); onLogout(); }}><LogOut size={15} /> Keluar</button>
            </div>
          )}
        </div>
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

function InsightBanner() {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const load = async ({ refresh = false } = {}) => {
    if (refresh) setRefreshing(true); else setLoading(true);
    setError(false);
    try {
      const response = await fetch(`/admin/insight${refresh ? '?refresh=1' : ''}`, {
        headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'same-origin',
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setInsight(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const fallbackHeadline = loading ? 'Menyusun insight…' : 'Insight minggu ini';
  const fallbackSummary = loading
    ? 'Menganalisis data rental minggu ini…'
    : 'Insight belum bisa dimuat. Periksa koneksi lalu coba lagi.';

  return (
    <>
      <section className="insight-banner">
        <span className="insight-icon"><Sparkles size={19} /></span>
        <span>
          <b>{insight?.headline || fallbackHeadline}</b>
          <small className={loading ? 'is-loading' : ''}>{insight?.summary || fallbackSummary}</small>
        </span>
        <button type="button" className="text-button" onClick={() => (error && !insight ? load() : setDetailOpen(true))} disabled={loading && !insight}>
          {error && !insight ? 'Coba lagi' : 'Lihat detail'} <ArrowUpRight size={15} />
        </button>
      </section>
      {detailOpen && insight && (
        <InsightDetailModal
          insight={insight}
          refreshing={refreshing}
          onRefresh={() => load({ refresh: true })}
          onClose={() => setDetailOpen(false)}
        />
      )}
    </>
  );
}

function InsightDetailModal({ insight, refreshing, onRefresh, onClose }) {
  const metrics = insight.metrics || {};
  const generatedAt = insight.generated_at
    ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(insight.generated_at))
    : '';
  const cards = [
    { label: 'Penyewaan aktif', value: metrics.ongoing_rentals ?? 0 },
    { label: 'Menunggu persetujuan', value: metrics.pending_rentals ?? 0 },
    { label: 'Pendapatan 7 hari', value: formatCurrency(metrics.weekly_revenue ?? 0) },
    { label: 'Unit tersedia', value: `${metrics.available_units ?? 0} / ${metrics.total_units ?? 0}` },
  ];

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="insight-modal" role="dialog" aria-modal="true" aria-labelledby="insight-modal-title" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Tutup detail insight"><X size={18} /></button>
        <div className="insight-modal-head">
          <span className="insight-icon"><Sparkles size={19} /></span>
          <div>
            <p className="eyebrow">Insight minggu ini</p>
            <h2 id="insight-modal-title">{insight.headline}</h2>
            <p>{insight.summary}</p>
          </div>
        </div>
        <div className="insight-metric-grid">
          {cards.map((card) => <div key={card.label}><span>{card.label}</span><b>{card.value}</b></div>)}
        </div>
        <div className="insight-details">
          <h3>Yang perlu diperhatikan</h3>
          <ul>
            {insight.details.map((detail, index) => (
              <li key={index}><span>{index + 1}</span><p>{detail}</p></li>
            ))}
          </ul>
        </div>
        {insight.recommendation && (
          <div className="insight-recommendation"><b>Rekomendasi</b><p>{insight.recommendation}</p></div>
        )}
        <div className="insight-modal-foot">
          <small>{insight.source === 'groq' ? `Dibuat AI (${insight.model})` : 'Insight berbasis data internal'}{generatedAt ? ` · ${generatedAt}` : ''}</small>
          <button type="button" className="secondary-button" onClick={onRefresh} disabled={refreshing}>
            <RefreshCw size={15} className={refreshing ? 'spin' : ''} /> {refreshing ? 'Memperbarui…' : 'Perbarui insight'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Overview({ onNavigate, user }) {
  const firstName = user?.name?.trim().split(/\s+/)[0] || 'Admin';
  return (
    <>
      <section className="page-heading">
        <div><p className="eyebrow">{formatLongDate()}</p><h1>{greetingForTime()}, {firstName}.</h1><p className="heading-subtitle">Berikut ringkasan operasional rental kamu hari ini.</p></div>
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
      <InsightBanner />
    </>
  );
}

function Catalog({ onSelectCamera, cameras: cameraSource = cameras, canManage = false, availability = null, onClearAvailability }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Semua');
  const [items, setItems] = useState(cameraSource);
  const [addOpen, setAddOpen] = useState(false);
  useEffect(() => { setItems(cameraSource); }, [cameraSource]);
  useEffect(() => { setFilter('Semua'); }, [availability]);
  const filtered = useMemo(() => items.filter((camera) => (filter === 'Semua' || camera.status === filter) && camera.name.toLowerCase().includes(query.toLowerCase())), [items, query, filter]);
  const availableCount = availability ? availability.cameras.filter((camera) => camera.available !== false).length : 0;
  const filters = availability ? ['Semua', 'Tersedia', 'Terbatas', 'Tidak tersedia'] : ['Semua', 'Tersedia', 'Terbatas', 'Disewa'];
  return (
    <>
      <section className="page-heading compact"><div><p className="eyebrow">Inventaris produk</p><h1>Katalog kamera</h1><p className="heading-subtitle">{availability ? 'Kamera yang sudah dicek untuk periode pilihanmu.' : 'Kelola koleksi kamera yang tersedia untuk disewa.'}</p></div>{canManage && <button className="primary-button" onClick={() => setAddOpen(true)}><Plus size={17} /> Tambah kamera</button>}</section>
      {availability && (
        <section className="availability-notice">
          <span className="availability-notice-icon"><CalendarDays size={19} /></span>
          <div>
            <b>Ketersediaan {formatDateInput(availability.startDate)} — {formatDateInput(availability.endDate)}</b>
            <small>{availableCount} dari {availability.cameras.length} kamera tersedia untuk sewa {availability.duration} hari.</small>
          </div>
          {onClearAvailability && <button className="text-button" onClick={onClearAvailability}>Tampilkan semua <X size={14} /></button>}
        </section>
      )}
      <section className="catalog-toolbar"><label className="search-field"><Search size={17} /><input placeholder="Cari nama kamera..." value={query} onChange={(event) => setQuery(event.target.value)} /></label><div className="filter-tabs">{filters.map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div><button className="filter-button"><SlidersHorizontal size={16} /> Filter</button></section>
      <section className="camera-grid">{filtered.map((camera) => <article className={`camera-card${camera.available === false ? ' is-unavailable' : ''}`} key={camera.id} onClick={() => onSelectCamera(camera)}><div className={`camera-image ${camera.tone}`}><span className="camera-tag">{camera.tag}</span><Camera size={76} strokeWidth={1.1} /><span className="camera-image-label">PHOTO / DEMO</span></div><div className="camera-card-body"><div className="camera-title"><div><h3>{camera.name}</h3><p>{camera.type}</p></div><button className="icon-button" aria-label={`Opsi ${camera.name}`}><MoreIcon /></button></div><div className="camera-card-foot"><span><b>{formatCurrency(camera.rate)}</b> <small>/ hari</small></span><span className="camera-foot-status">{camera.availableStock !== undefined && <small>{camera.available ? `Sisa ${camera.availableStock} unit` : 'Tidak ada unit'}</small>}<StatusBadge status={camera.status} /></span></div></div></article>)}</section>
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

function ContractDocsModal({ onClose, title, description, sections, note }) {
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="settings-docs" role="dialog" aria-modal="true" aria-labelledby="contract-docs-title" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Tutup dokumentasi"><X size={18} /></button>
        <div className="form-modal-head settings-docs-head">
          <p className="eyebrow">Kontrak data</p>
          <h2 id="contract-docs-title">{title}</h2>
          <p>{description}</p>
        </div>
        <div className="settings-docs-body">
          {sections.map((section) => (
            <section className="settings-docs-section" key={section.title}>
              <h3>{section.title}</h3>
              <p>{section.description}</p>
              <pre><code>{section.code}</code></pre>
            </section>
          ))}
          {note && <p className="settings-docs-note">{note}</p>}
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

      {docsOpen && (
        <ContractDocsModal
          onClose={() => setDocsOpen(false)}
          title="Dokumentasi modul Pengaturan"
          description="Bentuk data dan endpoint yang dipakai halaman ini. Pertahankan kontrak ini saat memindahkan logika ke action Laravel lain."
          sections={SETTINGS_CONTRACT}
          note="Validasi gagal mengembalikan status 422 dengan key error sesuai nama field, sehingga form dapat menampilkan pesan di tab yang tepat."
        />
      )}
    </>
  );
}

const CUSTOMER_FILTERS = ['Semua', 'Sedang menyewa', 'Pernah menyewa', 'Belum pernah menyewa'];

const CUSTOMER_CONTRACT = [
  {
    title: 'GET /admin/pelanggan',
    description: 'Props Inertia untuk halaman Pelanggan. Hanya akun ber-role customer yang dikirim, diurutkan berdasarkan nama.',
    code: `{
  "component": "App",
  "props": {
    "auth": { "user": { "id": 1, "name": "Admin Sewa Kamera", "role": "admin" } },
    "customers": [
      {
        "id": 2,
        "name": "Nadia Putri",
        "phone": "081298765432",
        "address": "Jl. Melati No. 10",
        "joinedAt": "02 Oct 2026",
        "rentalCount": 2,
        "activeRentalCount": 1,
        "completedRentalCount": 1,
        "totalSpent": 550000,
        "lastRentalAt": "24 Oct 2026",
        "status": "Sedang menyewa",
        "tone": "sand",
        "rentals": [
          {
            "id": "SK-261024120000-ABCD",
            "product": "Sony α7 IV",
            "dates": "24 Oct 2026 — 27 Oct 2026",
            "duration": 4,
            "total": 1100000,
            "status": "Sedang disewa",
            "tone": "sand"
          }
        ]
      }
    ],
    "customerSummary": {
      "total": 12,
      "active": 3,
      "new_this_month": 2,
      "completed_revenue": 8450000
    }
  }
}`,
  },
  {
    title: 'Aturan agregasi',
    description: 'Nilai ringkasan dihitung dari relasi transaksi milik pelanggan, bukan dari data demo frontend.',
    code: `activeRentalCount   = transaksi berstatus menunggu_persetujuan | disetujui | sedang_disewa
completedRentalCount = transaksi berstatus selesai
totalSpent          = SUM(total_biaya) transaksi berstatus selesai
lastRentalAt        = tanggal_sewa transaksi terbaru
status pelanggan    = "Sedang menyewa" > "Pernah menyewa" > "Belum pernah menyewa"
rentals             = riwayat terbaru lebih dulu (tanggal_sewa DESC)`,
  },
  {
    title: 'Batasan MVP',
    description: 'Modul ini hanya membaca data pelanggan. Perubahan profil pelanggan dan penonaktifan akun belum termasuk kontrak MVP.',
    code: `Tersedia:
GET /admin/pelanggan

Belum tersedia:
POST   /admin/pelanggan
PATCH  /admin/pelanggan/{id}
DELETE /admin/pelanggan/{id}`,
  },
];

function Customers({ customers = [], summary = {} }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Semua');
  const [selected, setSelected] = useState(null);
  const [docsOpen, setDocsOpen] = useState(false);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return customers.filter((customer) => {
      const matchesFilter = filter === 'Semua' || customer.status === filter;
      const haystack = `${customer.name} ${customer.phone} ${customer.address}`.toLowerCase();
      return matchesFilter && haystack.includes(needle);
    });
  }, [customers, filter, query]);

  const metrics = [
    { label: 'Total pelanggan', value: summary.total ?? customers.length, detail: 'Akun pelanggan terdaftar', period: 'Sepanjang waktu', icon: Users, tone: 'accent' },
    { label: 'Sedang menyewa', value: summary.active ?? 0, detail: 'Penyewaan berjalan', period: 'Status aktif', icon: CalendarDays, tone: 'warm' },
    { label: 'Pelanggan baru', value: summary.new_this_month ?? 0, detail: 'Bergabung bulan ini', period: 'Bulan ini', icon: Sparkles, tone: 'neutral' },
    { label: 'Pendapatan selesai', value: formatCurrency(summary.completed_revenue ?? 0), detail: 'Transaksi berstatus selesai', period: 'Sepanjang waktu', icon: Store, tone: 'soft' },
  ];

  return (
    <>
      <section className="page-heading compact customers-heading">
        <div><p className="eyebrow">Basis pelanggan</p><h1>Pelanggan</h1><p className="heading-subtitle">Lihat profil, kontak, dan riwayat penyewaan pelanggan terdaftar.</p></div>
        <button className="secondary-button" onClick={() => setDocsOpen(true)}><FileText size={16} /> Dokumentasi kontrak</button>
      </section>

      <section className="stats-grid customer-metrics">
        {metrics.map(({ label, value, detail, period, icon: MetricIcon, tone }) => (
          <article className={`stat-card ${tone}`} key={label}>
            <div className="stat-card-head"><span className="stat-icon"><MetricIcon size={18} /></span><span className="stat-period">{period}</span></div>
            <p>{label}</p>
            <strong>{value}</strong>
            <div className="stat-detail"><span>{detail}</span></div>
          </article>
        ))}
      </section>

      <section className="catalog-toolbar customers-toolbar">
        <label className="search-field"><Search size={17} /><input placeholder="Cari nama, telepon, atau alamat..." value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <div className="filter-tabs customers-tabs">{CUSTOMER_FILTERS.map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div>
      </section>

      <section className="panel customers-panel">
        <div className="panel-heading"><div><h2>Daftar pelanggan</h2><p>{filtered.length} dari {customers.length} pelanggan ditampilkan.</p></div><span className="settings-badge"><Users size={15} /> {summary.total ?? customers.length} akun</span></div>
        {filtered.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Pelanggan</th><th>Kontak</th><th>Transaksi</th><th>Total belanja</th><th>Sewa terakhir</th><th>Status</th><th /></tr></thead>
              <tbody>
                {filtered.map((customer) => (
                  <tr key={customer.id}>
                    <td><div className="customer-cell"><span className="customer-avatar">{getInitials(customer.name)}</span><span><b>{customer.name}</b><small>ID #{customer.id}</small></span></div></td>
                    <td><div className="customer-contact"><b>{customer.phone}</b><small>{customer.address || 'Alamat belum diisi'}</small></div></td>
                    <td>{customer.rentalCount}</td>
                    <td className="money">{formatCurrency(customer.totalSpent)}</td>
                    <td>{customer.lastRentalAt || '—'}</td>
                    <td><StatusBadge status={customer.status} /></td>
                    <td><button className="text-button" onClick={() => setSelected(customer)}>Detail <ArrowUpRight size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state customers-empty"><Search size={27} /><h2>Pelanggan tidak ditemukan</h2><p>Coba gunakan kata kunci atau filter status yang berbeda.</p></div>
        )}
      </section>

      {selected && <CustomerDetailModal customer={selected} onClose={() => setSelected(null)} />}

      {docsOpen && (
        <ContractDocsModal
          onClose={() => setDocsOpen(false)}
          title="Dokumentasi modul Pelanggan"
          description="Bentuk data dan endpoint yang dipakai halaman ini. Ringkasan dihitung dari transaksi milik pelanggan, bukan data demo."
          sections={CUSTOMER_CONTRACT}
          note="Halaman ini hanya membaca data. Kontrak baru perlu ditambahkan ke routes/web.php sebelum dipakai frontend."
        />
      )}
    </>
  );
}

function CustomerDetailModal({ customer, onClose }) {
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="customer-detail" role="dialog" aria-modal="true" aria-labelledby="customer-detail-title" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Tutup detail pelanggan"><X size={18} /></button>
        <div className="customer-detail-head">
          <span className={`customer-avatar large ${customer.tone}`}>{getInitials(customer.name)}</span>
          <div><p className="eyebrow">Profil pelanggan</p><h2 id="customer-detail-title">{customer.name}</h2><StatusBadge status={customer.status} /></div>
        </div>
        <div className="customer-detail-meta">
          <div><span>Nomor telepon</span><b>{customer.phone}</b></div>
          <div><span>Alamat</span><b>{customer.address || '—'}</b></div>
          <div><span>Bergabung</span><b>{customer.joinedAt || '—'}</b></div>
          <div><span>Total belanja</span><b>{formatCurrency(customer.totalSpent)}</b></div>
        </div>
        <div className="customer-detail-stats">
          <span><b>{customer.rentalCount}</b>Total transaksi</span>
          <span><b>{customer.activeRentalCount}</b>Sedang berjalan</span>
          <span><b>{customer.completedRentalCount}</b>Selesai</span>
        </div>
        <div className="customer-detail-history">
          <div className="customer-detail-history-head"><h3>Riwayat penyewaan</h3><small>{customer.rentals.length} transaksi</small></div>
          {customer.rentals.length > 0 ? (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Kode</th><th>Kamera</th><th>Periode</th><th>Total</th><th>Status</th></tr></thead>
                <tbody>
                  {customer.rentals.map((rental) => (
                    <tr key={rental.id}>
                      <td className="mono">{rental.id}</td>
                      <td><div className="customer-cell"><span className={`camera-thumb ${rental.tone}`}><Camera size={17} /></span><b>{rental.product}</b></div></td>
                      <td>{rental.dates}</td>
                      <td className="money">{formatCurrency(rental.total)}</td>
                      <td><StatusBadge status={rental.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="customer-detail-empty"><CalendarDays size={22} /><p>Pelanggan ini belum memiliki transaksi penyewaan.</p></div>
          )}
        </div>
      </div>
    </div>
  );
}

const INVENTORY_FILTERS = ['Semua', 'Tersedia', 'Terbatas', 'Disewa', 'Tidak tersedia'];

const INVENTORY_CONTRACT = [
  {
    title: 'GET /admin/inventaris',
    description: 'Props Inertia untuk halaman Inventaris. Setiap baris mewakili satu jenis produk beserta jumlah unit yang sedang keluar hari ini.',
    code: `{
  "component": "App",
  "props": {
    "auth": { "user": { "id": 1, "name": "Admin Sewa Kamera", "role": "admin" } },
    "inventory": [
      {
        "id": 1,
        "name": "Sony α7 IV",
        "type": "Mirrorless",
        "rate": 275000,
        "stock": 3,
        "status": "Tersedia",
        "tone": "sand",
        "rentedUnits": 1,
        "availableUnits": 2,
        "utilization": 33,
        "nextReturnAt": "27 Oct 2026",
        "ongoingRentals": [
          {
            "id": "SK-261024120000-ABCD",
            "customer": "Nadia Putri",
            "dates": "24 Oct 2026 — 27 Oct 2026",
            "returnAt": "27 Oct 2026",
            "status": "Sedang disewa"
          }
        ]
      }
    ],
    "inventorySummary": {
      "total_products": 4,
      "total_units": 7,
      "rented_units": 1,
      "available_units": 6,
      "attention_products": 0,
      "daily_value": 2025000
    }
  }
}`,
  },
  {
    title: 'PATCH /admin/inventaris/{id}',
    description: 'Memperbarui stok fisik dan status ketersediaan satu produk. Respons sukses berupa redirect ke halaman Inventaris dengan flash message.',
    code: `{
  "stock": 3,
  "status": "Tersedia"
}`,
  },
  {
    title: 'Aturan ketersediaan',
    description: 'Unit dianggap keluar bila transaksi berstatus aktif dan periodenya mencakup hari ini. Stok tidak boleh turun di bawah jumlah unit yang sedang disewa.',
    code: `status aktif        = menunggu_persetujuan | disetujui | sedang_disewa
periode berjalan    = tanggal_sewa <= hari ini <= tanggal_kembali
rentedUnits         = jumlah transaksi aktif pada periode berjalan
availableUnits      = max(0, stok - rentedUnits)
attention_products  = produk dengan availableUnits = 0
daily_value         = SUM(stok × harga_sewa)`,
  },
  {
    title: 'Batasan MVP',
    description: 'Modul ini membaca inventaris dan memperbarui stok/status. Penghapusan produk, unggah foto, dan pencatatan unit per nomor seri belum termasuk kontrak MVP.',
    code: `Tersedia:
GET   /admin/inventaris
PATCH /admin/inventaris/{id}
POST  /admin/kamera

Belum tersedia:
DELETE /admin/inventaris/{id}
PATCH  /admin/inventaris/{id}/foto`,
  },
];

function Inventory({ items = [], summary = {}, flash }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Semua');
  const [selected, setSelected] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const [notice, setNotice] = useState(flash?.success || '');

  useEffect(() => {
    if (flash?.success) setNotice(flash.success);
  }, [flash?.success]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((camera) => {
      const matchesFilter = filter === 'Semua' || camera.status === filter;
      const haystack = `${camera.name} ${camera.type}`.toLowerCase();
      return matchesFilter && haystack.includes(needle);
    });
  }, [items, filter, query]);

  const metrics = [
    { label: 'Total unit', value: summary.total_units ?? 0, detail: `${summary.total_products ?? items.length} jenis kamera`, period: 'Seluruh inventaris', icon: Package, tone: 'accent' },
    { label: 'Unit tersedia', value: summary.available_units ?? 0, detail: 'Siap disewakan hari ini', period: 'Hari ini', icon: CircleCheck, tone: 'soft' },
    { label: 'Sedang disewa', value: summary.rented_units ?? 0, detail: 'Dari transaksi aktif', period: 'Hari ini', icon: CalendarDays, tone: 'warm' },
    { label: 'Potensi sewa / hari', value: formatCurrency(summary.daily_value ?? 0), detail: 'Stok × tarif harian', period: 'Estimasi', icon: Sparkles, tone: 'neutral' },
  ];

  return (
    <>
      <section className="page-heading compact inventory-heading">
        <div><p className="eyebrow">Ketersediaan unit</p><h1>Inventaris</h1><p className="heading-subtitle">Pantau stok fisik, unit yang sedang keluar, dan status ketersediaan kamera.</p></div>
        <div className="inventory-heading-actions">
          <button className="secondary-button" onClick={() => setDocsOpen(true)}><FileText size={16} /> Dokumentasi kontrak</button>
          <button className="primary-button" onClick={() => setAddOpen(true)}><Plus size={17} /> Tambah kamera</button>
        </div>
      </section>

      {notice && <div className="settings-alert" role="status"><CircleCheck size={17} /><span>{notice}</span><button type="button" onClick={() => setNotice('')} aria-label="Tutup notifikasi"><X size={15} /></button></div>}

      <section className="stats-grid inventory-metrics">
        {metrics.map(({ label, value, detail, period, icon: MetricIcon, tone }) => (
          <article className={`stat-card ${tone}`} key={label}>
            <div className="stat-card-head"><span className="stat-icon"><MetricIcon size={18} /></span><span className="stat-period">{period}</span></div>
            <p>{label}</p>
            <strong>{value}</strong>
            <div className="stat-detail"><span>{detail}</span></div>
          </article>
        ))}
      </section>

      <section className="catalog-toolbar inventory-toolbar">
        <label className="search-field"><Search size={17} /><input placeholder="Cari nama atau jenis kamera..." value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <div className="filter-tabs inventory-tabs">{INVENTORY_FILTERS.map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div>
      </section>

      <section className="panel inventory-panel">
        <div className="panel-heading"><div><h2>Stok kamera</h2><p>{filtered.length} dari {items.length} jenis kamera ditampilkan.</p></div><span className="settings-badge"><Package size={15} /> {summary.attention_products ?? 0} perlu perhatian</span></div>
        {filtered.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Kamera</th><th>Jenis</th><th>Tarif / hari</th><th>Stok</th><th>Disewa</th><th>Tersedia</th><th>Status</th><th /></tr></thead>
              <tbody>
                {filtered.map((camera) => (
                  <tr key={camera.id}>
                    <td><div className="customer-cell"><span className={`camera-thumb ${camera.tone}`}><Camera size={17} /></span><span><b>{camera.name}</b><small>ID #{camera.id}</small></span></div></td>
                    <td>{camera.type}</td>
                    <td className="money">{formatCurrency(camera.rate)}</td>
                    <td>{camera.stock}</td>
                    <td>{camera.rentedUnits}</td>
                    <td><b className={`inventory-available ${camera.availableUnits === 0 ? 'empty' : ''}`}>{camera.availableUnits}</b></td>
                    <td><StatusBadge status={camera.status} /></td>
                    <td><button className="text-button" onClick={() => setSelected(camera)}>Kelola <ArrowUpRight size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state customers-empty"><Search size={27} /><h2>Kamera tidak ditemukan</h2><p>Coba gunakan kata kunci atau filter status yang berbeda.</p></div>
        )}
      </section>

      {selected && <InventoryManageModal camera={selected} onClose={() => setSelected(null)} />}
      {addOpen && <AddCameraModal onClose={() => setAddOpen(false)} />}

      {docsOpen && (
        <ContractDocsModal
          onClose={() => setDocsOpen(false)}
          title="Dokumentasi modul Inventaris"
          description="Bentuk data dan endpoint yang dipakai halaman ini. Ketersediaan dihitung dari transaksi aktif, bukan dari data demo frontend."
          sections={INVENTORY_CONTRACT}
          note="Validasi gagal mengembalikan status 422 dengan key error sesuai nama field, sehingga form kelola inventaris dapat menampilkan pesan yang tepat."
        />
      )}
    </>
  );
}

function InventoryManageModal({ camera, onClose }) {
  const [values, setValues] = useState({ stock: String(camera.stock), status: camera.status });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const stock = Number(values.stock);
  const available = Number.isNaN(stock) ? camera.availableUnits : Math.max(0, stock - camera.rentedUnits);
  const update = (field) => (event) => setValues((current) => ({ ...current, [field]: event.target.value }));
  const submit = (event) => {
    event.preventDefault();
    if (!values.stock.trim() || Number.isNaN(stock) || stock < 0) {
      setErrors({ stock: 'Stok wajib diisi dengan angka 0 atau lebih.' });
      return;
    }
    setErrors({});
    setProcessing(true);
    router.patch(`/admin/inventaris/${camera.id}`, { stock, status: values.status }, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => onClose(),
      onError: (serverErrors) => setErrors(serverErrors),
      onFinish: () => setProcessing(false),
    });
  };

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="camera-form-modal inventory-manage" role="dialog" aria-modal="true" aria-labelledby="inventory-manage-title" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Tutup"><X size={18} /></button>
        <div className="form-modal-head"><p className="eyebrow">Kelola inventaris</p><h2 id="inventory-manage-title">{camera.name}</h2><p>Perbarui jumlah unit fisik dan status ketersediaan {camera.type.toLowerCase()}.</p></div>
        <div className="inventory-manage-stats">
          <span><small>Stok fisik</small><b>{camera.stock}</b></span>
          <span><small>Sedang disewa</small><b>{camera.rentedUnits}</b></span>
          <span><small>Tersedia</small><b>{available}</b></span>
        </div>
        {camera.ongoingRentals.length > 0 ? (
          <div className="inventory-manage-rentals">
            <div className="inventory-manage-rentals-head"><h3>Unit sedang keluar</h3><small>{camera.ongoingRentals.length} transaksi aktif</small></div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Kode</th><th>Pelanggan</th><th>Periode</th><th>Kembali</th><th>Status</th></tr></thead>
                <tbody>{camera.ongoingRentals.map((rental) => <tr key={rental.id}><td className="mono">{rental.id}</td><td>{rental.customer}</td><td>{rental.dates}</td><td>{rental.returnAt}</td><td><StatusBadge status={rental.status} /></td></tr>)}</tbody>
              </table>
            </div>
            <p className="inventory-manage-note">Stok tidak dapat dikurangi di bawah {camera.rentedUnits} unit selama transaksi ini berjalan.</p>
          </div>
        ) : (
          <p className="inventory-manage-note">Seluruh unit sedang berada di tempat dan siap disewakan.</p>
        )}
        <form className="camera-form" onSubmit={submit} noValidate>
          <div className="camera-form-row">
            <label className={`form-field ${errors.stock ? 'has-error' : ''}`}><span>Stok unit</span><input type="number" min={camera.rentedUnits} max="999" step="1" inputMode="numeric" value={values.stock} onChange={update('stock')} autoFocus />{errors.stock && <small className="form-error">{errors.stock}</small>}</label>
            <label className={`form-field ${errors.status ? 'has-error' : ''}`}><span>Status ketersediaan</span><select value={values.status} onChange={update('status')}>{['Tersedia', 'Terbatas', 'Disewa', 'Tidak tersedia'].map((status) => <option key={status} value={status}>{status}</option>)}</select>{errors.status && <small className="form-error">{errors.status}</small>}</label>
          </div>
          <div className="camera-form-actions"><button type="button" className="secondary-button" onClick={onClose}>Batal</button><button type="submit" className="primary-button" disabled={processing}><Save size={16} /> {processing ? 'Menyimpan...' : 'Simpan perubahan'}</button></div>
        </form>
      </div>
    </div>
  );
}

const PROFILE_TABS = [
  { id: 'profil', label: 'Profil saya', icon: UserRound },
  { id: 'keamanan', label: 'Keamanan', icon: LockKeyhole },
];

const PROFILE_CONTRACT = [
  {
    title: 'GET /pelanggan/profil',
    description: 'Props Inertia untuk halaman Profil saya. Ringkasan dihitung dari transaksi milik pelanggan yang sedang masuk, bukan dari data demo frontend.',
    code: `{
  "component": "App",
  "props": {
    "auth": {
      "user": {
        "id": 2,
        "name": "Nadia Putri",
        "phone": "081298765432",
        "address": "Jl. Melati No. 10",
        "role": "customer"
      }
    },
    "profile": {
      "id": 2,
      "name": "Nadia Putri",
      "phone": "081298765432",
      "address": "Jl. Melati No. 10",
      "joinedAt": "02 Oct 2026",
      "role": "Pelanggan"
    },
    "profileSummary": {
      "rental_count": 2,
      "active_rental_count": 1,
      "completed_rental_count": 1,
      "total_spent": 675000,
      "last_rental_at": "24 Oct 2026",
      "favorite_camera": "Sony α7 IV"
    },
    "rentals": [
      {
        "id": "SK-261024120000-ABCD",
        "product": "Sony α7 IV",
        "dates": "24 Oct 2026 — 27 Oct 2026",
        "total": 1100000,
        "status": "Menunggu persetujuan",
        "tone": "sand"
      }
    ],
    "flash": { "success": null, "error": null }
  }
}`,
  },
  {
    title: 'PATCH /pelanggan/profil',
    description: 'Memperbarui identitas pelanggan yang sedang masuk. Spasi dan tanda hubung pada nomor telepon dibuang, nomor harus unik, dan harus mengikuti format nomor Indonesia.',
    code: `{
  "name": "Nadia Putri",
  "phone": "081298765432",
  "address": "Jl. Melati No. 10"
}`,
  },
  {
    title: 'PUT /pelanggan/profil/password',
    description: 'Mengganti password pelanggan. Password saat ini diverifikasi terhadap kolom password_hash di tabel pelanggan.',
    code: `{
  "current_password": "password-lama",
  "password": "password-baru",
  "password_confirmation": "password-baru"
}`,
  },
  {
    title: 'Aturan agregasi',
    description: 'Ringkasan profil hanya memakai transaksi milik pelanggan yang sedang masuk.',
    code: `rental_count           = jumlah seluruh transaksi pelanggan
active_rental_count    = transaksi berstatus menunggu_persetujuan | disetujui | sedang_disewa
completed_rental_count = transaksi berstatus selesai
total_spent            = SUM(total_biaya) transaksi berstatus selesai
last_rental_at         = tanggal_sewa transaksi terbaru
favorite_camera        = kamera yang paling sering disewa`,
  },
  {
    title: 'Batasan MVP',
    description: 'Modul ini memperbarui identitas dan password pelanggan. Perubahan role, penonaktifan akun, dan unggah foto profil belum termasuk kontrak MVP.',
    code: `Tersedia:
GET   /pelanggan/profil
PATCH /pelanggan/profil
PUT   /pelanggan/profil/password

Belum tersedia:
DELETE /pelanggan/profil
PATCH  /pelanggan/profil/foto`,
  },
];

function CustomerProfile({ user, profile, summary = {}, rentals = [], flash }) {
  const [activeTab, setActiveTab] = useState('profil');
  const [values, setValues] = useState({ name: profile?.name || user?.name || '', phone: profile?.phone || user?.phone || '', address: profile?.address || user?.address || '' });
  const [passwords, setPasswords] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [notice, setNotice] = useState(flash?.success || '');
  const [errorNotice, setErrorNotice] = useState(flash?.error || '');
  const [docsOpen, setDocsOpen] = useState(false);

  useEffect(() => {
    setValues({ name: profile?.name || user?.name || '', phone: profile?.phone || user?.phone || '', address: profile?.address || user?.address || '' });
  }, [profile?.name, profile?.phone, profile?.address, user?.name, user?.phone, user?.address]);

  useEffect(() => {
    if (flash?.success) setNotice(flash.success);
    if (flash?.error) setErrorNotice(flash.error);
  }, [flash?.success, flash?.error]);

  const accountName = profile?.name || user?.name || 'Pelanggan';
  const accountPhone = profile?.phone || user?.phone || '';
  const joinedAt = profile?.joinedAt || '';
  const accountId = profile?.id ?? user?.id;

  const metrics = [
    { label: 'Total penyewaan', value: summary.rental_count ?? rentals.length, detail: 'Seluruh transaksi', period: 'Sejak bergabung', icon: CalendarDays, tone: 'accent' },
    { label: 'Sewa aktif', value: summary.active_rental_count ?? 0, detail: 'Diproses atau sedang berjalan', period: 'Status aktif', icon: Clock3, tone: 'warm' },
    { label: 'Sewa selesai', value: summary.completed_rental_count ?? 0, detail: 'Transaksi berstatus selesai', period: 'Sepanjang waktu', icon: CircleCheck, tone: 'soft' },
    { label: 'Total pengeluaran', value: formatCurrency(summary.total_spent ?? 0), detail: summary.favorite_camera ? `Kamera favorit: ${summary.favorite_camera}` : 'Belum ada transaksi selesai', period: 'Transaksi selesai', icon: Sparkles, tone: 'neutral' },
  ];

  const updateProfile = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setProfileErrors((current) => ({ ...current, [field]: undefined }));
  };

  const updatePassword = (field) => (event) => {
    setPasswords((current) => ({ ...current, [field]: event.target.value }));
    setPasswordErrors((current) => ({ ...current, [field]: undefined }));
  };

  const saveProfile = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!values.name.trim()) nextErrors.name = 'Nama lengkap wajib diisi.';
    if (!values.phone.trim()) nextErrors.phone = 'Nomor telepon wajib diisi.';
    if (!values.address.trim()) nextErrors.address = 'Alamat wajib diisi.';
    setProfileErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setNotice('');
    setErrorNotice('');
    setSavingProfile(true);
    router.patch('/pelanggan/profil', values, {
      preserveScroll: true,
      onSuccess: () => {
        setNotice('Profil kamu berhasil diperbarui.');
        setErrorNotice('');
      },
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
    router.put('/pelanggan/profil/password', passwords, {
      preserveScroll: true,
      onSuccess: () => {
        setPasswords({ current_password: '', password: '', password_confirmation: '' });
        setNotice('Password berhasil diperbarui.');
        setErrorNotice('');
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
    setActiveTab(PROFILE_TABS[nextIndex].id);
  };

  return (
    <>
      <section className="page-heading compact settings-heading profile-heading">
        <div>
          <p className="eyebrow">Akun pelanggan</p>
          <h1>Profil saya</h1>
          <p className="heading-subtitle">Kelola identitas, kontak, dan keamanan akses akun kamu.</p>
        </div>
        <button className="secondary-button" onClick={() => setDocsOpen(true)}><FileText size={16} /> Dokumentasi kontrak</button>
      </section>

      {notice && <div className="settings-alert" role="status"><CircleCheck size={17} /><span>{notice}</span><button type="button" onClick={() => setNotice('')} aria-label="Tutup notifikasi"><X size={15} /></button></div>}
      {errorNotice && <div className="settings-alert is-error" role="alert"><AlertCircle size={17} /><span>{errorNotice}</span><button type="button" onClick={() => setErrorNotice('')} aria-label="Tutup notifikasi"><X size={15} /></button></div>}

      <section className="panel profile-identity">
        <span className="profile-identity-avatar">{getInitials(accountName)}</span>
        <div className="profile-identity-copy">
          <p className="eyebrow">Pelanggan</p>
          <h2>{accountName}</h2>
          <div className="profile-identity-meta">
            {accountPhone && <span><Phone size={13} /> {accountPhone}</span>}
            {joinedAt && <span><CalendarDays size={13} /> Bergabung {joinedAt}</span>}
            {accountId && <span><UserRound size={13} /> ID #{accountId}</span>}
          </div>
        </div>
        <button className="secondary-button" onClick={() => router.get('/pelanggan/sewa')}><CalendarDays size={16} /> Lihat sewa saya</button>
      </section>

      <section className="stats-grid profile-metrics">
        {metrics.map(({ label, value, detail, period, icon: MetricIcon, tone }) => (
          <article className={`stat-card ${tone}`} key={label}>
            <div className="stat-card-head"><span className="stat-icon"><MetricIcon size={18} /></span><span className="stat-period">{period}</span></div>
            <p>{label}</p>
            <strong>{value}</strong>
            <div className="stat-detail"><span>{detail}</span></div>
          </article>
        ))}
      </section>

      <section className="settings-shell profile-shell">
        <nav className="settings-nav" role="tablist" aria-label="Bagian profil" aria-orientation="vertical" onKeyDown={handleTabKeyDown}>
          {PROFILE_TABS.map(({ id, label, icon: TabIcon }) => (
            <button
              key={id}
              role="tab"
              id={`profile-tab-${id}`}
              aria-selected={activeTab === id}
              aria-controls={`profile-panel-${id}`}
              tabIndex={activeTab === id ? 0 : -1}
              className={`settings-nav-item ${activeTab === id ? 'active' : ''}`}
              onClick={() => setActiveTab(id)}
            >
              <TabIcon size={17} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="settings-panel panel" role="tabpanel" id={`profile-panel-${activeTab}`} aria-labelledby={`profile-tab-${activeTab}`}>
          {activeTab === 'profil' && (
            <>
              <div className="settings-panel-head">
                <div><p className="eyebrow">Identitas</p><h2>Data profil</h2><p>Nama dan kontak ini dipakai admin untuk menghubungi kamu terkait penyewaan.</p></div>
                <span className="settings-badge"><UserRound size={15} /> Pelanggan</span>
              </div>
              <form className="settings-form" onSubmit={saveProfile} noValidate>
                <div className="settings-form-grid">
                  <label className={`form-field ${profileErrors.name ? 'has-error' : ''}`}>
                    <span>Nama lengkap</span>
                    <input value={values.name} onChange={updateProfile('name')} placeholder="Nama lengkap kamu" autoComplete="name" />
                    {profileErrors.name && <small className="form-error">{profileErrors.name}</small>}
                  </label>
                  <label className={`form-field ${profileErrors.phone ? 'has-error' : ''}`}>
                    <span>Nomor telepon</span>
                    <input value={values.phone} onChange={updateProfile('phone')} placeholder="Contoh: 081298765432" inputMode="tel" autoComplete="tel" />
                    {profileErrors.phone && <small className="form-error">{profileErrors.phone}</small>}
                  </label>
                  <label className={`form-field settings-field-full ${profileErrors.address ? 'has-error' : ''}`}>
                    <span>Alamat</span>
                    <textarea rows="3" value={values.address} onChange={updateProfile('address')} placeholder="Alamat lengkap kamu" autoComplete="street-address" />
                    {profileErrors.address && <small className="form-error">{profileErrors.address}</small>}
                  </label>
                </div>
                <div className="settings-form-actions">
                  <span className="settings-hint">Nomor telepon dipakai untuk masuk ke akunmu.</span>
                  <button type="submit" className="primary-button" disabled={savingProfile}><Save size={16} /> {savingProfile ? 'Menyimpan...' : 'Simpan profil'}</button>
                </div>
              </form>
            </>
          )}

          {activeTab === 'keamanan' && (
            <>
              <div className="settings-panel-head">
                <div><p className="eyebrow">Akun</p><h2>Keamanan</h2><p>Ganti password secara berkala agar akunmu tetap aman.</p></div>
                <span className="settings-badge"><LockKeyhole size={15} /> Password</span>
              </div>
              <form className="settings-form" onSubmit={savePassword} noValidate>
                <div className="settings-form-grid">
                  <SettingsPasswordField id="profile-current-password" label="Password saat ini" value={passwords.current_password} onChange={updatePassword('current_password')} error={passwordErrors.current_password} autoComplete="current-password" />
                  <label className={`form-field ${passwordErrors.password ? 'has-error' : ''}`}>
                    <span>Password baru</span>
                    <input type="password" value={passwords.password} onChange={updatePassword('password')} placeholder="Minimal 8 karakter" autoComplete="new-password" />
                    {passwordErrors.password && <small className="form-error">{passwordErrors.password}</small>}
                  </label>
                  <label className={`form-field ${passwordErrors.password_confirmation ? 'has-error' : ''}`}>
                    <span>Konfirmasi password baru</span>
                    <input type="password" value={passwords.password_confirmation} onChange={updatePassword('password_confirmation')} placeholder="Ulangi password baru" autoComplete="new-password" />
                    {passwordErrors.password_confirmation && <small className="form-error">{passwordErrors.password_confirmation}</small>}
                  </label>
                </div>
                <div className="settings-note"><b>Catatan</b><span>Setelah password diperbarui, sesi saat ini tetap aktif dan sesi lain perlu masuk kembali.</span></div>
                <div className="settings-form-actions">
                  <span className="settings-hint">Gunakan kombinasi yang tidak dipakai di layanan lain.</span>
                  <button type="submit" className="primary-button" disabled={savingPassword}><Save size={16} /> {savingPassword ? 'Menyimpan...' : 'Perbarui password'}</button>
                </div>
              </form>
            </>
          )}
        </div>
      </section>

      <section className="panel profile-history">
        <div className="panel-heading">
          <div><h2>Riwayat penyewaan</h2><p>{summary.last_rental_at ? `Sewa terakhir ${summary.last_rental_at}.` : 'Belum ada transaksi tercatat.'}</p></div>
          <button className="text-button" onClick={() => router.get('/pelanggan/sewa')}>Lihat semua <ArrowUpRight size={15} /></button>
        </div>
        {rentals.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Kode</th><th>Kamera</th><th>Periode</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>
                {rentals.slice(0, 5).map((rental) => (
                  <tr key={rental.id}>
                    <td className="mono">{rental.id}</td>
                    <td><div className="customer-cell"><span className={`camera-thumb ${rental.tone}`}><Camera size={17} /></span><b>{rental.product}</b></div></td>
                    <td>{rental.dates}</td>
                    <td className="money">{formatCurrency(rental.total)}</td>
                    <td><StatusBadge status={rental.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state profile-empty"><CalendarDays size={26} /><h2>Belum ada penyewaan</h2><p>Ajukan sewa pertamamu lewat katalog kamera.</p></div>
        )}
      </section>

      {docsOpen && (
        <ContractDocsModal
          onClose={() => setDocsOpen(false)}
          title="Dokumentasi modul Profil saya"
          description="Bentuk data dan endpoint yang dipakai halaman ini. Ringkasan dihitung dari transaksi milik pelanggan yang sedang masuk."
          sections={PROFILE_CONTRACT}
          note="Validasi gagal mengembalikan status 422 dengan key error sesuai nama field, sehingga form dapat menampilkan pesan yang tepat."
        />
      )}
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

function CameraDetailModal({ camera, viewer = 'customer', onClose }) {
  const [step, setStep] = useState('detail');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [booking, setBooking] = useState(null);
  const today = toDateInputValue();
  const duration = rentalDuration(startDate, endDate);
  const total = duration * Number(camera.rate || 0);
  const unavailable = camera.status === 'Tidak tersedia';

  const openBooking = () => {
    if (viewer === 'guest') {
      router.get('/login');
      return;
    }
    setErrors({});
    setStep('booking');
  };

  const updateStartDate = (event) => {
    const value = event.target.value;
    setStartDate(value);
    setErrors((current) => ({ ...current, start_date: undefined }));
    if (endDate && value && endDate < value) setEndDate(value);
  };

  const updateEndDate = (event) => {
    setEndDate(event.target.value);
    setErrors((current) => ({ ...current, end_date: undefined }));
  };

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!startDate) nextErrors.start_date = 'Pilih tanggal mulai sewa.';
    if (!endDate) nextErrors.end_date = 'Pilih tanggal kembali.';
    if (startDate && endDate && endDate < startDate) nextErrors.end_date = 'Tanggal kembali tidak boleh sebelum tanggal mulai.';
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    router.post('/sewa', { camera_id: camera.id, start_date: startDate, end_date: endDate }, {
      preserveScroll: true,
      preserveState: true,
      onStart: () => {
        setProcessing(true);
        setErrors({});
      },
      onSuccess: () => {
        setBooking({ startDate, endDate, duration, total });
        setStep('success');
      },
      onError: (serverErrors) => setErrors(serverErrors),
      onFinish: () => setProcessing(false),
    });
  };

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="camera-modal" role="dialog" aria-modal="true" aria-labelledby="camera-modal-title" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Tutup"><X size={18} /></button>
        <div className={`modal-visual ${camera.tone || 'sand'}`}><Camera size={92} strokeWidth={1.05} /><span>PHOTO / DEMO</span></div>
        <div className="modal-copy">
          {step === 'success' ? (
            <div className="booking-success">
              <CircleCheck size={34} />
              <h3>Pengajuan sewa terkirim</h3>
              <p>{camera.name}<br />{formatDateInput(booking.startDate)} — {formatDateInput(booking.endDate)}</p>
              <div className="booking-summary"><span><small>Durasi</small><b>{booking.duration} hari</b></span><span><small>Total biaya</small><b>{formatCurrency(booking.total)}</b></span></div>
              <p className="booking-hint">Pengajuan kamu berstatus <b>Menunggu persetujuan</b>. Admin akan menghubungi nomor terdaftar setelah transaksi ditinjau.</p>
              <button className="primary-button full-width" onClick={() => router.get('/pelanggan')}>Lihat penyewaan saya <ArrowUpRight size={15} /></button>
              <button className="secondary-button full-width" onClick={onClose}>Tutup</button>
            </div>
          ) : step === 'booking' ? (
            <>
              <p className="eyebrow">{camera.type}</p>
              <h2 id="camera-modal-title">{camera.name}</h2>
              <p className="heading-subtitle">Pilih tanggal sewa dan kembali. Ketersediaan akan dicek saat pengajuan dikirim.</p>
              <form className="booking-form" onSubmit={submit} noValidate>
                <div className="booking-dates">
                  <label className={`form-field ${errors.start_date ? 'has-error' : ''}`}><span>Tanggal mulai</span><input type="date" min={today} value={startDate} onChange={updateStartDate} />{errors.start_date && <small className="form-error">{errors.start_date}</small>}</label>
                  <label className={`form-field ${errors.end_date ? 'has-error' : ''}`}><span>Tanggal kembali</span><input type="date" min={startDate || today} value={endDate} onChange={updateEndDate} />{errors.end_date && <small className="form-error">{errors.end_date}</small>}</label>
                </div>
                <div className="booking-summary"><span><small>Durasi sewa</small><b>{duration ? `${duration} hari` : '—'}</b></span><span><small>Total estimasi</small><b>{duration ? formatCurrency(total) : '—'}</b></span></div>
                <p className="booking-hint">Tarif {formatCurrency(camera.rate)} / hari. Tanggal mulai dan kembali dihitung inklusif.</p>
                {errors.camera_id && <p className="form-error">{errors.camera_id}</p>}
                <div className="booking-actions"><button type="button" className="secondary-button" onClick={() => setStep('detail')} disabled={processing}>Kembali</button><button type="submit" className="primary-button" disabled={processing}>{processing ? 'Mengirim...' : 'Ajukan sewa'}</button></div>
              </form>
            </>
          ) : (
            <>
              <p className="eyebrow">{camera.type}</p>
              <h2 id="camera-modal-title">{camera.name}</h2>
              <p className="heading-subtitle">Kamera ini siap dipesan untuk kebutuhan produksi dan konten kamu.</p>
              <div className="modal-rate"><b>{formatCurrency(camera.rate)}</b><span>/ hari</span></div>
              {viewer === 'admin' ? (
                <button className="secondary-button full-width" onClick={onClose}>Tutup</button>
              ) : (
                <button className="primary-button full-width" onClick={openBooking} disabled={unavailable}><CalendarDays size={17} /> {unavailable ? 'Kamera tidak tersedia' : viewer === 'guest' ? 'Masuk untuk menyewa' : 'Pilih tanggal sewa'}</button>
              )}
            </>
          )}
        </div>
      </div>
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
    if (route === '/ketersediaan/hasil') return 'availability-results';
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
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const viewer = currentUser ? (currentUser.role === 'admin' ? 'admin' : 'customer') : 'guest';
  const activeCustomerRentals = (props.rentals || []).filter((rental) => ['Menunggu persetujuan', 'Disetujui', 'Sedang disewa'].includes(rental.status)).length;
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
      'availability-results': '/ketersediaan/hasil',
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
    if (page === 'customers' || page === 'inventory' || page === 'customer-profile' || page === 'customer-rentals') {
      setSidebarOpen(false);
      const targets = {
        customers: '/admin/pelanggan',
        inventory: '/admin/inventaris',
        'customer-profile': '/pelanggan/profil',
        'customer-rentals': '/pelanggan/sewa',
      };
      router.get(targets[page]);
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
  const checkAvailability = ({ startDate, endDate }) => {
    router.get('/ketersediaan/hasil', { tanggal_mulai: startDate, tanggal_kembali: endDate });
  };
  const confirmLogout = () => {
    setLoggingOut(true);
    router.post('/logout', {}, {
      onFinish: () => setLoggingOut(false),
    });
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
  let content = active === 'public-home' ? <PublicHome onNavigate={navigate} onSelectCamera={setSelectedCamera} onCheckAvailability={checkAvailability} cameras={props.cameras} /> : role === 'customer' ? <CustomerHome user={currentUser} rentals={props.rentals} cameras={props.cameras} onSelectCamera={setSelectedCamera} onNavigate={navigate} /> : <Overview user={currentUser} onNavigate={navigate} />;
  if (active === 'availability-results') content = <AvailabilityResults availability={props.availability} onSelectCamera={setSelectedCamera} onNavigate={navigate} />;
  if (role === 'customer' && active === 'customer-catalog') content = <CustomerCatalog onSelectCamera={setSelectedCamera} cameras={props.cameras} availability={props.availability} onClearAvailability={() => navigate('customer-catalog')} />;
  if (role === 'customer' && active === 'customer-rentals') content = <CustomerRentals rentals={props.rentals} summary={props.customerRentalSummary} onNavigate={navigate} />;
  if (role === 'customer' && active === 'customer-profile') content = <CustomerProfile user={currentUser} profile={props.profile} summary={props.profileSummary} rentals={props.rentals || []} flash={props.flash} />;
  if (role === 'admin' && active === 'catalog') content = <Catalog onSelectCamera={setSelectedCamera} cameras={props.cameras} canManage />;
  if (active === 'rentals') content = <Rentals />;
  if (role === 'admin' && active === 'customers') content = <Customers customers={props.customers} summary={props.customerSummary} />;
  if (role === 'admin' && active === 'inventory') content = <Inventory items={props.inventory} summary={props.inventorySummary} flash={props.flash} />;
  if (role === 'admin' && active === 'settings') content = <Settings user={currentUser} settings={props.settings} flash={props.flash} />;
  if (['help'].includes(active)) content = <Placeholder title="Pusat bantuan" />;
  const isPublicPage = active === 'public-home' || active === 'availability-results';
  return (
    <div className="app-shell">
      {!isPublicPage && <Sidebar user={currentUser} active={active} onChange={navigate} open={sidebarOpen} onClose={() => setSidebarOpen(false)} role={role} rentalCount={activeCustomerRentals} onLogout={() => setLogoutOpen(true)} />}
      {sidebarOpen && <button className="sidebar-scrim" aria-label="Tutup navigasi" onClick={() => setSidebarOpen(false)} />}
      <main className={isPublicPage ? 'public-main' : 'main-content'}>{!isPublicPage && <Topbar role={role} active={active} user={currentUser} onMenu={() => setSidebarOpen(true)} onLogout={() => setLogoutOpen(true)} />}<div className={isPublicPage ? '' : 'page-content'}>{content}</div>{!isPublicPage && <footer className="app-footer">© 2026 Kamera Kita <span>•</span> Workspace operasional</footer>}</main>
      {selectedCamera && <CameraDetailModal camera={selectedCamera} viewer={viewer} onClose={() => setSelectedCamera(null)} />}
      {logoutOpen && <LogoutConfirmModal role={role} processing={loggingOut} onClose={() => setLogoutOpen(false)} onConfirm={confirmLogout} />}
    </div>
  );
}

export default App;
