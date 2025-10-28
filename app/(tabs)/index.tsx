import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { Alert, StyleSheet } from "react-native";

// Cấu hình notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function HomeScreen() {
  const [notificationPermission, setNotificationPermission] =
    useState<Notifications.NotificationPermissionsStatus | null>(null);

  useEffect(() => {
    // Kiểm tra quyền thông báo khi component mount
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setNotificationPermission(status);
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

  const sendNotificationNow = async () => {
    try {
      // Kiểm tra và xin quyền nếu chưa có
      if (notificationPermission !== "granted") {
        const hasPermission = await requestNotificationPermission();
        if (!hasPermission) return;
      }

      // Gửi thông báo ngay lập tức (trigger = null)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Thông báo từ Expo Go",
          body: "Đây là thông báo được gửi ngay lập tức!",
          sound: true,
        },
        trigger: null, // Gửi ngay lập tức
      });

      Alert.alert("Thành công", "Thông báo đã được gửi!", [{ text: "OK" }]);
    } catch (error) {
      console.error("Lỗi khi gửi thông báo:", error);
      Alert.alert("Lỗi", "Không thể gửi thông báo. Vui lòng thử lại.", [
        { text: "OK" },
      ]);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Thông báo Expo</ThemedText>
        <ThemedText style={styles.subtitle}>
          Demo tính năng gửi thông báo ngay lập tức
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

      <ThemedView style={styles.buttonContainer}>
        <ThemedView style={styles.button} onTouchEnd={sendNotificationNow}>
          <ThemedText style={styles.buttonText}>Gửi ngay</ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.infoContainer}>
        <ThemedText type="subtitle">Hướng dẫn:</ThemedText>
        <ThemedText style={styles.infoText}>
          • Nhấn nút "Gửi ngay" để gửi thông báo ngay lập tức{"\n"}• Lần đầu
          tiên sẽ yêu cầu cấp quyền thông báo{"\n"}• Thông báo sẽ hiển thị ngay
          sau khi nhấn nút{"\n"}• Cần sử dụng thiết bị thật để test đầy đủ tính
          năng
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
    marginBottom: 30,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  statusText: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonContainer: {
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#007AFF",
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
  },
  infoText: {
    marginTop: 10,
    lineHeight: 22,
    textAlign: "left",
  },
});
