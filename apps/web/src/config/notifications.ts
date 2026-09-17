export const notificationMessages = {
  auth: {
    loginSuccess: "Login successful.",
    loginFailed: "Login failed. Check your email and password.",
    logoutSuccess: "You have been logged out.",
    signupSuccess: "Account created successfully.",
  },
  common: {
    saved: "Changes saved successfully.",
    deleted: "Deleted successfully.",
    genericError: "Something went wrong. Please try again.",
  },
  applications: {
    submitted: "Application submitted successfully.",
    updated: "Application status updated.",
  },
  uploads: {
    success: "Upload completed successfully.",
    failed: "Upload failed. Please try again.",
  },
} as const;
