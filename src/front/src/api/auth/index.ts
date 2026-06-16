import instance from "..";
import { LoginDto } from "./dto/login.dto";
import { SignupDto } from "./dto/signup.dto";
import { Storage, StorageKeys } from "./storage";
import User from "@/entities/user/user";
import { withErrorHandling } from "@/api/api-wrapper-utility";

const getStoredUserId = () => Storage.getItem(StorageKeys.userId);

const getAuthHeader = (token?: string) => {
  const bearerToken = token || Storage.getItem(StorageKeys.access);

  if (!bearerToken) {
    return undefined;
  }

  return {
    Authorization: `Bearer ${bearerToken}`,
  };
};

/**
 * Unwraps the OpenAPI envelope { success: true, data: {...} }
 * and returns the inner `data` payload, or the raw value if no envelope.
 */
const unwrapEnvelope = (raw: any) => {
  if (raw && typeof raw === "object" && "success" in raw && "data" in raw) {
    return raw.data;
  }
  return raw;
};

/**
 * Maps a user object from the API (snake_case) to a User entity.
 * Handles both flat user objects and nested { data: { user: ... } } responses.
 * Also extracts is_entrepreneur / entrepreneur fields from the response envelope.
 */
const normalizeUserFromResponse = (rawData: any): User | null => {
  // Unwrap the API envelope if present
  const payload = unwrapEnvelope(rawData);

  // Extract role-level fields from the payload (siblings of `user`)
  const isEntrepreneur = !!(payload?.is_entrepreneur ?? false);
  const entrepreneurStatus =
    payload?.entrepreneur?.status ?? payload?.entrepreneur_status ?? null;

  // If the payload has a `user` key, navigate into it
  const source = payload?.user ?? payload?.Data ?? payload?.data ?? payload;

  const id = source?.id ?? source?.Id ?? source?.userId;
  const email = source?.emails ?? source?.email ?? source?.Email;
  const name = source?.full_name ?? source?.name ?? "User";
  const phoneNumber = source?.phone_number ?? source?.phoneNumber;
  const idCardUrl = source?.id_card_url ?? source?.idCardUrl;
  const idCardBackUrl = source?.id_card_back_url ?? source?.idCardBackUrl;
  const idCardNumber = source?.id_card_number ?? source?.idCardNumber;

  const validationStatus = source?.deleted_at
    ? "deleted"
    : idCardUrl
      ? "verified"
      : "pending";

  if (!id) {
    return null;
  }

  // Determine role
  const role =
    isEntrepreneur && entrepreneurStatus === "active"
      ? ("entrepreneur" as const)
      : ("investor" as const);

  return new User({
    id: String(id),
    email: email || "",
    name,
    phoneNumber,
    idCardUrl,
    idCardBackUrl,
    idCardNumber,
    validationStatus,
    isEntrepreneur,
    entrepreneurStatus,
    role,
  });
};

