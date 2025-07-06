// src/utils/types.ts

// Types basés sur le schéma Prisma

 export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  POLICE = 'POLICE'
}

export enum ReportType {
  LOST = 'LOST',
  FOUND = 'FOUND'
}

export enum ReportStatus {
  PENDING = 'PENDING',
  MATCHED = 'MATCHED',
  NOTIFIED = 'NOTIFIED'
}

export enum Category {
  CNI = 'CNI',
  PASSEPORT = 'PASSEPORT',
  PERMIS_AUTRE = 'PERMIS_AUTRE'
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName?: string | null;
  lastName?: string | null;
  gender?: string | null;
  lat?: number | null;
  lng?: number | null;
  points: number;
  createdAt: Date;
  isActive: boolean;
  reportLost?: Report[];
  reportFound?: Report[];
}

export interface Report {
  id: string;
  type: ReportType;
  status: ReportStatus;
  category: Category;
  data: any; // Json type
  lat: number;
  lng: number;
  createdBy: User;
  createdById: string;
  matchedTo?: User | null;
  matchedToId?: string | null;
  validated: boolean;
  createdAt: Date;
}

// Types pour les requêtes et réponses API

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  lat?: number;
  lng?: number;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  gender?: string;
  lat?: number;
  lng?: number;
  points?: number;
  isActive?: boolean;
}

export interface CreateReportRequest {
  type: ReportType;
  category: Category;
  data: any;
  lat: number;
  lng: number;
}

export interface UpdateReportRequest {
  status?: ReportStatus;
  category?: Category;
  data?: any;
  lat?: number;
  lng?: number;
  matchedToId?: string;
  validated?: boolean;
}

// Types pour l'authentification

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'passwordHash'>;
  token: string;
}

// Types pour les réponses API

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Types pour les filtres et requêtes

export interface ReportFilters {
  type?: ReportType;
  status?: ReportStatus;
  category?: Category;
  validated?: boolean;
  lat?: number;
  lng?: number;
  radius?: number; // en km
}

export interface UserFilters {
  isActive?: boolean;
  lat?: number;
  lng?: number;
  radius?: number; // en km
}

// Types pour les coordonnées géographiques

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} 