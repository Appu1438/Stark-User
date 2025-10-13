import color from "@/themes/app.colors";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import { StyleSheet } from "react-native";

// --- Design System Constants ---
const PADDING_HORIZONTAL = windowWidth(24);
const FONT_REGULAR = "TT-Octosquares-Medium"; // Use a regular font for body text
const FONT_MEDIUM = "TT-Octosquares-Medium"; // Use a medium font for titles and values
const COLOR_PRIMARY = "#1976D2"; // Brand Blue - for active elements/call to action
const COLOR_SECONDARY = "#4CAF50"; // Green - for completed/success
const COLOR_ACCENT = "#FFC107"; // Yellow/Amber - for rating and high-attention (like OTP)
const COLOR_DANGER = '#D32F2F'; // Red - for emergency

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.whiteColor,
  },
  mapContainer: {
    // Keep map large and prominent
    height: windowHeight(450), 
  },
  map: {
    flex: 1,
  },

  // --- Card Container (The Bottom Sheet) ---
  cardWrapper: {
    flex: 1,
    marginTop: -50, // Overlap map for a continuous feel
    backgroundColor: color.whiteColor,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 16,
    paddingHorizontal: PADDING_HORIZONTAL,
    // Refined, softer shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1, // Slightly more pronounced shadow
    shadowRadius: 12,
    elevation: 10,
  },
  cardHandle: {
    width: 48, 
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  scrollContent: {
    paddingBottom: 60,
  },

  // --- Header & Status Badge ---
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24, // Increased spacing after header
  },
  headerTitle: {
    fontFamily: FONT_MEDIUM,
    fontSize: fontSizes.FONT20, // Make the title bolder
    color: "#111",
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6, // Slightly reduced vertical padding for a thinner pill
    borderRadius: 20,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
    // Added a small shadow for lift
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  statusText: {
    fontFamily: FONT_MEDIUM,
    fontSize: fontSizes.FONT13,
  },

  // --- Driver Info ---
  driverSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 24, // Clean separation from other sections
    backgroundColor: '#F5F8FA', // Subtle background color
    borderRadius: 16, // Smoother corners
  },
  driverAvatar: {
    width: 64, // Slightly larger avatar for detail
    height: 64,
    borderRadius: 16,
    marginRight: 16,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    color: '#111',
    marginBottom: 4,
  },
  driverRating: {
    fontFamily: FONT_REGULAR,
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  driverVehicle: {
    fontFamily: FONT_REGULAR,
    fontSize: 13,
    color: '#888',
  },

  // --- Separator ---
  divider: {
    height: 1,
    backgroundColor: '#f5f5f5',
    marginVertical: 20, // Consistent vertical rhythm
  },

  // --- Trip Info (Visualizing the Route) ---
  tripInfoContainer: {
    marginBottom: 16,
  },
  tripInfoRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  // The icon container now focuses on marking the point
  tripInfoIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'transparent', // Make the background transparent
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16, // Increase margin for better line visibility
    zIndex: 2, // Ensure it's above the line
  },
  tripInfoIconText: {
    fontSize: 18,
  },
  tripInfoTextContainer: {
    flex: 1,
    justifyContent: 'center',
    // Remove borderLeft here, as we'll use a specific element for the line
    paddingLeft: 0,
    marginLeft: 0,
  },
  // Optional: Add a custom element (or use `position: 'absolute'`) 
  // between rows to draw the vertical line connecting them for a stronger visual flow.
  tripInfoLabel: {
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  tripInfoValue: {
    fontFamily: FONT_MEDIUM,
    fontSize: 15,
    color: '#333',
  },

  // --- Fare & Timings ---
  fareContainer: {
    backgroundColor: '#F9F9FB', // Lightest gray for clean background
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  fareLabel: {
    fontFamily: FONT_REGULAR,
    fontSize: fontSizes.FONT14,
    color: '#666',
  },
  fareValue: {
    fontFamily: FONT_MEDIUM,
    fontSize: fontSizes.FONT16, // Slightly larger, more dominant value
    color: '#111',
  },
  otpValue: {
    fontFamily: FONT_MEDIUM,
    fontSize: fontSizes.FONT18,
    color: COLOR_DANGER, // Make OTP very high attention (e.g., Red/Danger color)
    // fontWeight: '900', // Extra bold
  },

  // --- Action Buttons ---
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12, // More rounded corners
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButton: {
    backgroundColor: COLOR_PRIMARY,
    marginRight: 10,
    // Stronger shadow for the primary action
    shadowColor: COLOR_PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  emergencyButton: {
    backgroundColor: COLOR_DANGER,
    marginLeft: 10,
  },
  actionButtonText: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    color: '#fff',
  },
  footerNote: {
    fontFamily: FONT_REGULAR,
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: PADDING_HORIZONTAL,
  },

  // --- Map Markers ---
  locationMarker: {
    backgroundColor: COLOR_PRIMARY, // Solid color for pickup/drop
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4, // Prominent ring
    borderColor: '#E3F2FD', // Lighter shade of primary
  },
  locationMarkerText: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    color: 'white', // White text on solid background
  },
  completedMarker: {
    backgroundColor: COLOR_SECONDARY,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  completedMarkerText: {
    color: 'white',
    fontSize: 20,
    fontFamily: FONT_MEDIUM,
  },
});

export { styles };