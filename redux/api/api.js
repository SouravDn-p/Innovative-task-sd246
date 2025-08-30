import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout } from "../slice/authSlice";

// Base query with enhanced error handling and authentication
const baseQuery = fetchBaseQuery({
  baseUrl: "/api",
  prepareHeaders: (headers, { getState, extra, endpoint, type, forced }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    // Don't set Content-Type here - let individual endpoints or the browser set it
    // This allows FormData to work properly by letting the browser set the boundary
    return headers;
  },
});

// Base query with retry and authentication error handling
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // Handle authentication errors
  if (result.error && result.error.status === 401) {
    // Clear authentication state on 401
    api.dispatch(logout());
  }

  // Retry logic for network errors
  if (result.error && result.error.status === "FETCH_ERROR") {
    // Wait a bit and retry once
    await new Promise((resolve) => setTimeout(resolve, 1000));
    result = await baseQuery(args, api, extraOptions);
  }

  return result;
};

// Create the API slice for managing API requests
export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 30, // Keep data for 30 seconds
  refetchOnFocus: true,
  refetchOnReconnect: true,
  tagTypes: [
    "User",
    "Task",
    "Referral",
    "Wallet",
    "UserTasks",
    "KYC",
    "AdminDashboard",
    "TaskSubmissions",
  ],
  endpoints: (builder) => ({
    // ==========================================
    // AUTHENTICATION & USER MANAGEMENT
    // ==========================================
    registerUser: builder.mutation({
      query: (userData) => ({
        url: "auth/register",
        method: "POST",
        body: userData,
      }),
      transformErrorResponse: (response) => {
        return response.data || { error: "Registration failed" };
      },
    }),
    loginUser: builder.mutation({
      query: (credentials) => ({
        url: "auth/login",
        method: "POST",
        body: credentials,
      }),
      transformErrorResponse: (response) => {
        return response.data || { error: "Login failed" };
      },
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
        "AdminDashboard",
      ],
    }),

    // Profile-specific endpoints
    getUserProfile: builder.query({
      query: () => "user/profile",
      providesTags: ["User"],
    }),
    updateUserProfile: builder.mutation({
      query: (profileData) => ({
        url: "user/profile",
        method: "PUT",
        body: profileData,
      }),
      invalidatesTags: ["User", "AdminDashboard"],
    }),

    // ==========================================
    // REFERRAL SYSTEM (ACTIVE)
    // ==========================================
    addReferral: builder.mutation({
      query: ({ referrerId, newUser }) => ({
        url: `/user/addReferral/${referrerId}`,
        method: "POST",
        body: { referrerId, newUser },
      }),
      invalidatesTags: ["User", "Referral", "Wallet", "AdminDashboard"],
    }),
    getReferrals: builder.query({
      query: () => "referrals/my",
      providesTags: ["Referral"],
    }),
    getReferralStats: builder.query({
      query: () => "referrals/stats",
      providesTags: ["Referral"],
    }),
    setReferralId: builder.mutation({
      query: ({ userId, referralId }) => ({
        url: `user/${userId}/set-referral`,
        method: "POST",
        body: { referralId },
      }),
      invalidatesTags: ["User", "Referral"],
    }),

    // ==========================================
    // KYC SYSTEM (ACTIVE)
    // ==========================================
    getKYCData: builder.query({
      query: () => "user/kyc-verification",
      providesTags: ["KYC"],
    }),
    updateKYCData: builder.mutation({
      query: (kycData) => ({
        url: "user/kyc-verification",
        method: "POST",
        body: kycData,
        // Handle FormData properly by not setting Content-Type
        prepareHeaders: (headers, { getState }) => {
          // For FormData, let the browser set the Content-Type with proper boundary
          if (kycData instanceof FormData) {
            headers.delete("Content-Type");
          } else {
            // For JSON data, explicitly set Content-Type
            headers.set("Content-Type", "application/json");
          }
          return headers;
        },
      }),
      invalidatesTags: ["KYC", "AdminDashboard"],
    }),
    uploadFile: builder.mutation({
      query: ({ file, documentType }) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("documentType", documentType);

        return {
          url: "user/kyc-verification",
          method: "POST",
          body: formData,
          // Don't set Content-Type - let browser set multipart/form-data
          prepareHeaders: (headers) => {
            // Remove Content-Type to let browser set it automatically
            headers.delete("Content-Type");
            return headers;
          },
        };
      },
      invalidatesTags: ["KYC"],
    }),

    // ==========================================
    // TASK SYSTEM (USER SIDE)
    // ==========================================
    getTasks: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach((key) => {
          if (params[key]) searchParams.append(key, params[key]);
        });
        return `tasks?${searchParams.toString()}`;
      },
      providesTags: ["Task"],
    }),
    submitTaskProof: builder.mutation({
      query: ({ taskId, proofData, note }) => ({
        url: `tasks/${taskId}/submit`,
        method: "POST",
        body: { proofData, note },
      }),
      invalidatesTags: [
        "Task",
        "UserTasks",
        "TaskSubmissions",
        "AdminDashboard",
      ],
    }),
    getUserTasks: builder.query({
      query: (userEmail) => `user/getUserTasks/${userEmail}`,
      providesTags: ["UserTasks"],
      transformResponse: (response) => ({
        userTasks:
          response.userTasks?.map((task) => ({
            ...task,
            _id: task._id,
          })) || [],
        statistics: response.statistics || {},
        recentTasks: response.recentTasks || [],
      }),
    }),
    getUserTasksGrouped: builder.query({
      query: () => "user/tasks/grouped",
      providesTags: ["UserTasks"],
    }),
    joinTask: builder.mutation({
      query: ({ taskId, userEmail, userName }) => ({
        url: `tasks/${taskId}/join`,
        method: "POST",
        body: { userEmail, userName },
      }),
      invalidatesTags: ["Task", "UserTasks", "AdminDashboard"],
    }),
    startTask: builder.mutation({
      query: ({ taskId, userEmail }) => ({
        url: `tasks/${taskId}/start`,
        method: "POST",
        body: { userEmail },
      }),
      invalidatesTags: ["Task", "UserTasks"],
    }),
    getMyTaskSubmissions: builder.query({
      query: () => "user/my-task-submissions",
      providesTags: ["TaskSubmissions"],
    }),
    reviewMyTaskSubmission: builder.mutation({
      query: ({ submissionId, action, feedback }) => ({
        url: `user/task-submissions/${submissionId}/review`,
        method: "POST",
        body: { action, feedback },
      }),
      invalidatesTags: ["TaskSubmissions", "UserTasks"],
    }),

    // ==========================================
    // WALLET SYSTEM (ACTIVE)
    // ==========================================
    getWallet: builder.query({
      query: () => "wallet",
      providesTags: ["Wallet"],
    }),
    getTransactions: builder.query({
      query: (userId) => `wallet/${userId}/transactions`,
      providesTags: ["Wallet"],
    }),

    // ==========================================
    // ADMIN USER MANAGEMENT (ACTIVE)
    // ==========================================
    getAdminUsers: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach((key) => {
          if (params[key]) searchParams.append(key, params[key]);
        });
        return `admin/users?${searchParams.toString()}`;
      },
      providesTags: ["User"], // Use unified User tag
    }),
    getAdminUserDetails: builder.query({
      query: (userId) => `admin/users/${userId}`,
      providesTags: (result, error, userId) => [
        { type: "User", id: userId }, // Use unified User tag
      ],
    }),
    suspendUser: builder.mutation({
      query: ({ userId, reason, duration, customReason }) => ({
        url: `admin/users/${userId}/suspend`,
        method: "POST",
        body: { reason, duration, customReason },
      }),
      invalidatesTags: ["User", "AdminDashboard"],
    }),
    reactivateUser: builder.mutation({
      query: ({ userId, feeCollected, feeAmount, paymentReference, note }) => ({
        url: `admin/users/${userId}/reactivate`,
        method: "POST",
        body: { feeCollected, feeAmount, paymentReference, note },
      }),
      invalidatesTags: ["User", "AdminDashboard"],
    }),
    adjustUserWallet: builder.mutation({
      query: ({ userId, type, amount, note, reference }) => ({
        url: `admin/users/${userId}/wallet-adjust`,
        method: "POST",
        body: { type, amount, note, reference },
      }),
      invalidatesTags: ["User", "Wallet", "AdminDashboard"],
    }),
    resetUserPassword: builder.mutation({
      query: ({ userId, newPassword, sendNotification }) => ({
        url: `admin/users/${userId}/reset-password`,
        method: "POST",
        body: { newPassword, sendNotification },
      }),
      invalidatesTags: ["User"],
    }),
    deleteUser: builder.mutation({
      query: ({ userId, reason, confirmDelete }) => ({
        url: `admin/users/${userId}/delete`,
        method: "DELETE",
        body: { reason, confirmDelete },
      }),
      invalidatesTags: ["User", "AdminDashboard"],
    }),
    bulkSuspendUsers: builder.mutation({
      query: ({ userIds, reason, duration, customReason }) => ({
        url: "admin/users/bulk-suspend",
        method: "POST",
        body: { userIds, reason, duration, customReason },
      }),
      invalidatesTags: ["User", "AdminDashboard"],
    }),
    bulkReactivateUsers: builder.mutation({
      query: ({ userIds, feeCollected, feeAmount }) => ({
        url: "admin/users/bulk-reactivate",
        method: "POST",
        body: { userIds, feeCollected, feeAmount },
      }),
      invalidatesTags: ["User", "AdminDashboard"],
    }),
    sendUserNotification: builder.mutation({
      query: ({ userId, channel, message, subject }) => ({
        url: `admin/users/${userId}/notify`,
        method: "POST",
        body: { channel, message, subject },
      }),
    }),

    // ==========================================
    // ADMIN TASK MANAGEMENT (ACTIVE)
    // ==========================================
    getAdminTasks: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach((key) => {
          if (params[key]) searchParams.append(key, params[key]);
        });
        return `admin/tasks?${searchParams.toString()}`;
      },
      providesTags: ["Task"], // Use unified Task tag
    }),
    getAdminTaskDetails: builder.query({
      query: (taskId) => `admin/tasks/${taskId}`,
      providesTags: (result, error, taskId) => [{ type: "Task", id: taskId }],
    }),
    approveTask: builder.mutation({
      query: ({ taskId, note }) => {
        console.log("[REDUX API] Approving task:", { taskId, note });
        return {
          url: `admin/tasks/${taskId}/approve`,
          method: "POST",
          body: { note },
          headers: {
            "Cache-Control": "no-cache",
          },
        };
      },
      invalidatesTags: ["Task", "AdminDashboard"],
    }),
    pauseResumeTask: builder.mutation({
      query: ({ taskId, action, reason, duration }) => ({
        url: `admin/tasks/${taskId}/pause-resume`,
        method: "POST",
        body: { action, reason, duration },
      }),
      invalidatesTags: ["Task", "AdminDashboard"],
    }),
    completeTask: builder.mutation({
      query: ({ taskId, forceComplete, reason, refundRemaining }) => ({
        url: `admin/tasks/${taskId}/complete`,
        method: "POST",
        body: { forceComplete, reason, refundRemaining },
      }),
      invalidatesTags: ["Task", "Wallet", "AdminDashboard"],
    }),
    deleteAdminTask: builder.mutation({
      query: ({ taskId, reason, confirmDelete }) => ({
        url: `admin/tasks/${taskId}`,
        method: "DELETE",
        body: { reason, confirmDelete },
      }),
      invalidatesTags: ["Task", "AdminDashboard"],
    }),

    // ==========================================
    // ADMIN TASK SUBMISSIONS (ACTIVE)
    // ==========================================
    getAdminTaskSubmissions: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach((key) => {
          if (params[key]) searchParams.append(key, params[key]);
        });
        return `admin/task-submissions?${searchParams.toString()}`;
      },
      providesTags: ["TaskSubmissions"],
    }),
    getAdminTaskSubmissionDetails: builder.query({
      query: (submissionId) => `admin/task-submissions/${submissionId}`,
      providesTags: (result, error, submissionId) => [
        { type: "TaskSubmissions", id: submissionId },
      ],
    }),
    reviewTaskSubmission: builder.mutation({
      query: ({ submissionId, action, feedback }) => ({
        url: `admin/task-submissions/${submissionId}`,
        method: "POST",
        body: { action, feedback },
      }),
      invalidatesTags: [
        "TaskSubmissions",
        "UserTasks",
        "Wallet",
        "AdminDashboard",
      ],
    }),
    getTaskSubmissions: builder.query({
      query: (taskId) => `tasks/${taskId}/submissions`,
      providesTags: ["TaskSubmissions"],
    }),
    reviewTaskSubmissions: builder.mutation({
      query: ({ submissionIds, action, feedback }) => ({
        url: "admin/task-submissions/bulk-review",
        method: "POST",
        body: { submissionIds, action, feedback },
      }),
      invalidatesTags: [
        "TaskSubmissions",
        "UserTasks",
        "Wallet",
        "AdminDashboard",
      ],
    }),

    // ==========================================
    // ADMIN KYC MANAGEMENT (ACTIVE)
    // ==========================================
    getAdminKYCApplications: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach((key) => {
          if (params[key]) searchParams.append(key, params[key]);
        });
        return `admin/kyc?${searchParams.toString()}`;
      },
      providesTags: ["KYC"], // Use unified KYC tag
    }),
    getAdminKYCApplicationDetails: builder.query({
      query: (applicationId) => `admin/kyc/${applicationId}`,
      providesTags: (result, error, applicationId) => [
        { type: "KYC", id: applicationId }, // Use unified KYC tag
      ],
    }),
    approveKYCApplication: builder.mutation({
      query: ({ applicationId, action, rejectionReason, notes }) => ({
        url: `admin/kyc/${applicationId}`,
        method: "POST",
        body: { action, rejectionReason, notes },
      }),
      transformErrorResponse: (response) => {
        // Provide better error messages for KYC approval
        return (
          response.data || { message: "Failed to process KYC application" }
        );
      },
      invalidatesTags: ["KYC", "User", "AdminDashboard"],
    }),
    updateKYCApplication: builder.mutation({
      query: ({ applicationId, assignTo, notes, priority }) => ({
        url: `admin/kyc/${applicationId}`,
        method: "PUT",
        body: { assignTo, notes, priority },
      }),
      transformErrorResponse: (response) => {
        // Provide better error messages for KYC updates
        return response.data || { message: "Failed to update KYC application" };
      },
      invalidatesTags: (result, error, { applicationId }) => [
        { type: "KYC", id: applicationId },
        "KYC",
      ],
    }),

    // ==========================================
    // ADMIN DASHBOARD STATISTICS (ACTIVE)
    // ==========================================
    getAdminDashboardStats: builder.query({
      query: () => "admin/dashboard",
      providesTags: ["AdminDashboard"],
      // Refetch every 30 seconds for real-time updates
      pollingInterval: 30000,
    }),

    uploadDocument: builder.mutation({
      query: ({ file, documentType }) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("documentType", documentType);
        return {
          url: "/upload", // Points to /api/upload
          method: "POST",
          body: formData,
          prepareHeaders: (headers) => {
            headers.delete("Content-Type");
            return headers;
          },
        };
      },
      invalidatesTags: ["KYC"],
    }),
  }),
});

