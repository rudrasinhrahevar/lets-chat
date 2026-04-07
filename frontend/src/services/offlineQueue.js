// Offline message queue — persists to localStorage so messages survive page refreshes
const QUEUE_KEY = 'lets_chat_offline_queue';

const getQueue = () => {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveQueue = (queue) => {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // localStorage full — drop oldest items
    if (queue.length > 10) {
      saveQueue(queue.slice(-10));
    }
  }
};

export const enqueueMessage = (message) => {
  const queue = getQueue();
  // De-duplicate by clientId
  if (message.clientId && queue.some(m => m.clientId === message.clientId)) return;
  queue.push({ ...message, queuedAt: Date.now() });
  saveQueue(queue);
};

export const flushQueue = (socket) => {
  if (!socket?.connected) return;
  const queue = getQueue();
  if (queue.length === 0) return;

  // Send in FIFO order with small delays to not overwhelm
  queue.forEach((msg, i) => {
    setTimeout(() => {
      socket.emit('message:send', msg);
    }, i * 200); // 200ms between each
  });

  // Clear queue after flushing
  saveQueue([]);
  return queue.length;
};

export const getQueueSize = () => getQueue().length;

export const clearQueue = () => saveQueue([]);
