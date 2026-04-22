export type ViolationType = 'phone' | 'sunglasses' | 'drowsiness' | 'smoking';
export type RouteType = 'demanding' | 'moderate' | 'simple';
export type ViolationStatus = 'reviewed' | 'pending' | 'flagged';
export type DriverStatus = 'active' | 'inactive' | 'suspended';

export interface Driver {
  id: string;
  name: string;
  age: number;
  licenseNumber: string;
  violations: {
    phone: number;
    sunglasses: number;
    drowsiness: number;
    smoking: number;
  };
  totalViolations: number;
  safetyScore: number;
  rank: number;
  assignedRouteId: string;
  assignedRouteName: string;
  routeType: RouteType;
  status: DriverStatus;
  joinDate: string;
  lastActive: string;
  initials: string;
  avatarColor: string;
  experience: number; // years
}

export interface Violation {
  id: string;
  driverId: string;
  driverName: string;
  type: ViolationType;
  timestamp: string;
  location: string;
  confidence: number;
  status: ViolationStatus;
  route: string;
  frameCapture?: string;
}

export interface Route {
  id: string;
  name: string;
  from: string;
  to: string;
  distance: number;
  difficulty: RouteType;
  assignedDriverId: string | null;
  assignedDriverName: string | null;
  passengerCapacity: number;
  dailyTrips: number;
  description: string;
  stops: number;
  avgTravelTime: number; // minutes
}

export const VIOLATION_COLORS: Record<ViolationType, string> = {
  phone: '#f97316',
  sunglasses: '#eab308',
  drowsiness: '#ef4444',
  smoking: '#a855f7',
};

export const VIOLATION_LABELS: Record<ViolationType, string> = {
  phone: 'Phone Usage',
  sunglasses: 'Wearing Sunglasses',
  drowsiness: 'Drowsiness',
  smoking: 'Smoking',
};

export const ROUTE_COLORS: Record<RouteType, string> = {
  demanding: '#10b981',
  moderate: '#3b82f6',
  simple: '#6b7280',
};

export const ROUTE_LABELS: Record<RouteType, string> = {
  demanding: 'Demanding',
  moderate: 'Moderate',
  simple: 'Simple',
};

