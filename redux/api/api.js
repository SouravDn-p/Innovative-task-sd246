import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Create the API slice for managing API requests
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
  tagTypes: ["User", "Task", "Referral", "Wallet", "UserTasks", "KYC"],
  endpoints: (builder) => ({
    // User Authentication and Management
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

    // Inside endpoints: (builder) => ({
    setReferralId: builder.mutation({
      query: () => ({
        url: "user/setReferralId",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),
    addReferral: builder.mutation({
      query: ({ referrerId, newUser }) => ({
        url: `/user/addReferral/${referrerId}`,
        method: "POST",
        body: { referrerId, newUser },
      }),
      invalidatesTags: ["User", "Referral", "Wallet"],
    }),

    getKYCData: builder.query({
      query: () => "user/kyc-verification",
      providesTags: ["KYC"],
    }),
    updateKYCData: builder.mutation({
      query: (kycData) => ({
        url: "user/kyc-verification",
        method: "POST",
        body: kycData,
      }),
      invalidatesTags: ["KYC"],
    }),
    uploadFile: builder.mutation({
      query: ({ file, documentType }) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("documentType", documentType);

        return {
          url: "user/kyc-verification", // 👈 Prefer this over `upload`
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["KYC"],
    }),

    // Task-Related Endpoints: Manage tasks, submissions, and user-specific tasks
    getTasks: builder.query({
      query: () => "tasks",
      providesTags: ["Task"],
      transformResponse: (response) =>
        response.map((task) => ({
          ...task,
          _id: task._id.$oid,
        })),
    }),
    getTaskById: builder.query({
      query: (id) => `tasks/${id}`,
      providesTags: (result, error, id) => [{ type: "Task", id }],
      transformResponse: (response) => ({
        ...response,
        _id: response._id.$oid,
      }),
    }),
    createTask: builder.mutation({
      query: (taskData) => ({
        url: "tasks",
        method: "POST",
        body: taskData,
      }),
      invalidatesTags: ["Task"],
    }),

    // User-Specific Task Endpoints
    startTask: builder.mutation({
      query: ({ taskId, userName, userEmail }) => ({
        url: `user/tasks`,
        method: "POST",
        body: { taskId, userName, userEmail },
      }),
      invalidatesTags: ["Task", "UserTasks"],
    }),
    getUserTasks: builder.query({
      query: (userEmail) => `user/getUserTasks/${userEmail}`,
      providesTags: ["UserTasks"],
      transformResponse: (response) =>
        response.map((task) => ({
          ...task,
          _id: task._id.$oid,
        })),
    }),
    deleteMyTask: builder.mutation({
      query: (taskId) => ({
        url: `user/myTasks/${taskId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Task", "UserTasks"],
    }),
    getMyTasks: builder.query({
      query: () => `user/myTasks`,
      providesTags: ["Task", "UserTasks"],
      transformResponse: (response) =>
        response.map((task) => ({
          ...task,
          _id: task._id.$oid,
        })),
    }),
    updateMyTask: builder.mutation({
      query: ({ taskId, ...patch }) => ({
        url: `user/myTasks/${taskId}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Task", id: taskId },
      ],
    }),
    getMyTaskSubmissions: builder.query({
      query: () => `user/taskSubmissions`,
      providesTags: ["Task"],
      transformResponse: (response) =>
        response.map((submission) => ({
          ...submission,
          _id: submission._id.$oid,
        })),
    }),
    reviewMyTaskSubmission: builder.mutation({
      query: ({ submissionId, status }) => ({
        url: `user/taskSubmissions/${submissionId}/review`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Task"],
    }),
    submitTaskProof: builder.mutation({
      query: ({ taskId, proofData }) => ({
        url: `user/taskSubmissions/${taskId}/proof`,
        method: "POST",
        body: { taskId, proofData },
      }),
      invalidatesTags: ["Task"],
    }),

    // Referral Endpoints: Manage user referrals and statistics
    getReferrals: builder.query({
      query: () => "referrals/my",
      providesTags: ["Referral"],
    }),
    getAllReferrals: builder.query({
      query: () => "referrals",
      providesTags: ["Referral"],
    }),
    getReferralStats: builder.query({
      query: () => "referrals/stats",
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
  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useGetAllUsersQuery,
  useGetUserByEmailQuery,
  useUpdateUserMutation,

  useSetReferralIdMutation,
  useAddReferralMutation,

  // Add to exports (for KYC):
  useUploadFileMutation,

  // Add to exports:
  useGetKYCDataQuery,
  useUpdateKYCDataMutation,

  useGetTasksQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useStartTaskMutation,
  useGetUserTasksQuery,
  useDeleteMyTaskMutation,

  useGetMyTasksQuery,
  useUpdateMyTaskMutation,
  useGetMyTaskSubmissionsQuery,
  useReviewMyTaskSubmissionMutation,
  useSubmitTaskProofMutation, // Added missing export

  useGetReferralsQuery,
  useGetAllReferralsQuery,
  useGetReferralStatsQuery,
  useGetWalletQuery,
  useRequestWithdrawalMutation,
  useGetWithdrawalsQuery,
  useUpdateWithdrawalMutation,
  useGetTransactionsQuery,
} = api;
