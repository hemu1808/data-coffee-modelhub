import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Chat } from '../types';
import { fetchChats, createChat } from '../services/api';
import { useChatStore } from '../store/useChatStore';

export function useChatList() {
  const storeChats = useChatStore((state) => state.chats);

  return useQuery<Chat[]>({
    queryKey: ['chats'],
    queryFn: fetchChats,
    initialData: storeChats,
  });
}

export function useCreateChatMutation() {
  const queryClient = useQueryClient();
  const addChat = useChatStore((state) => state.addChat);

  return useMutation({
    mutationFn: (newChat: Chat) => createChat(newChat),
    onSuccess: (newChat) => {
      addChat(newChat);
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
}
