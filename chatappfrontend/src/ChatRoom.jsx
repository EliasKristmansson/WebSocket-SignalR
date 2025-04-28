import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

// Tar in array av meddelanden
const ChatRoom = ({ usermessages }) => {
    // Refererar till en osynlig div
    const messagesEndRef = useRef(null);

    // Scrollar användaren till botten av chattboxen
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Triggar scrollToBottom varje gång ett meddelande skickas
    useEffect(() => {
        scrollToBottom();
    }, [usermessages]);

    // Ifall usermessages är något oväntat hanteras det här
    if (!Array.isArray(usermessages)) {
        return <div>No messages to display</div>;
    }

    // Render
    return (
        <div className="h-screen p-4 overflow-y-scroll bg-white rounded-lg shadow-lg">
            {usermessages.map((msg, index) => (
                <div key={index} className={`mb-2 p-2 rounded ${msg.isSystem ? 'bg-gray-200' : 'bg-blue-200'}`}>
                    <strong>{msg.user}: </strong>{msg.message}
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
};
export default ChatRoom;
