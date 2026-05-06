'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Plus, Edit, Trash2, TrendingUp, ShoppingBag, Table2, DollarSign } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useLocations, useLocationAnalytics, useCreateLocation, useUpdateLocation, useDeleteLocation } from '@/hooks/useLocations';
import { useCurrentUser } from '@/hooks/useAuth';
import { can } from '@/lib/permissions';
import { Location } from '@/types';

export default function LocationsPage() {
  const router = useRouter();
  const user = useCurrentUser();
  if (user && !can.manageLocations(user)) { router.push('/dashboard'); return null; }

  const [showCreate, setShowCreate] = useState(false);
  const [editLocation, setEditLocation] = useState<Location | null>(null);
  const [form, setForm] = useState({ name: '', address: '', phone: '', timezone: 'UTC' });

  const { data: locations = [], isLoading } = useLocations();
  const { data: analytics, isLoading: analyticsLoading } = useLocationAnalytics();
  const createLocation = useCreateLocation();
  const updateLocation = useUpdateLocation();
  const deleteLocation = useDeleteLocation();

  const resetForm = () => setForm({ name: '', address: '', phone: '', timezone: 'UTC' });

  const handleSubmit = async () => {
    if (editLocation) {
      await updateLocation.mutateAsync({ id: editLocation.id, data: form });
      setEditLocation(null);
    } else {
      await createLocation.mutateAsync(form);
      setShowCreate(false);
      resetForm();
    }
  };

  const openEdit = (loc: Location) => {
    setForm({ name: loc.name, address: loc.address ?? '', phone: loc.phone ?? '', timezone: loc.timezone });
    setEditLocation(loc);
  };

  const LocationForm = () => (
    <div className="space-y-4">
      <Input label="Location Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Downtown Branch" />
      <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Main St, City" />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1234567890" />
        <Input label="Timezone" value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} placeholder="UTC" />
      </div>
      <div className="flex gap-3 pt-2">
        <Button variant="ghost" onClick={() => { setShowCreate(false); setEditLocation(null); resetForm(); }} className="flex-1">Cancel</Button>
        <Button onClick={handleSubmit} loading={createLocation.isPending || updateLocation.isPending} disabled={!form.name} className="flex-1">
          {editLocation ? 'Save Changes' : 'Create Location'}
        </Button>
      </div>
    </div>
  );

  return (
    <AppLayout title="Locations">
      <div className="space-y-6">
        {/* Cross-location analytics */}
        {analyticsLoading ? (
          <Skeleton className="h-24 rounded-2xl" />
        ) : analytics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4">
              <p className="text-xs text-[#8D6E63] mb-1">Total Locations</p>
              <p className="text-2xl font-bold text-[#4E342E]">{locations.length}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-[#8D6E63] mb-1">All-Time Orders</p>
              <p className="text-2xl font-bold text-[#4E342E]">{analytics.totals.orders}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-[#8D6E63] mb-1">All-Time Revenue</p>
              <p className="text-2xl font-bold text-[#FF8A65]">${analytics.totals.revenue.toFixed(0)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-[#8D6E63] mb-1">Active Locations</p>
              <p className="text-2xl font-bold text-green-600">{locations.filter((l) => l.active).length}</p>
            </Card>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-[#4E342E] flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#FF8A65]" /> All Locations
          </h2>
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => { resetForm(); setShowCreate(true); }}>Add Location</Button>
        </div>

        {/* Locations grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
          </div>
        ) : locations.length === 0 ? (
          <Card>
            <div className="text-center py-12 text-[#8D6E63]">
              <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No locations yet</p>
              <p className="text-sm mt-1">Add your first location to enable multi-location tracking.</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((loc) => {
              const locAnalytics = analytics?.locations.find((a) => a.location.id === loc.id);
              return (
                <Card key={loc.id} className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-[#4E342E] text-base">{loc.name}</p>
                      {loc.address && <p className="text-xs text-[#8D6E63] mt-0.5">{loc.address}</p>}
                      {loc.phone && <p className="text-xs text-[#8D6E63]">{loc.phone}</p>}
                    </div>
                    <Badge variant={loc.active ? 'success' : 'error'}>{loc.active ? 'Active' : 'Inactive'}</Badge>
                  </div>

                  {locAnalytics && (
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { icon: ShoppingBag, label: 'Orders', value: locAnalytics.totalOrders, color: 'text-blue-600' },
                        { icon: DollarSign, label: 'Revenue', value: `$${locAnalytics.totalRevenue.toFixed(0)}`, color: 'text-green-600' },
                        { icon: TrendingUp, label: 'Active', value: locAnalytics.activeOrders, color: 'text-orange-500' },
                        { icon: Table2, label: 'Tables', value: locAnalytics.tables, color: 'text-[#4E342E]' },
                      ].map((stat) => (
                        <div key={stat.label} className="bg-[#FFF8F0] rounded-xl p-2 text-center border border-[#F5E6D3]">
                          <p className="text-xs text-[#8D6E63]">{stat.label}</p>
                          <p className={`font-bold text-sm ${stat.color}`}>{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" icon={<Edit className="w-3.5 h-3.5" />} onClick={() => openEdit(loc)} className="flex-1">Edit</Button>
                    {loc.active ? (
                      <Button size="sm" variant="ghost" onClick={() => updateLocation.mutate({ id: loc.id, data: { active: false } })} className="text-orange-500 hover:text-orange-700 flex-1">Deactivate</Button>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => updateLocation.mutate({ id: loc.id, data: { active: true } })} className="text-green-600 hover:text-green-800 flex-1">Activate</Button>
                    )}
                    <Button size="sm" variant="ghost" icon={<Trash2 className="w-3.5 h-3.5" />}
                      onClick={() => { if (confirm(`Delete ${loc.name}?`)) deleteLocation.mutate(loc.id); }}
                      className="text-red-400 hover:text-red-600" />
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Cross-location breakdown table */}
        {analytics && analytics.locations.length > 0 && (
          <Card>
            <h3 className="font-semibold text-[#4E342E] mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#FF8A65]" /> Cross-Location Breakdown
            </h3>
            <div className="overflow-x-auto rounded-xl border border-[#F5E6D3]">
              <table className="w-full text-sm">
                <thead className="bg-[#F5E6D3]">
                  <tr>
                    {['Location', 'Total Orders', "Today's Orders", 'Active Orders', 'Total Revenue', "Today's Revenue", 'Tables'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-semibold text-[#4E342E] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {analytics.locations.map((a) => (
                    <tr key={a.location.id} className="border-t border-[#F5E6D3] hover:bg-[#FFF8F0]">
                      <td className="px-4 py-3 font-medium text-[#4E342E]">{a.location.name}</td>
                      <td className="px-4 py-3">{a.totalOrders}</td>
                      <td className="px-4 py-3">{a.todayOrders}</td>
                      <td className="px-4 py-3 text-orange-500 font-medium">{a.activeOrders}</td>
                      <td className="px-4 py-3 font-semibold text-[#FF8A65]">${a.totalRevenue.toFixed(2)}</td>
                      <td className="px-4 py-3">${a.todayRevenue.toFixed(2)}</td>
                      <td className="px-4 py-3">{a.tables}</td>
                    </tr>
                  ))}
                  {analytics.unassigned.totalOrders > 0 && (
                    <tr className="border-t border-[#F5E6D3] bg-gray-50">
                      <td className="px-4 py-3 text-[#8D6E63] italic">Unassigned</td>
                      <td className="px-4 py-3">{analytics.unassigned.totalOrders}</td>
                      <td className="px-4 py-3">—</td>
                      <td className="px-4 py-3">—</td>
                      <td className="px-4 py-3">${analytics.unassigned.totalRevenue.toFixed(2)}</td>
                      <td className="px-4 py-3">—</td>
                      <td className="px-4 py-3">—</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      <Modal isOpen={showCreate} onClose={() => { setShowCreate(false); resetForm(); }} title="Add Location"><LocationForm /></Modal>
      <Modal isOpen={!!editLocation} onClose={() => { setEditLocation(null); resetForm(); }} title={`Edit — ${editLocation?.name}`}><LocationForm /></Modal>
    </AppLayout>
  );
}
