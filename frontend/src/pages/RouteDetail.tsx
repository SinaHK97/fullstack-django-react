import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetRouteByIdQuery, useUpdateRouteStatusMutation, useGetRouteOrdersQuery, useUpdateOrderStatusMutation } from "@/app/api";
import { RouteStatus, OrderStatus } from "@/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Search,
  User,
  Calendar,
  Package,
  TrendingUp
} from "lucide-react";

const routeStatuses = [
  { value: RouteStatus.PLANNED, label: "Planned", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
  { value: RouteStatus.IN_PROGRESS, label: "In Progress", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Truck },
  { value: RouteStatus.COMPLETED, label: "Completed", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
  { value: RouteStatus.CANCELLED, label: "Cancelled", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
];

const orderStatuses = [
  { value: OrderStatus.PENDING, label: "Pending", color: "bg-gray-100 text-gray-700 border-gray-200", icon: Clock },
  { value: OrderStatus.ASSIGNED, label: "Assigned", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Package },
  { value: OrderStatus.IN_TRANSIT, label: "In Transit", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Truck },
  { value: OrderStatus.DELIVERED, label: "Delivered", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
  { value: OrderStatus.FAILED, label: "Failed", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
];

type StatusInfo = {
  label: string;
  color: string;
  icon: React.ComponentType<any>;
};

export default function RouteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [orderSearch, setOrderSearch] = useState("");
  
  const routeId = parseInt(id || "0");
  
  const { data: route, isLoading: routeLoading, error: routeError } = useGetRouteByIdQuery(routeId);
  const { data: orders, isLoading: ordersLoading, error: ordersError } = useGetRouteOrdersQuery({ 
    routeId, 
    search: orderSearch || undefined 
  });
  
  const [updateRouteStatus] = useUpdateRouteStatusMutation();
  const [updateOrderStatus] = useUpdateOrderStatusMutation();

  const handleRouteStatusChange = async (newStatus: string) => {
    if (!route) return;
    try {
      await updateRouteStatus({ id: route.id, status: newStatus }).unwrap();
    } catch (error) {
      console.error("Failed to update route status:", error);
    }
  };

  const handleOrderStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await updateOrderStatus({ id: orderId, status: newStatus }).unwrap();
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const getStatusInfo = (status: string, statusList: typeof routeStatuses | typeof orderStatuses): StatusInfo => {
    return statusList.find(s => s.value === status) || { 
      label: status, 
      color: "bg-gray-100 text-gray-700 border-gray-200", 
      icon: AlertCircle 
    };
  };

  if (routeLoading) return (
    <div className="p-6">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );

  if (routeError) return (
    <div className="p-6">
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-700">
            <XCircle className="h-5 w-5" />
            <p>Error loading route details. Please try again.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (!route) return (
    <div className="p-6">
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-gray-700">
            <AlertCircle className="h-5 w-5" />
            <p>Route not found.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const routeStatusInfo = getStatusInfo(route.status, routeStatuses);
  const StatusIcon = routeStatusInfo.icon;

  // Calculate order statistics
  const totalOrders = orders?.length || 0;
  const deliveredOrders = orders?.filter(order => order.status === OrderStatus.DELIVERED).length || 0;
  // const inTransitOrders = orders?.filter(order => order.status === OrderStatus.IN_TRANSIT).length || 0;
  // const pendingOrders = orders?.filter(order => order.status === OrderStatus.PENDING).length || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="h-8 w-8 text-blue-600" />
              {route.name}
            </h1>
            <p className="text-gray-600 mt-1">Route Details & Order Management</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full border ${routeStatusInfo.color}`}>
            <StatusIcon className="h-4 w-4" />
            {routeStatusInfo.label}
          </span>
        </div>
      </div>

      {/* Route Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Driver</CardTitle>
            <User className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{route.driver_name}</div>
            <p className="text-xs text-gray-500 mt-1">Assigned driver</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalOrders}</div>
            <p className="text-xs text-gray-500 mt-1">Orders in this route</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{deliveredOrders}</div>
            <p className="text-xs text-gray-500 mt-1">Successfully completed</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {route.completion_percentage ? Math.round(route.completion_percentage) : 0}%
            </div>
            <p className="text-xs text-gray-500 mt-1">Route completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Route Status Update */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Update Route Status
          </CardTitle>
          <CardDescription>
            Change the current status of this route to track its progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label htmlFor="route-status" className="text-sm font-medium">Status:</Label>
            <Select 
              value={route.status} 
              onValueChange={handleRouteStatusChange}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {routeStatuses.map((status) => {
                  const StatusIcon = status.icon;
                  return (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center gap-2">
                        <StatusIcon className="h-4 w-4" />
                        {status.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Section */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Orders ({totalOrders})
              </CardTitle>
              <CardDescription>
                Manage and track individual orders for this route
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search orders..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : ordersError ? (
            <div className="text-center py-8">
              <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600">Error loading orders</p>
            </div>
          ) : !orders || orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500">
                {orderSearch ? "Try adjusting your search criteria." : "No orders have been assigned to this route yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Code</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const orderStatusInfo = getStatusInfo(order.status, orderStatuses);
                    const OrderStatusIcon = orderStatusInfo.icon;
                    
                    return (
                      <TableRow key={order.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-gray-400" />
                            {order.code}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            {order.customer_name}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{order.address}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${orderStatusInfo.color}`}>
                            <OrderStatusIcon className="h-3 w-3" />
                            {orderStatusInfo.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={order.status} 
                            onValueChange={(newStatus) => handleOrderStatusChange(order.id, newStatus)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {orderStatuses.map((status) => {
                                const StatusIcon = status.icon;
                                return (
                                  <SelectItem key={status.value} value={status.value}>
                                    <div className="flex items-center gap-2">
                                      <StatusIcon className="h-4 w-4" />
                                      {status.label}
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Route Metadata */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Route Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <Label className="text-gray-600 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Created:
              </Label>
              <p className="text-gray-900 font-medium">{new Date(route.created_at).toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Last Updated:
              </Label>
              <p className="text-gray-900 font-medium">{new Date(route.updated_at).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
