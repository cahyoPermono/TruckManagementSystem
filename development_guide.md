# 🛠️ Panduan Pengembangan TMS (Development Guide)

Panduan ini berisi tutorial langkah demi langkah bagi para *developer* (pengembang) untuk membuat dan mengintegrasikan **sebuah modul sistem baru (end-to-end)** ke dalam Tire Management System (TMS).

TMS menggunakan arsitektur modular. Kita akan menggunakan contoh pembuatan modul baru fiktif bernama: **"Drivers"** (untuk mengelola pengemudi truk).

---

**Dibuat oleh: Cahyo Adi Permono dari Imani Prima**

---

## Fase 1: Skema Database

Semuanya bermula dari level database. Aplikasi ini menggunakan **Prisma**.

1. **Buka File Skema**: Buka file di `backend/prisma/schema.prisma`.
2. **Definisikan Model Anda**: Tambahkan model `Driver` baru Anda.

```prisma
model Driver {
  id        String   @id @default(uuid())
  firstName String
  lastName  String
  licenseNo String   @unique
  status    String   @default("ACTIVE") // ACTIVE, ON_LEAVE, INACTIVE
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

3. **Terapkan Migrasi (Migration)**:
Karena Anda berada dalam fase pengembangan aktif (*development*), jalankan perintah:
```bash
cd backend
npx prisma db push
```
*(Catatan: Jika Anda berada di lingkungan produksi, Anda harus menggunakan `npx prisma migrate dev --name init_drivers` sebagai gantinya).*

---

## Fase 2: Implementasi Backend (Fastify)

Backend disusun sebagai sebuah Monolit Modular (Modular Monolith) di dalam folder `backend/src/modules/`.

1. **Buat Folder Modul**: Buat sebuah direktori (folder) baru bernama `backend/src/modules/drivers`.
2. **Siapkan Controller (`drivers.controller.ts`)**:
   Buat logika pemrosesan CRUD.

```typescript
import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../prisma';

export const getDrivers = async (request: FastifyRequest, reply: FastifyReply) => {
  const drivers = await prisma.driver.findMany();
  return reply.send(drivers);
};

export const createDriver = async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
  const driver = await prisma.driver.create({
    data: request.body
  });
  return reply.code(201).send(driver);
};
```

3. **Siapkan Router (`drivers.routes.ts`)**:
   Daftarkan rute api Anda dan lindungi rute tersebut dengan RBAC. 
   **Catatan Penting:** Karena kita memiliki generator izin IAM (IAM Permission Generator) yang bersifat dinamis, hanya dengan membungkus rute di bawah pengawasan `verifyPermission('view:drivers')` di dalam folder `drivers`, maka sistem secara otomatis akan memahami izin (permissions) apa saja yang perlu dihasilkan/dibuat di dalam database!

```typescript
import { FastifyInstance } from 'fastify';
import { getDrivers, createDriver } from './drivers.controller';

export async function driverRoutes(fastify: FastifyInstance) {
  // Pasang sistem Autentikasi untuk seluruh rute di dalam plugin ini
  fastify.addHook('onRequest', fastify.authenticate);

  // Akses BACA (READ) membutuhkan izin hak 'view:drivers'
  // Gunakan Generic Interfaces parameter route jika mendefinisikan tipe Body/Params/Query untuk menghindari error TS
  fastify.get('/', { preHandler: fastify.verifyPermission('view:drivers') }, getDrivers);

  // Akses TULIS (WRITE) membutuhkan hak izin 'manage:drivers'
  fastify.post<{ Body: any }>('/', { preHandler: fastify.verifyPermission('manage:drivers') }, createDriver);
}
```

4. **Daftarkan Modul Baru Anda (`backend/src/app.ts`)**:
   Buka file `app.ts` di direktori backend Anda, lalu daftarkan (register) *plugin prefix* yang baru.

```typescript
import { driverRoutes } from './modules/drivers/drivers.routes';

// ...
fastify.register(driverRoutes, { prefix: '/api/drivers' });
```

5. **Nyalakan Ulang (Restart) Server**: 
   Server akan mendeteksi folder direktori `drivers` yang baru saja Anda buat, dan *permission generator* kami (`sync-permissions.ts`) akan **secara otomatis** membuatkan izin akses `view:drivers` serta `manage:drivers` di dalam database saat server menyala (*reboot*)!

---

## Fase 3: Persiapan Frontend (React atau Vue)

Di bagian ini kami akan mendokumentasikan pendekatan memakai **React**. *(Untuk Vue, pada prinsipnya sama saja, di mana Anda akan menggunakan `Pinia`, `vue-router`, dan `useMutation` dari TanStack)*.

### 3.1: Membuat API Composables

Aplikasi ini menggunakan `TanStack Query` untuk menghubungkan frontend ke backend.

1. **Buka file `useApi.ts`**: Terletak di `frontend/src/composables/useApi.ts`.
2. **Tambahkan Request Axios**:

```typescript
// Fetch / Mengambil Data Drivers
export const useDrivers = () => {
  return useQuery({
    queryKey: ['drivers'],
    queryFn: async () => {
      const res = await api.get('/api/drivers');
      return res.data;
    }
  });
};

