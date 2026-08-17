'use client';

import React, { useRef, useEffect } from 'react';
import { useChatCore } from '../../hooks/useChat';
import { useTempChat } from '../../hooks/useTempChat';
import { useUIStore } from '../../store/useUIStore';
import { ChatHeader } from './ChatHeader';
import { MessageBubble } from './MessageBubble';
import { Composer } from './Composer';
import { EmptyState } from './EmptyState';
import { TypingIndicator } from './TypingIndicator';
import { TempChatBanner } from './TempChatBanner';
import { TempChatCloseDialog } from './TempChatCloseDialog';
import { ChatExport } from './ChatExport';

export function ChatArea() {
  const { isTempChatActive, setIsTempChatActive } = useUIStore();

  // Core Chat State
  const coreChat = useChatCore();
  
  // Isolated Temporary Chat State
  const tempChat = useTempChat();

  const bottomRef = useRef<HTMLDivElement>(null);

  // Active chat state depending on mode
  const activeInput = isTempChatActive ? tempChat.input : coreChat.input;
  const setActiveInput = isTempChatActive ? tempChat.setInput : coreChat.setInput;
  const activeSend = isTempChatActive ? tempChat.handleSend : coreChat.handleSend;
  const isStreaming = isTempChatActive ? tempChat.isStreaming : coreChat.isStreaming;
  const currentModel = isTempChatActive ? tempChat.currentModel : coreChat.currentModel;
  const messages = isTempChatActive ? tempChat.messages : coreChat.messages;
  const title = isTempChatActive ? 'Isolated Temporary Chat' : (coreChat.currentChat?.title || 'New chat');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isStreaming]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-hub-bg">
      {/* Banner if in Temporary Mode */}
      {isTempChatActive && (
        <TempChatBanner
          onClose={() => {
            if (tempChat.messages.length > 0) {
              tempChat.setShowCloseDialog(true);
            } else {
              setIsTempChatActive(false);
            }
          }}
        />
      )}

      {/* Header with Integrated Export Action */}
      <ChatHeader title={title} messageCount={messages.length} isTemp={isTempChatActive}>
        {messages.length > 0 && <ChatExport chatTitle={title} messages={messages} />}
      </ChatHeader>

      {/* Main Chat Body or Empty State */}
      {!isTempChatActive && (!coreChat.currentChat || messages.length === 0) ? (
        <div className="flex-1 flex flex-col min-h-0">
          <EmptyState onSelectPrompt={(p) => coreChat.setInput(p)} />
          <div className="shrink-0 px-4 md:px-16 lg:px-28 pb-4 pt-2">
            <Composer
              input={coreChat.input}
              setInput={coreChat.setInput}
              onSend={coreChat.handleSend}
              isStreaming={coreChat.isStreaming}
            />
          </div>
        </div>
      ) : (
        <>
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto px-4 md:px-16 lg:px-28 py-6 space-y-5 scroll-smooth">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}


            <div ref={bottomRef} />
          </div>

          {/* Composer */}
          <div className="shrink-0 px-4 md:px-16 lg:px-28 pb-4 pt-2">
            <Composer
              input={activeInput}
              setInput={setActiveInput}
              onSend={activeSend}
              isStreaming={isStreaming}
              isTemp={isTempChatActive}
            />
          </div>
        </>
      )}

      {/* Confirmation Dialog on Exit Temp Chat */}
      <TempChatCloseDialog
        open={tempChat.showCloseDialog}
        onClose={() => tempChat.setShowCloseDialog(false)}
        onSave={() => tempChat.saveToPermanentChats()}
        onDiscard={() => tempChat.discardTempChat()}
      />
    </div>
  );
}
