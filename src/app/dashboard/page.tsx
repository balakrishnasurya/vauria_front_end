'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Eye, 
  Search,
  MapPin,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  User,
  CreditCard,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { dashboardService, type OrderDTO } from '@/services/dashboard.service';
import { profileService } from '@/services/profile.service';

// Types derived from service DTO
type DashboardOrder = OrderDTO;

type DashboardStats = {
  totalOrders: number;
  completedOrders: number;
  processingOrders: number;
  returnRequests: number;
  totalRevenue: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<DashboardOrder[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    completedOrders: 0,
    processingOrders: 0,
    returnRequests: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<DashboardOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    // Admin-only guard
    const guard = async () => {
      try {
        const profile = await profileService.getCurrentProfile();
        const role = (profile?.data?.role || '').toLowerCase();
        if (role !== 'admin') {
          router.push('/login');
          return;
        }
        await loadDashboardData();
      } catch (e) {
        router.push('/login');
      }
    };
    guard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterAndSortOrders();
  }, [orders, searchTerm, statusFilter, paymentFilter, sortBy, sortOrder]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const live = await dashboardService.getAllOrders(0, 50);
      setOrders(live);
      // compute stats from live data
      const totalOrders = live.length;
      const completedOrders = live.filter(o => o.order_status?.toLowerCase() === 'delivered').length;
      const processingOrders = live.filter(o => ['processing','shipped','in transit','out for delivery'].includes((o.order_status||'').toLowerCase())).length;
      const returnRequests = live.filter(o => !!o.return_request).length;
      const totalRevenue = live.reduce((sum, o) => sum + parseFloat(o.total_amount || '0'), 0);
      setStats({ totalOrders, completedOrders, processingOrders, returnRequests, totalRevenue });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortOrders = () => {
    let filtered = [...orders];

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shipping_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user_id.toString().includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => (order.order_status||'').toLowerCase() === statusFilter.toLowerCase());
    }

    if (paymentFilter !== 'all') {
      filtered = filtered.filter(order => order.payment_method === paymentFilter);
    }

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'amount':
          aValue = parseFloat(a.total_amount);
          bValue = parseFloat(b.total_amount);
          break;
        case 'status':
          aValue = a.order_status || '';
          bValue = b.order_status || '';
          break;
      }
      return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });

    setFilteredOrders(filtered);
  };

  const getStatusBadge = (status: string) => {
    const s = (status||'').toLowerCase();
    const map: Record<string, { variant: 'default'|'destructive'|'secondary'|'outline'; label: string; cls?: string }> = {
      'processing': { variant: 'outline', label: 'Processing', cls: 'text-blue-600' },
      'shipped': { variant: 'secondary', label: 'Shipped', cls: 'text-purple-600' },
      'in transit': { variant: 'secondary', label: 'In Transit', cls: 'text-orange-600' },
      'out for delivery': { variant: 'secondary', label: 'Out for Delivery', cls: 'text-yellow-600' },
      'delivered': { variant: 'default', label: 'Delivered', cls: 'text-green-600' },
      'cancelled': { variant: 'destructive', label: 'Cancelled', cls: 'text-red-600' },
      'returned': { variant: 'secondary', label: 'Returned', cls: 'text-gray-600' },
      'return requested': { variant: 'secondary', label: 'Return Requested', cls: 'text-orange-600' },
    };
    const cfg = map[s] || map['processing'];
    return <Badge variant={cfg.variant} className={`text-xs ${cfg.cls||''}`}>{cfg.label}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const s = (status||'').toLowerCase();
    const map: Record<string, { variant: 'default'|'destructive'|'secondary'|'outline'; label: string }> = {
      'paid': { variant: 'default', label: 'Paid' },
      'pending': { variant: 'outline', label: 'Pending' },
      'cancelled': { variant: 'destructive', label: 'Cancelled' },
      'returned': { variant: 'secondary', label: 'Returned' },
    };
    const cfg = map[s] || map['pending'];
    return <Badge variant={cfg.variant} className="text-xs">{cfg.label}</Badge>;
  };

  const formatCurrency = (amount: string) => `₹${parseFloat(amount||'0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const currentOrders = filteredOrders; // no pagination yet, using server skip/limit in future

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold">Order Management Dashboard</h1>
            <p className="text-muted-foreground">Manage and track all customer orders</p>
          </div>
          <Button onClick={loadDashboardData} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Processing</p>
                  <p className="text-2xl font-bold">{stats.processingOrders}</p>
                </div>
                <Truck className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{stats.completedOrders}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue.toString())}</p>
                </div>
                <CreditCard className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="search">Search Orders</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Order ID, Address, User ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label>Order Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="in transit">In Transit</SelectItem>
                      <SelectItem value="out for delivery">Out for Delivery</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="returned">Returned</SelectItem>
                      <SelectItem value="return requested">Return Requested</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Payment Method</Label>
                  <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Methods" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="COD">Cash on Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Sort By</Label>
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="amount">Amount</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Sort Order</Label>
                  <Button
                    variant="outline"
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="w-full justify-between"
                  >
                    {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                    {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Orders Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Orders ({filteredOrders.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">#{order.id.slice(0, 8)}...</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><div><p className="font-medium text-sm">User {order.user_id}</p><p className="text-xs text-muted-foreground">{order.payment_method === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</p></div></div>
                        </TableCell>
                        <TableCell>
                          <div><p className="font-semibold">{formatCurrency(order.total_amount)}</p>{parseFloat(order.delivery_cost) > 0 && (<p className="text-xs text-muted-foreground">+₹{order.delivery_cost} delivery</p>)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">{getPaymentStatusBadge(order.status)}<p className="text-xs text-muted-foreground">{order.payment_method === 'COD' ? 'COD' : 'Online'}</p></div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">{getStatusBadge(order.order_status)}{order.return_request && (<Badge variant="outline" className="text-xs text-orange-600">Return Request</Badge>)}</div>
                        </TableCell>
                        <TableCell><div className="text-sm">{order.items.length} item{order.items.length > 1 ? 's' : ''}</div></TableCell>
                        <TableCell><div className="text-sm">{formatDate(order.created_at)}</div></TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader><DialogTitle>Order Details - #{order.id.slice(0, 8)}</DialogTitle></DialogHeader>
                                {selectedOrder && (
                                  <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <Card>
                                        <CardHeader><CardTitle className="text-sm">Order Information</CardTitle></CardHeader>
                                        <CardContent className="space-y-3">
                                          <div className="flex justify-between"><span className="text-sm text-muted-foreground">Order ID:</span><span className="text-sm font-mono">#{selectedOrder.id.slice(0, 12)}...</span></div>
                                          <div className="flex justify-between"><span className="text-sm text-muted-foreground">Status:</span>{getStatusBadge(selectedOrder.order_status)}</div>
                                          <div className="flex justify-between"><span className="text-sm text-muted-foreground">Payment:</span>{getPaymentStatusBadge(selectedOrder.status)}</div>
                                          <div className="flex justify-between"><span className="text-sm text-muted-foreground">Method:</span><span className="text-sm">{selectedOrder.payment_method === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</span></div>
                                          <div className="flex justify-between"><span className="text-sm text-muted-foreground">Created:</span><span className="text-sm">{formatDate(selectedOrder.created_at)}</span></div>
                                        </CardContent>
                                      </Card>
                                      <Card>
                                        <CardHeader><CardTitle className="text-sm">Pricing Details</CardTitle></CardHeader>
                                        <CardContent className="space-y-3">
                                          <div className="flex justify-between"><span className="text-sm text-muted-foreground">Subtotal:</span><span className="text-sm">{formatCurrency(selectedOrder.total_amount)}</span></div>
                                          <div className="flex justify-between"><span className="text-sm text-muted-foreground">Discount:</span><span className="text-sm">-{formatCurrency(selectedOrder.discount_amount)}</span></div>
                                          <div className="flex justify-between"><span className="text-sm text-muted-foreground">Delivery:</span><span className="text-sm">{parseFloat(selectedOrder.delivery_cost) === 0 ? 'Free' : formatCurrency(selectedOrder.delivery_cost)}</span></div>
                                          <div className="flex justify-between border-t pt-2"><span className="text-sm font-semibold">Total:</span><span className="text-sm font-semibold">{formatCurrency(selectedOrder.total_amount)}</span></div>
                                        </CardContent>
                                      </Card>
                                    </div>
                                    <Card>
                                      <CardHeader><CardTitle className="text-sm flex items-center gap-2"><MapPin className="h-4 w-4" />Shipping Information</CardTitle></CardHeader>
                                      <CardContent className="space-y-3">
                                        <div><Label className="text-xs text-muted-foreground">Shipping Address:</Label><p className="text-sm mt-1">{selectedOrder.shipping_address}</p></div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div><Label className="text-xs text-muted-foreground">Shipping Method:</Label><p className="text-sm mt-1">{selectedOrder.shipping_method}</p></div>
                                          <div><Label className="text-xs text-muted-foreground">Carrier:</Label><p className="text-sm mt-1">{selectedOrder.carrier_name}</p></div>
                                        </div>
                                        {selectedOrder.order_notes && (<div><Label className="text-xs text-muted-foreground">Order Notes:</Label><p className="text-sm mt-1">{selectedOrder.order_notes}</p></div>)}
                                      </CardContent>
                                    </Card>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            {/* Optional inline status change could be added back when backend supports it */}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
