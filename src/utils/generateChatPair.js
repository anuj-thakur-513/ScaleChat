const generateChatPair = (senderId, receiverId) => {
  const primaryId = senderId < receiverId ? senderId : receiverId;
  const secondaryId = senderId < receiverId ? receiverId : senderId;
  return `${primaryId}:${secondaryId}`;
};

module.exports = generateChatPair;
