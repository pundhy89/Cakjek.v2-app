export interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  withCount?: boolean;
}

export interface AppSettings {
  id: string;
  app_name: string;
  logo_url: string;
  whatsapp_number: string;
  service_center_lat: number;
  service_center_lng: number;
  service_radius_km: number;
  mart_delivery_fee: number;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  code: string;
  color_from: string;
  color_to: string;
  image_url: string;
  order_idx: number;
  active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export interface Merchant {
  id: string;
  name: string;
  image_url: string;
  address: string;
  description: string;
  delivery_fee: number;
  rating: number;
  active: boolean;
  created_at: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  category: 'food' | 'mart' | 'cakpay';
  merchant_id: string | null;
  active: boolean;
  created_at: string;
}

export interface Tariff {
  id: string;
  service: 'cakride' | 'cakcar' | 'caksend' | 'cakmart' | 'caklangganan';
  base_fare: number;
  per_km: number;
  label: string;
}

export interface Order {
  id: string;
  service: string;
  customer_name: string;
  customer_phone: string;
  details: Record<string, unknown>;
  total: number;
  message: string;
  status: 'new' | 'process' | 'done' | 'cancel';
  created_at: string;
}

export interface Coords {
  lat: number;
  lng: number;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export interface ServiceItem {
  id: string;
  label: string;
  active: boolean;
  order_idx: number;
}

export interface Kost {
  id: number;
  nama: string;
  foto_url: string;
  alamat: string;
  deskripsi: string;
  fasilitas: string;
  harga_harian: number;
  harga_mingguan: number;
  harga_bulanan: number;
  status: 'tersedia' | 'penuh';
  active: boolean;
  created_at: string;
}

export interface Vehicle {
  id: number;
  nama: string;
  jenis: 'motor' | 'mobil';
  foto_url: string;
  deskripsi: string;
  harga_harian: number;
  harga_mingguan: number;
  harga_bulanan: number;
  biaya_sopir_harian: number | null;
  status: 'tersedia' | 'disewa';
  active: boolean;
  created_at: string;
}