export const {
  // Authentication & User Management
  useRegisterUserMutation,
  useLoginUserMutation,
  useGetUserByEmailQuery,
  useUpdateUserMutation,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,

  // Referral System
  useAddReferralMutation,
  useGetReferralsQuery,
  useGetReferralStatsQuery,
  useSetReferralIdMutation,

  // KYC System
  useGetKYCDataQuery,
  useUpdateKYCDataMutation,
  useUploadFileMutation,

  // Task System (User)
  useGetTasksQuery,
  useSubmitTaskProofMutation,
  useGetUserTasksQuery,
  useGetUserTasksGroupedQuery,
  useJoinTaskMutation,
  useStartTaskMutation,
  useGetMyTaskSubmissionsQuery,
  useReviewMyTaskSubmissionMutation,

  // Wallet System
  useGetWalletQuery,
  useGetTransactionsQuery,

  // Admin User Management
  useGetAdminUsersQuery,
  useGetAdminUserDetailsQuery,
  useSuspendUserMutation,
  useReactivateUserMutation,
  useAdjustUserWalletMutation,
  useResetUserPasswordMutation,
  useDeleteUserMutation,
  useBulkSuspendUsersMutation,
  useBulkReactivateUsersMutation,
  useSendUserNotificationMutation,

  // Admin Task Management
  useGetAdminTasksQuery,
  useGetAdminTaskDetailsQuery,
  useApproveTaskMutation,
  usePauseResumeTaskMutation,
  useCompleteTaskMutation,
  useDeleteAdminTaskMutation,

  // Admin Task Submissions
  useGetAdminTaskSubmissionsQuery,
  useGetAdminTaskSubmissionDetailsQuery,
  useReviewTaskSubmissionMutation,
  useGetTaskSubmissionsQuery,
  useReviewTaskSubmissionsMutation,

  // Admin KYC Management
  useGetAdminKYCApplicationsQuery,
  useGetAdminKYCApplicationDetailsQuery,
  useApproveKYCApplicationMutation,
  useUpdateKYCApplicationMutation,

  // Admin Dashboard
  useGetAdminDashboardStatsQuery,

  useUploadDocumentMutation,
} = api;
