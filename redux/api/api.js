import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["User", "Task", "Referral", "Wallet", "Product", "Order", "Blog"],
  endpoints: (builder) => ({
    // Auth Endpoints
    registerUser: builder.mutation({
      query: (userData) => ({
        url: "auth/register",
        method: "POST",
        body: userData,
      }),
    }),
    loginUser: builder.mutation({
      query: (credentials) => ({
        url: "auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    // User Management Endpoints
    getAllUsers: builder.query({
      query: () => "users",
      providesTags: ["User"],
    }),
    getUserByEmail: builder.query({
      query: (email) => `users/${email}`,
      providesTags: (result, error, email) => [{ type: "User", id: email }],
    }),
    updateUser: builder.mutation({
      query: ({ email, data }) => ({
        url: `users/${email}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { email }) => [
        { type: "User", id: email },
      ],
    }),
    // Task Endpoints
    getTasks: builder.query({
      query: () => "tasks",
      providesTags: ["Task"],
    }),
    getTaskById: builder.query({
      query: (id) => `tasks/${id}`,
      providesTags: (result, error, id) => [{ type: "Task", id }],
    }),
    submitTask: builder.mutation({
      query: ({ taskId, proof }) => ({
        url: `tasks/${taskId}/submit`,
        method: "POST",
        body: proof,
      }),
      invalidatesTags: ["Task", "Wallet"],
    }),
    // Task Management Endpoints for Admin
    createTask: builder.mutation({
      query: (taskData) => ({
        url: "tasks",
        method: "POST",
        body: taskData,
      }),
      invalidatesTags: ["Task"],
    }),
    updateTask: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `tasks/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Task", id }],
    }),
    deleteTask: builder.mutation({
      query: (id) => ({
        url: `tasks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Task"],
    }),
    submitTaskProof: builder.mutation({
      query: ({ taskId, proof }) => ({
        url: `/tasks/${taskId}/proof`,
        method: "POST",
        body: { proof }, // proof = image url / text etc
      }),
    }),
    // Referral Endpoints
    getReferrals: builder.query({
      query: () => "referrals/my",
      providesTags: ["Referral"],
    }),
    // Referral Management Endpoints
    getAllReferrals: builder.query({
      query: () => "referrals",
      providesTags: ["Referral"],
    }),

    getReferralStats: builder.query({
      query: () => "referrals/stats", // ✅ stats API route
      providesTags: ["Referral"],
    }),
    // Wallet Endpoints
    getWallet: builder.query({
      query: () => "wallet",
      providesTags: ["Wallet"],
    }),
    requestWithdrawal: builder.mutation({
      query: (withdrawalData) => ({
        url: "withdrawals/request",
        method: "POST",
        body: withdrawalData,
      }),
      invalidatesTags: ["Wallet"],
    }),
    // Withdrawal Management Endpoints
    getWithdrawals: builder.query({
      query: () => "withdrawals",
      providesTags: ["Wallet"],
    }),
    updateWithdrawal: builder.mutation({
      query: ({ id, status }) => ({
        url: `withdrawals/${id}`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Wallet"],
    }),
    getTransactions: builder.query({
      query: (userId) => `wallet/${userId}/transactions`,
      providesTags: ["Wallet"],
    }),
    // Product Management Endpoints for Future Expansion
    getProducts: builder.query({
      query: () => "products",
      providesTags: ["Product"],
    }),
    getProductById: builder.query({
      query: (id) => `products/${id}`,
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),
    createProduct: builder.mutation({
      query: (product) => ({
        url: "products",
        method: "POST",
        body: product,
      }),
      invalidatesTags: ["Product"],
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `products/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Product", id }],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),
    // Order Management Endpoints
    getOrders: builder.query({
      query: () => "orders",
      providesTags: ["Order"],
    }),
    getOrderById: builder.query({
      query: (id) => `orders/${id}`,
      providesTags: (result, error, id) => [{ type: "Order", id }],
    }),
    getOrdersByEmail: builder.query({
      query: (email) => `orders/user/${email}`,
      providesTags: ["Order"],
    }),
    placeOrder: builder.mutation({
      query: (orderData) => ({
        url: "orders",
        method: "POST",
        body: orderData,
      }),
      invalidatesTags: ["Order"],
    }),
    updateOrder: builder.mutation({
      query: ({ id, data }) => ({
        url: `orders/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Order", id }],
    }),
    // Blog Management Endpoints for Announcements
    getBlogs: builder.query({
      query: () => "blogs",
      providesTags: ["Blog"],
    }),
    getBlogById: builder.query({
      query: (id) => `blogs/${id}`,
      providesTags: (result, error, id) => [{ type: "Blog", id }],
    }),
    createBlog: builder.mutation({
      query: (blog) => ({
        url: "blogs",
        method: "POST",
        body: blog,
      }),
      invalidatesTags: ["Blog"],
    }),
    updateBlog: builder.mutation({
      query: ({ id, data }) => ({
        url: `blogs/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Blog", id }],
    }),
    deleteBlog: builder.mutation({
      query: (id) => ({
        url: `blogs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Blog"],
    }),

    // Task Submissions Endpoints
    getTaskSubmissions: builder.query({
      query: () => "task-submissions", // adjust this to your API route
      providesTags: ["Task"],
    }),
    reviewTaskSubmission: builder.mutation({
      query: ({ submissionId, status }) => ({
        url: `task-submissions/${submissionId}/review`, // adjust API route
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Task"],
    }),
  }),
});

export const {
  // Auth hooks
  useRegisterUserMutation,
  useLoginUserMutation,
  useGetAllUsersQuery,
  useGetUserByEmailQuery,
  useUpdateUserMutation,

  // Task hooks
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useSubmitTaskMutation,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useSubmitTaskProofMutation,

  // Referral hooks
  useGetReferralsQuery,
  useGetAllReferralsQuery,
  useGetReferralStatsQuery,

  // Wallet hooks
  useGetWalletQuery,
  useRequestWithdrawalMutation,
  useGetWithdrawalsQuery,
  useUpdateWithdrawalMutation,
  useGetTransactionsQuery,

  // Product hooks
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,

  // Order hooks
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useGetOrdersByEmailQuery,
  usePlaceOrderMutation,
  useUpdateOrderMutation,

  // Blog hooks
  useGetBlogsQuery,
  useGetBlogByIdQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,

  // Task Submissions hooks
  useGetTaskSubmissionsQuery,
  useReviewTaskSubmissionMutation,
} = api;