export const drivers: Driver[] = [
  {
    id: 'd1',
    name: 'James Carter',
    age: 34,
    licenseNumber: 'DL-2019-4421',
    violations: { phone: 0, sunglasses: 1, drowsiness: 0, smoking: 0 },
    totalViolations: 1,
    safetyScore: 97,
    rank: 1,
    assignedRouteId: 'r1',
    assignedRouteName: 'Metro Express Line A',
    routeType: 'demanding',
    status: 'active',
    joinDate: '2019-03-15',
    lastActive: '2026-04-18T08:42:00',
    initials: 'JC',
    avatarColor: '#6366f1',
    experience: 7,
  },
  {
    id: 'd2',
    name: 'Sofia Alvarez',
    age: 28,
    licenseNumber: 'DL-2021-7834',
    violations: { phone: 0, sunglasses: 0, drowsiness: 1, smoking: 0 },
    totalViolations: 1,
    safetyScore: 96,
    rank: 2,
    assignedRouteId: 'r2',
    assignedRouteName: 'Airport Shuttle Line B',
    routeType: 'demanding',
    status: 'active',
    joinDate: '2021-07-20',
    lastActive: '2026-04-18T09:10:00',
    initials: 'SA',
    avatarColor: '#06b6d4',
    experience: 5,
  },
  {
    id: 'd3',
    name: 'Marcus Johnson',
    age: 41,
    licenseNumber: 'DL-2015-1102',
    violations: { phone: 1, sunglasses: 0, drowsiness: 1, smoking: 0 },
    totalViolations: 2,
    safetyScore: 91,
    rank: 3,
    assignedRouteId: 'r3',
    assignedRouteName: 'City Center Route C',
    routeType: 'demanding',
    status: 'active',
    joinDate: '2015-11-08',
    lastActive: '2026-04-18T07:55:00',
    initials: 'MJ',
    avatarColor: '#10b981',
    experience: 11,
  },
  {
    id: 'd4',
    name: 'Priya Sharma',
    age: 32,
    licenseNumber: 'DL-2020-3356',
    violations: { phone: 2, sunglasses: 1, drowsiness: 0, smoking: 0 },
    totalViolations: 3,
    safetyScore: 85,
    rank: 4,
    assignedRouteId: 'r4',
    assignedRouteName: 'Suburban Line D',
    routeType: 'moderate',
    status: 'active',
    joinDate: '2020-01-12',
    lastActive: '2026-04-18T08:00:00',
    initials: 'PS',
    avatarColor: '#f59e0b',
    experience: 6,
  },
  {
    id: 'd5',
    name: 'Daniel Kim',
    age: 37,
    licenseNumber: 'DL-2018-9901',
    violations: { phone: 1, sunglasses: 2, drowsiness: 1, smoking: 0 },
    totalViolations: 4,
    safetyScore: 80,
    rank: 5,
    assignedRouteId: 'r5',
    assignedRouteName: 'Cross-Town Route E',
    routeType: 'moderate',
    status: 'active',
    joinDate: '2018-06-03',
    lastActive: '2026-04-18T09:30:00',
    initials: 'DK',
    avatarColor: '#8b5cf6',
    experience: 8,
  },
  {
    id: 'd6',
    name: 'Amina Hassan',
    age: 29,
    licenseNumber: 'DL-2022-6672',
    violations: { phone: 2, sunglasses: 1, drowsiness: 2, smoking: 0 },
    totalViolations: 5,
    safetyScore: 74,
    rank: 6,
    assignedRouteId: 'r6',
    assignedRouteName: 'North District Line F',
    routeType: 'moderate',
    status: 'active',
    joinDate: '2022-03-18',
    lastActive: '2026-04-17T16:45:00',
    initials: 'AH',
    avatarColor: '#ec4899',
    experience: 4,
  },
  {
    id: 'd7',
    name: 'Robert Walsh',
    age: 45,
    licenseNumber: 'DL-2013-4410',
    violations: { phone: 3, sunglasses: 1, drowsiness: 2, smoking: 1 },
    totalViolations: 7,
    safetyScore: 64,
    rank: 7,
    assignedRouteId: 'r7',
    assignedRouteName: 'Local Street Route G',
    routeType: 'simple',
    status: 'active',
    joinDate: '2013-09-22',
    lastActive: '2026-04-18T07:20:00',
    initials: 'RW',
    avatarColor: '#f97316',
    experience: 13,
  },
  {
    id: 'd8',
    name: 'Yuki Tanaka',
    age: 26,
    licenseNumber: 'DL-2023-1188',
    violations: { phone: 4, sunglasses: 0, drowsiness: 3, smoking: 1 },
    totalViolations: 8,
    safetyScore: 58,
    rank: 8,
    assignedRouteId: 'r8',
    assignedRouteName: 'Inner Ring Route H',
    routeType: 'simple',
    status: 'active',
    joinDate: '2023-02-14',
    lastActive: '2026-04-17T14:00:00',
    initials: 'YT',
    avatarColor: '#14b8a6',
    experience: 3,
  },
  {
    id: 'd9',
    name: 'Carlos Mendez',
    age: 38,
    licenseNumber: 'DL-2017-5543',
    violations: { phone: 5, sunglasses: 2, drowsiness: 3, smoking: 2 },
    totalViolations: 12,
    safetyScore: 42,
    rank: 9,
    assignedRouteId: 'r9',
    assignedRouteName: 'Depot Route I',
    routeType: 'simple',
    status: 'inactive',
    joinDate: '2017-04-30',
    lastActive: '2026-04-15T11:30:00',
    initials: 'CM',
    avatarColor: '#ef4444',
    experience: 9,
  },
  {
    id: 'd10',
    name: 'Lena Fischer',
    age: 31,
    licenseNumber: 'DL-2019-8823',
    violations: { phone: 6, sunglasses: 3, drowsiness: 5, smoking: 4 },
    totalViolations: 18,
    safetyScore: 24,
    rank: 10,
    assignedRouteId: 'r10',
    assignedRouteName: 'Restricted Route J',
    routeType: 'simple',
    status: 'suspended',
    joinDate: '2019-08-11',
    lastActive: '2026-04-10T09:00:00',
    initials: 'LF',
    avatarColor: '#dc2626',
    experience: 7,
  },
];

