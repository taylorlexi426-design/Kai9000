import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import ChatBox from '../components/ChatBox';
import '../styles/ChatPage.css';

function ChatPage() {
  const { taskId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, [taskId]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/conversations/${taskId}`);
      setConversations(response.data);
      if (response.data.length > 0) {
        setActiveConversation(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConversation = async () => {
    try {
      const response = await api.post('/conversations', {
        taskId,
        title: `Conversation ${conversations.length + 1}`,
      });
      setConversations([...conversations, response.data]);
      setActiveConversation(response.data);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  if (loading) return <div className="chat-page loading">Loading...</div>;

  return (
    <div className="chat-page">
      <div className="conversations-sidebar">
        <h2>Conversations</h2>
        <button onClick={handleCreateConversation} className="btn-primary">
          New Conversation
        </button>
        <div className="conversations-list">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`conversation-item ${activeConversation?.id === conv.id ? 'active' : ''}`}
              onClick={() => setActiveConversation(conv)}
            >
              {conv.title}
            </div>
          ))}
        </div>
      </div>
      <div className="chat-area">
        {activeConversation ? (
          <ChatBox conversationId={activeConversation.id} />
        ) : (
          <div className="no-conversation">Select or create a conversation to start</div>
        )}
      </div>
    </div>
  );
}

export default ChatPage;
