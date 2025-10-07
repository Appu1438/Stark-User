type ButtonProps = {
  title?: string;
  onPress?: () => void;
  width?: DimensionValue;
  backgroundColor?: string;
  textColor?: string;
  disabled:boolean
};


type UserType = {
  id: string;
  name: string;
  phone_number: string;
  email: string;
  ratings?: Number;
  totalRides?: Number;
  cratedAt: Date;
  updatedAt: Date;
  notificationToken: string;
};

type DriverType = {
  id: string;
  name: string;
  country: string;
  phone_number: string;
  email: string;
  vehicle_type: string;
  capacity: string;
  registration_number: string;
  registration_date: string;
  driving_license: string;
  vehicle_color: string;
  rate: number; // Changed to number for consistency

  // 👇 New fare-related fields
  baseFare: number;
  perKmRate: number;
  perMinRate: number;
  minFare: number;

  // Ratings & Earnings
  ratings: number;
  totalEarning: number;
  earnings: number;
  totalShare: number;
  shares: number;
  totalRides: number;
  pendingRides: number;
  cancelRides: number;

  // Status & Flags
  status: string;
  is_approved: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
};
