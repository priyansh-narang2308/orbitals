import prisma from "../lib/db.js";

export class ChatService {
    /**
   * create a new conversation
   * @param {string} userId - User ID
   * @param {string} mode - chat, tool, or agent
   * @param {string} title - Optional conversation title
   */
    async createConversation(userId, mode = "chat", title = null) {
        return await prisma.conversation.create({
            data: {
                userId,
                mode,
                title: title || `New ${mode} Conversation`,
            },
        });
    }

    /**
    * get or create a conversationn for user
    * @param {string} userId - User ID
    * @param {string} conversationId - Optional conversation ID
    * @param {string} mode - chat, tool, or agent
    */
    async getOrCreateConversation(userId, conversationId = null, mode = "chat") {
        if (conversationId) {
            const conversation = await prisma.conversation.findFirst({
                where: {
                    id: conversationId,
                    userId,
                },
                include: {
                    messages: {
                        orderBy: { createdAt: "asc" },
                    },
                },
            });

            if (conversation) {
                return conversation;
            }
        }

        // create a new conversaton if not found
        return await this.createConversation(userId, mode);
    }

    /**
    * add a message to conversation
    * @param {string} conversationId - Conversation ID
    * @param {string} role - user, assistant, system, tool
    * @param {string|object} content - Message content
   */
    async addMessage(conversationId, role, content) {
        const contentString = typeof content === "string" ? content : JSON.stringify(content)//convert to string

        // append in the db
        return await prisma.message.create({
            data: {
                conversationId,
                role,
                content: contentString,
            }
        })
    }

    /**
   * get conversation messages
   * @param {string} conversationId - Conversation ID
   */
    async getMessages(conversationId) {
        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: "asc" },
        });

        // parse the json contents back
        return messages.map((msg) => ({
            ...msg,
            content: this.parseContent(msg.content),
        }));
    }

    /**
  * get all conversations for a user
  * @param {string} userId - User ID
  */
    async getUserConversations(userId) {
        return await prisma.conversation.findMany({
            where: { userId },
            orderBy: { updatedAt: "desc" },
            include: {
                messages: {
                    take: 1,
                    orderBy: { createdAt: "desc" },
                },
            },
        });
    }

    /**
   * delete a conversation
   * @param {string} conversationId - Conversation ID
   * @param {string} userId - User ID (for security)
   */
    async deleteConversation(conversationId, userId) {
        return await prisma.conversation.deleteMany({
            where: {
                id: conversationId,
                userId,
            },
        });
    }

    /**
  * update conversation title
  * @param {string} conversationId - Conversation ID
  * @param {string} title - New title
  */
    async updateTitle(conversationId, title) {
        return await prisma.conversation.update({
            where: { id: conversationId },
            data: { title },
        });
    }

    // helper to parse the content
    parseContent(content) {
        try {
            return JSON.parse(content);
        } catch {
            return content;
        }
    }

    /**
  * format messages as ai sdk requirs
  * @param {Array} messages - Database messages
  */
    formatMessagesForAI(messages) {
        return messages.map((msg) => ({
            role: msg.role,
            content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content),
        }));
    }
}