export const authProvider = {
  /**
   * POST /auth/register
   * Create a new user account.
   */
  signup: async (data: SignupDto) => {
    return await withErrorHandling<{ message: string }>(
      async () => {
        const response = await instance.post("/auth/register", data);

        if (response.status === 200 || response.status === 201) {
          return {
            status: response.status,
            data: {
              message: "Registration successful",
            },
          };
        }

        return response;
      },
      "Error during registration",
      "Registration successful",
    );
  },

  /**
   * POST /auth/login
   * Authenticate and receive a JWT + user profile.
   */
  login: async ({ email, password }: LoginDto) => {
    return await withErrorHandling<{ user: User; token: string }>(
      async () => {
        const response = await instance.post("/auth/login", {
          email,
          password,
        });

        if (response.status === 200) {
          const body = unwrapEnvelope(response.data);
          const { user: rawUser, token } = body;

          if (token) {
            Storage.setItem(StorageKeys.access, token);
          }

          const user = normalizeUserFromResponse(rawUser);

          if (user) {
            Storage.setItem(StorageKeys.userId, user.id);
          }

          return {
            status: response.status,
            data: {
              user: user ?? undefined,
              token,
              message: "Login successful",
            },
          };
        }

        return response;
      },
      "Error during login",
      "Login successful",
    );
  },

  /**
   * POST /auth/forgot-password — Not yet implemented in the API.
   */
  forgotPassword: async (email: string) => {
    return await withErrorHandling<{ message: string }>(
      async () => {
        return {
          status: 400,
          data: {
            message:
              "Feature unavailable: Forgot password endpoint not documented in current API layout.",
          },
        };
      },
      "Error sending reset code",
      "Reset code sent successfully",
    );
  },

  /**
   * POST /auth/validate-reset-code — Not yet implemented in the API.
   */
  validateResetCode: async (email: string, resetCode: string) => {
    return await withErrorHandling<{ message: string }>(
      async () => {
        return {
          status: 400,
          data: {
            message:
              "Feature unavailable: Code verification endpoint not documented in current API layout.",
          },
        };
      },
      "Invalid or expired verification code",
      "Code verified successfully",
    );
  },

  /**
   * PUT /v1/user/password/{userId}
   * Reset password using an access token.
   */
  resetPassword: async (newPassword: string, accessToken: string) => {
    return await withErrorHandling<{ message: string }>(
      async () => {
        const userId = getStoredUserId();

        if (!userId) {
          return {
            status: 400,
            data: {
              message:
                "Cannot reset password: user identification key not found.",
            },
          };
        }

        const response = await instance.put(
          `/v1/user/password/${userId}`,
          { password: newPassword },
          { headers: getAuthHeader(accessToken) },
        );

        if (response.status === 200) {
          return {
            status: response.status,
            data: {
              message:
                response.data?.message || "Password updated successfully",
            },
          };
        }

        return response;
      },
      "Error resetting password",
      "Password updated successfully",
    );
  },

  /**
   * Client-side logout — clears local storage tokens.
   */
  logout: async () => {
    return await withErrorHandling<{ message: string }>(
      async () => {
        Storage.removeItem(StorageKeys.access);
        Storage.removeItem(StorageKeys.refresh);
        Storage.removeItem(StorageKeys.userId);

        return {
          status: 200,
          data: {
            message: "Logged out successfully",
          },
        };
      },
      "Error during logout execution",
      "Logged out successfully",
    );
  },

  /**
   * GET /auth/me
   * Returns the authenticated user's profile, entrepreneur status, and entrepreneur profile (if applicable).
   */
  getMe: async () => {
    return await withErrorHandling<{ user: User }>(
      async () => {
        const response = await instance.get("/auth/me", {
          headers: getAuthHeader(),
        });

        if (response.status === 200) {
          const user = normalizeUserFromResponse(response.data);

          if (!user) {
            return {
              status: 400,
              data: {
                message:
                  "Invalid user structural interface returned from service context",
              },
            };
          }

          Storage.setItem(StorageKeys.userId, user.id);

          return {
            status: response.status,
            data: {
              user,
              message: "Profile loaded successfully",
            },
          };
        }

        return response;
      },
      "Failed to sync identity profile. Please check your network connectivity and try again.",
      "Profile loaded successfully",
    );
  },

  /**
   * PUT /v1/user/update/{userId}
   * Update the authenticated user's profile fields.
   */
  updateProfile: async (profileData: any) => {
    return await withErrorHandling<{ message: string }>(
      async () => {
        const userId = getStoredUserId();

        if (!userId) {
          return {
            status: 400,
            data: {
              message:
                "Cannot perform operation: unique identity reference sequence not found.",
            },
          };
        }

        const response = await instance.put(
          `/v1/user/update/${userId}`,
          profileData,
          { headers: getAuthHeader() },
        );

        if (response.status === 200) {
          return {
            status: response.status,
            data: {
              message:
                response.data?.message ||
                "Profile parameters updated successfully",
            },
          };
        }

        return response;
      },
      "Error modifying profile settings",
      "Profile parameters updated successfully",
    );
  },

  /**
   * POST /auth/entrepreneur
   * Create an entrepreneur profile for the authenticated user.
   * Initial status is "pending" — an admin must validate.
   */
  becomeEntrepreneur: async () => {
    return await withErrorHandling<{
      id: string;
      user_id: string;
      status: string;
    }>(
      async () => {
        const response = await instance.post(
          "/auth/entrepreneur",
          {},
          { headers: getAuthHeader() },
        );

        if (response.status === 201) {
          const body = unwrapEnvelope(response.data);

          return {
            status: response.status,
            data: {
              id: body.id,
              user_id: body.user_id,
              status: body.status,
              message: "Entrepreneur profile created",
            },
          };
        }

        return response;
      },
      "Error creating entrepreneur profile",
      "Entrepreneur profile created",
    );
  },

  /**
   * Calls /auth/me to refresh the full user profile including entrepreneur status.
   * Useful after becoming an entrepreneur or after admin validation.
   */
  refreshUser: async () => {
    return await authProvider.getMe();
  },

  /**
   * POST /upload/id-card
   * Upload front/back photos of the national ID card.
   * Accepts multipart form-data with `front` and/or `back` fields.
   */
  uploadIdCard: async (formData: FormData) => {
    return await withErrorHandling<{
      front_url?: string;
      back_url?: string;
    }>(
      async () => {
        const response = await instance.post("/upload/id-card", formData, {
          headers: {
            ...getAuthHeader(),
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.status === 200) {
          const body = unwrapEnvelope(response.data);

          return {
            status: response.status,
            data: {
              front_url: body.front_url,
              back_url: body.back_url,
              message: "ID card uploaded successfully",
            },
          };
        }

        return response;
      },
      "Error uploading ID card",
      "ID card uploaded successfully",
    );
  },
};
