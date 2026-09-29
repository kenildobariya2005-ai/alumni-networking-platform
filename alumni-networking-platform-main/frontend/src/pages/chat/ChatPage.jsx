import React from 'react';
import EmptyState from '../../components/common/EmptyState.jsx';
import { HiOutlineChatAlt2 } from 'react-icons/hi';

export const ChatPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Direct Messages</h1>
          <p className="text-sm text-slate-500">Real-time chat and communication with peers and alumni.</p>
        </div>
      </div>

      <EmptyState
        icon={HiOutlineChatAlt2}
        title="Real-Time Messaging Center"
        description="Foundation routing and Socket context are established. Direct chat conversations will be implemented in the Chat module."
      />
    </div>
  );
};

export default ChatPage;
