import axios, { AxiosInstance } from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

interface UserFilters {
  role?: string;
  status?: string;
  search?: string;
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalPosts: number;
  totalEvents: number;
  totalComments: number;
  recentRegistrations: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  enrollment_year: number;
  occupation?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UserData {
  username?: string;
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  enrollment_year?: number;
  occupation?: string;
}

/** NEW: Contact inquiry type */
export interface ContactInquiry {
  id: number;
  full_name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  read_at: string | null;
  deleted: boolean;
}

/** NEW: API response wrapper for inquiries endpoints */
interface InquiriesResponse {
  ok: boolean;
  inquiries: ContactInquiry[];
}

interface InquiryResponse {
  ok: boolean;
  inquiry: ContactInquiry;
}

class AdminService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: false,
    });

    // Add token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // User Management
  async getUsers(
    filters: UserFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<User>> {
    const params = { ...filters, page, limit };
    const response = await this.api.get<PaginatedResponse<User>>(
      "/admin/users",
      { params }
    );
    return response.data;
  }

  async getUserById(userId: number): Promise<User> {
    const response = await this.api.get<User>(`/admin/users/${userId}`);
    return response.data;
  }

  async createUser(userData: UserData): Promise<User> {
    const response = await this.api.post<User>("/admin/users", userData);
    return response.data;
  }

  async updateUser(userId: number, userData: UserData): Promise<User> {
    const response = await this.api.put<User>(`/admin/users/${userId}`, userData);
    return response.data;
  }

  async deleteUser(userId: number): Promise<{ message: string }> {
    const response = await this.api.delete<{ message: string }>(
      `/admin/users/${userId}`
    );
    return response.data;
  }

  async deactivateUser(userId: number): Promise<User> {
    const response = await this.api.patch<User>(
      `/admin/users/${userId}/deactivate`
    );
    return response.data;
  }

  async activateUser(userId: number): Promise<User> {
    const response = await this.api.patch<User>(
      `/admin/users/${userId}/activate`
    );
    return response.data;
  }

  // Content Management
  async getPosts(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<any>> {
    const response = await this.api.get<PaginatedResponse<any>>("/admin/posts", {
      params: { page, limit },
    });
    return response.data;
  }

  async deletePost(postId: number): Promise<{ message: string }> {
    const response = await this.api.delete<{ message: string }>(
      `/admin/posts/${postId}`
    );
    return response.data;
  }

  async getEvents(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<any>> {
    const response = await this.api.get<PaginatedResponse<any>>("/admin/events", {
      params: { page, limit },
    });
    return response.data;
  }

  // Analytics
  async getStats(): Promise<Stats> {
    const response = await this.api.get<Stats>("/admin/stats");
    return response.data;
  }

  // =========================
  // NEW: Inquiries management
  // =========================

  /** List all non-deleted inquiries (admin only) */
  async getInquiries(): Promise<ContactInquiry[]> {
    const response = await this.api.get<InquiriesResponse>("/admin/inquiries");
    return response.data.inquiries;
  }

  /** Mark inquiry as read (admin only) */
  async markInquiryRead(id: number): Promise<ContactInquiry> {
    const response = await this.api.patch<InquiryResponse>(
      `/admin/inquiries/${id}/read`
    );
    return response.data.inquiry;
  }

  /** Delete inquiry (soft delete) (admin only) */
  async deleteInquiry(id: number): Promise<ContactInquiry> {
    const response = await this.api.delete<InquiryResponse>(`/admin/inquiries/${id}`);
    return response.data.inquiry;
  }
}

export default new AdminService();
