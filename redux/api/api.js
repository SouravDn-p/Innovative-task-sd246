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
  tagTypes: [
    "User",
    "Task",
    "Referral",
    "Wallet",
    "UserTasks",
    "KYC",
    "AdminUsers",
    "AdminTasks",
    "AdminKYC",
    "TaskSubmissions",
  ],
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
      invalidatesTags: ["User"],
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
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach((key) => {
          if (params[key]) searchParams.append(key, params[key]);
        });
        return `tasks?${searchParams.toString()}`;
      },
      providesTags: ["Task"],
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
    getUserTasksGrouped: builder.query({
      query: () => "user/tasks",
      providesTags: ["UserTasks", "Task"],
    }),
    joinTask: builder.mutation({
      query: ({ taskId }) => ({
        url: "user/tasks",
        method: "POST",
        body: { taskId },
      }),
      invalidatesTags: ["Task", "UserTasks"],
    }),
    submitTaskProof: builder.mutation({
      query: ({ taskId, proofData, note }) => ({
        url: `tasks/${taskId}/submit`,
        method: "POST",
        body: { proofData, note },
      }),
      invalidatesTags: ["Task", "UserTasks"],
    }),
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

    // Advertiser Wallet Endpoints
    getAdvertiserWallet: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach((key) => {
          if (params[key]) searchParams.append(key, params[key]);
        });
        return `advertiser/wallet?${searchParams.toString()}`;
      },
      providesTags: ["Wallet"],
    }),
    addAdvertiserFunds: builder.mutation({
      query: ({ amount, description, reference }) => ({
        url: "advertiser/wallet",
        method: "POST",
        body: { amount, description, reference },
      }),
      invalidatesTags: ["Wallet"],
    }),

    // Admin User Management Endpoints
    getAdminUsers: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach((key) => {
          if (params[key]) searchParams.append(key, params[key]);
        });
        return `admin/users?${searchParams.toString()}`;
      },
      providesTags: ["AdminUsers"],
    }),
    getAdminUserDetails: builder.query({
      query: (userId) => `admin/users/${userId}`,
      providesTags: (result, error, userId) => [
        { type: "AdminUsers", id: userId },
      ],
    }),
    suspendUser: builder.mutation({
      query: ({ userId, reason, duration, customReason }) => ({
        url: `admin/users/${userId}/suspend`,
        method: "POST",
        body: { reason, duration, customReason },
      }),
      invalidatesTags: ["AdminUsers", "User"],
    }),
    reactivateUser: builder.mutation({
      query: ({ userId, feeCollected, feeAmount, paymentReference, note }) => ({
        url: `admin/users/${userId}/reactivate`,
        method: "POST",
        body: { feeCollected, feeAmount, paymentReference, note },
      }),
      invalidatesTags: ["AdminUsers", "User"],
    }),
    adjustUserWallet: builder.mutation({
      query: ({ userId, type, amount, note, reference }) => ({
        url: `admin/users/${userId}/wallet-adjust`,
        method: "POST",
        body: { type, amount, note, reference },
      }),
      invalidatesTags: ["AdminUsers", "User", "Wallet"],
    }),
    resetUserPassword: builder.mutation({
      query: ({ userId, newPassword, sendNotification }) => ({
        url: `admin/users/${userId}/reset-password`,
        method: "POST",
        body: { newPassword, sendNotification },
      }),
      invalidatesTags: ["AdminUsers"],
    }),
    deleteUser: builder.mutation({
      query: ({ userId, reason, confirmDelete }) => ({
        url: `admin/users/${userId}/delete`,
        method: "DELETE",
        body: { reason, confirmDelete },
      }),
      invalidatesTags: ["AdminUsers", "User"],
    }),
    bulkSuspendUsers: builder.mutation({
      query: ({ userIds, reason, duration, customReason }) => ({
        url: "admin/users/bulk-suspend",
        method: "POST",
        body: { userIds, reason, duration, customReason },
      }),
      invalidatesTags: ["AdminUsers", "User"],
    }),
    bulkReactivateUsers: builder.mutation({
      query: ({ userIds, feeCollected, feeAmount }) => ({
        url: "admin/users/bulk-reactivate",
        method: "POST",
        body: { userIds, feeCollected, feeAmount },
      }),
      invalidatesTags: ["AdminUsers", "User"],
    }),
    exportUsers: builder.query({
      query: (filters = {}) => {
        const searchParams = new URLSearchParams();
        Object.keys(filters).forEach((key) => {
          if (filters[key]) searchParams.append(key, filters[key]);
        });
        return `admin/users/export?${searchParams.toString()}`;
      },
    }),
    sendUserNotification: builder.mutation({
      query: ({ userId, channel, message, subject }) => ({
        url: `admin/users/${userId}/notify`,
        method: "POST",
        body: { channel, message, subject },
      }),
    }),
    bulkNotifyUsers: builder.mutation({
      query: ({ userIds, channel, message, subject }) => ({
        url: "admin/users/notify-bulk",
        method: "POST",
        body: { userIds, channel, message, subject },
      }),
    }),

    // Admin Task Management Endpoints
    getAdminTasks: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach((key) => {
          if (params[key]) searchParams.append(key, params[key]);
        });
        return `admin/tasks?${searchParams.toString()}`;
      },
      providesTags: ["AdminTasks"],
    }),
    getAdminTaskDetails: builder.query({
      query: (taskId) => `admin/tasks/${taskId}`,
      providesTags: (result, error, taskId) => [
        { type: "AdminTasks", id: taskId },
        { type: "Task", id: taskId },
      ],
    }),
    createAdminTask: builder.mutation({
      query: (taskData) => ({
        url: "admin/tasks",
        method: "POST",
        body: taskData,
      }),
      invalidatesTags: ["AdminTasks", "Task"],
    }),
    updateAdminTask: builder.mutation({
      query: ({ taskId, ...data }) => ({
        url: `admin/tasks/${taskId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "AdminTasks", id: taskId },
        { type: "Task", id: taskId },
        "AdminTasks",
      ],
    }),
    deleteAdminTask: builder.mutation({
      query: ({ taskId, reason, confirmDelete }) => ({
        url: `admin/tasks/${taskId}`,
        method: "DELETE",
        body: { reason, confirmDelete },
      }),
      invalidatesTags: ["AdminTasks", "Task"],
    }),
    approveTask: builder.mutation({
      query: ({ taskId, note }) => ({
        url: `admin/tasks/${taskId}/approve`,
        method: "POST",
        body: { note },
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "AdminTasks", id: taskId },
        { type: "Task", id: taskId },
        "AdminTasks",
        "Task", // Invalidate all task cache to ensure user tasks page refreshes
      ],
    }),
    pauseResumeTask: builder.mutation({
      query: ({ taskId, action, reason, duration }) => ({
        url: `admin/tasks/${taskId}/pause-resume`,
        method: "POST",
        body: { action, reason, duration },
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "AdminTasks", id: taskId },
        { type: "Task", id: taskId },
        "AdminTasks",
      ],
    }),
    completeTask: builder.mutation({
      query: ({ taskId, forceComplete, reason, refundRemaining }) => ({
        url: `admin/tasks/${taskId}/complete`,
        method: "POST",
        body: { forceComplete, reason, refundRemaining },
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "AdminTasks", id: taskId },
        { type: "Task", id: taskId },
        "AdminTasks",
        "Wallet",
      ],
    }),
    reviewTaskSubmissions: builder.mutation({
      query: ({ taskId, submissionIds, action, feedback, bulkReason }) => ({
        url: `admin/tasks/${taskId}/submissions`,
        method: "POST",
        body: { submissionIds, action, feedback, bulkReason },
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "AdminTasks", id: taskId },
        { type: "Task", id: taskId },
        "AdminTasks",
        "Wallet",
      ],
    }),
    getTaskSubmissions: builder.query({
      query: ({ taskId, status, page = 1, limit = 20 }) => {
        const searchParams = new URLSearchParams();
        if (status) searchParams.append("status", status);
        searchParams.append("page", page.toString());
        searchParams.append("limit", limit.toString());
        return `admin/tasks/${taskId}/submissions?${searchParams.toString()}`;
      },
      providesTags: (result, error, { taskId }) => [
        { type: "AdminTasks", id: taskId },
      ],
    }),

    // Task Submission Endpoints
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
      invalidatesTags: ["TaskSubmissions", "UserTasks", "Wallet"],
    }),

    // Admin KYC Management Endpoints
    getAdminKYCApplications: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach((key) => {
          if (params[key]) searchParams.append(key, params[key]);
        });
        return `admin/kyc?${searchParams.toString()}`;
      },
      providesTags: ["AdminKYC"],
    }),
    getAdminKYCApplicationDetails: builder.query({
      query: (applicationId) => `admin/kyc/${applicationId}`,
      providesTags: (result, error, applicationId) => [
        { type: "AdminKYC", id: applicationId },
      ],
    }),
    approveKYCApplication: builder.mutation({
      query: ({ applicationId, action, rejectionReason, notes }) => ({
        url: `admin/kyc/${applicationId}`,
        method: "POST",
        body: { action, rejectionReason, notes },
      }),
      invalidatesTags: (result, error, { applicationId }) => [
        { type: "AdminKYC", id: applicationId },
        "AdminKYC",
        "AdminUsers",
        "KYC",
      ],
    }),
    updateKYCApplication: builder.mutation({
      query: ({ applicationId, assignTo, notes, priority }) => ({
        url: `admin/kyc/${applicationId}`,
        method: "PUT",
        body: { assignTo, notes, priority },
      }),
      invalidatesTags: (result, error, { applicationId }) => [
        { type: "AdminKYC", id: applicationId },
        "AdminKYC",
      ],
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useGetAllUsersQuery,
  useGetUserByEmailQuery,
  useUpdateUserMutation,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,

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
  useGetUserTasksGroupedQuery,
  useJoinTaskMutation,
  useSubmitTaskProofMutation,
  useStartTaskMutation,
  useGetUserTasksQuery,
  useDeleteMyTaskMutation,

  useGetMyTasksQuery,
  useUpdateMyTaskMutation,
  useGetMyTaskSubmissionsQuery,
  useReviewMyTaskSubmissionMutation,

  useGetReferralsQuery,
  useGetAllReferralsQuery,
  useGetReferralStatsQuery,
  useGetWalletQuery,
  useRequestWithdrawalMutation,
  useGetWithdrawalsQuery,
  useUpdateWithdrawalMutation,
  useGetTransactionsQuery,

  // Advertiser Wallet exports
  useGetAdvertiserWalletQuery,
  useAddAdvertiserFundsMutation,

  // Admin User Management exports
  useGetAdminUsersQuery,
  useGetAdminUserDetailsQuery,
  useSuspendUserMutation,
  useReactivateUserMutation,
  useAdjustUserWalletMutation,
  useResetUserPasswordMutation,
  useDeleteUserMutation,
  useBulkSuspendUsersMutation,
  useBulkReactivateUsersMutation,
  useExportUsersQuery,
  useSendUserNotificationMutation,
  useBulkNotifyUsersMutation,

  // Admin Task Management exports
  useGetAdminTasksQuery,
  useGetAdminTaskDetailsQuery,
  useCreateAdminTaskMutation,
  useUpdateAdminTaskMutation,
  useDeleteAdminTaskMutation,
  useApproveTaskMutation,
  usePauseResumeTaskMutation,
  useCompleteTaskMutation,
  useReviewTaskSubmissionsMutation,
  useGetTaskSubmissionsQuery,

  // Task Submission Management exports
  useGetAdminTaskSubmissionsQuery,
  useGetAdminTaskSubmissionDetailsQuery,
  useReviewTaskSubmissionMutation,

  // Admin KYC Management exports
  useGetAdminKYCApplicationsQuery,
  useGetAdminKYCApplicationDetailsQuery,
  useApproveKYCApplicationMutation,
  useUpdateKYCApplicationMutation,
} = api;
