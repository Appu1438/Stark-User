import color from "@/themes/app.colors";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.whiteColor,
  },
  mapContainer: {
    height: windowHeight(400),
  },
  map: {
    flex: 1,
  },
  cardWrapper: {
    flex: 1,
    marginTop: -30,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: windowWidth(24),
    paddingBottom: 60,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  cardHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontFamily: "TT-Octosquares-Medium",
    fontSize: fontSizes.FONT20,
    color: "#111",
  },
  statusBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontFamily: "TT-Octosquares-Medium",
    fontSize: fontSizes.FONT10,
    color: '#1976D2',
  },
  driverSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  driverAvatar: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginRight: 16,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontFamily: "TT-Octosquares-Medium",
    fontSize: 18,
    color: '#111',
    marginBottom: 4,
  },
  driverRating: {
    fontFamily: "TT-Octosquares-Medium",
    fontSize: 14,
    color: '#FFA000',
    marginBottom: 4,
  },
  driverVehicle: {
    fontFamily: "TT-Octosquares-Medium",
    fontSize: 14,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 16,
  },
  tripInfoContainer: {
    marginBottom: 16,
  },
  tripInfoRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tripInfoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tripInfoIconText: {
    fontSize: 18,
  },
  tripInfoTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  tripInfoLabel: {
    fontFamily: "TT-Octosquares-Medium",
    fontSize: 13,
    color: '#888',
    marginBottom: 2,
  },
  tripInfoValue: {
    fontFamily: "TT-Octosquares-Medium",
    fontSize: 15,
    color: '#333',
  },
  fareContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  fareLabel: {
    fontFamily: "TT-Octosquares-Medium",
    fontSize: fontSizes.FONT14,
    color: '#555',
  },
  fareValue: {
    fontFamily: "TT-Octosquares-Medium",
    fontSize: fontSizes.FONT14,
    color: '#111',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  callButton: {
    backgroundColor: color.buttonBg,
    marginRight: 12,
  },
  emergencyButton: {
    backgroundColor: '#D32F2F',
  },
  actionButtonText: {
    fontFamily: "TT-Octosquares-Medium",
    fontSize: 16,
    color: '#fff',
    marginLeft: 8,
  },
  footerNote: {
    fontFamily: "TT-Octosquares-Medium",
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontFamily: "TT-Octosquares-Medium",
    fontSize: 16,
    color: "#555",
  },
  locationMarker: {
    backgroundColor: 'white',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  locationMarkerText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  completedMarker: {
    backgroundColor: '#4CAF50',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedMarkerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },

});

export {styles}