export const violations: Violation[] = [
  { id: 'v1', driverId: 'd10', driverName: 'Lena Fischer', type: 'smoking', timestamp: '2026-04-18T09:15:00', location: 'Restricted Route J, KM 2.4', confidence: 94, status: 'flagged', route: 'Restricted Route J' },
  { id: 'v2', driverId: 'd9', driverName: 'Carlos Mendez', type: 'drowsiness', timestamp: '2026-04-18T08:55:00', location: 'Depot Route I, KM 1.1', confidence: 89, status: 'flagged', route: 'Depot Route I' },
  { id: 'v3', driverId: 'd8', driverName: 'Yuki Tanaka', type: 'phone', timestamp: '2026-04-18T08:40:00', location: 'Inner Ring Route H, KM 5.2', confidence: 97, status: 'pending', route: 'Inner Ring Route H' },
  { id: 'v4', driverId: 'd7', driverName: 'Robert Walsh', type: 'phone', timestamp: '2026-04-18T08:20:00', location: 'Local Street Route G, KM 3.8', confidence: 91, status: 'pending', route: 'Local Street Route G' },
  { id: 'v5', driverId: 'd6', driverName: 'Amina Hassan', type: 'drowsiness', timestamp: '2026-04-18T07:50:00', location: 'North District Line F, KM 7.0', confidence: 85, status: 'pending', route: 'North District Line F' },
  { id: 'v6', driverId: 'd5', driverName: 'Daniel Kim', type: 'sunglasses', timestamp: '2026-04-18T07:30:00', location: 'Cross-Town Route E, KM 4.5', confidence: 88, status: 'reviewed', route: 'Cross-Town Route E' },
  { id: 'v7', driverId: 'd10', driverName: 'Lena Fischer', type: 'drowsiness', timestamp: '2026-04-17T17:10:00', location: 'Restricted Route J, KM 1.2', confidence: 92, status: 'reviewed', route: 'Restricted Route J' },
  { id: 'v8', driverId: 'd9', driverName: 'Carlos Mendez', type: 'phone', timestamp: '2026-04-17T16:45:00', location: 'Depot Route I, KM 0.8', confidence: 96, status: 'reviewed', route: 'Depot Route I' },
  { id: 'v9', driverId: 'd4', driverName: 'Priya Sharma', type: 'phone', timestamp: '2026-04-17T15:30:00', location: 'Suburban Line D, KM 9.3', confidence: 90, status: 'reviewed', route: 'Suburban Line D' },
  { id: 'v10', driverId: 'd8', driverName: 'Yuki Tanaka', type: 'drowsiness', timestamp: '2026-04-17T14:20:00', location: 'Inner Ring Route H, KM 2.6', confidence: 87, status: 'reviewed', route: 'Inner Ring Route H' },
  { id: 'v11', driverId: 'd3', driverName: 'Marcus Johnson', type: 'drowsiness', timestamp: '2026-04-17T13:00:00', location: 'City Center Route C, KM 6.1', confidence: 82, status: 'reviewed', route: 'City Center Route C' },
  { id: 'v12', driverId: 'd7', driverName: 'Robert Walsh', type: 'smoking', timestamp: '2026-04-17T11:40:00', location: 'Local Street Route G, KM 1.9', confidence: 93, status: 'reviewed', route: 'Local Street Route G' },
  { id: 'v13', driverId: 'd10', driverName: 'Lena Fischer', type: 'phone', timestamp: '2026-04-17T10:55:00', location: 'Restricted Route J, KM 3.7', confidence: 98, status: 'reviewed', route: 'Restricted Route J' },
  { id: 'v14', driverId: 'd5', driverName: 'Daniel Kim', type: 'drowsiness', timestamp: '2026-04-16T16:20:00', location: 'Cross-Town Route E, KM 8.2', confidence: 83, status: 'reviewed', route: 'Cross-Town Route E' },
  { id: 'v15', driverId: 'd2', driverName: 'Sofia Alvarez', type: 'drowsiness', timestamp: '2026-04-16T14:00:00', location: 'Airport Shuttle Line B, KM 12.1', confidence: 79, status: 'reviewed', route: 'Airport Shuttle Line B' },
  { id: 'v16', driverId: 'd1', driverName: 'James Carter', type: 'sunglasses', timestamp: '2026-04-15T11:10:00', location: 'Metro Express Line A, KM 18.4', confidence: 76, status: 'reviewed', route: 'Metro Express Line A' },
  { id: 'v17', driverId: 'd6', driverName: 'Amina Hassan', type: 'phone', timestamp: '2026-04-15T09:30:00', location: 'North District Line F, KM 3.3', confidence: 94, status: 'reviewed', route: 'North District Line F' },
  { id: 'v18', driverId: 'd9', driverName: 'Carlos Mendez', type: 'sunglasses', timestamp: '2026-04-14T15:50:00', location: 'Depot Route I, KM 2.0', confidence: 81, status: 'reviewed', route: 'Depot Route I' },
];

