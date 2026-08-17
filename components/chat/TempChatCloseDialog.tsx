'use client';

import React from 'react';
import { Dialog, DialogFooter } from '../ui/Dialog';
import { Button } from '../ui/button';

interface TempChatCloseDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  onDiscard: () => void;
}

export function TempChatCloseDialog({ open, onClose, onSave, onDiscard }: TempChatCloseDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Exit Isolated Chat?"
      description="This conversation is temporary and will be permanently cleared when you exit."
    >
      <div className="text-hub-sm text-hub-text-sec space-y-2 py-2">
        <p>Would you like to save this conversation to your chat history before exiting?</p>
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={onDiscard} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
          Discard &amp; Exit
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Keep Chatting
        </Button>
        <Button variant="default" onClick={onSave}>
          Save to Chats
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