// Create / Menambahkan Driver Baru
export const useCreateDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/api/drivers', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    }
  });
};
```

### 3.2: Membangun Antarmuka Halaman (UI Page)

1. **Buat file `Drivers.tsx`**: Posisikan di dalam folder `frontend/src/pages/Drivers.tsx`.
2. **Gunakan Elemen dari Shadcn UI**: *Import* atau masukkan komponen Table, Button, Dialog, dan Input. Buat antarmuka antarmuka CRUD pada umumnya. Jangan lupa untuk menambahkan `sonner` agar memunculkan notifikasi Toast yang cantik!

```tsx
import { useDrivers, useCreateDriver } from '@/composables/useApi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuthStore } from '@/store';

export default function Drivers() {
  const { data: drivers, isLoading } = useDrivers();
  const { mutateAsync: createDriver } = useCreateDriver();

  // Ambil state auth dari user login untuk otorisasi tombol UI
  const { user } = useAuthStore();
  const canManage = user?.role?.permissions?.some((p: any) => p.permission.name === 'manage:drivers');

  const handleAdd = async () => {
    try {
      await createDriver({ firstName: "John", lastName: "Doe", licenseNo: "L123" });
      toast.success("Driver berhasil ditambahkan!");
    } catch (e) {
      toast.error("Gagal menambahkan driver");
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-50">Database Pengemudi</h1>
        {/* Render tombol secara kondisional jika user memiliki izin */}
        {canManage && (
          <Button onClick={handleAdd}>Tambah Pengemudi</Button>
        )}
      </div>
      <Card className="bg-slate-900/60 border-slate-800">
         {/* Sisipkan dan render Tabel Anda Di Sini */}
      </Card>
    </div>
  );
}
```

### 3.3: Menambahkan Routing & Menu Navigasi (Navigation)

1. **Tambahkan Ke Menu Sidebar (`Layout.tsx`)**:
   Buka file `frontend/src/components/Layout.tsx` dan sisipkan halaman baru Anda di dalam daftar `NAV_ITEMS`.

```tsx
import { UserSquare2 } from 'lucide-react'; // Pilih Icon yang tepat

const NAV_ITEMS = [
  // ... item menu lain yang sebelumnya sudah ada
  // Sertakan 'permission' flag agar layout menyembunyikan menu ini jika user tidak memiliki izin!
  { name: "Pengemudi (Drivers)", href: "/drivers", icon: UserSquare2, permission: "view:drivers" },
];
```

2. **Daftarkan Rutenya (Register Route di `App.tsx`)**:
   Buka file `frontend/src/App.tsx` lalu arahkan URI path ke halaman komponen Anda di mana elemen tersebut berada dalam pembungkus `<ProtectedRoute>`.

```tsx
import Drivers from './pages/Drivers';

// ...
<Route element={<ProtectedRoute />}>
  <Route element={<Layout><AnimatedRoute /></Layout>}>
    // ...
    <Route path="/drivers" element={<Drivers />} />
  </Route>
</Route>
```

---

## Fase 4: Validasi & Uji Coba (Verification)

1. **Pemberian Izin Akses (Assign Permissions)**: Selagi Anda menyalakan Server Backend dan backend secara langsung memasukkan `view:drivers` & `manage:drivers`, saat ini Anda wajib *memberikan ("grant")* hak izin baru tersebut kepada Role / Peran Anda saat ini (Misal Super Admin).
   - Buka halaman navigasi `IAM & Roles` -> Buka matrix hak izin (Matrix Permissions) untuk Role "Super Admin" dan centang pilihan *checkbox* untuk fitur `Drivers`.
2. **Navigasi ke Halaman Baru**: Periksa menu di sisi kiri (*sidebar*), pastikan menu baru telah muncul, lalu klik menu tersebut dan pastikan rutenya berjalan lancar sesuai harapan.
3. **Penyisipan Data (Data Mutate)**: Uji coba form/menambahkan driver lewat UI dan pastikan notifikasi Toast menyala memberikan respon Sukses. Cek juga apakah tabel Anda berhasil *update* dan di sisi Database PostgreSQL ikut berubah!

**Selamat!** Anda telah berhasil membuat dan mengimplementasikan modul end-to-end secara penuh (full-stack).