export const routes: Route[] = [
  { id: 'r1', name: 'Metro Express Line A', from: 'Central Station', to: 'Northgate Terminal', distance: 28, difficulty: 'demanding', assignedDriverId: 'd1', assignedDriverName: 'James Carter', passengerCapacity: 80, dailyTrips: 12, description: 'High-frequency express route through the city center with multiple intersections and heavy traffic zones.', stops: 14, avgTravelTime: 65 },
  { id: 'r2', name: 'Airport Shuttle Line B', from: 'City Hub', to: 'International Airport', distance: 35, difficulty: 'demanding', assignedDriverId: 'd2', assignedDriverName: 'Sofia Alvarez', passengerCapacity: 60, dailyTrips: 8, description: 'Long-distance shuttle connecting city center to airport, requiring precise scheduling and highway driving.', stops: 6, avgTravelTime: 55 },
  { id: 'r3', name: 'City Center Route C', from: 'West Gate', to: 'East Terminal', distance: 22, difficulty: 'demanding', assignedDriverId: 'd3', assignedDriverName: 'Marcus Johnson', passengerCapacity: 70, dailyTrips: 15, description: 'Busy cross-city route through commercial districts with narrow streets and pedestrian zones.', stops: 20, avgTravelTime: 50 },
  { id: 'r4', name: 'Suburban Line D', from: 'Downtown Park', to: 'Riverside Estate', distance: 18, difficulty: 'moderate', assignedDriverId: 'd4', assignedDriverName: 'Priya Sharma', passengerCapacity: 65, dailyTrips: 10, description: 'Suburban connector route with moderate traffic and residential stops.', stops: 16, avgTravelTime: 42 },
  { id: 'r5', name: 'Cross-Town Route E', from: 'South Market', to: 'University Campus', distance: 15, difficulty: 'moderate', assignedDriverId: 'd5', assignedDriverName: 'Daniel Kim', passengerCapacity: 55, dailyTrips: 11, description: 'Mid-city route serving commercial and educational areas with mixed traffic.', stops: 12, avgTravelTime: 38 },
  { id: 'r6', name: 'North District Line F', from: 'Old Town Square', to: 'Northern Mall', distance: 12, difficulty: 'moderate', assignedDriverId: 'd6', assignedDriverName: 'Amina Hassan', passengerCapacity: 50, dailyTrips: 9, description: 'Neighborhood route through northern residential areas with moderate passenger load.', stops: 10, avgTravelTime: 30 },
  { id: 'r7', name: 'Local Street Route G', from: 'West Park', to: 'Community Center', distance: 8, difficulty: 'simple', assignedDriverId: 'd7', assignedDriverName: 'Robert Walsh', passengerCapacity: 40, dailyTrips: 7, description: 'Short local route through quiet residential streets with low traffic volume.', stops: 8, avgTravelTime: 25 },
  { id: 'r8', name: 'Inner Ring Route H', from: 'Market Square', to: 'Hospital District', distance: 7, difficulty: 'simple', assignedDriverId: 'd8', assignedDriverName: 'Yuki Tanaka', passengerCapacity: 35, dailyTrips: 6, description: 'Short urban loop with minimal complexity, serving inner-city neighborhoods.', stops: 7, avgTravelTime: 22 },
  { id: 'r9', name: 'Depot Route I', from: 'Bus Depot', to: 'Warehouse District', distance: 5, difficulty: 'simple', assignedDriverId: 'd9', assignedDriverName: 'Carlos Mendez', passengerCapacity: 30, dailyTrips: 5, description: 'Restricted industrial route with minimal passenger interaction and low complexity.', stops: 5, avgTravelTime: 18 },
  { id: 'r10', name: 'Restricted Route J', from: 'Depot Gate', to: 'Parking Zone', distance: 3, difficulty: 'simple', assignedDriverId: 'd10', assignedDriverName: 'Lena Fischer', passengerCapacity: 0, dailyTrips: 2, description: 'Minimal-use restricted route for probationary or suspended drivers only.', stops: 3, avgTravelTime: 10 },
];

