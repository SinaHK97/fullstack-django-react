import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  Route,
  Order,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  PaginatedResponse,
} from "@/types";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError, FetchBaseQueryMeta } from "@reduxjs/toolkit/query";

// Global error handler for 401 responses
let globalNavigate: ((path: string) => void) | null = null;

export const setGlobalHandlers = (navigate: (path: string) => void, _dispatch: (action: any) => void) => {
  globalNavigate = navigate;
};

// Raw base query
const rawBaseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:8000/api",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as any).auth?.token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Custom base query that handles 401 responses
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  {},
  FetchBaseQueryMeta
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result && (result as any).error && (result as any).error.status === 401) {
    api.dispatch({ type: "auth/logout" });
    if (globalNavigate) {
      globalNavigate("/login");
    } else if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Route", "Order", "User"],
  endpoints: (builder) => ({
    // Authentication endpoints
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body: LoginRequest) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
    }),

    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (body: RegisterRequest) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),

    // Route endpoints
    getRoutes: builder.query<
      PaginatedResponse<Route>,
      { status?: string; page?: number; search?: string }
    >({
      query: (args?: { status?: string; page?: number; search?: string }) => {
        const params = new URLSearchParams();
        if (args?.status) params.append("status", args.status);
        if (args?.page) params.append("page", String(args.page));
        if (args?.search) params.append("search", args.search);
        const queryString = params.toString();
        return `/routes${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: ["Route"],
    }),

    getRouteById: builder.query<Route, number>({
      query: (id: number) => `/routes/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Route", id }],
    }),

    updateRouteStatus: builder.mutation<Route, { id: number; status: string }>({
      query: ({ id, status }: { id: number; status: string }) => ({
        url: `/routes/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Route", id }, "Route"],
    }),

    getRouteOrders: builder.query<
      Order[],
      { routeId: number; search?: string }
    >({
      query: ({ routeId, search }: { routeId: number; search?: string }) => {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        const queryString = params.toString();
        return `/routes/${routeId}/orders${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: (_result, _error, { routeId }) => [
        { type: "Order", id: "LIST" },
        { type: "Route", id: routeId },
      ],
    }),

    exportRoutesCSV: builder.query<Blob, { search?: string }>({
      query: (args?: { search?: string }) => {
        const params = new URLSearchParams();
        if (args?.search) params.append("q", args.search);
        const queryString = params.toString();
        return {
          url: `/routes/export.csv${queryString ? `?${queryString}` : ""}`,
          responseHandler: (res: Response) => res.blob(),
        } as any;
      },
    }),

    // Order endpoints
    getOrderById: builder.query<Order, number>({
      query: (id: number) => `/orders/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Order", id }],
    }),

    updateOrderStatus: builder.mutation<Order, { id: number; status: string }>({
      query: ({ id, status }: { id: number; status: string }) => ({
        url: `/orders/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Order", id },
        { type: "Order", id: "LIST" },
        "Route",
      ],
    }),
  }),
});

export const {
  // Auth hooks
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,

  // Route hooks
  useGetRoutesQuery,
  useGetRouteByIdQuery,
  useUpdateRouteStatusMutation,
  useGetRouteOrdersQuery,
  useExportRoutesCSVQuery,

  // Order hooks
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
} = api;
