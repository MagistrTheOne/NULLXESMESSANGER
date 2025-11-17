import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { getChatMembers, getUserById } from "@/lib/api/db";
import { useAuthStore } from "@/stores/authStore";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Crown, UserMinus, UserPlus } from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert } from "react-native";

export default function GroupManagementScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadMembers();
    }
  }, [id]);

  const loadMembers = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const chatMembers = await getChatMembers(id);
      const membersWithDetails = await Promise.all(
        chatMembers.map(async (member) => {
          const userDetails = await getUserById(member.userId);
          return {
            ...member,
            name: userDetails?.name,
            avatar: userDetails?.avatar,
            phone: userDetails?.phone,
          };
        })
      );
      setMembers(membersWithDetails);
    } catch (error) {
      console.error("Error loading members:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Удалить участника?",
      "Вы уверены, что хотите удалить этого участника из группы?",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          style: "destructive",
          onPress: async () => {
            try {
              // TODO: Implement remove member API
              await loadMembers();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error("Error removing member:", error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-primary">
      <View className="pt-12 pb-4 px-4 bg-secondary/40 border-b border-accent/10 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-text-primary text-lg font-semibold flex-1">Управление группой</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-text-secondary">Загрузка...</Text>
        </View>
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card className="p-4 mb-2 mx-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <Avatar uri={item.avatar} name={item.name || item.phone} size={48} />
                  <View className="ml-3 flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-text-primary font-semibold">
                        {item.name || item.phone}
                      </Text>
                      {item.role === "admin" && (
                        <Crown size={16} color="#FFD700" weight="fill" className="ml-2" />
                      )}
                    </View>
                    <Text className="text-text-secondary text-sm">{item.role}</Text>
                  </View>
                </View>
                {item.userId !== user?.id && item.role !== "admin" && (
                  <TouchableOpacity
                    onPress={() => handleRemoveMember(item.id)}
                    className="ml-2 p-2"
                  >
                    <UserMinus size={20} color="#FF1A4B" />
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          )}
          ListHeaderComponent={
            <View className="p-4">
              <Text className="text-text-primary text-base font-semibold mb-2">
                Участники ({members.length})
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

