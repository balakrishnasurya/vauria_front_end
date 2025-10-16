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
  Copy,
  Check,
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
import { productService } from '@/services/product.service';

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
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [productDetails, setProductDetails] = useState<Record<number, any>>({});
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

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
      // Filter out any null or invalid orders
      const validOrders = live.filter(order => order && order.id);
      setOrders(validOrders);
      // compute stats from live data
      const totalOrders = validOrders.length;
      const completedOrders = validOrders.filter(o => o.order_status?.toLowerCase() === 'delivered').length;
      const processingOrders = validOrders.filter(o => ['processing','shipped','in transit','out for delivery'].includes((o.order_status||'').toLowerCase())).length;
      const returnRequests = validOrders.filter(o => !!o.return_request).length;
      const totalRevenue = validOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || '0'), 0);
      setStats({ totalOrders, completedOrders, processingOrders, returnRequests, totalRevenue });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortOrders = () => {
    let filtered = [...orders].filter(order => order && order.id); // Filter out null orders

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
    const map: Record<string, { variant: 'default'|'destructive'|'secondary'|'outline'; label: string; className: string }> = {
      'processing': { variant: 'outline', label: 'Processing', className: 'border-blue-600 text-blue-800 bg-blue-100 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700' },
      'shipped': { variant: 'secondary', label: 'Shipped', className: 'bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:text-white' },
      'in transit': { variant: 'secondary', label: 'In Transit', className: 'bg-amber-500 text-white border-amber-500 dark:bg-amber-400 dark:text-black' },
      'out for delivery': { variant: 'secondary', label: 'Out for Delivery', className: 'bg-orange-500 text-white border-orange-500 dark:bg-orange-400 dark:text-white' },
      'delivered': { variant: 'default', label: 'Delivered', className: 'bg-green-600 text-white border-green-600 dark:bg-green-500 dark:text-white' },
      'cancelled': { variant: 'destructive', label: 'Cancelled', className: 'bg-red-600 text-white border-red-600 dark:bg-red-500 dark:text-white' },
      'returned': { variant: 'secondary', label: 'Returned', className: 'bg-gray-600 text-white border-gray-600 dark:bg-gray-500 dark:text-white' },
      'return requested': { variant: 'outline', label: 'Return Requested', className: 'border-amber-600 text-amber-800 bg-amber-100 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-700' },
    };
    const cfg = map[s] || map['processing'];
    return <Badge variant={cfg.variant} className={`text-xs font-semibold ${cfg.className}`}>{cfg.label}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const s = (status||'').toLowerCase();
    const map: Record<string, { variant: 'default'|'destructive'|'secondary'|'outline'; label: string; className: string }> = {
      'paid': { variant: 'default', label: 'Paid', className: 'bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-500 dark:text-white' },
      'pending': { variant: 'outline', label: 'Pending', className: 'border-yellow-600 text-yellow-800 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700' },
      'cancelled': { variant: 'destructive', label: 'Cancelled', className: 'bg-red-600 text-white border-red-600 dark:bg-red-500 dark:text-white' },
      'returned': { variant: 'secondary', label: 'Returned', className: 'bg-slate-600 text-white border-slate-600 dark:bg-slate-500 dark:text-white' },
    };
    const cfg = map[s] || map['pending'];
    return <Badge variant={cfg.variant} className={`text-xs font-semibold ${cfg.className}`}>{cfg.label}</Badge>;
  };

  const formatCurrency = (amount: string) => `₹${parseFloat(amount||'0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const toggleItemsExpansion = async (orderId: string, items: any[]) => {
    if (!orderId) return; // Safety check
    
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
      // Fetch product details for items that haven't been fetched yet
      for (const item of items) {
        if (item && item.product_id && !productDetails[item.product_id]) {
          try {
            const product = await productService.getProductById(item.product_id);
            if (product) {
              setProductDetails(prev => ({ ...prev, [item.product_id]: product }));
            }
          } catch (error) {
            console.error(`Failed to fetch product ${item.product_id}:`, error);
          }
        }
      }
    }
    setExpandedItems(newExpanded);
  };

  const copyOrderId = async (orderId: string) => {
    if (!orderId) return; // Safety check
    
    try {
      await navigator.clipboard.writeText(orderId);
      setCopiedOrderId(orderId);
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopiedOrderId(null), 2000);
    } catch (error) {
      console.error('Failed to copy order ID:', error);
    }
  };

  const currentOrders = filteredOrders.filter(order => order && order.id); // Filter out null orders

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
                      <TableHead>Return/Cancel</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentOrders.map((order) => (
                      <>
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-xs">
                            <div className="flex items-center gap-2">
                              <span>#{order.id.slice(0, 8)}...</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyOrderId(order.id)}
                                className="h-6 w-6 p-0 hover:bg-muted"
                                title="Copy full order ID"
                              >
                                {copiedOrderId === order.id ? (
                                  <Check className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Copy className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
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
                            <div className="space-y-1">{getStatusBadge(order.order_status)}{order.return_request && (<Badge variant="outline" className="text-xs font-medium border-orange-500 text-orange-700 bg-orange-50 dark:bg-orange-950 dark:text-orange-300 ml-1">Return Request</Badge>)}</div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleItemsExpansion(order.id, order.items)}
                              className="text-sm p-0 h-auto font-normal"
                            >
                              {order.items.length} item{order.items.length > 1 ? 's' : ''}
                              {expandedItems.has(order.id) ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {order.return_request && (
                                <Badge variant="outline" className="text-xs font-semibold border-amber-600 text-amber-800 bg-amber-100 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-700">
                                  Return Requested
                                </Badge>
                              )}
                              {order.cancel_reason && (
                                <div className="text-xs">
                                  <span className="text-muted-foreground">Cancel: </span>
                                  <span className="text-red-800 font-semibold bg-red-100 px-1 py-0.5 rounded dark:bg-red-900 dark:text-red-200">{order.cancel_reason}</span>
                                  {order.cancelled_at && (
                                    <div className="text-muted-foreground">
                                      {formatDate(order.cancelled_at)}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell><div className="text-sm">{formatDate(order.created_at)}</div></TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={async () => {
                                      setSelectedOrder(order);
                                      // Fetch product details for the dialog
                                      for (const item of order.items) {
                                        if (!productDetails[item.product_id]) {
                                          try {
                                            const product = await productService.getProductById(item.product_id);
                                            if (product) {
                                              setProductDetails(prev => ({ ...prev, [item.product_id]: product }));
                                            }
                                          } catch (error) {
                                            console.error(`Failed to fetch product ${item.product_id}:`, error);
                                          }
                                        }
                                      }
                                    }}
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                      Order Details - #{selectedOrder?.id || 'Loading...'}
                                      {selectedOrder && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => copyOrderId(selectedOrder.id)}
                                          className="h-6 w-6 p-0 hover:bg-muted"
                                          title="Copy order ID"
                                        >
                                          {copiedOrderId === selectedOrder.id ? (
                                            <Check className="h-3 w-3 text-green-600" />
                                          ) : (
                                            <Copy className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                          )}
                                        </Button>
                                      )}
                                    </DialogTitle>
                                  </DialogHeader>
                                  {selectedOrder && (
                                    <div className="space-y-6">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Card>
                                          <CardHeader><CardTitle className="text-sm">Order Information</CardTitle></CardHeader>
                                          <CardContent className="space-y-3">
                                            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Order ID:</span><span className="text-sm font-mono">#{selectedOrder.id}</span></div>
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
                                      <Card>
                                        <CardHeader><CardTitle className="text-sm">Order Items</CardTitle></CardHeader>
                                        <CardContent>
                                          <div className="space-y-3">
                                            {selectedOrder.items.map((item, index) => {
                                              const product = productDetails[item.product_id];
                                              return (
                                                <div key={item.id} className="flex items-center gap-3 p-3 border rounded">
                                                  {product?.image_url && (
                                                    <img 
                                                      src={product.image_url} 
                                                      alt={product.name || 'Product'} 
                                                      className="w-12 h-12 object-cover rounded"
                                                    />
                                                  )}
                                                  <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                      <p className="font-mono text-xs text-muted-foreground">
                                                        ID: {item.product_id}
                                                      </p>
                                                      <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => copyOrderId(item.product_id.toString())}
                                                        className="h-5 w-5 p-0 hover:bg-muted"
                                                        title="Copy product ID"
                                                      >
                                                        {copiedOrderId === item.product_id.toString() ? (
                                                          <Check className="h-3 w-3 text-green-600" />
                                                        ) : (
                                                          <Copy className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                                        )}
                                                      </Button>
                                                    </div>
                                                    <p className="font-medium">
                                                      {product?.name || 'Product Name Not Available'}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                      Quantity: {item.quantity} × {formatCurrency(item.price)}
                                                    </p>
                                                  </div>
                                                  <div className="text-right">
                                                    <p className="font-semibold">{formatCurrency((parseFloat(item.price) * item.quantity).toString())}</p>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
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
                        {expandedItems.has(order.id) && (
                          <TableRow>
                            <TableCell colSpan={9} className="bg-muted/50">
                              <div className="p-4">
                                <h4 className="font-medium mb-3">Order Items:</h4>
                                <div className="space-y-2">
                                  {order.items.map((item, index) => {
                                    const product = productDetails[item.product_id];
                                    return (
                                      <div key={item.id} className="flex items-center justify-between p-3 bg-background rounded border">
                                        <div className="flex items-center gap-3">
                                          {product?.image_url && (
                                            <img 
                                              src={product.image_url} 
                                              alt={product.name || 'Product'} 
                                              className="w-12 h-12 object-cover rounded"
                                            />
                                          )}
                                          <div>
                                            <div className="flex items-center gap-2 mb-1">
                                              <p className="font-mono text-xs text-muted-foreground">
                                                ID: {item.product_id}
                                              </p>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => copyOrderId(item.product_id.toString())}
                                                className="h-5 w-5 p-0 hover:bg-muted"
                                                title="Copy product ID"
                                              >
                                                {copiedOrderId === item.product_id.toString() ? (
                                                  <Check className="h-3 w-3 text-green-600" />
                                                ) : (
                                                  <Copy className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                                )}
                                              </Button>
                                            </div>
                                            <p className="font-medium">
                                              {product?.name || 'Product Name Not Available'}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                              Quantity: {item.quantity} × {formatCurrency(item.price)}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="font-semibold">{formatCurrency((parseFloat(item.price) * item.quantity).toString())}</p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
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