// Weekly violation trend data (last 7 days)
export const weeklyViolationData = [
  { day: 'Mon', phone: 2, sunglasses: 1, drowsiness: 3, smoking: 1, total: 7 },
  { day: 'Tue', phone: 1, sunglasses: 2, drowsiness: 2, smoking: 0, total: 5 },
  { day: 'Wed', phone: 3, sunglasses: 1, drowsiness: 4, smoking: 2, total: 10 },
  { day: 'Thu', phone: 2, sunglasses: 0, drowsiness: 2, smoking: 1, total: 5 },
  { day: 'Fri', phone: 4, sunglasses: 2, drowsiness: 3, smoking: 2, total: 11 },
  { day: 'Sat', phone: 1, sunglasses: 1, drowsiness: 2, smoking: 0, total: 4 },
  { day: 'Sun', phone: 3, sunglasses: 1, drowsiness: 1, smoking: 1, total: 6 },
];

// Monthly trend
export const monthlyViolationData = [
  { month: 'Oct', total: 28 },
  { month: 'Nov', total: 35 },
  { month: 'Dec', total: 22 },
  { month: 'Jan', total: 40 },
  { month: 'Feb', total: 31 },
  { month: 'Mar', total: 27 },
  { month: 'Apr', total: 18 },
];

export const violationBreakdown = [
  { name: 'Phone Usage', value: 24, color: '#f97316' },
  { name: 'Drowsiness', value: 19, color: '#ef4444' },
  { name: 'Sunglasses', value: 11, color: '#eab308' },
  { name: 'Smoking', value: 7, color: '#a855f7' },
];

// Live monitor feeds (simulated)
export const liveFeeds = [
  { id: 'cam1', driverId: 'd1', driverName: 'James Carter', route: 'Metro Express Line A', status: 'safe', speed: 42, location: 'Central Ave & 5th St', alert: null },
  { id: 'cam2', driverId: 'd2', driverName: 'Sofia Alvarez', route: 'Airport Shuttle Line B', status: 'safe', speed: 78, location: 'Highway 101, KM 22', alert: null },
  { id: 'cam3', driverId: 'd3', driverName: 'Marcus Johnson', route: 'City Center Route C', status: 'safe', speed: 35, location: 'Market Street & 3rd Ave', alert: null },
  { id: 'cam4', driverId: 'd8', driverName: 'Yuki Tanaka', route: 'Inner Ring Route H', status: 'alert', speed: 28, location: 'Hospital Drive, KM 3.1', alert: 'drowsiness' },
  { id: 'cam5', driverId: 'd7', driverName: 'Robert Walsh', route: 'Local Street Route G', status: 'warning', speed: 31, location: 'Park Road, KM 1.8', alert: 'phone' },
  { id: 'cam6', driverId: 'd5', driverName: 'Daniel Kim', route: 'Cross-Town Route E', status: 'safe', speed: 45, location: 'University Blvd, KM 7.4', alert: null },
];
