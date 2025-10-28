import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { Alert, Clipboard, Platform, StyleSheet } from "react-native";

// Cấu hình notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function TabTwoScreen() {
  const [notificationPermission, setNotificationPermission] = useState<
    string | null
  >(null);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [isLoadingToken, setIsLoadingToken] = useState(false);

  useEffect(() => {
    // Kiểm tra quyền thông báo khi component mount
    checkNotificationPermission();
    // Lấy Expo Push Token
    registerForPushNotificationsAsync();
  }, []);

  const checkNotificationPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setNotificationPermission(status);
  };

  const registerForPushNotificationsAsync = async () => {
    setIsLoadingToken(true);

    try {
      // Kiểm tra xem có phải thiết bị thật không (sử dụng Platform thay vì Device)
      if (Platform.OS === "web") {
        Alert.alert(
          "Cảnh báo",
          "Expo Push Token chỉ hoạt động trên thiết bị thật (iOS/Android). Vui lòng chạy trên thiết bị thật để lấy token.",
          [{ text: "OK" }]
        );
        setExpoPushToken("Chỉ hoạt động trên thiết bị thật");
        return;
      }

      // Kiểm tra quyền thông báo
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Alert.alert(
          "Lỗi",
          "Không thể lấy Expo Push Token vì không có quyền thông báo.",
          [{ text: "OK" }]
        );
        return;
      }

      // Lấy Expo Push Token
      const token = await Notifications.getExpoPushTokenAsync();
      setExpoPushToken(token.data);
      console.log("Expo Push Token:", token.data);
    } catch (error) {
      console.error("Lỗi khi lấy Expo Push Token:", error);
      Alert.alert("Lỗi", "Không thể lấy Expo Push Token. Vui lòng thử lại.", [
        { text: "OK" },
      ]);
    } finally {
      setIsLoadingToken(false);
    }
  };

  const copyTokenToClipboard = async () => {
    if (expoPushToken && expoPushToken !== "Chỉ hoạt động trên thiết bị thật") {
      await Clipboard.setString(expoPushToken);
      Alert.alert("Thành công", "Token đã được sao chép vào clipboard!", [
        { text: "OK" },
      ]);
    } else {
      Alert.alert(
        "Cảnh báo",
        "Không có token để sao chép hoặc đang chạy trên simulator.",
        [{ text: "OK" }]
      );
    }
  };

  const requestNotificationPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setNotificationPermission(status);

    if (status !== "granted") {
      Alert.alert(
        "Thông báo",
        "Bạn cần cấp quyền thông báo để sử dụng tính năng này.",
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  };

  const scheduleReminder = async () => {
    try {
      // Kiểm tra và xin quyền nếu chưa có
      if (notificationPermission !== "granted") {
        const hasPermission = await requestNotificationPermission();
        if (!hasPermission) return;
      }

      // Lên lịch thông báo sau 10 giây
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Nhắc nhở từ Expo Go",
          body: "Đây là thông báo được lên lịch sau 10 giây!",
          sound: true,
        },
        trigger: {
          seconds: 10,
        } as any, // Lên lịch sau 10 giây
      });

      setScheduledCount((prev) => prev + 1);

      // Hiển thị Alert thông báo đã lên lịch
      Alert.alert("Thành công", "Đã lên lịch nhắc nhở.", [{ text: "OK" }]);
    } catch (error) {
      console.error("Lỗi khi lên lịch thông báo:", error);
      Alert.alert("Lỗi", "Không thể lên lịch thông báo. Vui lòng thử lại.", [
        { text: "OK" },
      ]);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Lên lịch thông báo</ThemedText>
        <ThemedText style={styles.subtitle}>
          Demo tính năng hẹn giờ thông báo
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.statusContainer}>
        <ThemedText type="subtitle">Trạng thái quyền:</ThemedText>
        <ThemedText style={styles.statusText}>
          {notificationPermission === "granted"
            ? "✅ Đã cấp quyền"
            : notificationPermission === "denied"
            ? "❌ Từ chối quyền"
            : "⏳ Chưa xin quyền"}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.statsContainer}>
        <ThemedText type="subtitle">Thống kê:</ThemedText>
        <ThemedText style={styles.statsText}>
          Đã lên lịch: {scheduledCount} thông báo
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.tokenContainer}>
        <ThemedText type="subtitle">Expo Push Token:</ThemedText>
        {isLoadingToken ? (
          <ThemedText style={styles.loadingText}>Đang tải token...</ThemedText>
        ) : (
          <ThemedView style={styles.tokenDisplay}>
            <ThemedText style={styles.tokenText} numberOfLines={3}>
              {expoPushToken || "Chưa có token"}
            </ThemedText>
            <ThemedView style={styles.tokenButtons}>
              <ThemedView
                style={styles.copyButton}
                onTouchEnd={copyTokenToClipboard}
              >
                <ThemedText style={styles.copyButtonText}>Sao chép</ThemedText>
              </ThemedView>
              <ThemedView
                style={styles.refreshButton}
                onTouchEnd={registerForPushNotificationsAsync}
              >
                <ThemedText style={styles.refreshButtonText}>
                  Làm mới
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        )}
      </ThemedView>

      <ThemedView style={styles.buttonContainer}>
        <ThemedView style={styles.button} onTouchEnd={scheduleReminder}>
          <ThemedText style={styles.buttonText}>
            Nhắc tôi sau 10 giây
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.infoContainer}>
        <ThemedText type="subtitle">Hướng dẫn:</ThemedText>
        <ThemedText style={styles.infoText}>
          • Nhấn nút "Nhắc tôi sau 10 giây" để lên lịch thông báo{"\n"}• Thông
          báo sẽ hiển thị sau đúng 10 giây{"\n"}• Có thể lên lịch nhiều thông
          báo cùng lúc{"\n"}• Cần sử dụng thiết bị thật để test đầy đủ tính năng
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.pushToolContainer}>
        <ThemedText type="subtitle">Thử thách Expo Push Tool:</ThemedText>
        <ThemedText style={styles.pushToolText}>
          1. Sao chép Expo Push Token ở trên{"\n"}
          2. Truy cập: https://expo.dev/notifications{"\n"}
          3. Dán token vào ô "Expo Push Token"{"\n"}
          4. Nhập title và message{"\n"}
          5. Nhấn "Send a notification"{"\n"}
          6. Kiểm tra thiết bị có nhận được thông báo không!
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.comparisonContainer}>
        <ThemedText type="subtitle">So sánh với tab Home:</ThemedText>
        <ThemedText style={styles.comparisonText}>
          • Tab Home: Gửi thông báo ngay lập tức (trigger: null){"\n"}• Tab
          Explore: Lên lịch thông báo sau 10 giây (trigger: {"{ seconds: 10 }"})
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  subtitle: {
    marginTop: 10,
    textAlign: "center",
    opacity: 0.7,
  },
  statusContainer: {
    alignItems: "center",
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  statusText: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: "bold",
  },
  statsContainer: {
    alignItems: "center",
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
  },
  statsText: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
  },
  tokenContainer: {
    alignItems: "center",
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "rgba(52, 199, 89, 0.1)",
    maxWidth: "90%",
  },
  loadingText: {
    marginTop: 5,
    fontSize: 16,
    fontStyle: "italic",
    color: "#34C759",
  },
  tokenDisplay: {
    width: "100%",
    marginTop: 10,
  },
  tokenText: {
    fontSize: 12,
    fontFamily: "monospace",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    textAlign: "center",
  },
  tokenButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 10,
  },
  copyButton: {
    backgroundColor: "#34C759",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 15,
    flex: 1,
    marginRight: 5,
  },
  copyButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  refreshButton: {
    backgroundColor: "#FF9500",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 15,
    flex: 1,
    marginLeft: 5,
  },
  refreshButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonContainer: {
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  infoContainer: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    maxWidth: "90%",
    marginBottom: 20,
  },
  infoText: {
    marginTop: 10,
    lineHeight: 22,
    textAlign: "left",
  },
  pushToolContainer: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: "rgba(88, 86, 214, 0.1)",
    maxWidth: "90%",
    marginBottom: 20,
  },
  pushToolText: {
    marginTop: 10,
    lineHeight: 22,
    textAlign: "left",
    color: "#5856D6",
  },
  comparisonContainer: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255, 107, 53, 0.1)",
    maxWidth: "90%",
  },
  comparisonText: {
    marginTop: 10,
    lineHeight: 22,
    textAlign: "left",
    color: "#FF6B35",
  },
});
