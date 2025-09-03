import { useState } from "react";
import { useGetRoutesQuery } from "@/app/api";
import { useNavigate } from "react-router-dom";
import { RouteStatus } from "@/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Truck, MapPin, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const statuses = [
  { value: RouteStatus.PLANNED, label: "Planned", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
  { value: RouteStatus.IN_PROGRESS, label: "In Progress", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Truck },
  { value: RouteStatus.COMPLETED, label: "Completed", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
  { value: RouteStatus.CANCELLED, label: "Cancelled", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
];

const getStatusInfo = (status: string) => {
  return statuses.find(s => s.value === status) || {
    label: status,
    color: "bg-gray-100 text-gray-700 border-gray-200",
    icon: AlertCircle
  };
};

export default function Dashboard() {
  const [status, setStatus] = useState<string | undefined>();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const { data, isLoading, error } = useGetRoutesQuery({
    status,
    page: currentPage,
    search: search || undefined
  });

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus === "all" ? undefined : newStatus);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalRoutes = data?.count || 0;
  const completedRoutes = data?.results?.filter(route => route.status === RouteStatus.COMPLETED).length || 0;
  const inProgressRoutes = data?.results?.filter(route => route.status === RouteStatus.IN_PROGRESS).length || 0;
  const plannedRoutes = data?.results?.filter(route => route.status === RouteStatus.PLANNED).length || 0;

  if (isLoading) return (
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

  if (error) return (
    <div className="p-6">
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle>Error loading routes</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Failed to load data. Please try again.</p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your delivery routes and track progress</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search routes..."
              value={search}
              onChange={handleSearchChange}
              className="pl-10 w-64"
            />
          </div>
          <Select onValueChange={handleStatusChange} value={status || "all"}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Routes</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  <div className="flex items-center gap-2">
                    <s.icon className="h-4 w-4" />
                    {s.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Routes</CardTitle>
            <MapPin className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalRoutes}</div>
            <p className="text-xs text-gray-500 mt-1">All delivery routes</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
            <Truck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgressRoutes}</div>
            <p className="text-xs text-gray-500 mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedRoutes}</div>
            <p className="text-xs text-gray-500 mt-1">Successfully delivered</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Planned</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{plannedRoutes}</div>
            <p className="text-xs text-gray-500 mt-1">Ready to start</p>
          </CardContent>
        </Card>
      </div>

      {/* Routes Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Delivery Routes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!data?.results || data.results.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No routes found</h3>
              <p className="text-gray-500">
                {search || status ? "Try adjusting your search or filter criteria." : "No delivery routes have been created yet."}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Route Name</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.results.map((route) => {
                      const statusInfo = getStatusInfo(route.status);
                      const StatusIcon = statusInfo.icon;

                      return (
                        <TableRow
                          key={route.id}
                          className="cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                          onClick={() => navigate(`/routes/${route.id}`)}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              {route.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Truck className="h-4 w-4 text-gray-400" />
                              {route.driver_name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${statusInfo.color}`}>
                              <StatusIcon className="h-3 w-3" />
                              {statusInfo.label}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{route.order_count || 0}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${route.completion_percentage || 0}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">
                                {Math.round(route.completion_percentage || 0)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {new Date(route.updated_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {data.count > 0 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, data.count)} of {data.count} routes
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!data.previous}
                    >
                      Previous
                    </Button>

                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                      {(() => {
                        const totalPages = Math.ceil(data.count / 10);
                        const pages = [];
                        const maxVisiblePages = 5;

                        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

                        if (endPage - startPage + 1 < maxVisiblePages) {
                          startPage = Math.max(1, endPage - maxVisiblePages + 1);
                        }

                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <Button
                              key={i}
                              variant={i === currentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(i)}
                              className="w-8 h-8 p-0"
                            >
                              {i}
                            </Button>
                          );
                        }

                        return pages;
                      })()}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!data.next}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
